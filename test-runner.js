#!/usr/bin/env node

/**
 * 🧪 Custom Playwright Test Runner
 *
 * Provides user-friendly test execution with detailed reporting
 * Integrates traditional E2E tests with advanced QA framework
 *
 * Author: Joshua Bautista
 * Contact: jrbauti19@gmail.com
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for beautiful output
const colors = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function showTestBanner() {
  console.clear();
  console.log(
    colorize(
      `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🧪 Playwright E2E Test Suite                                               ║
║  📧 Joshua Bautista - QA Wolf Take-Home Assignment                          ║
║                                                                              ║
║  🎯 Comprehensive End-to-End Testing Framework                              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`,
      'cyan',
    ),
  );
}

function showTestInfo() {
  console.log(colorize('\n🎯 Test Suite Overview:', 'bold'));
  console.log(
    colorize('✅ Core Functionality Tests', 'green') +
      ' - Basic page validation',
  );
  console.log(
    colorize('✅ Advanced Integration Tests', 'blue') +
      ' - Framework compatibility',
  );
  console.log(
    colorize('✅ Performance & Quality Tests', 'magenta') +
      ' - Speed and security',
  );
  console.log(
    colorize('✅ Cross-Browser Testing', 'yellow') +
      ' - Chrome, Firefox, Safari, Edge',
  );
  console.log(
    colorize('✅ Mobile Responsiveness', 'cyan') + ' - Mobile Chrome & Safari',
  );

  console.log(colorize("\n🔍 What We're Testing:", 'bold'));
  console.log('• Page loading and basic structure validation');
  console.log('• Article ranking and sequential numbering');
  console.log('• Timestamp presence and format validation');
  console.log('• Pagination functionality and consistency');
  console.log('• Mobile responsiveness and accessibility');
  console.log('• Performance benchmarks and security headers');
  console.log('• Integration with our advanced QA framework');

  console.log(
    colorize(
      '\n💡 This demonstrates both traditional E2E testing AND our advanced framework!',
      'dim',
    ),
  );
}

async function runTests(options = {}) {
  return new Promise((resolve, reject) => {
    console.log(colorize('\n🚀 Starting Playwright E2E Tests...', 'bold'));
    console.log(colorize('━'.repeat(80), 'cyan'));

    const args = ['test'];

    // Add options based on parameters
    if (options.headed) {
      args.push('--headed');
    }

    if (options.project) {
      args.push('--project', options.project);
    }

    if (options.grep) {
      args.push('--grep', options.grep);
    }

    // Add reporter for better output
    args.push('--reporter=line');

    const testProcess = spawn('npx', ['playwright', ...args], {
      stdio: 'pipe',
      cwd: process.cwd(),
    });

    let output = '';
    let errorOutput = '';

    testProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;

      // Parse and enhance output in real-time
      const lines = text.split('\n');
      lines.forEach((line) => {
        if (line.trim()) {
          if (line.includes('✓') || line.includes('PASSED')) {
            console.log(colorize(`  ${line}`, 'green'));
          } else if (line.includes('✗') || line.includes('FAILED')) {
            console.log(colorize(`  ${line}`, 'red'));
          } else if (line.includes('Running')) {
            console.log(colorize(`  ${line}`, 'cyan'));
          } else if (line.includes('Testing:')) {
            console.log(colorize(`    ${line}`, 'blue'));
          } else {
            console.log(`  ${line}`);
          }
        }
      });
    });

    testProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    testProcess.on('close', (code) => {
      console.log(colorize('━'.repeat(80), 'cyan'));

      if (code === 0) {
        console.log(colorize('\n🎉 ALL TESTS PASSED!', 'green'));
        showTestSummary(output);
        resolve({ success: true, output, code });
      } else {
        console.log(colorize('\n❌ Some tests failed', 'red'));
        if (errorOutput) {
          console.log(colorize('\nError Details:', 'red'));
          console.log(errorOutput);
        }
        showTestSummary(output);
        resolve({ success: false, output, errorOutput, code });
      }
    });

    testProcess.on('error', (error) => {
      console.log(
        colorize(`\n❌ Test execution error: ${error.message}`, 'red'),
      );
      reject(error);
    });
  });
}

function showTestSummary(output) {
  console.log(colorize('\n📊 Test Execution Summary:', 'bold'));

  // Parse test results from output
  const passedMatches = output.match(/(\d+) passed/g);
  const failedMatches = output.match(/(\d+) failed/g);
  const skippedMatches = output.match(/(\d+) skipped/g);

  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  if (passedMatches) {
    totalPassed = passedMatches.reduce((sum, match) => {
      return sum + parseInt(match.match(/\d+/)[0]);
    }, 0);
  }

  if (failedMatches) {
    totalFailed = failedMatches.reduce((sum, match) => {
      return sum + parseInt(match.match(/\d+/)[0]);
    }, 0);
  }

  if (skippedMatches) {
    totalSkipped = skippedMatches.reduce((sum, match) => {
      return sum + parseInt(match.match(/\d+/)[0]);
    }, 0);
  }

  console.log(colorize(`✅ Tests Passed: ${totalPassed}`, 'green'));
  if (totalFailed > 0) {
    console.log(colorize(`❌ Tests Failed: ${totalFailed}`, 'red'));
  }
  if (totalSkipped > 0) {
    console.log(colorize(`⏭️  Tests Skipped: ${totalSkipped}`, 'yellow'));
  }

  // Show browser coverage
  const browsers = ['chromium', 'firefox', 'webkit'];
  const testedBrowsers = browsers.filter(
    (browser) => output.includes(`[${browser}]`) || output.includes(browser),
  );

  if (testedBrowsers.length > 0) {
    console.log(
      colorize(`🌐 Browsers Tested: ${testedBrowsers.join(', ')}`, 'blue'),
    );
  }

  console.log(colorize('\n💡 Integration Points:', 'bold'));
  console.log('• Traditional E2E tests validate basic functionality');
  console.log('• Advanced QA framework provides comprehensive analysis');
  console.log('• Combined approach ensures complete quality coverage');
  console.log('• Professional reporting for stakeholder communication');
}

function showFrameworkComparison() {
  console.log(colorize('\n🔄 Testing Approach Comparison:', 'bold'));
  console.log(colorize('\n📋 Traditional E2E Tests (Playwright):', 'cyan'));
  console.log('✅ Page load and structure validation');
  console.log('✅ Element presence and interaction testing');
  console.log('✅ Cross-browser compatibility verification');
  console.log('✅ Basic accessibility and performance checks');
  console.log('✅ Mobile responsiveness validation');

  console.log(colorize('\n🚀 Advanced QA Framework (Our Solution):', 'green'));
  console.log('✅ Complex business logic validation (chronological order)');
  console.log('✅ Comprehensive accessibility testing (WCAG 2.1 AA)');
  console.log('✅ Performance monitoring with detailed metrics');
  console.log('✅ Interactive web reports with data visualization');
  console.log('✅ Multi-page data extraction and analysis');
  console.log('✅ Professional stakeholder communication tools');

  console.log(colorize('\n🎯 Combined Value:', 'magenta'));
  console.log('• Complete quality assurance coverage');
  console.log('• Both traditional and advanced testing methodologies');
  console.log('• Professional presentation for different audiences');
  console.log('• Scalable architecture for enterprise deployment');
}

async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  if (args.includes('--headed')) {
    options.headed = true;
  }

  if (args.includes('--project')) {
    const projectIndex = args.indexOf('--project');
    if (projectIndex !== -1 && args[projectIndex + 1]) {
      options.project = args[projectIndex + 1];
    }
  }

  if (args.includes('--help')) {
    showTestBanner();
    console.log(colorize('\n🎯 Usage Options:', 'bold'));
    console.log('node test-runner.js                 # Run all tests');
    console.log(
      'node test-runner.js --headed        # Run with visible browser',
    );
    console.log(
      'node test-runner.js --project chromium  # Run only Chrome tests',
    );
    console.log('node test-runner.js --help          # Show this help');
    return;
  }

  showTestBanner();
  showTestInfo();

  if (args.includes('--comparison')) {
    showFrameworkComparison();
    return;
  }

  try {
    const result = await runTests(options);

    console.log(colorize('\n📞 Contact Information:', 'bold'));
    console.log(colorize('📧 Email: jrbauti19@gmail.com', 'cyan'));
    console.log(
      colorize('🌐 Portfolio: https://www.joshuabautista.dev/', 'cyan'),
    );
    console.log(
      colorize('🚀 Ready to discuss QA automation strategies!', 'green'),
    );

    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.log(colorize(`\n❌ Test runner error: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(colorize('\n\n👋 Test execution interrupted', 'yellow'));
  process.exit(0);
});

// Run the test runner
if (require.main === module) {
  main();
}

module.exports = { runTests, showTestSummary };
