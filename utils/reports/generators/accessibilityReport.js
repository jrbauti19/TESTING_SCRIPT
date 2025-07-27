/**
 * Accessibility Report Generator
 * Generates detailed accessibility compliance reports
 */

function generateAccessibilityReport(data) {
  const { accessibilityReport, articles } = data;

  if (!accessibilityReport || !accessibilityReport.violations) {
    return `
      <div class="header">
        <h1>♿ Accessibility Compliance Report</h1>
        <div class="subtitle">WCAG 2.1 AA/AAA Analysis</div>
      </div>
      <div class="no-data">
        <h3>📋 No Accessibility Data Available</h3>
        <p>No accessibility audit data was found for this validation run.</p>
        <div class="instructions">
          <h4>To generate an accessibility report:</h4>
          <ol>
            <li>Run the validation with the <code>--accessibility</code> flag</li>
            <li>Use the interactive menu to perform an accessibility audit</li>
            <li>Wait for the audit to complete before viewing this report</li>
          </ol>
        </div>
      </div>
    `;
  }

  const { violations, passes, inapplicable, timestamp } = accessibilityReport;
  const totalIssues = violations.length;
  const totalPasses =
    typeof passes === 'number' ? passes : passes ? passes.length : 0;
  const totalInapplicable =
    typeof inapplicable === 'number'
      ? inapplicable
      : inapplicable
      ? inapplicable.length
      : 0;
  const totalChecks = totalIssues + totalPasses + totalInapplicable;

  // Group violations by impact
  const criticalViolations = violations.filter((v) => v.impact === 'critical');
  const seriousViolations = violations.filter((v) => v.impact === 'serious');
  const moderateViolations = violations.filter((v) => v.impact === 'moderate');
  const minorViolations = violations.filter((v) => v.impact === 'minor');

  // Group violations by WCAG level
  const wcagA = violations.filter((v) => v.tags.includes('wcag2a'));
  const wcagAA = violations.filter((v) => v.tags.includes('wcag2aa'));
  const wcagAAA = violations.filter((v) => v.tags.includes('wcag2aaa'));

  // Group violations by category
  const violationsByCategory = violations.reduce((acc, violation) => {
    const category =
      violation.tags.find((tag) =>
        [
          'color-contrast',
          'document-title',
          'html-has-lang',
          'image-alt',
          'label',
          'link-name',
          'list',
          'listitem',
          'page-has-heading-one',
          'region',
        ].includes(tag),
      ) || 'other';

    if (!acc[category]) acc[category] = [];
    acc[category].push(violation);
    return acc;
  }, {});

  return `
    <div class="header">
      <h1>♿ Accessibility Compliance Report</h1>
      <div class="subtitle">WCAG 2.1 AA/AAA Analysis</div>
      <div class="timestamp">Generated: ${new Date(
        timestamp,
      ).toLocaleString()}</div>
    </div>

    <div class="executive-summary">
      <h2>📊 Executive Summary</h2>
      <div class="stats-grid">
        <div class="stat-card critical">
          <div class="stat-number">${totalIssues}</div>
          <div class="stat-label">Total Issues</div>
        </div>
        <div class="stat-card serious">
          <div class="stat-number">${seriousViolations.length}</div>
          <div class="stat-label">Serious Issues</div>
        </div>
        <div class="stat-card moderate">
          <div class="stat-number">${moderateViolations.length}</div>
          <div class="stat-label">Moderate Issues</div>
        </div>
        <div class="stat-card minor">
          <div class="stat-number">${minorViolations.length}</div>
          <div class="stat-label">Minor Issues</div>
        </div>
        <div class="stat-card passes">
          <div class="stat-number">${totalPasses}</div>
          <div class="stat-label">Passed Checks</div>
        </div>
        <div class="stat-card compliance">
          <div class="stat-number">${
            totalChecks > 0 ? Math.round((totalPasses / totalChecks) * 100) : 0
          }%</div>
          <div class="stat-label">Compliance Rate</div>
        </div>
      </div>
    </div>

    <div class="wcag-compliance">
      <h2>🎯 WCAG Compliance Matrix</h2>
      <div class="compliance-grid">
        <div class="compliance-level">
          <h3>WCAG 2.1 A</h3>
          <div class="level-stats">
            <span class="issues">${wcagA.length} issues</span>
            <span class="status ${wcagA.length === 0 ? 'pass' : 'fail'}">${
    wcagA.length === 0 ? 'PASS' : 'FAIL'
  }</span>
          </div>
        </div>
        <div class="compliance-level">
          <h3>WCAG 2.1 AA</h3>
          <div class="level-stats">
            <span class="issues">${wcagAA.length} issues</span>
            <span class="status ${wcagAA.length === 0 ? 'pass' : 'fail'}">${
    wcagAA.length === 0 ? 'PASS' : 'FAIL'
  }</span>
          </div>
        </div>
        <div class="compliance-level">
          <h3>WCAG 2.1 AAA</h3>
          <div class="level-stats">
            <span class="issues">${wcagAAA.length} issues</span>
            <span class="status ${wcagAAA.length === 0 ? 'pass' : 'fail'}">${
    wcagAAA.length === 0 ? 'PASS' : 'FAIL'
  }</span>
          </div>
        </div>
      </div>
    </div>

    <div class="violations-by-category">
      <h2>📋 Issues by Category</h2>
      <div class="category-grid">
        ${Object.entries(violationsByCategory)
          .map(
            ([category, categoryViolations]) => `
          <div class="category-card">
            <h3>${formatCategoryName(category)}</h3>
            <div class="category-count">${
              categoryViolations.length
            } issues</div>
            <div class="category-description">${getCategoryDescription(
              category,
            )}</div>
          </div>
        `,
          )
          .join('')}
      </div>
    </div>

    <div class="top-issues">
      <h2>🚨 Top Critical Issues</h2>
      <div class="issues-list">
        ${criticalViolations
          .slice(0, 5)
          .map(
            (violation) => `
          <div class="issue-card critical">
            <div class="issue-header">
              <h4>${violation.description}</h4>
              <span class="impact critical">Critical</span>
            </div>
            <div class="issue-details">
              <p><strong>Help:</strong> ${violation.help}</p>
              <p><strong>WCAG:</strong> ${violation.tags
                .filter((tag) => tag.startsWith('wcag'))
                .join(', ')}</p>
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
    </div>

    <div class="detailed-violations">
      <h2>🔍 Detailed Violations</h2>
      <div class="violations-container">
        ${violations
          .map(
            (violation, index) => `
          <div class="violation-card ${violation.impact}">
            <div class="violation-header">
              <h4>${index + 1}. ${violation.description}</h4>
              <span class="impact ${violation.impact}">${
              violation.impact
            }</span>
            </div>
            <div class="violation-details">
              <p><strong>Help:</strong> ${violation.help}</p>
              <p><strong>WCAG Criteria:</strong> ${violation.tags
                .filter((tag) => tag.startsWith('wcag'))
                .join(', ')}</p>
              <p><strong>Tags:</strong> ${violation.tags.join(', ')}</p>
            </div>
            ${
              violation.nodes && violation.nodes.length > 0
                ? `
              <div class="violation-nodes">
                <h5>Affected Elements (${violation.nodes.length}):</h5>
                <div class="nodes-list">
                  ${violation.nodes
                    .slice(0, 3)
                    .map(
                      (node) => `
                    <div class="node-item">
                      <code>${node.html.substring(0, 100)}${
                        node.html.length > 100 ? '...' : ''
                      }</code>
                    </div>
                  `,
                    )
                    .join('')}
                  ${
                    violation.nodes.length > 3
                      ? `<div class="more-nodes">... and ${
                          violation.nodes.length - 3
                        } more</div>`
                      : ''
                  }
                </div>
              </div>
            `
                : ''
            }
          </div>
        `,
          )
          .join('')}
      </div>
    </div>

    <div class="recommendations">
      <h2>💡 Recommendations</h2>
      <div class="recommendations-list">
        ${generateRecommendations(violations)}
      </div>
    </div>

    <div class="article-context">
      <h2>📰 Article-Specific Analysis</h2>
      ${
        articles && articles.length > 0
          ? `
        <div class="articles-summary">
          <p>Accessibility audit was performed on <strong>${
            articles.length
          }</strong> Hacker News articles.</p>
          <div class="articles-grid">
            ${articles
              .slice(0, 10)
              .map(
                (article) => `
              <div class="article-card">
                <h4>${article.title}</h4>
                <p class="article-meta">Rank: ${article.rank} | Score: ${
                  article.score || 'N/A'
                }</p>
                <a href="${
                  article.url
                }" target="_blank" class="article-link">View Article →</a>
              </div>
            `,
              )
              .join('')}
          </div>
        </div>
      `
          : `
        <div class="no-articles">
          <p>No article data available for context analysis.</p>
        </div>
      `
      }
    </div>
  `;
}

function formatCategoryName(category) {
  const names = {
    'color-contrast': 'Color Contrast',
    'document-title': 'Document Title',
    'html-has-lang': 'HTML Language',
    'image-alt': 'Image Alt Text',
    label: 'Form Labels',
    'link-name': 'Link Names',
    list: 'List Structure',
    listitem: 'List Items',
    'page-has-heading-one': 'Page Headings',
    region: 'Page Regions',
    other: 'Other Issues',
  };
  return names[category] || category;
}

function getCategoryDescription(category) {
  const descriptions = {
    'color-contrast': 'Text and background color contrast issues',
    'document-title': 'Missing or inadequate page titles',
    'html-has-lang': 'Missing or invalid HTML language attribute',
    'image-alt': 'Images missing alternative text',
    label: 'Form controls without proper labels',
    'link-name': 'Links without descriptive text',
    list: 'Improper list structure',
    listitem: 'List items not properly contained',
    'page-has-heading-one': 'Missing main heading (h1)',
    region: 'Missing page landmarks and regions',
    other: 'Other accessibility issues',
  };
  return descriptions[category] || 'Accessibility compliance issue';
}

function generateRecommendations(violations) {
  const recommendations = [];

  if (violations.some((v) => v.tags.includes('color-contrast'))) {
    recommendations.push(`
      <div class="recommendation">
        <h4>🎨 Improve Color Contrast</h4>
        <p>Ensure text has sufficient contrast with background colors. Use tools like WebAIM's contrast checker to verify ratios meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).</p>
      </div>
    `);
  }

  if (violations.some((v) => v.tags.includes('image-alt'))) {
    recommendations.push(`
      <div class="recommendation">
        <h4>🖼️ Add Alt Text to Images</h4>
        <p>Provide descriptive alternative text for all images. Use empty alt="" for decorative images and meaningful descriptions for content images.</p>
      </div>
    `);
  }

  if (violations.some((v) => v.tags.includes('link-name'))) {
    recommendations.push(`
      <div class="recommendation">
        <h4>🔗 Improve Link Descriptions</h4>
        <p>Ensure all links have descriptive text that explains their purpose. Avoid generic text like "click here" or "read more".</p>
      </div>
    `);
  }

  if (violations.some((v) => v.tags.includes('document-title'))) {
    recommendations.push(`
      <div class="recommendation">
        <h4>📄 Add Descriptive Page Titles</h4>
        <p>Provide unique, descriptive titles for each page that clearly indicate the page content and purpose.</p>
      </div>
    `);
  }

  if (violations.some((v) => v.tags.includes('html-has-lang'))) {
    recommendations.push(`
      <div class="recommendation">
        <h4>🌐 Set HTML Language</h4>
        <p>Add the lang attribute to the HTML element to specify the primary language of the page content.</p>
      </div>
    `);
  }

  if (recommendations.length === 0) {
    recommendations.push(`
      <div class="recommendation">
        <h4>✅ Great Job!</h4>
        <p>No specific recommendations at this time. Continue monitoring accessibility as content changes.</p>
      </div>
    `);
  }

  return recommendations.join('');
}

module.exports = {
  generateAccessibilityReport,
};
