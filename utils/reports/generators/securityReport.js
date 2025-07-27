/**
 * Security Report Generator
 * Generates comprehensive security assessment reports in HTML format
 */

/**
 * Generate security assessment report HTML
 * @param {Object} securityData - Security testing results
 * @returns {string} HTML content
 */
function generateSecurityReport(securityData) {
  const {
    overall,
    score,
    maxScore,
    tests,
    summary,
    recommendations,
    timestamp,
  } = securityData;
  const percentage = Math.round((score / maxScore) * 100);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS':
        return 'green';
      case 'WARN':
        return 'yellow';
      case 'FAIL':
        return 'red';
      case 'ERROR':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getOverallColor = (overall) => {
    switch (overall) {
      case 'EXCELLENT':
        return 'green';
      case 'GOOD':
        return 'cyan';
      case 'FAIR':
        return 'yellow';
      case 'POOR':
        return 'red';
      default:
        return 'gray';
    }
  };

  return `
    <div class="header">
        <h1>🔒 Security Assessment Report</h1>
        <div class="subtitle">Comprehensive Web Security Analysis</div>
        <div style="margin-top: 20px;">
            <span class="grade-badge grade-${getOverallColor(overall)}">
                ${overall} SECURITY RATING
            </span>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <span class="icon">🎯</span>
            <div class="value">${score}/${maxScore}</div>
            <div class="label">Security Score</div>
        </div>
        <div class="stat-card">
            <span class="icon">📊</span>
            <div class="value">${percentage}%</div>
            <div class="label">Overall Rating</div>
        </div>
        <div class="stat-card">
            <span class="icon">✅</span>
            <div class="value">${summary.passed}</div>
            <div class="label">Tests Passed</div>
        </div>
        <div class="stat-card">
            <span class="icon">⚠️</span>
            <div class="value">${summary.warnings}</div>
            <div class="label">Warnings</div>
        </div>
        <div class="stat-card">
            <span class="icon">❌</span>
            <div class="value">${summary.failed}</div>
            <div class="label">Tests Failed</div>
        </div>
        <div class="stat-card">
            <span class="icon">🔥</span>
            <div class="value">${summary.errors}</div>
            <div class="label">Errors</div>
        </div>
    </div>

    <div class="security-overview">
        <h3 style="margin-bottom: 20px; color: #4a5568;">🔍 Security Test Results</h3>
        ${tests
          .map(
            (test) => `
            <div class="security-test-item ${test.status.toLowerCase()}">
                <div class="test-header">
                    <div class="test-title">${test.name}</div>
                    <div class="test-status ${test.status.toLowerCase()}">
                        ${test.status} (${test.score}/${test.maxScore})
                    </div>
                </div>
                <div class="test-details">
                    ${test.details
                      .map(
                        (detail) => `
                        <div class="test-detail">${detail}</div>
                    `,
                      )
                      .join('')}
                </div>
                ${
                  test.issues.length > 0
                    ? `
                    <div class="test-issues">
                        <h4 style="color: #e53e3e; margin: 10px 0;">Issues Found:</h4>
                        ${test.issues
                          .map(
                            (issue) => `
                            <div class="issue-item">• ${issue}</div>
                        `,
                          )
                          .join('')}
                    </div>
                `
                    : ''
                }
            </div>
        `,
          )
          .join('')}
    </div>

    ${
      recommendations.length > 0
        ? `
        <div class="recommendations-section">
            <h3 style="margin-bottom: 20px; color: #d69e2e;">💡 Security Recommendations</h3>
            <div class="recommendations-list">
                ${recommendations
                  .map(
                    (rec, index) => `
                    <div class="recommendation-item">
                        <div class="recommendation-number">${index + 1}</div>
                        <div class="recommendation-text">${rec}</div>
                    </div>
                `,
                  )
                  .join('')}
            </div>
        </div>
    `
        : ''
    }

    <div class="security-summary">
        <h3 style="margin-bottom: 20px; color: #4a5568;">📋 Security Summary</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <strong>Overall Rating:</strong> ${overall}
            </div>
            <div class="summary-item">
                <strong>Security Score:</strong> ${score}/${maxScore} (${percentage}%)
            </div>
            <div class="summary-item">
                <strong>Tests Executed:</strong> ${summary.totalTests}
            </div>
            <div class="summary-item">
                <strong>Assessment Date:</strong> ${new Date(
                  timestamp,
                ).toLocaleString()}
            </div>
        </div>
    </div>

    <div class="contact-section">
        <h3 style="margin-bottom: 20px; color: #4a5568;">📞 Contact Information</h3>
        <div class="contact-info">
            <div class="contact-item">
                <strong>📧 Email:</strong> jrbauti19@gmail.com
            </div>
            <div class="contact-item">
                <strong>🌐 Portfolio:</strong> https://www.joshuabautista.dev/
            </div>
            <div class="contact-item">
                <strong>🚀 Ready to discuss security automation strategies!</strong>
            </div>
        </div>
    </div>
  `;
}

module.exports = {
  generateSecurityReport,
};
