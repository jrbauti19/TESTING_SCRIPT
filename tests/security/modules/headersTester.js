/**
 * Security Headers Tester Module
 *
 * Tests for critical security headers including CSP, HSTS, X-Frame-Options, etc.
 *
 * @author Joshua Bautista
 * @contact jrbauti19@gmail.com
 */

const https = require('https');
const http = require('http');
const url = require('url');

class SecurityHeadersTester {
  /**
   * Initialize security headers tester
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
   * Test security headers configuration
   * @returns {Promise<Object>} Test results
   */
  async testSecurityHeaders() {
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

      // Test critical security headers
      await this.testCriticalHeaders(headers, test);

      // Test additional security headers
      await this.testAdditionalHeaders(headers, test);

      // Determine final status
      test.status = this.determineStatus(test.score, test.maxScore);
    } catch (error) {
      test.status = 'ERROR';
      test.details.push(`❌ Error: ${error.message}`);
    }

    return test;
  }

  /**
   * Test critical security headers
   * @param {Object} headers - Response headers
   * @param {Object} test - Test result object to update
   */
  async testCriticalHeaders(headers, test) {
    const criticalHeaders = {
      'strict-transport-security': {
        score: 5,
        name: 'HSTS',
        description: 'HTTP Strict Transport Security',
      },
      'x-frame-options': {
        score: 4,
        name: 'X-Frame-Options',
        description: 'Clickjacking protection',
      },
      'x-content-type-options': {
        score: 3,
        name: 'X-Content-Type-Options',
        description: 'MIME type sniffing protection',
      },
      'x-xss-protection': {
        score: 3,
        name: 'X-XSS-Protection',
        description: 'XSS protection',
      },
      'content-security-policy': {
        score: 5,
        name: 'Content Security Policy',
        description: 'Content Security Policy',
      },
    };

    for (const [headerKey, config] of Object.entries(criticalHeaders)) {
      const headerValue =
        headers[headerKey] || headers[headerKey.toLowerCase()];

      if (headerValue) {
        test.details.push(`✅ ${config.name} header present`);
        test.score += config.score;

        // Additional validation for specific headers
        if (headerKey === 'strict-transport-security') {
          this.validateHSTSHeader(headerValue, test);
        }

        if (headerKey === 'content-security-policy') {
          this.validateCSPHeader(headerValue, test);
        }
      } else {
        test.details.push(`⚠️  ${config.name} header missing`);
        test.issues.push(`Consider adding ${config.name} header`);
      }
    }
  }

  /**
   * Test additional security headers
   * @param {Object} headers - Response headers
   * @param {Object} test - Test result object to update
   */
  async testAdditionalHeaders(headers, test) {
    const additionalHeaders = {
      'referrer-policy': {
        score: 3,
        name: 'Referrer Policy',
        description: 'Referrer information control',
      },
      'permissions-policy': {
        score: 2,
        name: 'Permissions Policy',
        description: 'Feature policy control',
      },
      'x-permitted-cross-domain-policies': {
        score: 2,
        name: 'X-Permitted-Cross-Domain-Policies',
        description: 'Cross-domain policy control',
      },
      'cross-origin-embedder-policy': {
        score: 2,
        name: 'Cross-Origin-Embedder-Policy',
        description: 'Cross-origin isolation',
      },
    };

    for (const [headerKey, config] of Object.entries(additionalHeaders)) {
      const headerValue =
        headers[headerKey] || headers[headerKey.toLowerCase()];

      if (headerValue) {
        test.details.push(`✅ ${config.name} header present`);
        test.score += config.score;
      } else {
        test.details.push(`ℹ️  ${config.name} header not present (optional)`);
      }
    }
  }

  /**
   * Validate HSTS header configuration
   * @param {string} headerValue - HSTS header value
   * @param {Object} test - Test result object to update
   */
  validateHSTSHeader(headerValue, test) {
    if (headerValue.includes('max-age=')) {
      const maxAgeMatch = headerValue.match(/max-age=(\d+)/);
      if (maxAgeMatch) {
        const maxAge = parseInt(maxAgeMatch[1]);
        if (maxAge >= 31536000) {
          // 1 year
          test.details.push('✅ HSTS max-age set to 1 year or more');
        } else {
          test.details.push('⚠️  HSTS max-age should be at least 1 year');
          test.issues.push('Increase HSTS max-age to at least 1 year');
        }
      }
    }

    if (headerValue.includes('includeSubDomains')) {
      test.details.push('✅ HSTS includes subdomains');
    } else {
      test.details.push('ℹ️  HSTS does not include subdomains');
    }
  }

  /**
   * Validate CSP header configuration
   * @param {string} headerValue - CSP header value
   * @param {Object} test - Test result object to update
   */
  validateCSPHeader(headerValue, test) {
    if (headerValue.includes("'unsafe-inline'")) {
      test.details.push('⚠️  CSP allows unsafe-inline');
      test.issues.push('Consider removing unsafe-inline from CSP');
    } else {
      test.details.push('✅ CSP restricts inline scripts');
    }

    if (headerValue.includes("'unsafe-eval'")) {
      test.details.push('⚠️  CSP allows unsafe-eval');
      test.issues.push('Consider removing unsafe-eval from CSP');
    } else {
      test.details.push('✅ CSP restricts eval()');
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

    if (percentage >= 80) return 'PASS';
    if (percentage >= 50) return 'WARN';
    return 'FAIL';
  }
}

module.exports = SecurityHeadersTester;
