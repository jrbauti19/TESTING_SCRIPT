/**
 * CLI Configuration Module
 * Handles argument parsing, validation, and help text generation
 */

const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const logger = require('../logger');

/**
 * Parse and validate CLI arguments
 * @returns {Object} Validated CLI options
 */
function parseArguments() {
  const argv = yargs(hideBin(process.argv))
    .scriptName('node index.js')
    .usage(
      '🚀 Please Hire Me - Advanced Hacker News Validator\n\nUsage: $0 [options]',
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
    .option('interactive', {
      alias: 'i',
      type: 'boolean',
      description: 'Enable interactive mode with post-validation options',
      default: true,
    })
    .option('accessibility', {
      type: 'boolean',
      description: 'Run accessibility audit after validation',
      default: false,
    })
    .option('security', {
      type: 'boolean',
      description: 'Run comprehensive security assessment after validation',
      default: false,
    })
    .option('demo', {
      type: 'boolean',
      description: 'Enable demo mode with visible browser and enhanced output',
      default: false,
    })
    .example('$0', 'Validate 100 articles with interactive mode')
    .example(
      '$0 --count 50 --headless=false',
      'Validate 50 articles with visible browser',
    )
    .example(
      '$0 --export-json --export-csv --debug',
      'Full validation with exports and debug info',
    )
    .example(
      '$0 --count 200 --timeout 30000 --no-interactive',
      'Validate 200 articles non-interactively',
    )
    .example(
      '$0 --accessibility --interactive',
      'Validate with accessibility audit and interactive menu',
    )
    .example(
      '$0 --security --interactive',
      'Validate with security assessment and interactive menu',
    )
    .example(
      '$0 --demo --count 20',
      'Run demo mode with visible browser and 20 articles',
    )
    .help('h')
    .alias('h', 'help')
    .version('2.0.0')
    .epilog(generateHelpEpilog()).argv;

  return argv;
}

/**
 * Validate CLI arguments and exit if invalid
 * @param {Object} argv - Parsed arguments
 */
function validateArguments(argv) {
  // Validate article count
  if (argv.count < 1 || argv.count > 1000) {
    logger.errorBox('❌ INVALID ARGUMENTS', [
      'Article count must be between 1 and 1000',
      `You specified: ${argv.count}`,
      'Use --help for more information',
    ]);
    process.exit(1);
  }

  // Validate timeout
  if (argv.timeout < 1000 || argv.timeout > 60000) {
    logger.errorBox('❌ INVALID ARGUMENTS', [
      'Timeout must be between 1000ms and 60000ms',
      `You specified: ${argv.timeout}ms`,
      'Use --help for more information',
    ]);
    process.exit(1);
  }

  // Validate retry attempts
  if (argv.retries < 0 || argv.retries > 10) {
    logger.errorBox('❌ INVALID ARGUMENTS', [
      'Retry attempts must be between 0 and 10',
      `You specified: ${argv.retries}`,
      'Use --help for more information',
    ]);
    process.exit(1);
  }
}

/**
 * Convert CLI arguments to application options
 * @param {Object} argv - Parsed CLI arguments
 * @returns {Object} Application options
 */
function createApplicationOptions(argv) {
  return {
    articleCount: argv.count,
    exportJson: argv['export-json'],
    exportCsv: argv['export-csv'],
    debug: argv.debug,
    headless: argv.headless,
    timeout: argv.timeout,
    retryAttempts: argv.retries,
    quiet: argv.quiet,
    interactive: argv.interactive,
    accessibility: argv.accessibility,
    security: argv.security,
    demo: argv.demo,
  };
}

/**
 * Generate comprehensive help epilog
 * @returns {string} Help epilog text
 */
function generateHelpEpilog() {
  return `
🚀 Advanced Features:
• Interactive post-validation menu with article context
• Accessibility testing with WCAG compliance & article mapping
• Security assessment with comprehensive vulnerability scanning
• Localhost report viewer with interactive charts
• Continue validation with more articles
• Advanced data analysis and statistics
• Export capabilities (JSON/CSV)
• Performance monitoring and metrics
• Comprehensive error handling

🎯 Interactive Features:
• Export detailed reports
• Run accessibility audits with article-specific violations
• Run security assessments with vulnerability scanning
• Launch localhost report viewer
• Continue with more articles
• View performance breakdowns
• Advanced data analysis

📧 Contact Information:
• Email: jrbauti19@gmail.com
• LinkedIn: https://www.linkedin.com/in/joshua-raphael-bautista-8a019a11b/
• Portfolio: https://www.joshuabautista.dev/

Made with ❤️  by Joshua Bautista for QA Wolf`;
}

module.exports = {
  parseArguments,
  validateArguments,
  createApplicationOptions,
};
