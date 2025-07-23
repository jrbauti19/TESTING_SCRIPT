/**
 * Timeline Report Generator
 * Generates chronological analysis reports
 */

/**
 * Generate timeline report HTML
 * @param {Object} data - Complete validation data
 * @returns {string} HTML content
 */
function generateTimelineReport(data) {
  const { articles, validationReport } = data;
  const chronologyViolations =
    validationReport?.chronological?.violations || [];
  const isValidOrder = validationReport?.chronological?.isValid || false;

  // Check if we have article data
  if (!articles || articles.length === 0) {
    return `
      <div class="header">
          <h1>📅 Article Timeline Analysis</h1>
          <div class="subtitle">Chronological Order Validation</div>
      </div>
      <div class="no-data">
          <h3>No article data available</h3>
          <p>Unable to generate timeline analysis without article information.</p>
          <p>Please run the validation with article data to see the chronological analysis.</p>
      </div>
    `;
  }

  return `
    <div class="header">
        <h1>📅 Article Timeline Analysis</h1>
        <div class="subtitle">Chronological Order Validation for ${
          articles.length
        } Articles</div>
        <div style="margin-top: 20px;">
            <span class="grade-badge ${isValidOrder ? 'grade-a' : 'grade-c'}">
                ${
                  isValidOrder
                    ? '✅ CHRONOLOGICALLY CORRECT'
                    : '⚠️ ORDER VIOLATIONS FOUND'
                }
            </span>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <span class="icon">📰</span>
            <div class="value">${articles.length}</div>
            <div class="label">Total Articles</div>
        </div>
        <div class="stat-card">
            <span class="icon">${isValidOrder ? '✅' : '❌'}</span>
            <div class="value">${isValidOrder ? 'PASS' : 'FAIL'}</div>
            <div class="label">Chronology Check</div>
        </div>
        <div class="stat-card">
            <span class="icon">🚨</span>
            <div class="value">${chronologyViolations.length}</div>
            <div class="label">Order Violations</div>
        </div>
        <div class="stat-card">
            <span class="icon">📊</span>
            <div class="value">${
              validationReport?.summary?.dataQualityScore || 'N/A'
            }/100</div>
            <div class="label">Data Quality</div>
        </div>
    </div>

    <div class="chart-container">
        <h3>📈 Timeline Visualization</h3>
        <p style="text-align: center; color: #666; margin-bottom: 20px;">
            Compare actual article ranking with expected chronological order (newest to oldest)
        </p>
        <canvas id="timelineChart" width="400" height="300"></canvas>
    </div>

    ${
      chronologyViolations.length > 0
        ? `
    <div class="chronology-violations">
        <h3 style="margin-bottom: 20px; color: #e53e3e;">🚨 Chronological Order Violations</h3>
        <p style="margin-bottom: 20px; color: #4a5568;">
            The following articles violate the expected chronological order (newest to oldest):
        </p>
        
        ${chronologyViolations
          .slice(0, 10)
          .map(
            (violation) => `
            <div class="violation-item serious">
                <div class="violation-header">
                    <div class="violation-title">Article #${
                      violation.current.position
                    } is out of order</div>
                    <div class="violation-impact-badge serious">CHRONOLOGY VIOLATION</div>
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
                    <strong>Issue:</strong> This article is newer than the previous article<br>
                    <strong>Time Difference:</strong> ${Math.round(
                      violation.timeDifference / (1000 * 60),
                    )} minutes newer
                </div>
                <div class="violation-elements">
                    Current: ${violation.current.formatted} | Previous: ${
              violation.previous.formatted
            }
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
                        } is out of order</div>
                        <div class="violation-impact-badge serious">CHRONOLOGY VIOLATION</div>
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
                        <strong>Issue:</strong> This article is newer than the previous article<br>
                        <strong>Time Difference:</strong> ${Math.round(
                          violation.timeDifference / (1000 * 60),
                        )} minutes newer
                    </div>
                    <div class="violation-elements">
                        Current: ${violation.current.formatted} | Previous: ${
                  violation.previous.formatted
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
        : `
    <div class="success-message">
        <h3 style="color: #38a169; margin-bottom: 20px;">✅ Perfect Chronological Order</h3>
        <p>All ${articles.length} articles are correctly sorted from newest to oldest!</p>
        <p style="margin-top: 15px; color: #4a5568;">
            This indicates that Hacker News is properly maintaining chronological order on their /newest page.
        </p>
    </div>
    `
    }

    <div class="timeline-articles">
        <h3 style="margin-bottom: 20px; color: #4a5568;">📰 Complete Article Timeline</h3>
        <p style="margin-bottom: 20px; color: #666;">
            All articles sorted by their position on the page. Articles with chronological violations are highlighted.
        </p>
        
        ${articles
          .map((article, index) => {
            const hasViolation = chronologyViolations.some(
              (v) => v.current.position == article.rank,
            );
            return `
            <div class="timeline-article-item ${
              hasViolation ? 'has-violation' : ''
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
                            <span class="article-author">👤 ${
                              article.author || 'Unknown'
                            }</span>
                            <span class="article-time">⏰ ${
                              article.ageText || 'Unknown time'
                            }</span>
                            <span class="article-score">⭐ ${
                              article.score || 0
                            } points</span>
                            ${
                              article.comments
                                ? `<span class="article-comments">💬 ${article.comments} comments</span>`
                                : ''
                            }
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
                  hasViolation
                    ? `
                <div class="violation-indicator">
                    ⚠️ This article appears to be out of chronological order - it's newer than the previous article
                </div>
                `
                    : ''
                }
            </div>
          `;
          })
          .join('')}
    </div>

    <div class="timeline-summary" style="background: white; border-radius: 15px; padding: 30px; margin-bottom: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        <h3 style="margin-bottom: 20px; color: #4a5568;">📊 Timeline Analysis Summary</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <span class="icon">🕐</span>
                <div class="value">${
                  articles.filter((a) => a.timestamp).length
                }</div>
                <div class="label">Articles with Timestamps</div>
            </div>
            <div class="stat-card">
                <span class="icon">📈</span>
                <div class="value">${Math.round(
                  ((articles.length - chronologyViolations.length) /
                    articles.length) *
                    100,
                )}%</div>
                <div class="label">Chronological Accuracy</div>
            </div>
            <div class="stat-card">
                <span class="icon">⏱️</span>
                <div class="value">${getTimeSpan(articles)}</div>
                <div class="label">Time Span</div>
            </div>
            <div class="stat-card">
                <span class="icon">🔄</span>
                <div class="value">${
                  articles.filter((a) => a.author).length
                }</div>
                <div class="label">Articles with Authors</div>
            </div>
        </div>
        
        <div style="margin-top: 25px; padding: 20px; background: #f7fafc; border-radius: 10px; border-left: 4px solid #4299e1;">
            <h4 style="color: #2d3748; margin-bottom: 15px;">💡 Analysis Insights</h4>
            <ul style="color: #4a5568; line-height: 1.6;">
                <li><strong>Data Quality:</strong> ${
                  validationReport?.summary?.dataQualityScore || 'N/A'
                }/100 overall quality score</li>
                <li><strong>Chronological Order:</strong> ${
                  chronologyViolations.length === 0
                    ? 'Perfect - all articles in correct order'
                    : `${chronologyViolations.length} violations found out of ${articles.length} articles`
                }</li>
                <li><strong>Timestamp Coverage:</strong> ${Math.round(
                  (articles.filter((a) => a.timestamp).length /
                    articles.length) *
                    100,
                )}% of articles have valid timestamps</li>
                <li><strong>Recommendation:</strong> ${
                  chronologyViolations.length === 0
                    ? 'No action needed - chronological order is maintained'
                    : 'Review the highlighted violations to understand chronological discrepancies'
                }</li>
            </ul>
        </div>
    </div>
  `;
}

/**
 * Calculate time span between first and last articles
 * @param {Array} articles - Array of articles
 * @returns {string} Human-readable time span
 */
function getTimeSpan(articles) {
  const validArticles = articles.filter((a) => a.timestamp);
  if (validArticles.length < 2) return 'N/A';

  const timestamps = validArticles.map((a) => new Date(a.timestamp).getTime());
  const earliest = Math.min(...timestamps);
  const latest = Math.max(...timestamps);
  const diffHours = Math.round((latest - earliest) / (1000 * 60 * 60));

  if (diffHours < 1) return '< 1 hour';
  if (diffHours < 24) return `${diffHours} hours`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
}

module.exports = {
  generateTimelineReport,
};
