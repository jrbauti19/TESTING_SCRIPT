/**
 * Complete Report Generator
 * Generates comprehensive validation reports with all analysis sections
 */

/**
 * Generate complete validation report HTML
 * @param {Object} data - Complete validation data
 * @returns {string} HTML content
 */
function generateCompleteReport(data) {
  const { articles, validationReport, performanceReport, accessibilityReport } =
    data;
  const success = validationReport?.summary?.validationPassed || false;
  const chronologyViolations =
    validationReport?.chronological?.violations || [];
  const qualityIssues = validationReport?.quality?.issues || [];

  return `
    <div class="header">
        <h1>🚀 Joshua Bautista - QA Wolf Take Home</h1>
        <div class="subtitle">Complete Validation Analysis</div>
        <div style="margin-top: 20px;">
            <span class="grade-badge ${success ? 'grade-a' : 'grade-c'}">
                ${success ? '✅ PASSED' : '⚠️ ISSUES FOUND'}
            </span>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <span class="icon">📄</span>
            <div class="value">${articles?.length || 0}</div>
            <div class="label">Articles Validated</div>
        </div>
        <div class="stat-card">
            <span class="icon">🎯</span>
            <div class="value">${
              validationReport?.summary?.dataQualityScore || 'N/A'
            }/100</div>
            <div class="label">Quality Score</div>
        </div>
        <div class="stat-card">
            <span class="icon">⏱️</span>
            <div class="value">${
              performanceReport?.summary?.totalDurationFormatted || 'N/A'
            }</div>
            <div class="label">Duration</div>
        </div>
        <div class="stat-card">
            <span class="icon">🔍</span>
            <div class="value">${chronologyViolations.length}</div>
            <div class="label">Chronology Violations</div>
        </div>
    </div>

    ${
      chronologyViolations.length > 0
        ? `
    <div class="violations-section">
        <h3 style="margin-bottom: 20px; color: #e53e3e;">🚨 Chronological Order Violations</h3>
        <p style="margin-bottom: 20px; color: #4a5568;">The following articles are not in proper chronological order (newest to oldest):</p>
        ${chronologyViolations
          .slice(0, 10)
          .map(
            (violation) => `
            <div class="violation-item serious">
                <div class="violation-header">
                    <div class="violation-title">Article #${
                      violation.current.position
                    } is out of chronological order</div>
                    <div class="violation-impact-badge serious">ORDER VIOLATION</div>
                </div>
                <div class="violation-description">
                    <strong>Article:</strong> 
                    <a href="${
                      violation.current.url ||
                      `https://news.ycombinator.com/item?id=${violation.current.id}`
                    }" 
                       target="_blank" 
                       class="article-link"
                       title="Open article in new tab">
                        ${violation.current.title}
                    </a><br>
                    <strong>Current Position:</strong> Rank #${
                      violation.current.position
                    }<br>
                    <strong>Issue:</strong> This article is newer than the previous article (should be older)<br>
                    <strong>Time Published:</strong> ${
                      violation.current.formatted
                    }
                </div>
                <div class="violation-details">
                    <div class="violation-stats">
                        <span>📅 Current: ${violation.current.formatted}</span>
                        <span>⚠️ Previous: ${
                          violation.previous.formatted
                        }</span>
                        <span>⏱️ Time Difference: ${Math.round(
                          violation.timeDifference / (1000 * 60),
                        )} minutes newer</span>
                    </div>
                </div>
            </div>
        `,
          )
          .join('')}
        ${
          chronologyViolations.length > 10
            ? `
        <div class="more-violations">
            <button id="expandViolationsBtn" class="expand-button" onclick="expandAllViolations()">
                📋 Show all ${
                  chronologyViolations.length - 10
                } remaining violations
            </button>
        </div>
        <div id="hiddenViolations" class="hidden-violations" style="display: none;">
            ${chronologyViolations
              .slice(10)
              .map(
                (violation) => `
                <div class="violation-item serious">
                    <div class="violation-header">
                        <div class="violation-title">Article #${
                          violation.current.position
                        } is out of chronological order</div>
                        <div class="violation-impact-badge serious">ORDER VIOLATION</div>
                    </div>
                    <div class="violation-description">
                        <strong>Article:</strong> 
                        <a href="${
                          violation.current.url ||
                          `https://news.ycombinator.com/item?id=${violation.current.id}`
                        }" 
                           target="_blank" 
                           class="article-link"
                           title="Open article in new tab">
                            ${violation.current.title}
                        </a><br>
                        <strong>Current Position:</strong> Rank #${
                          violation.current.position
                        }<br>
                        <strong>Issue:</strong> This article is newer than the previous article (should be older)<br>
                        <strong>Time Published:</strong> ${
                          violation.current.formatted
                        }
                    </div>
                    <div class="violation-details">
                        <div class="violation-stats">
                            <span>📅 Current: ${
                              violation.current.formatted
                            }</span>
                            <span>⚠️ Previous: ${
                              violation.previous.formatted
                            }</span>
                            <span>⏱️ Time Difference: ${Math.round(
                              violation.timeDifference / (1000 * 60),
                            )} minutes newer</span>
                        </div>
                    </div>
                </div>
            `,
              )
              .join('')}
        </div>
        `
            : ''
        }
    </div>
    `
        : `
    <div class="success-message">
        <h3 style="color: #38a169; margin-bottom: 20px;">✅ Perfect Chronological Order</h3>
        <p>All ${
          articles?.length || 0
        } articles are correctly sorted from newest to oldest!</p>
    </div>
    `
    }

    ${
      accessibilityReport
        ? `
    <div class="accessibility-summary">
        <h3 style="margin-bottom: 20px; color: #4a5568;">♿ Accessibility Analysis Summary</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <span class="icon">🎯</span>
                <div class="value">${
                  accessibilityReport.executive?.score || 'N/A'
                }/100</div>
                <div class="label">Accessibility Score</div>
            </div>
            <div class="stat-card">
                <span class="icon">🚨</span>
                <div class="value">${
                  accessibilityReport.executive?.totalViolations || 0
                }</div>
                <div class="label">Total Violations</div>
            </div>
            <div class="stat-card">
                <span class="icon">📰</span>
                <div class="value">${
                  accessibilityReport.articleAnalysis?.affectedArticles || 0
                }</div>
                <div class="label">Articles with Issues</div>
            </div>
            <div class="stat-card">
                <span class="icon">⚠️</span>
                <div class="value">${
                  accessibilityReport.executive?.criticalIssues || 0
                }</div>
                <div class="label">Critical Issues</div>
            </div>
        </div>

        ${
          accessibilityReport.articleAnalysis?.mostProblematicArticles?.length >
          0
            ? `
        <div class="problematic-articles">
            <h4 style="color: #4a5568; margin-bottom: 15px;">Articles with Accessibility Issues</h4>
            ${accessibilityReport.articleAnalysis.mostProblematicArticles
              .slice(0, 5)
              .map(
                (articleIssue) => `
                <div class="article-issue-item">
                    <div class="article-header">
                        <span class="article-rank">#${
                          articleIssue.article.rank
                        }</span>
                        <div class="article-title">${
                          articleIssue.article.title
                        }</div>
                    </div>
                    <div class="article-stats">
                        <span class="issue-count">${
                          articleIssue.violations.length
                        } violation types</span>
                        <span class="element-count">${
                          articleIssue.issueCount
                        } affected elements</span>
                        <span class="severity-score">Severity: ${
                          articleIssue.severityScore
                        }</span>
                    </div>
                    <div class="article-violations">
                        ${articleIssue.violations
                          .slice(0, 2)
                          .map(
                            (violation) => `
                            <div class="violation-detail">
                                <strong>${violation.id}:</strong> ${violation.help}
                                <div class="violation-impact">Impact: ${violation.impact} | ${violation.nodeCount} elements</div>
                            </div>
                        `,
                          )
                          .join('')}
                        ${
                          articleIssue.violations.length > 2
                            ? `<div class="more-violations">... and ${
                                articleIssue.violations.length - 2
                              } more violations</div>`
                            : ''
                        }
                    </div>
                </div>
            `,
              )
              .join('')}
        </div>
        `
            : ''
        }
    </div>
    `
        : ''
    }

    ${
      qualityIssues.length > 0
        ? `
    <div class="quality-issues">
        <h3 style="margin-bottom: 20px; color: #d69e2e;">📊 Data Quality Issues</h3>
        ${qualityIssues
          .slice(0, 5)
          .map(
            (issue) => `
            <div class="violation-item moderate">
                <div class="violation-title">Data Quality Issue</div>
                <div class="violation-description">${
                  issue.description || 'Quality issue detected'
                }</div>
                <div class="violation-elements">Article: ${
                  issue.article || 'Unknown'
                } | Issue: ${issue.type || 'General'}</div>
            </div>
        `,
          )
          .join('')}
    </div>
    `
        : ''
    }

    <div class="chart-container">
        <h3>Article Timeline Analysis</h3>
        <canvas id="timelineChart" width="400" height="300"></canvas>
    </div>

    ${
      performanceReport
        ? `
    <div class="chart-container">
        <h3>Performance Breakdown</h3>
        <canvas id="performanceChart" width="400" height="200"></canvas>
    </div>
    `
        : ''
    }

    ${
      articles && articles.length > 0
        ? `
    <div class="articles-summary">
        <h3 style="margin-bottom: 20px; color: #4a5568;">📰 Articles Summary (First 10)</h3>
        ${articles
          .slice(0, 10)
          .map(
            (article, index) => `
            <div class="timeline-article-item ${
              chronologyViolations.some(
                (v) => v.current.position == article.rank,
              )
                ? 'has-violation'
                : ''
            }">
                <div class="article-timeline-header">
                    <span class="article-rank">#${article.rank}</span>
                    <div class="article-timeline-info">
                        <div class="article-title">
                            <a href="${
                              article.url ||
                              `https://news.ycombinator.com/item?id=${article.id}`
                            }" 
                               target="_blank" 
                               class="article-link"
                               title="Open article in new tab">
                                ${article.title}
                            </a>
                        </div>
                        <div class="article-meta">
                            <span class="article-author">by ${
                              article.author || 'Unknown'
                            }</span>
                            <span class="article-time">${
                              article.ageText || 'Unknown time'
                            }</span>
                            <span class="article-score">${
                              article.score || 0
                            } points</span>
                        </div>
                    </div>
                    ${
                      article.timestamp
                        ? `
                    <div class="article-timestamp">
                        <div class="timestamp-label">Published</div>
                        <div class="timestamp-value">${new Date(
                          article.timestamp,
                        ).toLocaleString()}</div>
                    </div>
                    `
                        : ''
                    }
                </div>
                ${
                  chronologyViolations.some(
                    (v) => v.current.position == article.rank,
                  )
                    ? `
                <div class="violation-indicator">
                    ⚠️ This article appears to be out of chronological order
                </div>
                `
                    : ''
                }
            </div>
        `,
          )
          .join('')}
        ${
          articles.length > 10
            ? `
        <div class="more-articles">
            <p>... and ${articles.length - 10} more articles validated</p>
        </div>
        `
            : ''
        }
    </div>
    `
        : ''
    }
  `;
}

module.exports = {
  generateCompleteReport,
};
