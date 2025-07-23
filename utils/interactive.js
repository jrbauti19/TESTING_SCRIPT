// utils/interactive.js
// Interactive CLI utilities for enhanced user experience

const inquirer = require('inquirer');
const logger = require('../logger');
const { exportJSON, exportCSV } = require('./export');
const { validateHackerNewsArticles } = require('../hnScraper');
const {
  performAccessibilityAudit,
  generateAccessibilityReport,
} = require('./accessibility');
const { createReportServer } = require('./reports/reportServer');

/**
 * Show interactive menu after validation completion
 * @param {Object} validationResult - Results from the validation
 * @param {Object} options - Original options
 * @returns {Promise<void>}
 */
async function showPostValidationMenu(validationResult, options) {
  const { articles, validationReport, performanceReport, systemInfo } =
    validationResult;

  logger.separator();
  logger.box(`${logger.icons.rocket} What would you like to do next?`, {
    title: '🎯 Interactive Options',
    titleAlignment: 'center',
    borderColor: 'cyan',
  });

  const choices = [
    {
      name: `📊 Export detailed statistics and reports`,
      value: 'export',
      short: 'Export',
    },
    {
      name: `🔍 Run accessibility audit on Hacker News`,
      value: 'accessibility',
      short: 'Accessibility',
    },
    {
      name: `🌐 Launch localhost report viewer`,
      value: 'localhost',
      short: 'Localhost',
    },
    {
      name: `➕ Continue validation with more articles`,
      value: 'continue',
      short: 'Continue',
    },
    {
      name: `📈 View detailed performance breakdown`,
      value: 'performance',
      short: 'Performance',
    },
    {
      name: `🔬 Advanced data analysis`,
      value: 'analysis',
      short: 'Analysis',
    },
    {
      name: `✅ Exit`,
      value: 'exit',
      short: 'Exit',
    },
  ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Choose an action:',
      choices,
      pageSize: 10,
    },
  ]);

  switch (action) {
    case 'export':
      await handleExportOptions(validationResult);
      break;
    case 'accessibility':
      await handleAccessibilityAudit(articles, options);
      break;
    case 'localhost':
      await handleLocalhostReport(validationResult);
      break;
    case 'continue':
      await handleContinueValidation(validationResult, options);
      break;
    case 'performance':
      await handlePerformanceBreakdown(performanceReport);
      break;
    case 'analysis':
      await handleAdvancedAnalysis(validationResult);
      break;
    case 'exit':
      logger.success(
        '👋 Thanks for checking out my work! Hope to hear from you soon! 🚀',
      );
      return;
  }

  // Show menu again unless user chose to exit
  if (action !== 'exit') {
    await showPostValidationMenu(validationResult, options);
  }
}

/**
 * Handle export options
 * @param {Object} validationResult - Validation results
 */
async function handleExportOptions(validationResult) {
  const { articles, validationReport, performanceReport } = validationResult;

  const { exportTypes } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'exportTypes',
      message: 'What would you like to export?',
      choices: [
        { name: 'Article data (JSON)', value: 'articles_json', checked: true },
        { name: 'Article data (CSV)', value: 'articles_csv', checked: true },
        {
          name: 'Validation report (JSON)',
          value: 'validation_json',
          checked: true,
        },
        {
          name: 'Performance metrics (JSON)',
          value: 'performance_json',
          checked: false,
        },
        {
          name: 'Combined report (JSON)',
          value: 'combined_json',
          checked: false,
        },
      ],
    },
  ]);

  if (exportTypes.length === 0) {
    logger.warn('No export types selected.');
    return;
  }

  const spinner = logger
    .ora({
      text: 'Exporting data...',
      spinner: 'dots',
      color: 'blue',
    })
    .start();

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (exportTypes.includes('articles_json')) {
      exportJSON(articles, `hn_articles_${timestamp}.json`);
    }

    if (exportTypes.includes('articles_csv')) {
      exportCSV(articles, `hn_articles_${timestamp}.csv`);
    }

    if (exportTypes.includes('validation_json')) {
      exportJSON(validationReport, `hn_validation_report_${timestamp}.json`);
    }

    if (exportTypes.includes('performance_json')) {
      exportJSON(performanceReport, `hn_performance_report_${timestamp}.json`);
    }

    if (exportTypes.includes('combined_json')) {
      const combined = {
        articles,
        validationReport,
        performanceReport,
        exportedAt: new Date().toISOString(),
      };
      exportJSON(combined, `hn_combined_report_${timestamp}.json`);
    }

    spinner.succeed(`Successfully exported ${exportTypes.length} file(s)`);

    logger.box(
      `📁 Files exported with timestamp: ${timestamp}\n\nCheck your current directory for the exported files.`,
      {
        title: '✅ Export Complete',
        borderColor: 'green',
      },
    );
  } catch (error) {
    spinner.fail('Export failed');
    logger.error('Export error:', error.message);
  }
}

