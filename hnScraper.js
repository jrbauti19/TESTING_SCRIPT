// hnScraper.js
// Main logic for scraping and validating Hacker News article order

const { chromium } = require('playwright');
const ora = require('ora');
const cliProgress = require('cli-progress');
const config = require('./config');
const logger = require('./logger');
const { parseHackerNewsTime, formatTimestamp } = require('./utils/time');
const { retry } = require('./utils/retry');
const { exportJSON, exportCSV } = require('./utils/export');
const { generateValidationReport } = require('./utils/validation');
const { createMonitor, getSystemInfo } = require('./utils/performance');

/**
 * Scrape and validate the newest articles on Hacker News.
 * @param {Object} options - Options for the run (articleCount, export, debug, etc.)
 * @returns {Promise<Object>} - Validation results and article data
 */
async function validateHackerNewsArticles(options = {}) {
  const {
    articleCount = config.ARTICLE_COUNT,
    exportJson = false,
    exportCsv = false,
    debug = false,
    headless = true,
    timeout = config.TIMEOUT,
    retryAttempts = config.RETRY_ATTEMPTS,
    retryDelay = config.RETRY_DELAY,
  } = options;

  // Initialize performance monitoring
  const perfMonitor = createMonitor().start();
  const systemInfo = getSystemInfo();

  // Show banner
  logger.banner('HN Validator');

  // Show configuration
  logger.box(
    `${
      logger.icons.rocket
    } Starting validation with the following configuration:
  
${logger.colors.info('Target Articles:')} ${logger.chalk.white.bold(
      articleCount,
    )}
${logger.colors.info('Headless Mode:')} ${logger.chalk.white.bold(
      headless ? 'Yes' : 'No',
    )}
${logger.colors.info('Export JSON:')} ${logger.chalk.white.bold(
      exportJson ? 'Yes' : 'No',
    )}
${logger.colors.info('Export CSV:')} ${logger.chalk.white.bold(
      exportCsv ? 'Yes' : 'No',
    )}
${logger.colors.info('Debug Mode:')} ${logger.chalk.white.bold(
      debug ? 'Yes' : 'No',
    )}
${logger.colors.info('System:')} ${logger.chalk.white.bold(
      `${systemInfo.platform} ${systemInfo.arch} Node ${systemInfo.nodeVersion}`,
    )}`,
    {
      title: '⚙️  Configuration',
      titleAlignment: 'center',
      borderColor: 'blue',
    },
  );

  perfMonitor.startPhase('browser_launch');
  let spinner = ora({
    text: 'Launching browser...',
    spinner: 'dots',
    color: 'cyan',
  }).start();

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    userAgent: config.USER_AGENT,
    viewport: config.VIEWPORT,
  });
  const page = await context.newPage();

  let articles = [];
  let pageNumber = 1;
  let startTime = Date.now();

  try {
    perfMonitor.endPhase().startPhase('navigation');

    // --- Navigation and Extraction ---
    spinner.text = 'Navigating to Hacker News...';
    const navStart = Date.now();
    await retry(
      async () => {
        await page.goto(config.HN_URL, { timeout });
        await page.waitForSelector(config.SELECTORS.ARTICLE_ROW, { timeout });
      },
      retryAttempts,
      retryDelay,
      logger,
    );

    const loadTime = Date.now() - navStart;
    perfMonitor.recordNetworkRequest(loadTime);
    spinner.succeed(`${logger.icons.network} Successfully loaded Hacker News`);

    perfMonitor.endPhase().startPhase('article_extraction');

    // Create progress bar for article extraction
    const progressBar = new cliProgress.SingleBar({
      format: `${logger.icons.article} Extracting Articles |${logger.chalk.cyan(
        '{bar}',
      )}| {percentage}% | {value}/{total} | ETA: {eta}s`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    });
    progressBar.start(articleCount, 0);

    // --- Pagination: Load enough articles ---
    while (articles.length < articleCount) {
      const rows = await page.$$(config.SELECTORS.ARTICLE_ROW);

      if (debug)
        logger.info(`Page ${pageNumber}: Found ${rows.length} article rows`);

      // Extract articles from current page
      for (let i = 0; i < rows.length && articles.length < articleCount; i++) {
        const row = rows[i];
        const id = await row.getAttribute('id');

        // Skip if we already have this article (avoid duplicates)
        if (articles.some((article) => article.id === id)) {
          if (debug) logger.debug(`Skipping duplicate article: ${id}`);
          continue;
        }

        const titleEl = await row.$(config.SELECTORS.TITLE);
        const title = titleEl ? await titleEl.innerText() : '';

        // Get rank number for verification
        const rankEl = await row.$('td.title .rank');
        const rank = rankEl ? await rankEl.innerText() : '';

        // Subtext is in the next row
        const subtextRow = await row.evaluateHandle(
          (r) => r.nextElementSibling,
        );
        const ageEl = await subtextRow.$(config.SELECTORS.AGE);
        const ageText = ageEl ? await ageEl.innerText() : '';

        // Extract additional metadata
        const scoreEl = await subtextRow.$('.score');
        const score = scoreEl ? await scoreEl.innerText() : '0 points';

        const authorEl = await subtextRow.$('.hnuser');
        const author = authorEl ? await authorEl.innerText() : 'unknown';

        let timestamp = null;
        try {
          timestamp = parseHackerNewsTime(ageText);
        } catch (e) {
          if (debug)
            logger.warn(
              `Failed to parse timestamp for article ${id}:`,
              ageText,
            );
        }

        articles.push({
          position: articles.length + 1,
          id,
          title,
          rank: rank.replace('.', ''),
          ageText,
          timestamp,
          score,
          author,
          pageNumber,
          extractedAt: new Date(),
        });

        progressBar.update(articles.length);
      }

      if (articles.length < articleCount) {
        // Click 'More' to load next page
        progressBar.stop();
        pageNumber++;

        const paginationStart = Date.now();
        spinner = ora({
          text: `Loading page ${pageNumber} (${articles.length}/${articleCount} articles)...`,
          spinner: 'dots',
          color: 'yellow',
        }).start();

        if (debug)
          logger.info(
            `Current articles: ${articles.length}, clicking More for page ${pageNumber}...`,
          );

        // Use retry mechanism for clicking More
        try {
          await retry(
            async () => {
              // Find the More link fresh each time to avoid stale element references
              const moreLink = await page.$(config.SELECTORS.MORE_LINK);
              if (!moreLink) {
                throw new Error('More link not found');
              }

              if (debug)
                logger.info(
                  `Before click: Current articles=${articles.length}`,
                );

              await moreLink.click();

              // Wait for navigation to complete and new articles to load
              let attempts = 0;
              const maxAttempts = 10;
              let newArticlesFound = false;

              while (attempts < maxAttempts && !newArticlesFound) {
                await page.waitForTimeout(1000);
                attempts++;

                try {
                  await page.waitForSelector(config.SELECTORS.ARTICLE_ROW, {
                    timeout: 2000,
                  });
                  const newRows = await page.$$(config.SELECTORS.ARTICLE_ROW);

                  // Check if we have new articles by looking at the first article's ID
                  if (newRows.length > 0) {
                    const firstNewRow = newRows[0];
                    const firstNewId = await firstNewRow.getAttribute('id');

                    // If this is a new article we haven't seen, we're good
                    if (
                      !articles.some((article) => article.id === firstNewId)
                    ) {
                      newArticlesFound = true;
                      if (debug)
                        logger.info(
                          `Found new articles starting with ID: ${firstNewId}`,
                        );
                    }
                  }

                  if (debug && attempts % 3 === 0) {
                    logger.info(
                      `Attempt ${attempts}: Checking for new articles...`,
                    );
                  }
                } catch (e) {
                  if (debug)
                    logger.warn(`Attempt ${attempts}: Error checking articles`);
                }
              }

              if (!newArticlesFound) {
                throw new Error(`No new articles found after clicking More`);
              }

              return true;
            },
            1,
            3000,
            debug ? logger : null,
          );

          const paginationTime = Date.now() - paginationStart;
          perfMonitor.recordPaginationClick(paginationTime);

          spinner.succeed(`Page ${pageNumber} loaded successfully`);
          progressBar.start(articleCount, articles.length);
        } catch (err) {
          if (err.message.includes('More link not found')) {
            spinner.warn('No more articles available');
          } else {
            spinner.warn(`Failed to load more articles: ${err.message}`);
          }
          break;
        }
      }
    }

    progressBar.stop();
    perfMonitor.endPhase().startPhase('validation');

    logger.separator();

    // --- Advanced Validation ---
    spinner = ora({
      text: 'Performing comprehensive validation analysis...',
      spinner: 'clock',
      color: 'magenta',
    }).start();

    // Set articles processed for performance metrics
    perfMonitor.setArticlesProcessed(articles.length);

    // Generate comprehensive validation report
    const validationReport = generateValidationReport(articles);

    spinner.stop();

    perfMonitor.endPhase();

    // --- Export (optional) ---
    if (exportJson || exportCsv) {
      perfMonitor.startPhase('export');
      spinner = ora({
        text: 'Exporting data and reports...',
        spinner: 'bouncingBar',
        color: 'blue',
      }).start();

      if (exportJson) {
        exportJSON(articles, `${config.EXPORT_PATH}.json`);
        exportJSON(validationReport, `${config.EXPORT_PATH}_report.json`);
      }
      if (exportCsv) {
        exportCSV(articles, `${config.EXPORT_PATH}.csv`);
      }

      spinner.succeed('Data exported successfully');
      perfMonitor.endPhase();
    }

    // --- Comprehensive Reporting ---
    perfMonitor.end();
    const performanceReport = perfMonitor.getReport();

    logger.separator();

    // Main validation results
    if (validationReport.summary.validationPassed) {
      logger.successBox('🎉 VALIDATION SUCCESSFUL!', [
        `All ${articles.length} articles are properly sorted from newest to oldest`,
        `Data quality score: ${validationReport.summary.dataQualityScore}/100`,
        `Validation completed in ${performanceReport.summary.totalDurationFormatted}`,
        `Articles processed: ${articles.length}/${articleCount}`,
        `Pages processed: ${pageNumber}`,
      ]);
    } else {
      const details = [
        validationReport.summary.isChronologicallyValid
          ? '✓ Chronological order is correct'
          : `✗ Found ${validationReport.chronological.violations.length} chronological violations`,
        validationReport.summary.hasDuplicates
          ? `✗ Found ${validationReport.duplicates.duplicates.byId.length} duplicate articles`
          : '✓ No duplicate articles found',
        `Data quality score: ${validationReport.summary.dataQualityScore}/100`,
        `Articles processed: ${articles.length}/${articleCount}`,
        `Pages processed: ${pageNumber}`,
      ];

      logger.errorBox('❌ VALIDATION ISSUES DETECTED', details);

      // Show detailed violation information if debug mode
      if (debug && validationReport.chronological.violations.length > 0) {
        const v = validationReport.chronological.violations[0];
        logger.error(
          `${logger.icons.cross} First violation: Article "${v.current.title}" (ID: ${v.current.id}) at position ${v.current.position} is newer than the previous article`,
        );
        logger.error(
          `Previous: ${v.previous.formatted}, Current: ${v.current.formatted}`,
        );
      }
    }

    // Performance and system statistics
    logger.statsBox({
      'Execution Time': performanceReport.summary.totalDurationFormatted,
      'Articles/Second': performanceReport.efficiency.articlesPerSecond,
      'Pages Processed': pageNumber,
      'Network Requests': performanceReport.summary.networkRequests,
      'Peak Memory': `${performanceReport.summary.peakMemoryMB} MB`,
      'Memory Delta': `${performanceReport.summary.memoryDeltaMB} MB`,
      'Data Quality Score': `${validationReport.summary.dataQualityScore}/100`,
      'Average Time Gap': validationReport.chronological.averageGap
        ? `${Math.round(
            validationReport.chronological.averageGap / 1000 / 60,
          )} minutes`
        : 'N/A',
    });

    // Show recommendations if any
    if (validationReport.recommendations.length > 0) {
      logger.box(
        `${
          logger.icons.info
        } Recommendations:\n\n${validationReport.recommendations
          .map((r) => `• ${r}`)
          .join('\n')}`,
        {
          title: '💡 Recommendations',
          titleAlignment: 'center',
          borderColor: 'yellow',
        },
      );
    }

    // Show phase breakdown in debug mode
    if (debug) {
      logger.separator();
      logger.info('Performance Phase Breakdown:');
      Object.entries(performanceReport.phases).forEach(([phase, data]) => {
        logger.info(
          `  ${phase}: ${data.durationFormatted} (${data.percentage}%)`,
        );
      });
    }

    return {
      success: validationReport.summary.validationPassed,
      articles,
      validationReport,
      performanceReport,
      systemInfo,
      pages: pageNumber,
      execTime: performanceReport.summary.totalDuration / 1000,
      loadTime: loadTime,
      newest: validationReport.chronological.newest,
      oldest: validationReport.chronological.oldest,
    };
  } catch (err) {
    if (spinner) spinner.fail('Fatal error occurred');
    perfMonitor.end();

    logger.errorBox('💥 FATAL ERROR', [
      'An unexpected error occurred during validation',
      err.message,
      'Check your network connection and try again',
      debug ? `Stack trace: ${err.stack}` : 'Run with --debug for more details',
    ]);

    return {
      success: false,
      error: err,
      performanceReport: perfMonitor.getReport(),
      systemInfo,
    };
  } finally {
    await browser.close();
  }
}

module.exports = {
  validateHackerNewsArticles,
};
