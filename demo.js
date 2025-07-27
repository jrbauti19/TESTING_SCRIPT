#!/usr/bin/env node

/**
 * 🎬 QA Wolf Take-Home Demo Script
 *
 * Author: Joshua Bautista
 * Contact: jrbauti19@gmail.com
 * Portfolio: https://www.joshuabautista.dev/
 */

const { spawn } = require('child_process');
const readline = require('readline');

// ANSI color codes for beautiful terminal output
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

function showBanner() {
  console.clear();
  console.log(
    colorize(
      `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🚀 QA Wolf Take-Home Assignment Demo                                        ║
║  📧 Joshua Bautista - jrbauti19@gmail.com                                   ║
║  🌐 Portfolio: https://www.joshuabautista.dev/                              ║
║                                                                              ║
║  🎯 Advanced Playwright Automation & Quality Assurance Framework            ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`,
      'cyan',
    ),
  );
}

function showMenu() {
  console.log(
    colorize('1.', 'yellow') +
      ' ' +
      colorize('🚀 Quick Demo', 'cyan') +
      ' - 150 articles validation with visual browser (90s)',
  );
  console.log(
    colorize('2.', 'yellow') +
      ' ' +
      colorize('♿ Accessibility Demo', 'magenta') +
      ' - WCAG compliance testing',
  );
  console.log(
    colorize('3.', 'yellow') +
      ' ' +
      colorize('📊 Interactive Reports Demo', 'blue') +
      ' - Localhost web reports',
  );
  console.log(
    colorize('4.', 'yellow') +
      ' ' +
      colorize('🎯 Complete Feature Demo', 'green') +
      ' - All features showcase',
  );
  console.log(
    colorize('5.', 'yellow') +
      ' ' +
      colorize('⚡ Performance Showcase', 'red') +
      ' - Speed & efficiency demo',
  );
  console.log(
    colorize('6.', 'yellow') +
      ' ' +
      colorize('🧪 E2E Testing Demo', 'magenta') +
      ' - Traditional Playwright tests (90s)',
  );
  console.log(
    colorize('7.', 'yellow') +
      ' ' +
      colorize('🔒 Security Testing Demo', 'red') +
      ' - Comprehensive security assessment (120s)',
  );
  console.log(
    colorize('8.', 'yellow') +
      ' ' +
      colorize('🔧 Architecture Tour', 'white') +
      ' - Code structure walkthrough (120s)',
  );
  console.log(colorize('9.', 'yellow') + ' ' + colorize('❌ Exit', 'dim'));

  console.log(
    colorize(
      '\n💡 Tip: Run demos with your screen shared for maximum impact!',
      'dim',
    ),
  );
}

function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(colorize(`\n🎬 ${description}`, 'bold'));
    console.log(colorize(`▶️  ${command}`, 'dim'));
    console.log(colorize('━'.repeat(80), 'cyan'));

    // Clean up input stream before spawning child process
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();
    process.stdin.removeAllListeners('data');

    const child = spawn('node', command.split(' ').slice(1), {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    child.on('close', (code) => {
      // Restore input stream after child process completes
      setTimeout(() => {
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        process.stdin.removeAllListeners('data');
        process.stdin.pause();
      }, 100);

      if (code === 0) {
        console.log(colorize('\n✅ Demo completed successfully!', 'green'));
        resolve();
      } else if (code === 1) {
        // Exit code 1 might indicate validation findings (not failures)
        // This is expected when chronological violations are found
        console.log(
          colorize('\n✅ Demo completed with validation findings!', 'green'),
        );
        console.log(
          colorize(
            '💡 Note: Chronological violations are expected findings on Hacker News',
            'dim',
          ),
        );
        resolve();
      } else {
        console.log(colorize('\n❌ Demo encountered an issue', 'red'));
        console.log(colorize(`Exit code: ${code}`, 'dim'));
        resolve(); // Continue anyway
      }
    });

    child.on('error', (error) => {
      console.log(colorize(`\n❌ Error: ${error.message}`, 'red'));
      resolve(); // Continue anyway
    });
  });
}

