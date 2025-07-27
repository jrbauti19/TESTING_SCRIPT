/**
 * Validation Orchestrator Module
 * Main orchestration logic for Hacker News article validation
 */

const ora = require('ora');
const cliProgress = require('cli-progress');
const config = require('../config');
const logger = require('../logger');
const { retry } = require('../utils/retry');
const { exportJSON, exportCSV } = require('../utils/export');
const { generateValidationReport } = require('../utils/validation');
const { createMonitor, getSystemInfo } = require('../utils/performance');
const { BrowserManager } = require('./browserManager');
const { extractArticlesFromPage } = require('./articleExtractor');
const { clickMoreAndWaitForArticles } = require('./paginationHandler');

/**
 * Main validation orchestrator class
 */
class ValidationOrchestrator {
  constructor(options = {}) {
    this.options = {
      articleCount: config.ARTICLE_COUNT,
      exportJson: false,
      exportCsv: false,
      debug: false,
      headless: true,
      timeout: config.TIMEOUT,
      retryAttempts: config.RETRY_ATTEMPTS,
      retryDelay: config.RETRY_DELAY,
      ...options,
    };

    this.browserManager = new BrowserManager();
    this.perfMonitor = createMonitor();
    this.systemInfo = getSystemInfo();
    this.articles = [];
    this.pageNumber = 1;
  }

  /**
   * Display configuration information
   */
  displayConfiguration() {
    logger.banner('Please Hire Me');

    logger.box(
      `${
        logger.icons.rocket
      } Starting validation with the following configuration:
    
${logger.colors.info('Target Articles:')} ${logger.chalk.white.bold(
        this.options.articleCount,
      )}
${logger.colors.info('Headless Mode:')} ${logger.chalk.white.bold(
        this.options.headless ? 'Yes' : 'No',
      )}
${logger.colors.info('Export JSON:')} ${logger.chalk.white.bold(
        this.options.exportJson ? 'Yes' : 'No',
      )}
${logger.colors.info('Export CSV:')} ${logger.chalk.white.bold(
        this.options.exportCsv ? 'Yes' : 'No',
      )}
${logger.colors.info('Debug Mode:')} ${logger.chalk.white.bold(
        this.options.debug ? 'Yes' : 'No',
      )}
${logger.colors.info('System:')} ${logger.chalk.white.bold(
        `${this.systemInfo.platform} ${this.systemInfo.arch} Node ${this.systemInfo.nodeVersion}`,
      )}`,
      {
        title: '⚙️  Configuration',
        titleAlignment: 'center',
        borderColor: 'blue',
      },
    );
  }

  /**
   * Initialize browser and navigate to Hacker News
   * @returns {Promise<number>} Load time in milliseconds
   */
  async initializeBrowser() {
    this.perfMonitor.start().startPhase('browser_launch');

    const spinner = ora({
      text: 'Launching browser...',
      spinner: 'dots',
      color: 'cyan',
    }).start();

    try {
      await this.browserManager.launch({
        headless: this.options.headless,
        timeout: this.options.timeout,
      });

      this.perfMonitor.endPhase().startPhase('navigation');
      spinner.text = 'Navigating to Hacker News...';

      const loadTime = await retry(
        async () => {
          return await this.browserManager.navigateToHackerNews(
            this.options.timeout,
          );
        },
        this.options.retryAttempts,
        this.options.retryDelay,
        logger,
      );

      this.perfMonitor.recordNetworkRequest(loadTime);
      spinner.succeed(
        `${logger.icons.network} Successfully loaded Hacker News`,
      );

      return loadTime;
    } catch (error) {
      spinner.fail('Failed to initialize browser');
      throw error;
    }
  }

  /**
   * Extract articles with pagination
   * @returns {Promise<Array>} Array of extracted articles
   */
  async extractArticles() {
    this.perfMonitor.endPhase().startPhase('article_extraction');

    // Create progress bar for article extraction
    const progressBar = new cliProgress.SingleBar({
      format: `${logger.icons.article} Extracting Articles |${logger.chalk.cyan(
        '{bar}',
      )}| {percentage}% | {value}/{total} | ETA: {eta}s`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    });
    progressBar.start(this.options.articleCount, 0);

    try {
      // Extract articles from pages until we have enough
      while (this.articles.length < this.options.articleCount) {
        const page = this.browserManager.getPage();

        // Extract articles from current page
        const newArticles = await extractArticlesFromPage(
          page,
          this.articles,
          this.options.articleCount - this.articles.length,
          this.pageNumber,
          this.options.debug,
        );

        this.articles.push(...newArticles);
        progressBar.update(this.articles.length);

        // Check if we need more articles
        if (this.articles.length < this.options.articleCount) {
          await this.loadNextPage(progressBar);
        }
      }

      progressBar.stop();
      this.perfMonitor.endPhase();

      return this.articles;
    } catch (error) {
      progressBar.stop();
      throw error;
    }
  }

