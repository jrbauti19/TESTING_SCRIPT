// index.js
// Entry point for the Hacker News sorting validation script

const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const logger = require('./logger');
const { validateHackerNewsArticles } = require('./hnScraper');

// --- CLI Options ---
const argv = yargs(hideBin(process.argv))
  .scriptName('node index.js')
  .usage(
    '🐺 QA Wolf Take Home - Hacker News Article Sorting Validator\n\nUsage: $0 [options]',
  )
  .option('count', {
    alias: 'c',
    type: 'number',
    description: 'Number of articles to validate',
    default: 100,
  })
  .option('export-json', {
    type: 'boolean',
    description: 'Export extracted data and reports to JSON',
    default: false,
  })
  .option('export-csv', {
    type: 'boolean',
    description: 'Export extracted data to CSV',
    default: false,
  })
  .option('headless', {
    type: 'boolean',
    description: 'Run browser in headless mode',
    default: true,
  })
  .option('debug', {
    type: 'boolean',
    description: 'Enable debug logging and detailed output',
    default: false,
  })
  .option('timeout', {
    type: 'number',
    description: 'Network timeout in milliseconds',
    default: 15000,
  })
  .option('retries', {
    type: 'number',
    description: 'Number of retry attempts for failed operations',
    default: 3,
  })
  .option('quiet', {
    alias: 'q',
    type: 'boolean',
    description: 'Suppress non-essential output',
    default: false,
  })
  .example('$0', 'Validate 100 articles in headless mode')
  .example(
    '$0 --count 50 --headless=false',
    'Validate 50 articles with visible browser',
  )
  .example(
    '$0 --export-json --export-csv --debug',
    'Full validation with exports and debug info',
  )
  .example(
    '$0 --count 200 --timeout 30000',
    'Validate 200 articles with extended timeout',
  )
  .help('h')
  .alias('h', 'help')
  .version('2.0.0').epilog(`
🚀 Advanced Features:
• Comprehensive data quality analysis
• Performance monitoring and metrics
• Duplicate detection and prevention
• Advanced chronological validation
• Detailed reporting with recommendations
• Export capabilities (JSON/CSV)
• Robust error handling and retries

Made with ❤️  for QA Wolf`).argv;

// Validate arguments
if (argv.count < 1 || argv.count > 1000) {
  logger.errorBox('❌ INVALID ARGUMENTS', [
    'Article count must be between 1 and 1000',
    `You specified: ${argv.count}`,
    'Use --help for more information',
  ]);
  process.exit(1);
}

if (argv.timeout < 1000 || argv.timeout > 60000) {
  logger.errorBox('❌ INVALID ARGUMENTS', [
    'Timeout must be between 1000ms and 60000ms',
    `You specified: ${argv.timeout}ms`,
    'Use --help for more information',
  ]);
  process.exit(1);
}

(async () => {
  const startTime = Date.now();

  try {
    const result = await validateHackerNewsArticles({
      articleCount: argv.count,
      exportJson: argv['export-json'],
      exportCsv: argv['export-csv'],
      debug: argv.debug,
      headless: argv.headless,
      timeout: argv.timeout,
      retryAttempts: argv.retries,
      quiet: argv.quiet,
    });

    // Show final summary unless quiet mode
    if (!argv.quiet) {
      const totalTime = (Date.now() - startTime) / 1000;

      logger.separator();
      logger.box(
        `${result.success ? '🎉' : '⚠️'} VALIDATION ${
          result.success ? 'COMPLETED' : 'FINISHED'
        }\n\n` +
          `Result: ${
            result.success
              ? logger.chalk.green('PASSED')
              : logger.chalk.yellow('ISSUES DETECTED')
          }\n` +
          `Articles: ${result.articles?.length || 0}/${argv.count}\n` +
          `Pages: ${result.pages || 'N/A'}\n` +
          `Duration: ${totalTime.toFixed(2)}s\n` +
          `Quality Score: ${
            result.validationReport?.summary?.dataQualityScore || 'N/A'
          }/100`,
        {
          title: '📋 Final Summary',
          titleAlignment: 'center',
          borderColor: result.success ? 'green' : 'yellow',
        },
      );

      if (result.validationReport?.recommendations?.length > 0) {
        logger.info(
          `💡 ${result.validationReport.recommendations.length} recommendation(s) provided above`,
        );
      }

      if (argv['export-json'] || argv['export-csv']) {
        logger.info('📁 Exported data available in current directory');
      }
    }

    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);
  } catch (err) {
    logger.errorBox('💥 SCRIPT FAILED', [
      'An unexpected error occurred',
      err.message,
      'Please check your setup and try again',
      argv.debug
        ? `Stack: ${err.stack}`
        : 'Use --debug for detailed error information',
    ]);
    process.exit(1);
  }
})();
