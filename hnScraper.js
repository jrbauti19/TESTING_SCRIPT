// hnScraper.js
// Clean entry point for Hacker News article validation

const { ValidationOrchestrator } = require('./scrapers/validationOrchestrator');
const logger = require('./logger');

/**
 * Scrape and validate the newest articles on Hacker News.
 * This is the main entry point that orchestrates the entire validation process.
 *
 * @param {Object} options - Options for the validation run
 * @param {number} options.articleCount - Number of articles to validate (default: 100)
 * @param {boolean} options.exportJson - Export extracted data to JSON (default: false)
 * @param {boolean} options.exportCsv - Export extracted data to CSV (default: false)
 * @param {boolean} options.debug - Enable debug logging (default: false)
 * @param {boolean} options.headless - Run browser in headless mode (default: true)
 * @param {number} options.timeout - Network timeout in milliseconds (default: 15000)
 * @param {number} options.retryAttempts - Number of retry attempts (default: 3)
 * @param {number} options.retryDelay - Delay between retries in milliseconds (default: 1000)
 * @param {boolean} options.quiet - Suppress non-essential output (default: false)
 * @param {boolean} options.interactive - Enable interactive mode (default: true)
 * @param {boolean} options.accessibility - Run accessibility audit (default: false)
 * @param {boolean} options.demo - Enable demo mode (default: false)
 *
 * @returns {Promise<Object>} Validation results containing:
 *   - success: boolean - Whether validation passed
 *   - articles: Array - Extracted article data
 *   - validationReport: Object - Detailed validation analysis
 *   - performanceReport: Object - Performance metrics
 *   - systemInfo: Object - System information
 *   - pages: number - Number of pages processed
 *   - execTime: number - Total execution time in seconds
 *   - loadTime: number - Initial page load time in milliseconds
 *   - newest: Object - Newest article information
 *   - oldest: Object - Oldest article information
 *   - error: Error - Error object if validation failed
 *
 * @example
 * // Basic validation
 * const result = await validateHackerNewsArticles({ articleCount: 50 });
 *
 * // Full validation with exports and debug
 * const result = await validateHackerNewsArticles({
 *   articleCount: 100,
 *   exportJson: true,
 *   exportCsv: true,
 *   debug: true,
 *   headless: false
 * });
 */
async function validateHackerNewsArticles(options = {}) {
  try {
    // Create validation orchestrator with provided options
    const orchestrator = new ValidationOrchestrator(options);

    // Run the complete validation process
    const result = await orchestrator.run();

    // Display results summary (unless in quiet mode)
    if (!options.quiet) {
      displayValidationSummary(result, options);
    }

    return result;
  } catch (error) {
    logger.error('Validation failed:', error.message);

    // Return error result
    return {
      success: false,
      error: error,
      articles: [],
      validationReport: null,
      performanceReport: null,
      systemInfo: null,
      pages: 0,
      execTime: 0,
      loadTime: 0,
    };
  }
}

/**
 * Display validation summary and results
 * @param {Object} result - Validation results
 * @param {Object} options - Validation options
 */
function displayValidationSummary(result, options) {
  logger.separator();

  // Main validation results
  if (result.success) {
    logger.successBox('🎉 VALIDATION SUCCESSFUL!', [
      `All ${result.articles.length} articles are properly sorted from newest to oldest`,
      `Validation completed in ${result.performanceReport.summary.totalDurationFormatted}`,
      `Articles processed: ${result.articles.length}`,
      `Pages processed: ${result.pages}`,
    ]);
  } else {
    const details = [
      result.validationReport?.summary.isChronologicallyValid
        ? '✓ Chronological order is correct'
        : `✗ Found ${
            result.validationReport?.chronological?.violations?.length || 0
          } chronological violations`,
      result.validationReport?.summary.hasDuplicates
        ? `✗ Found ${
            result.validationReport?.duplicates?.duplicates?.byId?.length || 0
          } duplicate articles`
        : '✓ No duplicate articles found',
      `Articles processed: ${result.articles?.length || 0}`,
      `Pages processed: ${result.pages || 0}`,
    ];

    logger.errorBox('❌ VALIDATION ISSUES DETECTED', details);

    // Show detailed violation information if debug mode
    if (
      options.debug &&
      result.validationReport?.chronological?.violations?.length > 0
    ) {
      const v = result.validationReport.chronological.violations[0];
      logger.error(
        `${logger.icons.cross} First violation: Article "${v.current.title}" (ID: ${v.current.id}) at position ${v.current.position} is newer than the previous article`,
      );
      logger.error(
        `Previous: ${v.previous.formatted}, Current: ${v.current.formatted}`,
      );
    }
  }

  // Performance and system statistics
  if (result.performanceReport) {
    logger.statsBox({
      'Execution Time': result.performanceReport.summary.totalDurationFormatted,
      'Articles/Second': result.performanceReport.efficiency.articlesPerSecond,
      'Pages Processed': result.pages,
      'Network Requests': result.performanceReport.summary.networkRequests,
      'Peak Memory': `${result.performanceReport.summary.peakMemoryMB} MB`,
      'Memory Delta': `${result.performanceReport.summary.memoryDeltaMB} MB`,
      'Average Time Gap': result.validationReport?.chronological?.averageGap
        ? `${Math.round(
            result.validationReport.chronological.averageGap / 1000 / 60,
          )} minutes`
        : 'N/A',
    });
  }

  // Show recommendations if any
  if (result.validationReport?.recommendations?.length > 0) {
    logger.box(
      `${
        logger.icons.info
      } Recommendations:\n\n${result.validationReport.recommendations
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
  if (options.debug && result.performanceReport?.phases) {
    logger.separator();
    logger.info('Performance Phase Breakdown:');
    Object.entries(result.performanceReport.phases).forEach(([phase, data]) => {
      logger.info(
        `  ${phase}: ${data.durationFormatted} (${data.percentage}%)`,
      );
    });
  }
}

module.exports = {
  validateHackerNewsArticles,
};
