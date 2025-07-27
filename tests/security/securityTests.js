/**
 * 🔒 Security Testing Module
 *
 * Comprehensive security assessment for web applications
 * Tests HTTPS, headers, CSP, cookies, and vulnerability patterns
 *
 * Author: Joshua Bautista
 * Contact: jrbauti19@gmail.com
 */

const { chromium } = require('playwright');
const https = require('https');
const http = require('http');
const url = require('url');

class SecurityTester {
  constructor(options = {}) {
    this.targetUrl = options.targetUrl || 'https://news.ycombinator.com';
    this.verbose = options.verbose || false;
    this.timeout = options.timeout || 30000;
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
   * Main entry point for security testing
   * @returns {Promise<Object>} Complete security assessment results
   */
  async runSecurityTests() {
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

    try {
      // Run all security tests
      await this.testHTTPSConfiguration();
      await this.testSecurityHeaders();
      await this.testContentSecurityPolicy();
      await this.testCookieSecurity();
      await this.testXSSVulnerabilities();
      await this.testInformationDisclosure();
      await this.testAuthenticationSecurity();
      await this.testInputValidation();

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
   * Test HTTPS/TLS configuration
   */
  async testHTTPSConfiguration() {
    console.log(
      this.colorize('\n🔐 Testing HTTPS/TLS Configuration...', 'bold'),
    );

    const test = {
      name: 'HTTPS/TLS Configuration',
      status: 'UNKNOWN',
      score: 0,
      maxScore: 20,
      details: [],
      issues: [],
    };

    try {
      // Test HTTPS redirect
      const httpUrl = this.targetUrl.replace('https://', 'http://');
      const httpTest = await this.makeRequest(httpUrl);

      if (httpTest.statusCode === 301 || httpTest.statusCode === 302) {
        test.details.push('✅ HTTP to HTTPS redirect enabled');
        test.score += 5;
      } else {
        test.details.push('⚠️  HTTP to HTTPS redirect not detected');
        test.issues.push('Consider implementing HTTP to HTTPS redirect');
      }

      // Test HTTPS response
      const httpsTest = await this.makeRequest(this.targetUrl);
      if (httpsTest.statusCode === 200) {
        test.details.push('✅ HTTPS connection successful');
        test.score += 10;
      } else {
        test.details.push('❌ HTTPS connection failed');
        test.issues.push('HTTPS connection issues detected');
      }

      // Check TLS version (basic check)
      if (httpsTest.headers) {
        test.details.push('✅ TLS connection established');
        test.score += 5;
      }

      test.status =
        test.score >= 15 ? 'PASS' : test.score >= 10 ? 'WARN' : 'FAIL';
    } catch (error) {
      test.status = 'ERROR';
      test.details.push(`❌ Error: ${error.message}`);
    }

    this.results.tests.push(test);
    console.log(
      this.colorize(
        `  Status: ${test.status} (${test.score}/${test.maxScore})`,
        test.status === 'PASS'
          ? 'green'
          : test.status === 'WARN'
          ? 'yellow'
          : 'red',
      ),
    );
  }

  /**
   * Test security headers
   */
  async testSecurityHeaders() {
    console.log(this.colorize('\n🛡️  Testing Security Headers...', 'bold'));

    const test = {
      name: 'Security Headers',
      status: 'UNKNOWN',
      score: 0,
      maxScore: 25,
      details: [],
      issues: [],
    };

    try {
      const response = await this.makeRequest(this.targetUrl);
      const headers = response.headers || {};

      // Critical security headers
      const securityHeaders = {
        'strict-transport-security': { score: 5, name: 'HSTS' },
        'x-frame-options': { score: 4, name: 'X-Frame-Options' },
        'x-content-type-options': { score: 3, name: 'X-Content-Type-Options' },
        'x-xss-protection': { score: 3, name: 'X-XSS-Protection' },
        'content-security-policy': {
          score: 5,
          name: 'Content Security Policy',
        },
        'referrer-policy': { score: 3, name: 'Referrer Policy' },
        'permissions-policy': { score: 2, name: 'Permissions Policy' },
      };

      Object.entries(securityHeaders).forEach(([header, config]) => {
        if (headers[header] || headers[header.toLowerCase()]) {
          test.details.push(`✅ ${config.name} header present`);
          test.score += config.score;
        } else {
          test.details.push(`⚠️  ${config.name} header missing`);
          test.issues.push(`Consider adding ${config.name} header`);
        }
      });

      test.status =
        test.score >= 20 ? 'PASS' : test.score >= 12 ? 'WARN' : 'FAIL';
    } catch (error) {
      test.status = 'ERROR';
      test.details.push(`❌ Error: ${error.message}`);
    }

    this.results.tests.push(test);
    console.log(
      this.colorize(
        `  Status: ${test.status} (${test.score}/${test.maxScore})`,
        test.status === 'PASS'
          ? 'green'
          : test.status === 'WARN'
          ? 'yellow'
          : 'red',
      ),
    );
  }

  /**
   * Test Content Security Policy
   */
  async testContentSecurityPolicy() {
    console.log(
      this.colorize('\n📋 Testing Content Security Policy...', 'bold'),
    );

    const test = {
      name: 'Content Security Policy',
      status: 'UNKNOWN',
      score: 0,
      maxScore: 15,
      details: [],
      issues: [],
    };

    try {
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
      test.status =
        test.score >= 12 ? 'PASS' : test.score >= 8 ? 'WARN' : 'FAIL';
    } catch (error) {
      test.status = 'ERROR';
      test.details.push(`❌ Error: ${error.message}`);
    }

    this.results.tests.push(test);
    console.log(
      this.colorize(
        `  Status: ${test.status} (${test.score}/${test.maxScore})`,
        test.status === 'PASS'
          ? 'green'
          : test.status === 'WARN'
          ? 'yellow'
          : 'red',
      ),
    );
  }

  /**
   * Test cookie security
   */
  async testCookieSecurity() {
    console.log(this.colorize('\n🍪 Testing Cookie Security...', 'bold'));

    const test = {
      name: 'Cookie Security',
      status: 'UNKNOWN',
      score: 0,
      maxScore: 15,
      details: [],
      issues: [],
    };

    try {
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(this.targetUrl);

      const cookies = await page.context().cookies();

      if (cookies.length === 0) {
        test.details.push('ℹ️  No cookies detected');
        test.score += 5; // No cookies = no cookie security issues
      } else {
        let secureCookies = 0;
        let httpOnlyCookies = 0;
        let sameSiteCookies = 0;

        cookies.forEach((cookie) => {
          if (cookie.secure) secureCookies++;
          if (cookie.httpOnly) httpOnlyCookies++;
          if (cookie.sameSite && cookie.sameSite !== 'none') sameSiteCookies++;
        });

        test.details.push(`📊 Total cookies: ${cookies.length}`);

        if (secureCookies === cookies.length) {
          test.details.push('✅ All cookies have Secure flag');
          test.score += 5;
        } else {
          test.details.push(
            `⚠️  ${cookies.length - secureCookies} cookies missing Secure flag`,
          );
          test.issues.push('Set Secure flag on all cookies');
        }

        if (httpOnlyCookies > 0) {
          test.details.push(`✅ ${httpOnlyCookies} cookies have HttpOnly flag`);
          test.score += 5;
        } else {
          test.details.push('⚠️  No cookies have HttpOnly flag');
          test.issues.push(
            'Consider adding HttpOnly flag to sensitive cookies',
          );
        }

        if (sameSiteCookies > 0) {
          test.details.push(
            `✅ ${sameSiteCookies} cookies have SameSite attribute`,
          );
          test.score += 5;
        } else {
          test.details.push('⚠️  No cookies have SameSite attribute');
          test.issues.push('Consider adding SameSite attribute to cookies');
        }
      }

      await browser.close();
      test.status =
        test.score >= 12 ? 'PASS' : test.score >= 8 ? 'WARN' : 'FAIL';
    } catch (error) {
      test.status = 'ERROR';
      test.details.push(`❌ Error: ${error.message}`);
    }

    this.results.tests.push(test);
    console.log(
      this.colorize(
        `  Status: ${test.status} (${test.score}/${test.maxScore})`,
        test.status === 'PASS'
          ? 'green'
          : test.status === 'WARN'
          ? 'yellow'
          : 'red',
      ),
    );
  }

  /**
   * Test for XSS vulnerabilities
   */
  async testXSSVulnerabilities() {
    console.log(this.colorize('\n🚨 Testing XSS Vulnerabilities...', 'bold'));

    const test = {
      name: 'XSS Vulnerability Assessment',
      status: 'UNKNOWN',
      score: 0,
      maxScore: 10,
      details: [],
      issues: [],
    };

    try {
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      // Set up XSS detection
      let xssDetected = false;
      page.on('dialog', async (dialog) => {
        if (dialog.message().includes('XSS') || dialog.type() === 'alert') {
          xssDetected = true;
          await dialog.dismiss();
        }
      });

      await page.goto(this.targetUrl);

      // Test for reflected XSS in URL parameters (basic test)
      const testPayloads = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '"><script>alert("XSS")</script>',
      ];

      for (const payload of testPayloads) {
        try {
          const testUrl = `${this.targetUrl}?q=${encodeURIComponent(payload)}`;
          await page.goto(testUrl, { timeout: 5000 });
          await page.waitForTimeout(1000);

          if (xssDetected) {
            test.details.push('❌ Potential XSS vulnerability detected');
            test.issues.push('XSS vulnerability requires immediate attention');
            break;
          }
        } catch (e) {
          // Continue testing other payloads
        }
      }

      if (!xssDetected) {
        test.details.push('✅ No obvious XSS vulnerabilities detected');
        test.score += 10;
      }

      // Check for XSS protection headers
      const response = await this.makeRequest(this.targetUrl);
      const xssProtection = response.headers['x-xss-protection'];
      if (xssProtection && xssProtection.includes('1')) {
        test.details.push('✅ X-XSS-Protection header enabled');
      } else {
        test.details.push('⚠️  X-XSS-Protection header not optimal');
      }

      await browser.close();
      test.status = xssDetected ? 'FAIL' : test.score >= 8 ? 'PASS' : 'WARN';
    } catch (error) {
      test.status = 'ERROR';
      test.details.push(`❌ Error: ${error.message}`);
    }

    this.results.tests.push(test);
    console.log(
      this.colorize(
        `  Status: ${test.status} (${test.score}/${test.maxScore})`,
        test.status === 'PASS'
          ? 'green'
          : test.status === 'WARN'
          ? 'yellow'
          : 'red',
      ),
    );
  }

  /**
   * Test for information disclosure
   */
  async testInformationDisclosure() {
    console.log(
      this.colorize('\n🔍 Testing Information Disclosure...', 'bold'),
    );

    const test = {
      name: 'Information Disclosure',
      status: 'UNKNOWN',
      score: 0,
      maxScore: 10,
      details: [],
      issues: [],
    };

    try {
      const response = await this.makeRequest(this.targetUrl);
      const headers = response.headers || {};

      // Check for information disclosure in headers
      const sensitiveHeaders = ['server', 'x-powered-by', 'x-aspnet-version'];
      let disclosureCount = 0;

      sensitiveHeaders.forEach((header) => {
        if (headers[header]) {
          test.details.push(`⚠️  ${header} header reveals: ${headers[header]}`);
          test.issues.push(`Consider removing or obfuscating ${header} header`);
          disclosureCount++;
        }
      });

      if (disclosureCount === 0) {
        test.details.push('✅ No obvious information disclosure in headers');
        test.score += 5;
      }

      // Check for common sensitive files (basic test)
      const sensitiveUrls = [
        '/robots.txt',
        '/.git/config',
        '/admin',
        '/config',
        '/.env',
      ];

      let accessibleFiles = 0;
      for (const path of sensitiveUrls) {
        try {
          const testUrl = new URL(path, this.targetUrl).href;
          const testResponse = await this.makeRequest(testUrl);
          if (testResponse.statusCode === 200) {
            if (path === '/robots.txt') {
              test.details.push('✅ robots.txt accessible (normal)');
            } else {
              test.details.push(`⚠️  Sensitive path accessible: ${path}`);
              test.issues.push(`Restrict access to ${path}`);
              accessibleFiles++;
            }
          }
        } catch (e) {
          // Expected for most paths
        }
      }

      if (accessibleFiles === 0) {
        test.details.push('✅ No sensitive files accessible');
        test.score += 5;
      }

      test.status =
        test.score >= 8 ? 'PASS' : test.score >= 5 ? 'WARN' : 'FAIL';
    } catch (error) {
      test.status = 'ERROR';
      test.details.push(`❌ Error: ${error.message}`);
    }

    this.results.tests.push(test);
    console.log(
      this.colorize(
        `  Status: ${test.status} (${test.score}/${test.maxScore})`,
        test.status === 'PASS'
          ? 'green'
          : test.status === 'WARN'
          ? 'yellow'
          : 'red',
      ),
    );
  }

  /**
   * Test authentication security
   */
  async testAuthenticationSecurity() {
    console.log(
      this.colorize('\n🔐 Testing Authentication Security...', 'bold'),
    );

    const test = {
      name: 'Authentication Security',
      status: 'UNKNOWN',
      score: 0,
      maxScore: 10,
      details: [],
      issues: [],
    };

    try {
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
      test.status =
        test.score >= 8 ? 'PASS' : test.score >= 5 ? 'WARN' : 'FAIL';
    } catch (error) {
      test.status = 'ERROR';
      test.details.push(`❌ Error: ${error.message}`);
    }

    this.results.tests.push(test);
    console.log(
      this.colorize(
        `  Status: ${test.status} (${test.score}/${test.maxScore})`,
        test.status === 'PASS'
          ? 'green'
          : test.status === 'WARN'
          ? 'yellow'
          : 'red',
      ),
    );
  }

  /**
   * Test input validation
   */
  async testInputValidation() {
    console.log(this.colorize('\n📝 Testing Input Validation...', 'bold'));

    const test = {
      name: 'Input Validation',
      status: 'UNKNOWN',
      score: 0,
      maxScore: 5,
      details: [],
      issues: [],
    };

    try {
      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(this.targetUrl);

      // Find input fields
      const inputs = await page.$$('input, textarea');

      if (inputs.length > 0) {
        test.details.push(`📊 ${inputs.length} input field(s) detected`);

        // Check for basic input validation attributes
        let validatedInputs = 0;
        for (const input of inputs) {
          const type = await input.getAttribute('type');
          const required = await input.getAttribute('required');
          const pattern = await input.getAttribute('pattern');
          const maxlength = await input.getAttribute('maxlength');

          if (
            required ||
            pattern ||
            maxlength ||
            ['email', 'url', 'tel'].includes(type)
          ) {
            validatedInputs++;
          }
        }

        if (validatedInputs > 0) {
          test.details.push(
            `✅ ${validatedInputs} input(s) have validation attributes`,
          );
          test.score += 5;
        } else {
          test.details.push('⚠️  No client-side validation detected');
          test.issues.push('Consider adding input validation attributes');
        }
      } else {
        test.details.push('ℹ️  No input fields detected on main page');
        test.score += 3; // No inputs = no input validation issues
      }

      await browser.close();
      test.status =
        test.score >= 4 ? 'PASS' : test.score >= 2 ? 'WARN' : 'FAIL';
    } catch (error) {
      test.status = 'ERROR';
      test.details.push(`❌ Error: ${error.message}`);
    }

    this.results.tests.push(test);
    console.log(
      this.colorize(
        `  Status: ${test.status} (${test.score}/${test.maxScore})`,
        test.status === 'PASS'
          ? 'green'
          : test.status === 'WARN'
          ? 'yellow'
          : 'red',
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
   * Make HTTP/HTTPS request
   */
  makeRequest(targetUrl) {
    return new Promise((resolve, reject) => {
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
   * Colorize console output
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