/**
 * Handle accessibility audit with article context
 * @param {Array} articles - Article data for context
 * @param {Object} options - Original validation options
 */
async function handleAccessibilityAudit(articles = [], options = {}) {
  const { auditOptions } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'auditOptions',
      message: 'Select accessibility audit options:',
      choices: [
        { name: 'WCAG 2.1 AA Compliance', value: 'wcag21aa', checked: true },
        { name: 'WCAG 2.1 AAA Compliance', value: 'wcag21aaa', checked: false },
        { name: 'Keyboard Navigation', value: 'keyboard', checked: true },
        { name: 'Color Contrast', value: 'color-contrast', checked: true },
        {
          name: 'Screen Reader Compatibility',
          value: 'screen-reader',
          checked: true,
        },
        { name: 'Focus Management', value: 'focus', checked: false },
      ],
    },
  ]);

  if (auditOptions.length === 0) {
    logger.warn('No audit options selected.');
    return;
  }

  const spinner = logger
    .ora({
      text: 'Running accessibility audit on Hacker News...',
      spinner: 'dots',
      color: 'magenta',
    })
    .start();

  try {
    // Launch browser for accessibility testing
    const { chromium } = require('playwright');
    const browser = await chromium.launch({ headless: options.headless });
    const page = await browser.newPage();

    await page.goto('https://news.ycombinator.com/newest');

    // Configure audit based on user selections
    const runOnly = [];
    if (auditOptions.includes('wcag21aa')) runOnly.push('wcag21aa');
    if (auditOptions.includes('wcag21aaa')) runOnly.push('wcag21aaa');

    // Use the enhanced auditor with article context
    const { AccessibilityAuditor } = require('./accessibility');
    const auditor = new AccessibilityAuditor();
    const auditResults = await auditor.auditPageWithContext(page, articles, {
      runOnly,
      debug: options.debug,
    });

    await browser.close();
    spinner.stop();

    // Generate and display enhanced report
    const report = auditor.generateReport(auditResults);
    await displayAccessibilityReport(report, auditResults.articleAnalysis);
  } catch (error) {
    spinner.fail('Accessibility audit failed');
    logger.error('Audit error:', error.message);
  }
}

/**
 * Display accessibility report in terminal with article context
 * @param {Object} report - Accessibility report
 * @param {Object} articleAnalysis - Article-specific analysis
 */
