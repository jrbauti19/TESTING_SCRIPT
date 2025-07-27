/**
 * Accessibility Handler Module
 * Manages accessibility audit execution and reporting
 */

const { chromium } = require('playwright');
const logger = require('../logger');
const {
  displayAccessibilityResults,
  displayAccessibilityError,
} = require('./output');

/**
 * Execute accessibility audit
 * @param {Object} options - Application options
 * @returns {Promise<Object>} Audit results
 */
async function executeAccessibilityAudit(options) {
  const {
    performAccessibilityAudit,
    generateAccessibilityReport,
  } = require('../utils/accessibility');

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

    await page.goto('https://news.ycombinator.com/newest', {
      waitUntil: 'networkidle',
      timeout: options.timeout,
    });

    const auditResults = await performAccessibilityAudit(page, {
      tags: ['wcag21aa'],
      debug: options.debug,
    });

    await browser.close();
    spinner.succeed('Accessibility audit completed');

    const report = generateAccessibilityReport(auditResults);

    return {
      auditResults,
      report,
    };
  } catch (error) {
    spinner.fail('Accessibility audit failed');
    displayAccessibilityError(error);
    throw error;
  }
}

/**
 * Run accessibility audit if requested
 * @param {Object} options - Application options
 * @returns {Promise<void>}
 */
async function runAccessibilityAuditIfRequested(options) {
  if (!options.accessibility) {
    return;
  }

  try {
    const results = await executeAccessibilityAudit(options);
    displayAccessibilityResults(results, options);
  } catch (error) {
    // Error already displayed by executeAccessibilityAudit
    // Just log for debugging if needed
    if (options.debug) {
      logger.debug('Accessibility audit error details:', error);
    }
  }
}

module.exports = {
  executeAccessibilityAudit,
  runAccessibilityAuditIfRequested,
};