  /**
   * Load the next page of articles
   * @param {Object} progressBar - Progress bar instance
   */
  async loadNextPage(progressBar) {
    this.pageNumber++;
    const page = this.browserManager.getPage();

    const paginationStart = Date.now();
    const spinner = ora({
      text: `Loading page ${this.pageNumber} (${this.articles.length}/${this.options.articleCount} articles)...`,
      spinner: 'dots',
      color: 'yellow',
    }).start();

    try {
      await retry(
        async () => {
          return await clickMoreAndWaitForArticles(
            page,
            this.articles,
            this.pageNumber,
            this.options.debug,
          );
        },
        this.options.retryAttempts,
        3000,
        this.options.debug ? logger : null,
      );

      const paginationTime = Date.now() - paginationStart;
      this.perfMonitor.recordPaginationClick(paginationTime);

      spinner.succeed(`Page ${this.pageNumber} loaded successfully`);
      progressBar.start(this.options.articleCount, this.articles.length);
    } catch (error) {
      if (error.message.includes('More link not found')) {
        spinner.warn('No more articles available');
      } else {
        spinner.warn(`Failed to load more articles: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Perform validation analysis
   * @returns {Promise<Object>} Validation report
   */
  async performValidation() {
    this.perfMonitor.startPhase('validation');

    const spinner = ora({
      text: 'Performing comprehensive validation analysis...',
      spinner: 'clock',
      color: 'magenta',
    }).start();

    try {
      // Set articles processed for performance metrics
      this.perfMonitor.setArticlesProcessed(this.articles.length);

      // Generate comprehensive validation report
      const validationReport = generateValidationReport(this.articles);

      spinner.stop();
      this.perfMonitor.endPhase();

      return validationReport;
    } catch (error) {
      spinner.fail('Validation analysis failed');
      throw error;
    }
  }

  /**
   * Export data if requested
   */
  async exportData() {
    if (!this.options.exportJson && !this.options.exportCsv) {
      return;
    }

    this.perfMonitor.startPhase('export');

    const spinner = ora({
      text: 'Exporting data and reports...',
      spinner: 'bouncingBar',
      color: 'blue',
    }).start();

    try {
      if (this.options.exportJson) {
        exportJSON(this.articles, `${config.EXPORT_PATH}.json`);
        exportJSON(this.validationReport, `${config.EXPORT_PATH}_report.json`);
      }

      if (this.options.exportCsv) {
        exportCSV(this.articles, `${config.EXPORT_PATH}.csv`);
      }

      spinner.succeed('Data exported successfully');
      this.perfMonitor.endPhase();
    } catch (error) {
      spinner.fail('Export failed');
      throw error;
    }
  }

  /**
   * Generate final results
   * @param {Object} validationReport - Validation report
   * @param {number} loadTime - Initial page load time
   * @returns {Promise<Object>} Complete results object
   */
  async generateResults(validationReport, loadTime) {
    this.perfMonitor.end();
    const performanceReport = this.perfMonitor.getReport();

    return {
      success: validationReport.summary.validationPassed,
      articles: this.articles,
      validationReport,
      performanceReport,
      systemInfo: this.systemInfo,
      pages: this.pageNumber,
      execTime: performanceReport.summary.totalDuration / 1000,
      loadTime: loadTime,
      newest: validationReport.chronological.newest,
      oldest: validationReport.chronological.oldest,
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    await this.browserManager.close();
  }

  /**
   * Run the complete validation process
   * @returns {Promise<Object>} Validation results
   */
  async run() {
    let loadTime = 0;

    try {
      // Display configuration
      this.displayConfiguration();

      // Initialize browser and navigate
      loadTime = await this.initializeBrowser();

      // Extract articles
      await this.extractArticles();

      // Perform validation
      this.validationReport = await this.performValidation();

      // Export data if requested
      await this.exportData();

      // Generate and return results
      return await this.generateResults(this.validationReport, loadTime);
    } catch (error) {
      this.perfMonitor.end();

      logger.errorBox('💥 FATAL ERROR', [
        'An unexpected error occurred during validation',
        error.message,
        'Check your network connection and try again',
        this.options.debug
          ? `Stack trace: ${error.stack}`
          : 'Run with --debug for more details',
      ]);

      return {
        success: false,
        error: error,
        performanceReport: this.perfMonitor.getReport(),
        systemInfo: this.systemInfo,
      };
    } finally {
      await this.cleanup();
    }
  }
}

module.exports = {
  ValidationOrchestrator,
};
