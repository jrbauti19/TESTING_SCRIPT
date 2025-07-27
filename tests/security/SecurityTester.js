/**
 * 🔒 Modular Security Testing Framework
 *
 * Comprehensive security assessment for web applications
 * Orchestrates multiple security test modules for complete coverage
 *
 * @author Joshua Bautista
 * @contact jrbauti19@gmail.com
 */

const HTTPSecurityTester = require('./modules/httpsTester');
const SecurityHeadersTester = require('./modules/headersTester');
const CookieSecurityTester = require('./modules/cookieTester');
const VulnerabilityTester = require('./modules/vulnerabilityTester');

class SecurityTester {
  /**
   * Initialize the security tester
   * @param {Object} options - Configuration options
   * @param {string} options.targetUrl - Target URL to test
   * @param {boolean} options.verbose - Enable verbose logging
   * @param {number} options.timeout - Network timeout in milliseconds
   */
  constructor(options = {}) {
    this.targetUrl = options.targetUrl || 'https://news.ycombinator.com';
    this.verbose = options.verbose || false;
    this.timeout = options.timeout || 30000;

    // Initialize test modules
    this.httpsTester = new HTTPSecurityTester(options);
    this.headersTester = new SecurityHeadersTester(options);
    this.cookieTester = new CookieSecurityTester(options);
    this.vulnerabilityTester = new VulnerabilityTester(options);

    // Results storage
    this.results = {
      overall: 'UNKNOWN',
      score: 0,
      maxScore: 0,
      tests: [],
      summary: {},
      timestamp: new Date().toISOString(),
      recommendations: [],
    };
  }

  /**
   * Run complete security assessment
   * @returns {Promise<Object>} Complete security assessment results
   */
  async runSecurityTests() {
    this.displayHeader();

    try {
      // Run all security test modules
      await this.runAllTests();

      // Calculate final score and recommendations
      this.calculateOverallScore();
      this.generateRecommendations();

      // Display results
      this.displayResults();

      return this.results;
    } catch (error) {
      console.log(
        this.colorize(`\n❌ Security testing failed: ${error.message}`, 'red'),
      );
      this.results.overall = 'ERROR';
      this.results.error = error.message;
      return this.results;
    }
  }

  /**
   * Run all security test modules
   */
  async runAllTests() {
    // HTTPS/TLS Configuration
    console.log(
      this.colorize('\n🔐 Testing HTTPS/TLS Configuration...', 'bold'),
    );
    const httpsTest = await this.httpsTester.testHTTPSConfiguration();
    this.results.tests.push(httpsTest);
    this.displayTestStatus(httpsTest);

    // Security Headers
    console.log(this.colorize('\n🛡️  Testing Security Headers...', 'bold'));
    const headersTest = await this.headersTester.testSecurityHeaders();
    this.results.tests.push(headersTest);
    this.displayTestStatus(headersTest);

    // Content Security Policy
    console.log(
      this.colorize('\n📋 Testing Content Security Policy...', 'bold'),
    );
    const cspTest = await this.testContentSecurityPolicy();
    this.results.tests.push(cspTest);
    this.displayTestStatus(cspTest);

    // Cookie Security
    console.log(this.colorize('\n🍪 Testing Cookie Security...', 'bold'));
    const cookieTest = await this.cookieTester.testCookieSecurity();
    this.results.tests.push(cookieTest);
    this.displayTestStatus(cookieTest);

    // XSS Vulnerabilities
    console.log(this.colorize('\n🚨 Testing XSS Vulnerabilities...', 'bold'));
    const xssTest = await this.vulnerabilityTester.testXSSVulnerabilities();
    this.results.tests.push(xssTest);
    this.displayTestStatus(xssTest);

    // Information Disclosure
    console.log(
      this.colorize('\n🔍 Testing Information Disclosure...', 'bold'),
    );
    const disclosureTest =
      await this.vulnerabilityTester.testInformationDisclosure();
    this.results.tests.push(disclosureTest);
    this.displayTestStatus(disclosureTest);

    // Authentication Security
    console.log(
      this.colorize('\n🔐 Testing Authentication Security...', 'bold'),
    );
    const authTest = await this.testAuthenticationSecurity();
    this.results.tests.push(authTest);
    this.displayTestStatus(authTest);

    // Input Validation
    console.log(this.colorize('\n📝 Testing Input Validation...', 'bold'));
    const validationTest = await this.vulnerabilityTester.testInputValidation();
    this.results.tests.push(validationTest);
    this.displayTestStatus(validationTest);
  }