async function displayAccessibilityReport(report, articleAnalysis = null) {
  const { executive, breakdown, topIssues, recommendations } = report;

  // Executive summary
  const gradeColor = executive.grade.startsWith('A')
    ? 'green'
    : executive.grade.startsWith('B')
    ? 'yellow'
    : 'red';

  logger.box(
    `🎯 Accessibility Score: ${logger.chalk[gradeColor](executive.grade)} (${
      executive.score
    }/100)
  
📊 Summary:
• Total Violations: ${executive.totalViolations}
• Affected Elements: ${executive.affectedElements}
• Critical Issues: ${executive.criticalIssues}
• WCAG Compliance: ${executive.wcagCompliance}`,
    {
      title: '♿ Accessibility Report',
      titleAlignment: 'center',
      borderColor: gradeColor,
    },
  );

  // Severity breakdown
  if (breakdown.bySeverity.critical + breakdown.bySeverity.serious > 0) {
    logger.box(
      `🚨 Critical: ${breakdown.bySeverity.critical}
⚠️  Serious: ${breakdown.bySeverity.serious}
⚡ Moderate: ${breakdown.bySeverity.moderate}
📝 Minor: ${breakdown.bySeverity.minor}`,
      {
        title: '📈 Issues by Severity',
        borderColor: 'red',
      },
    );
  }

  // Top issues
  if (topIssues.length > 0) {
    logger.info('\n🔍 Top Accessibility Issues:');
    topIssues.slice(0, 5).forEach((issue, index) => {
      const impact =
        issue.impact === 'critical'
          ? '🚨'
          : issue.impact === 'serious'
          ? '⚠️'
          : '⚡';
      logger.info(
        `${index + 1}. ${impact} ${issue.help} (${issue.nodeCount} elements)`,
      );
    });
  }

  // Recommendations
  if (recommendations.length > 0) {
    logger.box(recommendations.join('\n'), {
      title: '💡 Recommendations',
      borderColor: 'yellow',
    });
  }

  // Display article-specific analysis if available
  if (articleAnalysis) {
    logger.box(
      `📰 Article Analysis:
• Articles Scanned: ${articleAnalysis.totalArticles}
• Articles with Issues: ${articleAnalysis.affectedArticles}
• Article-Specific Issues: ${articleAnalysis.issueDistribution.articleSpecific}
• General Page Issues: ${articleAnalysis.issueDistribution.generalPage}`,
      {
        title: '📊 Article Impact Analysis',
        borderColor: 'blue',
      },
    );

    // Show most problematic articles
    if (articleAnalysis.mostProblematicArticles.length > 0) {
      logger.info('\n🚨 Articles with Most Accessibility Issues:');
      articleAnalysis.mostProblematicArticles
        .slice(0, 3)
        .forEach((articleIssue, index) => {
          const { article, violations, severityScore, issueCount } =
            articleIssue;
          logger.info(
            `${index + 1}. ${logger.chalk.yellow(
              `#${article.rank}`,
            )} ${logger.chalk.cyan(article.title.substring(0, 60))}${
              article.title.length > 60 ? '...' : ''
            }
     └─ ${
       violations.length
     } violation types, ${issueCount} total issues (severity: ${severityScore})`,
          );
        });
    }

    // Show general page issues
    if (articleAnalysis.generalPageIssues.length > 0) {
      logger.info('\n🌐 General Page Issues (not article-specific):');
      articleAnalysis.generalPageIssues.slice(0, 3).forEach((issue, index) => {
        logger.info(`${index + 1}. ${issue.id}: ${issue.description}`);
      });
    }
  }

  // Ask if user wants to see detailed report
  const { showDetails } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'showDetails',
      message: 'Would you like to launch a detailed report in your browser?',
      default: true,
    },
  ]);

  if (showDetails) {
    await createReportServer(report, 'accessibility');
  }
}

/**
 * Handle localhost report viewer
 * @param {Object} validationResult - Validation results
 */
async function handleLocalhostReport(validationResult) {
  const { reportType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'reportType',
      message: 'Which report would you like to view?',
      choices: [
        { name: 'Complete Validation Report', value: 'complete' },
        { name: 'Performance Dashboard', value: 'performance' },
        { name: 'Data Quality Analysis', value: 'quality' },
        { name: 'Article Timeline View', value: 'timeline' },
      ],
    },
  ]);

  const spinner = logger
    .ora({
      text: 'Starting localhost report server...',
      spinner: 'dots',
      color: 'blue',
    })
    .start();

  try {
    await createReportServer(validationResult, reportType);
    spinner.succeed('Report server started successfully');
  } catch (error) {
    spinner.fail('Failed to start report server');
    logger.error('Server error:', error.message);
  }
}

/**
 * Handle continue validation with more articles
 * @param {Object} validationResult - Previous validation results
 * @param {Object} options - Original options
 */
async function handleContinueValidation(validationResult, options) {
  const { additionalCount } = await inquirer.prompt([
    {
      type: 'number',
      name: 'additionalCount',
      message: 'How many additional articles would you like to validate?',
      default: 50,
      validate: (input) => {
        if (input < 1 || input > 500) {
          return 'Please enter a number between 1 and 500';
        }
        return true;
      },
    },
  ]);

  const spinner = logger
    .ora({
      text: `Validating ${additionalCount} additional articles...`,
      spinner: 'dots',
      color: 'green',
    })
    .start();

  try {
    const newResult = await validateHackerNewsArticles({
      ...options,
      articleCount: additionalCount,
      quiet: true, // Suppress detailed output for continuation
    });

    spinner.succeed(
      `Successfully validated ${additionalCount} additional articles`,
    );

    // Merge results
    const mergedResult = {
      ...validationResult,
      articles: [...validationResult.articles, ...newResult.articles],
      // Update other properties as needed
    };

    logger.box(
      `📈 Extended Validation Complete!\n\nTotal Articles: ${
        mergedResult.articles.length
      }\nNew Articles: ${additionalCount}\nCombined Success: ${
        newResult.success && validationResult.success
      }`,
      {
        title: '🎉 Validation Extended',
        borderColor: 'green',
      },
    );

    // Update the validation result for further operations
    Object.assign(validationResult, mergedResult);
  } catch (error) {
    spinner.fail('Additional validation failed');
    logger.error('Validation error:', error.message);
  }
}

/**
 * Handle performance breakdown display
 * @param {Object} performanceReport - Performance report
 */
async function handlePerformanceBreakdown(performanceReport) {
  logger.box(
    `⏱️  Total Duration: ${performanceReport.summary.totalDurationFormatted}
🚀 Articles/Second: ${performanceReport.efficiency.articlesPerSecond}
💾 Peak Memory: ${performanceReport.summary.peakMemoryMB} MB
🌐 Network Requests: ${performanceReport.summary.networkRequests}
📄 Pagination Clicks: ${performanceReport.summary.paginationClicks}`,
    {
      title: '📊 Performance Summary',
      borderColor: 'blue',
    },
  );

  logger.info('\n🔍 Phase Breakdown:');
  Object.entries(performanceReport.phases).forEach(([phase, data]) => {
    logger.info(
      `  ${phase.replace(/_/g, ' ')}: ${data.durationFormatted} (${
        data.percentage
      }%)`,
    );
  });

  logger.info('\n💾 Memory Analysis:');
  logger.info(`  Initial: ${performanceReport.memory.initial.heapUsedMB} MB`);
  logger.info(`  Final: ${performanceReport.memory.final.heapUsedMB} MB`);
  logger.info(`  Peak: ${performanceReport.memory.peak.heapUsedMB} MB`);
  logger.info(`  Delta: ${performanceReport.memory.delta.heapUsedMB} MB`);
}

/**
 * Handle advanced data analysis
 * @param {Object} validationResult - Validation results
 */
async function handleAdvancedAnalysis(validationResult) {
  const { articles, validationReport } = validationResult;

  // Calculate additional statistics
  const timeGaps = [];
  for (let i = 1; i < articles.length; i++) {
    if (articles[i - 1].timestamp && articles[i].timestamp) {
      const gap = articles[i - 1].timestamp - articles[i].timestamp;
      timeGaps.push(gap);
    }
  }

  const avgGap =
    timeGaps.length > 0
      ? timeGaps.reduce((a, b) => a + b, 0) / timeGaps.length
      : 0;
  const maxGap = timeGaps.length > 0 ? Math.max(...timeGaps) : 0;
  const minGap = timeGaps.length > 0 ? Math.min(...timeGaps) : 0;

  // Author analysis
  const authorStats = {};
  articles.forEach((article) => {
    if (article.author && article.author !== 'unknown') {
      authorStats[article.author] = (authorStats[article.author] || 0) + 1;
    }
  });

  const topAuthors = Object.entries(authorStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  logger.box(
    `📊 Advanced Data Analysis

⏰ Time Gap Analysis:
• Average gap: ${Math.round(avgGap / 1000 / 60)} minutes
• Maximum gap: ${Math.round(maxGap / 1000 / 60)} minutes  
• Minimum gap: ${Math.round(minGap / 1000 / 60)} minutes

👥 Top Authors:
${topAuthors
  .map(([author, count]) => `• ${author}: ${count} articles`)
  .join('\n')}

📈 Quality Metrics:
• Data completeness: ${Math.round(
      (articles.filter((a) => a.timestamp).length / articles.length) * 100,
    )}%
• Average title length: ${Math.round(
      articles.reduce((sum, a) => sum + a.title.length, 0) / articles.length,
    )} characters
• Unique authors: ${Object.keys(authorStats).length}`,
    {
      title: '🔬 Advanced Analysis',
      borderColor: 'magenta',
    },
  );
}

module.exports = {
  showPostValidationMenu,
  handleExportOptions,
  handleAccessibilityAudit,
  handleLocalhostReport,
  handleContinueValidation,
  displayAccessibilityReport,
};
