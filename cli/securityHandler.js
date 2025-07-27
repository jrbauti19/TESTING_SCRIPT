/**
 * Security Handler Module
 * Manages security testing integration with the CLI application
 */

const logger = require('../logger');
const SecurityTester = require('../tests/security/SecurityTester');
const {
  generateSecurityReport,
} = require('../utils/reports/generators/securityReport');
const { createReportServer } = require('../utils/reports/reportServer');

/**
 * Run security audit if requested
 * @param {Object} options - Application options
 * @returns {Promise<Object|null>} Security test results or null
 */
async function runSecurityAuditIfRequested(options) {
  if (!options.security) {
    return null;
  }

  logger.separator();
  logger.box('🔒 Security Assessment Starting...', {
    title: '🛡️ Security Testing',
    titleAlignment: 'center',
    borderColor: 'red',
  });

  try {
    const securityTester = new SecurityTester({
      targetUrl: 'https://news.ycombinator.com',
      verbose: options.debug,
      timeout: options.timeout || 30000,
    });

    const securityResults = await securityTester.runSecurityTests();

    // Store results for potential HTML report generation
    if (options.generateReports) {
      await generateSecurityHTMLReport(securityResults, options);
    }

    return securityResults;
  } catch (error) {
    logger.error('Security audit failed:', error.message);
    if (options.debug) {
      logger.debug('Security error stack:', error.stack);
    }
    return null;
  }
}

/**
 * Generate security HTML report
 * @param {Object} securityResults - Security testing results
 * @param {Object} options - Application options
 */
async function generateSecurityHTMLReport(securityResults, options) {
  try {
    const htmlContent = generateSecurityReport(securityResults);

    // Create a simple report data structure for the server
    const reportData = {
      securityReport: securityResults,
      type: 'security',
    };

    if (options.launchReport) {
      await createReportServer(reportData, 'security');
    }
  } catch (error) {
    logger.error('Failed to generate security HTML report:', error.message);
  }
}

/**
 * Handle security testing in interactive mode
 * @param {Object} options - Application options
 * @returns {Promise<Object|null>} Security test results or null
 */
async function handleSecurityTesting(options) {
  const { runSecurity } = await require('inquirer').prompt([
    {
      type: 'confirm',
      name: 'runSecurity',
      message: 'Would you like to run a comprehensive security assessment?',
      default: false,
    },
  ]);

  if (!runSecurity) {
    return null;
  }

  const { securityOptions } = await require('inquirer').prompt([
    {
      type: 'checkbox',
      name: 'securityOptions',
      message: 'Select security testing options:',
      choices: [
        { name: 'HTTPS/TLS Configuration', value: 'https', checked: true },
        {
          name: 'Security Headers Assessment',
          value: 'headers',
          checked: true,
        },
        { name: 'Content Security Policy (CSP)', value: 'csp', checked: true },
        { name: 'Cookie Security Analysis', value: 'cookies', checked: true },
        { name: 'XSS Vulnerability Scanning', value: 'xss', checked: true },
        {
          name: 'Information Disclosure Detection',
          value: 'disclosure',
          checked: true,
        },
        { name: 'Authentication Security', value: 'auth', checked: true },
        {
          name: 'Input Validation Testing',
          value: 'validation',
          checked: true,
        },
      ],
    },
  ]);

  if (securityOptions.length === 0) {
    logger.warn('No security options selected.');
    return null;
  }

  const spinner = logger
    .ora({
      text: 'Running comprehensive security assessment...',
      spinner: 'dots',
      color: 'red',
    })
    .start();

  try {
    const securityTester = new SecurityTester({
      targetUrl: 'https://news.ycombinator.com',
      verbose: options.debug,
      timeout: options.timeout || 30000,
    });

    const securityResults = await securityTester.runSecurityTests();
    spinner.succeed('Security assessment completed');

    // Ask if user wants to see detailed report
    const { showDetails } = await require('inquirer').prompt([
      {
        type: 'confirm',
        name: 'showDetails',
        message:
          'Would you like to launch a detailed security report in your browser?',
        default: true,
      },
    ]);

    if (showDetails) {
      await generateSecurityHTMLReport(securityResults, {
        ...options,
        launchReport: true,
      });
    }

    return securityResults;
  } catch (error) {
    spinner.fail('Security assessment failed');
    logger.error('Security error:', error.message);
    return null;
  }
}

module.exports = {
  runSecurityAuditIfRequested,
  handleSecurityTesting,
  generateSecurityHTMLReport,
};
