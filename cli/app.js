/**
 * Main Application Module
 * Orchestrates the validation flow and coordinates all components
 */

const logger = require('../logger');
const { validateHackerNewsArticles } = require('../hnScraper');
const { showPostValidationMenu } = require('../utils/interactive');
const { runAccessibilityAuditIfRequested } = require('./accessibilityHandler');
const { runSecurityAuditIfRequested } = require('./securityHandler');
const {
  displayFinalSummary,
  displayContactInfo,
  displayError,
} = require('./output');

/**
 * Main application orchestrator
 * @param {Object} options - Application options
 * @returns {Promise<number>} Exit code
 */
async function runApplication(options) {
  const startTime = Date.now();

  try {
    // Execute main validation
    const result = await validateHackerNewsArticles(options);

    // Display results unless in quiet mode
    if (!options.quiet) {
      displayFinalSummary(result, options, startTime);
      displayContactInfo();
    }

    // Handle interactive mode
    if (options.interactive && !options.quiet) {
      await handleInteractiveMode(result, options);
    }

    // Handle accessibility audit
    await runAccessibilityAuditIfRequested(options);

    // Handle security audit
    await runSecurityAuditIfRequested(options);

    // Return appropriate exit code
    return determineExitCode(result, options);
  } catch (error) {
    displayError(error, options);
    return 1;
  }
}

/**
 * Handle interactive mode execution
 * @param {Object} result - Validation result
 * @param {Object} options - Application options
 */
async function handleInteractiveMode(result, options) {
  try {
    await showPostValidationMenu(result, options);
  } catch (interactiveError) {
    logger.warn(
      'Interactive mode encountered an error:',
      interactiveError.message,
    );
    if (options.debug) {
      logger.debug('Interactive error stack:', interactiveError.stack);
    }
  }
}

/**
 * Determine appropriate exit code based on results and options
 * @param {Object} result - Validation result
 * @param {Object} options - Application options
 * @returns {number} Exit code
 */
function determineExitCode(result, options) {
  // In demo mode, exit with 0 if articles were scraped successfully
  // regardless of validation findings (chronological violations are expected)
  if (options.demo && result.articles && result.articles.length > 0) {
    return 0;
  }

  // Standard exit code based on validation success
  return result.success ? 0 : 1;
}

module.exports = {
  runApplication,
};
