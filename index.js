// index.js
// Clean entry point for the Hacker News sorting validation script

const {
  parseArguments,
  validateArguments,
  createApplicationOptions,
} = require('./cli/config');
const { runApplication } = require('./cli/app');

/**
 * Main entry point
 */
async function main() {
  try {
    // Parse and validate CLI arguments
    const argv = parseArguments();
    validateArguments(argv);

    // Create application options
    const options = createApplicationOptions(argv);

    // Run the application
    const exitCode = await runApplication(options);

    // Exit with appropriate code
    process.exit(exitCode);
  } catch (error) {
    // This should rarely happen as most errors are handled in runApplication
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

// Execute if this is the main module
if (require.main === module) {
  main();
}

module.exports = { main };