async function quickDemo() {
  console.log(
    colorize('\n🚀 QUICK DEMO - Core Validation (150 Articles)', 'bold'),
  );
  console.log(colorize('This demo shows:', 'dim'));
  console.log(
    colorize('• Multi-page traversal (150+ articles across 5 pages)', 'dim'),
  );
  console.log(
    colorize(
      '• Real-time chronological validation with visible browser',
      'dim',
    ),
  );
  console.log(colorize('• Comprehensive data quality analysis', 'dim'));
  console.log(
    colorize('• Performance monitoring with detailed metrics', 'dim'),
  );
  console.log(
    colorize('• Professional terminal UI with progress tracking', 'dim'),
  );

  await runCommand(
    'node index.js --demo --count 150 --no-interactive',
    'Running comprehensive validation - 150 articles with visible browser',
  );
}

async function accessibilityDemo() {
  console.log(
    colorize('\n♿ ACCESSIBILITY DEMO - WCAG Compliance Testing', 'bold'),
  );
  console.log(colorize('This demo shows:', 'dim'));
  console.log(colorize('• Automated WCAG 2.1 AA compliance testing', 'dim'));
  console.log(colorize('• Article-specific accessibility analysis', 'dim'));
  console.log(colorize('• Interactive web reports with charts', 'dim'));
  console.log(colorize('• Professional accessibility grading', 'dim'));

  await runCommand(
    'node index.js --demo --accessibility --count 30 --interactive',
    'Running accessibility audit with interactive reports',
  );
}

async function interactiveReportsDemo() {
  console.log(
    colorize('\n📊 INTERACTIVE REPORTS DEMO - Web Dashboard', 'bold'),
  );
  console.log(colorize('This demo shows:', 'dim'));
  console.log(
    colorize('• Localhost web server with interactive reports', 'dim'),
  );
  console.log(colorize('• Chart.js visualizations', 'dim'));
  console.log(colorize('• Clickable article links', 'dim'));
  console.log(colorize('• Responsive design and professional UI', 'dim'));

  await runCommand(
    'node index.js --demo --count 50 --interactive',
    'Running validation with interactive web reports',
  );
}

async function completeFeatureDemo() {
  console.log(colorize('\n🎯 COMPLETE FEATURE DEMO - Full Showcase', 'bold'));
  console.log(colorize('This demo shows:', 'dim'));
  console.log(colorize('• All features in one comprehensive run', 'dim'));
  console.log(colorize('• Performance monitoring', 'dim'));
  console.log(colorize('• Data export capabilities', 'dim'));
  console.log(colorize('• Advanced error handling', 'dim'));

  await runCommand(
    'node index.js --demo --accessibility --count 100 --interactive',
    'Running complete feature demonstration',
  );
}

async function performanceShowcase() {
  console.log(
    colorize('\n⚡ PERFORMANCE SHOWCASE - Speed & Efficiency', 'bold'),
  );
  console.log(colorize('This demo shows:', 'dim'));
  console.log(colorize('• High-speed article processing', 'dim'));
  console.log(colorize('• Memory efficiency monitoring', 'dim'));
  console.log(colorize('• Network optimization', 'dim'));
  console.log(colorize('• Scalability for large datasets', 'dim'));

  await runCommand(
    'node index.js --count 200 --no-interactive --headless',
    'Running high-performance validation (200 articles)',
  );
}

async function e2eTestingDemo() {
  console.log(
    colorize('\n🧪 E2E TESTING DEMO - Traditional Playwright Tests', 'bold'),
  );
  console.log(colorize('This demo shows:', 'dim'));
  console.log(colorize('• Traditional end-to-end test execution', 'dim'));
  console.log(colorize('• Cross-browser compatibility testing', 'dim'));
  console.log(colorize('• Professional test reporting', 'dim'));
  console.log(colorize('• Integration with advanced QA framework', 'dim'));

  await runCommand(
    'npm run test:chrome',
    'Running Playwright E2E tests with professional reporting',
  );
}

async function securityTestingDemo() {
  console.log(
    colorize(
      '\n🔒 SECURITY TESTING DEMO - Comprehensive Security Assessment',
      'bold',
    ),
  );
  console.log(colorize('This demo shows:', 'dim'));
  console.log(colorize('• HTTPS/TLS configuration analysis', 'dim'));
  console.log(
    colorize('• Security headers assessment (HSTS, CSP, etc.)', 'dim'),
  );
  console.log(colorize('• XSS and injection vulnerability scanning', 'dim'));
  console.log(colorize('• Cookie security and authentication testing', 'dim'));
  console.log(colorize('• Information disclosure detection', 'dim'));
  console.log(
    colorize('• Professional security reporting with recommendations', 'dim'),
  );

  await runCommand(
    'npm run test:security',
    'Running comprehensive security assessment with detailed analysis',
  );
}

