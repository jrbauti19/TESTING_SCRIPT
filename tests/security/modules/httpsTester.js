/**
 * HTTPS/TLS Security Tester Module
 *
 * Tests HTTPS configuration, TLS setup, and secure communication protocols
 *
 * @author Joshua Bautista
 * @contact jrbauti19@gmail.com
 */

const https = require('https');
const http = require('http');
const url = require('url');

class HTTPSecurityTester {
  /**
   * Initialize HTTPS security tester
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
   * Test HTTPS/TLS configuration
   * @returns {Promise<Object>} Test results
   */
  async testHTTPSConfiguration() {
    const test = {
      name: 'HTTPS/TLS Configuration',
      status: 'UNKNOWN',
      score: 0,
      maxScore: 20,
      details: [],
      issues: [],
    };

    try {
      // Test HTTP to HTTPS redirect
      await this.testHTTPRedirect(test);

      // Test HTTPS connection
      await this.testHTTPSConnection(test);

      // Test TLS configuration
      await this.testTLSConfiguration(test);

      // Determine final status
      test.status = this.determineStatus(test.score, test.maxScore);
    } catch (error) {
      test.status = 'ERROR';
      test.details.push(`❌ Error: ${error.message}`);
    }

    return test;
  }

  /**
   * Test HTTP to HTTPS redirect
   * @param {Object} test - Test result object to update
   */
  async testHTTPRedirect(test) {
    try {
      const httpUrl = this.targetUrl.replace('https://', 'http://');
      const httpTest = await this.makeRequest(httpUrl);

      if (httpTest.statusCode === 301 || httpTest.statusCode === 302) {
        test.details.push('✅ HTTP to HTTPS redirect enabled');
        test.score += 5;
      } else {
        test.details.push('⚠️  HTTP to HTTPS redirect not detected');
        test.issues.push('Consider implementing HTTP to HTTPS redirect');
      }
    } catch (error) {
      test.details.push(`⚠️  HTTP redirect test failed: ${error.message}`);
    }
  }

  /**
   * Test HTTPS connection
   * @param {Object} test - Test result object to update
   */
  async testHTTPSConnection(test) {
    try {
      const httpsTest = await this.makeRequest(this.targetUrl);

      if (httpsTest.statusCode === 200) {
        test.details.push('✅ HTTPS connection successful');
        test.score += 10;
      } else {
        test.details.push('❌ HTTPS connection failed');
        test.issues.push('HTTPS connection issues detected');
      }
    } catch (error) {
      test.details.push(`❌ HTTPS connection test failed: ${error.message}`);
      test.issues.push('HTTPS connection failed');
    }
  }

  /**
   * Test TLS configuration
   * @param {Object} test - Test result object to update
   */
  async testTLSConfiguration(test) {
    try {
      const httpsTest = await this.makeRequest(this.targetUrl);

      if (httpsTest.headers) {
        test.details.push('✅ TLS connection established');
        test.score += 5;

        // Check for security headers that indicate TLS
        const securityHeaders = ['strict-transport-security'];
        const hasSecurityHeaders = securityHeaders.some(
          (header) =>
            httpsTest.headers[header] ||
            httpsTest.headers[header.toLowerCase()],
        );

        if (hasSecurityHeaders) {
          test.details.push('✅ Security headers indicate proper TLS setup');
        }
      }
    } catch (error) {
      test.details.push(`⚠️  TLS configuration test failed: ${error.message}`);
    }
  }

  /**
   * Make HTTP/HTTPS request
   * @param {string} targetUrl - URL to request
   * @returns {Promise<Object>} Response object
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
}

module.exports = HTTPSecurityTester;
