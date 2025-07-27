/**
 * Output Display Module
 * Handles all terminal output, summaries, and formatting
 */

const logger = require('../logger');

/**
 * Display final validation summary
 * @param {Object} result - Validation result
 * @param {Object} options - Application options
 * @param {number} startTime - Start timestamp
 */
function displayFinalSummary(result, options, startTime) {
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
      `Articles: ${result.articles?.length || 0}/${options.articleCount}\n` +
      `Pages: ${result.pages || 'N/A'}\n` +
      `Duration: ${totalTime.toFixed(2)}s\n` +
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

  if (options.exportJson || options.exportCsv) {
    logger.info('📁 Exported data available in current directory');
  }
}

/**
 * Display contact information and project showcase
 */
function displayContactInfo() {
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

/**
 * Display error message and exit
 * @param {Error} error - Error object
 * @param {Object} options - Application options
 */
function displayError(error, options) {
  logger.errorBox('💥 SCRIPT FAILED', [
    'An unexpected error occurred',
    error.message,
    'Please check your setup and try again',
    options.debug
      ? `Stack: ${error.stack}`
      : 'Use --debug for detailed error information',
  ]);
  process.exit(1);
}

/**
 * Display accessibility audit results
 * @param {Object} auditResults - Accessibility audit results
 * @param {Object} options - Application options
 */
function displayAccessibilityResults(auditResults, options) {
  const report = auditResults.report;
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
}

/**
 * Display accessibility audit error
 * @param {Error} error - Accessibility error
 */
function displayAccessibilityError(error) {
  logger.error('Accessibility audit failed:', error.message);
  if (error.stack) {
    logger.debug('Accessibility error stack:', error.stack);
  }
}

module.exports = {
  displayFinalSummary,
  displayContactInfo,
  displayError,
  displayAccessibilityResults,
  displayAccessibilityError,
};
