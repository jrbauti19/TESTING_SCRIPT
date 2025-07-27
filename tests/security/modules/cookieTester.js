/**
 * Cookie Security Tester Module
 *
 * Tests cookie security settings including Secure, HttpOnly, SameSite flags
 *
 * @author Joshua Bautista
 * @contact jrbauti19@gmail.com
 */

const { chromium } = require('playwright');

class CookieSecurityTester {
  /**
   * Initialize cookie security tester
   * @param {Object} options - Configuration options
   * @param {string} options.targetUrl - Target URL to test
   * @param {number} options.timeout - Request timeout in milliseconds
   * @param {boolean} options.verbose - Enable verbose logging
   */
  constructor(options = {}) {
    this.targetUrl = options.targetUrl || 'https://news.ycombinator.com';
    this.timeout = options.timeout || 30000;
    this.verbose = options.verbose || false;
  }

  /**
   * Test cookie security configuration
   * @returns {Promise<Object>} Test results
   */
  async testCookieSecurity() {
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

      // Navigate to target URL
      await page.goto(this.targetUrl, {
        waitUntil: 'networkidle',
        timeout: this.timeout,
      });

      // Get all cookies
      const cookies = await page.context().cookies();

      // Analyze cookie security
      await this.analyzeCookies(cookies, test);

      // Test cookie behavior
      await this.testCookieBehavior(page, test);

      await browser.close();

      // Determine final status
      test.status = this.determineStatus(test.score, test.maxScore);
    } catch (error) {
      test.status = 'ERROR';
      test.details.push(`❌ Error: ${error.message}`);
    }

