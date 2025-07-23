// index.js
// Entry point for the Hacker News sorting validation script

const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const logger = require('./logger');
const { validateHackerNewsArticles } = require('./hnScraper');
const { showPostValidationMenu } = require('./utils/interactive');

// --- CLI Options ---
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
  .help('h')
  .alias('h', 'help')
  .version('2.0.0').epilog(`
🚀 Advanced Features:
• Interactive post-validation menu with article context
• Accessibility testing with WCAG compliance & article mapping
• Localhost report viewer with interactive charts
• Continue validation with more articles
• Advanced data analysis and statistics
• Export capabilities (JSON/CSV)
• Performance monitoring and metrics
• Comprehensive error handling

🎯 Interactive Features:
• Export detailed reports
• Run accessibility audits with article-specific violations
• Launch localhost report viewer
• Continue with more articles
• View performance breakdowns
• Advanced data analysis

📧 Contact Information:
• Email: jrbauti19@gmail.com
• LinkedIn: https://www.linkedin.com/in/joshua-raphael-bautista-8a019a11b/
• Portfolio: https://www.joshuabautista.dev/

Made with ❤️  by Joshua Bautista for QA Wolf`).argv;

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
    const options = {
      articleCount: argv.count,
      exportJson: argv['export-json'],
      exportCsv: argv['export-csv'],
      debug: argv.debug,
      headless: argv.headless,
      timeout: argv.timeout,
      retryAttempts: argv.retries,
      quiet: argv.quiet,
    };

    const result = await validateHackerNewsArticles(options);

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

      // Display contact information
      logger.separator();
      logger.box(
        `👨‍💻 Thank you for reviewing my QA Wolf take-home assignment!

📧 Contact Information:
• Email: jrbauti19@gmail.com
• LinkedIn: https://www.linkedin.com/in/joshua-raphael-bautista-8a019a11b/
• Portfolio: https://www.joshuabautista.dev/

🚀 This application demonstrates:
• Advanced Playwright automation with error handling
• Modular architecture with separation of concerns
• Interactive CLI with rich user experience
• Accessibility testing with article-specific context
• Performance monitoring and data visualization
• Production-ready logging and reporting systems

I look forward to discussing this project and the QA Wolf opportunity!`,
        {
          title: '💼 Joshua Bautista - QA Engineer',
          titleAlignment: 'center',
          borderColor: 'cyan',
          padding: 1,
        },
      );
    }

    // Interactive mode - show post-validation menu
    if (argv.interactive && !argv.quiet) {
      try {
        await showPostValidationMenu(result, options);
      } catch (interactiveError) {
        logger.warn(
          'Interactive mode encountered an error:',
          interactiveError.message,
        );
        if (argv.debug) {
          logger.debug('Interactive error stack:', interactiveError.stack);
        }
      }
    }

    // Run accessibility audit if requested
    if (argv.accessibility) {
      const {
        performAccessibilityAudit,
        generateAccessibilityReport,
      } = require('./utils/accessibility');
      const { chromium } = require('playwright');

      const spinner = logger
        .ora({
          text: 'Running accessibility audit...',
          spinner: 'dots',
          color: 'magenta',
        })
        .start();

      try {
        const browser = await chromium.launch({ headless: options.headless });
        const page = await browser.newPage();
        await page.goto('https://news.ycombinator.com/newest');

        const auditResults = await performAccessibilityAudit(page, {
          tags: ['wcag21aa'],
          debug: options.debug,
        });

        await browser.close();
        spinner.stop();

        const report = generateAccessibilityReport(auditResults);

        // Display accessibility summary
        const gradeColor = report.executive.grade.startsWith('A')
          ? 'green'
          : report.executive.grade.startsWith('B')
          ? 'yellow'
          : 'red';

        logger.box(
          `♿ Accessibility Score: ${logger.chalk[gradeColor](
            report.executive.grade,
          )} (${report.executive.score}/100)
        
📊 Summary:
• Total Violations: ${report.executive.totalViolations}
• Critical Issues: ${report.executive.criticalIssues}
• WCAG Compliance: ${report.executive.wcagCompliance}`,
          {
            title: '♿ Accessibility Report',
            titleAlignment: 'center',
            borderColor: gradeColor,
          },
        );

        if (report.recommendations.length > 0) {
          logger.box(report.recommendations.join('\n'), {
            title: '💡 Accessibility Recommendations',
            borderColor: 'yellow',
          });
        }
      } catch (accessibilityError) {
        spinner.fail('Accessibility audit failed');
        logger.error('Accessibility error:', accessibilityError.message);
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