async function architectureTour() {
  console.log(
    colorize('\n🔧 ARCHITECTURE TOUR - Code Structure Walkthrough', 'bold'),
  );
  console.log(
    colorize('This showcases the professional code architecture:', 'dim'),
  );

  console.log(colorize('\n📁 Project Structure:', 'cyan'));
  console.log('├── 🎯 Core Engine (index.js, hnScraper.js, config.js)');
  console.log(
    '├── 🔧 CLI Framework (cli/config.js, cli/app.js, cli/output.js)',
  );
  console.log(
    '├── 🛠️  Utilities (validation.js, performance.js, accessibility.js)',
  );
  console.log('├── 📊 Modular Reports (generators/, templates/, charts/)');
  console.log('└── 🧪 Interactive Features (interactive.js, export.js)');

  console.log(colorize('\n🎯 Key Engineering Principles:', 'cyan'));
  console.log('✅ Single Responsibility Principle');
  console.log('✅ Separation of Concerns');
  console.log('✅ Dependency Injection');
  console.log('✅ Error Boundaries & Resilience');
  console.log('✅ Professional Logging & Monitoring');
  console.log('✅ Comprehensive Testing Strategy');

  console.log(colorize('\n📈 Scalability Features:', 'cyan'));
  console.log('• Modular architecture for easy extension');
  console.log('• Configurable retry logic and timeouts');
  console.log('• Memory-efficient data processing');
  console.log('• Parallel execution capabilities');

  console.log(colorize('\n🔍 Quality Assurance Features:', 'cyan'));
  console.log(
    '• Multi-layer validation (chronological, data quality, accessibility)',
  );
  console.log('• Interactive debugging and analysis tools');
  console.log('• Export capabilities for stakeholder communication');

  await new Promise((resolve) => {
    console.log(
      colorize('\n👀 Press Enter to see a quick code demo...', 'yellow'),
    );

    const onData = (data) => {
      if (data.toString().trim() === '' || data.toString().includes('\n')) {
        process.stdin.removeListener('data', onData);
        process.stdin.setRawMode(false);
        process.stdin.pause();
        resolve();
      }
    };

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', onData);
  });

  await runCommand(
    'node index.js --demo --count 20 --interactive',
    'Quick architecture demonstration',
  );
}

async function main() {
  // Clean up any existing listeners
  process.stdin.removeAllListeners('data');
  process.stdin.setRawMode(false);
  process.stdin.pause();

  while (true) {
    showBanner();
    showMenu();

    const choice = await new Promise((resolve) => {
      console.log(colorize('\n🎯 Select demo option (1-9): ', 'bold'));

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('', (answer) => {
        rl.close();
        resolve(answer);
      });
    });

    switch (choice.trim()) {
      case '1':
        await quickDemo();
        break;
      case '2':
        await accessibilityDemo();
        break;
      case '3':
        await interactiveReportsDemo();
        break;
      case '4':
        await completeFeatureDemo();
        break;
      case '5':
        await performanceShowcase();
        break;
      case '6':
        await e2eTestingDemo();
        break;
      case '7':
        await securityTestingDemo();
        break;
      case '8':
        await architectureTour();
        break;
      case '9':
        console.log(
          colorize('\n👋 Thanks for checking out my QA Wolf demo!', 'green'),
        );
        console.log(colorize('📧 Contact: jrbauti19@gmail.com', 'cyan'));
        console.log(
          colorize('🌐 Portfolio: https://www.joshuabautista.dev/', 'cyan'),
        );
        console.log(
          colorize('🚀 Looking forward to hearing from QA Wolf!\n', 'yellow'),
        );
        process.exit(0);
      default:
        console.log(colorize('\n❌ Invalid option. Please select 1-9.', 'red'));
        await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    // Pause between demos
    await new Promise((resolve) => {
      console.log(colorize('\n⏸️  Press Enter to return to menu...', 'dim'));

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('', () => {
        rl.close();
        resolve();
      });
    });
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(
    colorize('\n\n👋 Demo interrupted. Thanks for watching!', 'yellow'),
  );
  process.exit(0);
});

// Run the demo
main().catch((error) => {
  console.error(colorize(`\n❌ Demo error: ${error.message}`, 'red'));
  process.exit(1);
});