    return test;
  }

  /**
   * Analyze cookie security settings
   * @param {Array} cookies - Array of cookie objects
   * @param {Object} test - Test result object to update
   */
  async analyzeCookies(cookies, test) {
    if (cookies.length === 0) {
      test.details.push('ℹ️  No cookies detected');
      test.score += 5; // No cookies = no cookie security issues
      return;
    }

    test.details.push(`📊 Total cookies: ${cookies.length}`);

    // Count secure cookies
    const secureCookies = cookies.filter((cookie) => cookie.secure);
    const httpOnlyCookies = cookies.filter((cookie) => cookie.httpOnly);
    const sameSiteCookies = cookies.filter(
      (cookie) => cookie.sameSite && cookie.sameSite !== 'none',
    );

    // Test Secure flag
    await this.testSecureFlag(secureCookies, cookies.length, test);

    // Test HttpOnly flag
    await this.testHttpOnlyFlag(httpOnlyCookies, cookies.length, test);

    // Test SameSite attribute
    await this.testSameSiteAttribute(sameSiteCookies, cookies.length, test);

    // Test session cookies specifically
    await this.testSessionCookies(cookies, test);
  }

  /**
   * Test Secure flag on cookies
   * @param {Array} secureCookies - Cookies with Secure flag
   * @param {number} totalCookies - Total number of cookies
   * @param {Object} test - Test result object to update
   */
  async testSecureFlag(secureCookies, totalCookies, test) {
    if (secureCookies.length === totalCookies) {
      test.details.push('✅ All cookies have Secure flag');
      test.score += 5;
    } else {
      const insecureCount = totalCookies - secureCookies.length;
      test.details.push(`⚠️  ${insecureCount} cookies missing Secure flag`);
      test.issues.push('Set Secure flag on all cookies');

      // Show examples of insecure cookies
      if (this.verbose) {
        const insecureCookies = secureCookies.filter(
          (cookie) => !cookie.secure,
        );
        insecureCookies.slice(0, 3).forEach((cookie) => {
          test.details.push(`   - ${cookie.name} (domain: ${cookie.domain})`);
        });
      }
    }
  }

  /**
   * Test HttpOnly flag on cookies
   * @param {Array} httpOnlyCookies - Cookies with HttpOnly flag
   * @param {number} totalCookies - Total number of cookies
   * @param {Object} test - Test result object to update
   */
  async testHttpOnlyFlag(httpOnlyCookies, totalCookies, test) {
    if (httpOnlyCookies.length > 0) {
      test.details.push(
        `✅ ${httpOnlyCookies.length} cookies have HttpOnly flag`,
      );
      test.score += 5;

      // Check if sensitive cookies have HttpOnly
      const sensitiveCookies = httpOnlyCookies.filter(
        (cookie) =>
          cookie.name.toLowerCase().includes('session') ||
          cookie.name.toLowerCase().includes('auth') ||
          cookie.name.toLowerCase().includes('token'),
      );

      if (sensitiveCookies.length > 0) {
        test.details.push('✅ Sensitive cookies have HttpOnly flag');
      }
    } else {
      test.details.push('⚠️  No cookies have HttpOnly flag');
      test.issues.push('Consider adding HttpOnly flag to sensitive cookies');
    }
  }

  /**
   * Test SameSite attribute on cookies
   * @param {Array} sameSiteCookies - Cookies with SameSite attribute
   * @param {number} totalCookies - Total number of cookies
   * @param {Object} test - Test result object to update
   */
  async testSameSiteAttribute(sameSiteCookies, totalCookies, test) {
    if (sameSiteCookies.length > 0) {
      test.details.push(
        `✅ ${sameSiteCookies.length} cookies have SameSite attribute`,
      );
      test.score += 5;

      // Check for proper SameSite values
      const strictSameSite = sameSiteCookies.filter(
        (cookie) => cookie.sameSite === 'strict',
      );

      if (strictSameSite.length > 0) {
        test.details.push('✅ Some cookies use SameSite=Strict');
      } else {
        test.details.push(
          'ℹ️  Consider using SameSite=Strict for sensitive cookies',
        );
      }
    } else {
      test.details.push('⚠️  No cookies have SameSite attribute');
      test.issues.push('Consider adding SameSite attribute to cookies');
    }
  }

  /**
   * Test session cookies specifically
   * @param {Array} cookies - All cookies
   * @param {Object} test - Test result object to update
   */
  async testSessionCookies(cookies, test) {
    const sessionCookies = cookies.filter(
      (cookie) =>
        cookie.name.toLowerCase().includes('session') ||
        cookie.name.toLowerCase().includes('auth') ||
        cookie.name.toLowerCase().includes('token'),
    );

    if (sessionCookies.length > 0) {
      test.details.push(
        `📊 ${sessionCookies.length} potential session cookie(s)`,
      );

      const secureSessionCookies = sessionCookies.filter(
        (cookie) => cookie.secure && cookie.httpOnly,
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
  }

  /**
   * Test cookie behavior and vulnerabilities
   * @param {Object} page - Playwright page object
   * @param {Object} test - Test result object to update
   */
  async testCookieBehavior(page, test) {
    try {
      // Test for cookie injection vulnerabilities (basic)
      const cookieInjectionTest = await page.evaluate(() => {
        try {
          // Try to set a cookie via JavaScript
          document.cookie = 'test=injection';
          return document.cookie.includes('test=injection');
        } catch (e) {
          return false;
        }
      });

      if (cookieInjectionTest) {
        test.details.push(
          'ℹ️  JavaScript can set cookies (normal for non-HttpOnly cookies)',
        );
      } else {
        test.details.push('✅ JavaScript cookie setting restricted');
      }
    } catch (error) {
      test.details.push(`⚠️  Cookie behavior test failed: ${error.message}`);
    }
  }

  /**
   * Determine test status based on score
   * @param {number} score - Current score
   * @param {number} maxScore - Maximum possible score
   * @returns {string} Status (PASS, WARN, FAIL)
   */
  determineStatus(score, maxScore) {
    const percentage = (score / maxScore) * 100;

    if (percentage >= 80) return 'PASS';
    if (percentage >= 50) return 'WARN';
    return 'FAIL';
  }
}

module.exports = CookieSecurityTester;