  /**
   * Test Content Security Policy
   * @returns {Promise<Object>} CSP test results
   */
  async testContentSecurityPolicy() {
    const test = {
      name: 'Content Security Policy',
      status: 'UNKNOWN',
      score: 0,
      maxScore: 15,
      details: [],
      issues: [],
    };

    try {
      const { chromium } = require('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      // Capture CSP violations
      const cspViolations = [];
      page.on('console', (msg) => {
        if (msg.text().includes('Content Security Policy')) {
          cspViolations.push(msg.text());
        }
      });

      await page.goto(this.targetUrl, { waitUntil: 'networkidle' });

      // Check for CSP header
      const response = await this.makeRequest(this.targetUrl);
      const cspHeader =
        response.headers['content-security-policy'] ||
        response.headers['content-security-policy-report-only'];

      if (cspHeader) {
        test.details.push('✅ CSP header detected');
        test.score += 10;

        // Analyze CSP directives
        if (cspHeader.includes("'unsafe-inline'")) {
          test.details.push('⚠️  CSP allows unsafe-inline');
          test.issues.push('Consider removing unsafe-inline from CSP');
        } else {
          test.details.push('✅ CSP restricts inline scripts');
          test.score += 3;
        }

        if (cspHeader.includes("'unsafe-eval'")) {
          test.details.push('⚠️  CSP allows unsafe-eval');
          test.issues.push('Consider removing unsafe-eval from CSP');
        } else {
          test.details.push('✅ CSP restricts eval()');
          test.score += 2;
        }
      } else {
        test.details.push('❌ No CSP header found');
        test.issues.push('Implement Content Security Policy');
      }

      if (cspViolations.length > 0) {
        test.details.push(
          `⚠️  ${cspViolations.length} CSP violations detected`,
        );
        test.issues.push('Review and fix CSP violations');
      } else {
        test.details.push('✅ No CSP violations detected');
      }

      await browser.close();
      test.status = this.determineStatus(test.score, test.maxScore);
    } catch (error) {
      test.status = 'ERROR';
      test.details.push(`❌ Error: ${error.message}`);
    }

    return test;
  }

  /**
   * Test authentication security
   * @returns {Promise<Object>} Authentication test results
   */
  async testAuthenticationSecurity() {
    const test = {
      name: 'Authentication Security',
      status: 'UNKNOWN',
      score: 0,
      maxScore: 10,
      details: [],
      issues: [],
    };

    try {
      const { chromium } = require('playwright');
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(this.targetUrl);

      // Look for login forms
      const loginForms = await page.$$('form');
      const loginInputs = await page.$$('input[type="password"]');

      if (loginInputs.length > 0) {
        test.details.push(
          `📊 ${loginInputs.length} password field(s) detected`,
        );

        // Check if login is over HTTPS
        if (this.targetUrl.startsWith('https://')) {
          test.details.push('✅ Login forms served over HTTPS');
          test.score += 5;
        } else {
          test.details.push('❌ Login forms not served over HTTPS');
          test.issues.push('Serve login forms over HTTPS only');
        }

        // Check for autocomplete attributes
        for (const input of loginInputs) {
          const autocomplete = await input.getAttribute('autocomplete');
          if (autocomplete === 'off' || autocomplete === 'new-password') {
            test.details.push('✅ Password autocomplete properly configured');
            test.score += 3;
            break;
          }
        }
      } else {
        test.details.push('ℹ️  No password fields detected on main page');
        test.score += 5; // No authentication = no auth vulnerabilities
      }

      // Check for session management
      const cookies = await page.context().cookies();
      const sessionCookies = cookies.filter(
        (c) =>
          c.name.toLowerCase().includes('session') ||
          c.name.toLowerCase().includes('auth') ||
          c.name.toLowerCase().includes('token'),
      );

      if (sessionCookies.length > 0) {
        test.details.push(
          `📊 ${sessionCookies.length} potential session cookie(s)`,
        );
        const secureSessionCookies = sessionCookies.filter(
          (c) => c.secure && c.httpOnly,
        );
        if (secureSessionCookies.length === sessionCookies.length) {
          test.details.push('✅ Session cookies properly secured');
          test.score += 2;
        } else {
          test.details.push('⚠️  Session cookies not fully secured');
          test.issues.push(
            'Ensure session cookies have Secure and HttpOnly flags',
          );
        }
      }

      await browser.close();
      test.status = this.determineStatus(test.score, test.maxScore);
    } catch (error) {
      test.status = 'ERROR';
      test.details.push(`❌ Error: ${error.message}`);
    }

    return test;
  }

  /**
   * Make HTTP/HTTPS request
   * @param {string} targetUrl - URL to request
   * @returns {Promise<Object>} Response object
   */
  makeRequest(targetUrl) {
    return new Promise((resolve, reject) => {
      const url = require('url');
      const https = require('https');
      const http = require('http');

      const parsedUrl = url.parse(targetUrl);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method: 'GET',
        timeout: this.timeout,
        headers: {
          'User-Agent': 'SecurityTester/1.0 (QA Wolf Assessment)',
        },
      };

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data,
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  /**
   * Display test header
   */
  displayHeader() {
    console.log(
      this.colorize(
        `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🔒 Security Assessment Suite                                               ║
║  📧 Joshua Bautista - QA Wolf Take-Home Assignment                          ║
║                                                                              ║
║  🛡️  Comprehensive Web Security Testing Framework                           ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
    `,
        'cyan',
      ),
    );

    console.log(this.colorize('\n🎯 Security Test Overview:', 'bold'));
    console.log('• HTTPS/TLS Configuration Analysis');
    console.log('• Security Headers Assessment');
    console.log('• Content Security Policy (CSP) Evaluation');
    console.log('• Cookie Security Analysis');
    console.log('• XSS & Injection Vulnerability Scanning');
    console.log('• Authentication & Session Management');
    console.log('• Information Disclosure Detection');

    console.log(this.colorize(`\n🔍 Target: ${this.targetUrl}`, 'dim'));
    console.log(this.colorize('━'.repeat(80), 'cyan'));
  }

  /**
   * Display test status
   * @param {Object} test - Test result object
   */
  displayTestStatus(test) {
    const statusColor =
      test.status === 'PASS'
        ? 'green'
        : test.status === 'WARN'
        ? 'yellow'
        : 'red';

    console.log(
      this.colorize(
        `  Status: ${test.status} (${test.score}/${test.maxScore})`,
        statusColor,
      ),
    );
  }

  /**
   * Calculate overall security score
   */
  calculateOverallScore() {
    this.results.score = this.results.tests.reduce(
      (sum, test) => sum + test.score,
      0,
    );
    this.results.maxScore = this.results.tests.reduce(
      (sum, test) => sum + test.maxScore,
      0,
    );

    const percentage = (this.results.score / this.results.maxScore) * 100;

    if (percentage >= 80) {
      this.results.overall = 'EXCELLENT';
    } else if (percentage >= 65) {
      this.results.overall = 'GOOD';
    } else if (percentage >= 50) {
      this.results.overall = 'FAIR';
    } else {
      this.results.overall = 'POOR';
    }

    // Generate summary
    this.results.summary = {
      totalTests: this.results.tests.length,
      passed: this.results.tests.filter((t) => t.status === 'PASS').length,
      warnings: this.results.tests.filter((t) => t.status === 'WARN').length,
      failed: this.results.tests.filter((t) => t.status === 'FAIL').length,
      errors: this.results.tests.filter((t) => t.status === 'ERROR').length,
      percentage: Math.round(percentage),
    };
  }

  /**
   * Generate security recommendations
   */
  generateRecommendations() {
    const allIssues = this.results.tests.flatMap((test) => test.issues);
    this.results.recommendations = [...new Set(allIssues)]; // Remove duplicates
  }

  /**
   * Display comprehensive results
   */
  displayResults() {
    console.log(this.colorize('\n━'.repeat(80), 'cyan'));
    console.log(this.colorize('🔒 SECURITY ASSESSMENT RESULTS', 'bold'));
    console.log(this.colorize('━'.repeat(80), 'cyan'));

    // Overall score
    const scoreColor =
      this.results.overall === 'EXCELLENT'
        ? 'green'
        : this.results.overall === 'GOOD'
        ? 'cyan'
        : this.results.overall === 'FAIR'
        ? 'yellow'
        : 'red';

    console.log(
      this.colorize(
        `\n🎯 Overall Security Rating: ${this.results.overall}`,
        'bold',
      ),
    );
    console.log(
      this.colorize(
        `📊 Score: ${this.results.score}/${this.results.maxScore} (${this.results.summary.percentage}%)`,
        scoreColor,
      ),
    );

    // Test summary
    console.log(this.colorize('\n📋 Test Summary:', 'bold'));
    console.log(
      this.colorize(`✅ Passed: ${this.results.summary.passed}`, 'green'),
    );
    console.log(
      this.colorize(`⚠️  Warnings: ${this.results.summary.warnings}`, 'yellow'),
    );
    console.log(
      this.colorize(`❌ Failed: ${this.results.summary.failed}`, 'red'),
    );
    if (this.results.summary.errors > 0) {
      console.log(
        this.colorize(`🔥 Errors: ${this.results.summary.errors}`, 'red'),
      );
    }

    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log(this.colorize('\n💡 Security Recommendations:', 'bold'));
      this.results.recommendations.slice(0, 5).forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
      if (this.results.recommendations.length > 5) {
        console.log(
          this.colorize(
            `   ... and ${this.results.recommendations.length - 5} more`,
            'dim',
          ),
        );
      }
    }

    // Contact info
    console.log(this.colorize('\n📞 Contact Information:', 'bold'));
    console.log(this.colorize('📧 Email: jrbauti19@gmail.com', 'cyan'));
    console.log(
      this.colorize('🌐 Portfolio: https://www.joshuabautista.dev/', 'cyan'),
    );
    console.log(
      this.colorize(
        '🚀 Ready to discuss security automation strategies!',
        'green',
      ),
    );
  }

  /**
   * Determine test status based on score
   * @param {number} score - Current score
   * @param {number} maxScore - Maximum possible score
   * @returns {string} Status (PASS, WARN, FAIL)
   */
  determineStatus(score, maxScore) {
    const percentage = (score / maxScore) * 100;

    if (percentage >= 75) return 'PASS';
    if (percentage >= 50) return 'WARN';
    return 'FAIL';
  }

  /**
   * Colorize console output
   * @param {string} text - Text to colorize
   * @param {string} color - Color name
   * @returns {string} Colorized text
   */
  colorize(text, color) {
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

    return `${colors[color] || ''}${text}${colors.reset}`;
  }
}

module.exports = SecurityTester;
