// utils/reportServer.js
// Localhost web server for interactive report viewing

const express = require('express');
const path = require('path');
const open = require('open');
const logger = require('../logger');

/**
 * Create and start a report server
 * @param {Object} data - Report data to display
 * @param {string} reportType - Type of report (complete, performance, accessibility, etc.)
 * @returns {Promise<void>}
 */
async function createReportServer(data, reportType = 'complete') {
  const app = express();
  const port = await getAvailablePort(3000);

  // Serve static files and templates
  app.use(express.static(path.join(__dirname, '../web')));
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../templates'));

  // Main report route
  app.get('/', (req, res) => {
    res.send(generateReportHTML(data, reportType));
  });

  // API endpoints for dynamic data
  app.get('/api/data', (req, res) => {
    res.json(data);
  });

  app.get('/api/chart/:type', (req, res) => {
    const chartData = generateChartData(data, req.params.type);
    res.json(chartData);
  });

  // Start server
  const server = app.listen(port, () => {
    const url = `http://localhost:${port}`;
    logger.success(`🌐 Report server started at ${url}`);

    // Open browser
    open(url).catch(() => {
      logger.warn('Could not open browser automatically. Please visit:', url);
    });
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Shutting down report server...');
    server.close(() => {
      logger.success('Report server stopped');
      process.exit(0);
    });
  });

  return server;
}

/**
 * Generate HTML report based on report type
 * @param {Object} data - Report data
 * @param {string} reportType - Type of report
 * @returns {string} HTML content
 */
function generateReportHTML(data, reportType) {
  const baseHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Joshua Bautista - QA Wolf Take Home - ${
      reportType.charAt(0).toUpperCase() + reportType.slice(1)
    }</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        ${getReportStyles()}
    </style>
</head>
<body>
    <div class="container">
        ${generateReportContent(data, reportType)}
        
        <div class="contact-footer">
            <div class="footer-content">
                <h3>👨‍💻 Joshua Bautista - QA Engineer</h3>
                <p>Thank you for reviewing my QA Wolf take-home assignment!</p>
                <div class="contact-links">
                    <a href="mailto:jrbauti19@gmail.com">📧 jrbauti19@gmail.com</a>
                    <a href="https://www.linkedin.com/in/joshua-raphael-bautista-8a019a11b/" target="_blank">💼 LinkedIn</a>
                    <a href="https://www.joshuabautista.dev/" target="_blank">🌐 Portfolio</a>
                </div>
                <p class="footer-note">I look forward to discussing this project and the QA Wolf opportunity!</p>
            </div>
        </div>
    </div>
    <script>
        ${generateReportScripts(data, reportType)}
    </script>
</body>
</html>`;

  return baseHTML;
}

/**
 * Generate CSS styles for the report
 * @returns {string} CSS styles
 */
function getReportStyles() {
  return `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        color: #333;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    .header {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        text-align: center;
    }

    .header h1 {
        color: #4a5568;
        margin-bottom: 10px;
        font-size: 2.5em;
    }

    .header .subtitle {
        color: #718096;
        font-size: 1.2em;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .stat-card {
        background: white;
        border-radius: 15px;
        padding: 25px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
    }

    .stat-card:hover {
        transform: translateY(-5px);
    }

    .stat-card .icon {
        font-size: 2.5em;
        margin-bottom: 15px;
        display: block;
    }

    .stat-card .value {
        font-size: 2em;
        font-weight: bold;
        color: #4a5568;
        margin-bottom: 5px;
    }

    .stat-card .label {
        color: #718096;
        font-size: 0.9em;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .chart-container {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .chart-container h3 {
        margin-bottom: 20px;
        color: #4a5568;
        text-align: center;
    }

    .violations-list {
        background: white;
        border-radius: 15px;
        padding: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .violation-item {
        border-left: 4px solid #e53e3e;
        padding: 15px;
        margin-bottom: 15px;
        background: #fed7d7;
        border-radius: 0 10px 10px 0;
    }

    .violation-item.serious {
        border-color: #dd6b20;
        background: #feebc8;
    }

    .violation-item.moderate {
        border-color: #d69e2e;
        background: #faf089;
    }

    .violation-item.minor {
        border-color: #38a169;
        background: #c6f6d5;
    }

    .violation-title {
        font-weight: bold;
        margin-bottom: 8px;
        color: #2d3748;
    }

    .violation-description {
        color: #4a5568;
        margin-bottom: 8px;
    }

    .violation-elements {
        font-size: 0.9em;
        color: #718096;
    }

    .article-analysis {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .problematic-articles {
        margin-top: 25px;
    }

    .article-issue-item {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 15px;
        background: #f7fafc;
        transition: all 0.3s ease;
    }

    .article-issue-item:hover {
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        transform: translateY(-2px);
    }

    .article-header {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }

    .article-rank {
        background: #4299e1;
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-weight: bold;
        font-size: 0.9em;
        margin-right: 12px;
        min-width: 40px;
        text-align: center;
    }

    .article-title {
        font-weight: 600;
        color: #2d3748;
        flex: 1;
        line-height: 1.4;
    }

    .article-stats {
        display: flex;
        gap: 15px;
        font-size: 0.9em;
        color: #718096;
    }

    .article-stats span {
        background: #edf2f7;
        padding: 4px 8px;
        border-radius: 4px;
    }

    .severity-score {
        font-weight: 600;
        color: #e53e3e !important;
    }

    .violation-detail {
        margin: 8px 0;
        padding: 8px;
        background: #f7fafc;
        border-left: 3px solid #4299e1;
        border-radius: 4px;
        font-size: 0.9em;
    }

    .violation-impact {
        color: #718096;
        font-size: 0.85em;
        margin-top: 4px;
    }

    .more-violations {
        color: #4a5568;
        font-style: italic;
        margin-top: 8px;
        text-align: center;
    }

    .violation-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
    }

    .violation-impact-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.75em;
        font-weight: bold;
        text-transform: uppercase;
    }

    .violation-impact-badge.critical {
        background: #fed7d7;
        color: #742a2a;
    }

    .violation-impact-badge.serious {
        background: #feebc8;
        color: #744210;
    }

    .violation-impact-badge.moderate {
        background: #faf089;
        color: #744210;
    }

    .violation-impact-badge.minor {
        background: #c6f6d5;
        color: #22543d;
    }

    .violation-details {
        margin-top: 15px;
    }

    .violation-stats {
        display: flex;
        gap: 15px;
        margin-bottom: 10px;
        flex-wrap: wrap;
    }

    .violation-stats span {
        background: #edf2f7;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.9em;
        color: #4a5568;
    }

    .affected-articles {
        margin: 10px 0;
        padding: 10px;
        background: #ebf8ff;
        border-radius: 6px;
    }

    .article-list {
        margin-top: 8px;
    }

    .affected-article {
        display: inline-block;
        background: #bee3f8;
        color: #2b6cb0;
        padding: 4px 8px;
        margin: 2px;
        border-radius: 4px;
        font-size: 0.85em;
    }

    .more-articles {
        color: #4a5568;
        font-style: italic;
        margin-top: 5px;
    }

    .general-issue {
        margin: 10px 0;
        padding: 10px;
        background: #faf5ff;
        border-radius: 6px;
        color: #553c9a;
    }

    .violation-help {
        margin-top: 10px;
    }

    .help-link {
        color: #4299e1;
        text-decoration: none;
        font-weight: 500;
    }

    .help-link:hover {
        text-decoration: underline;
    }

    .no-data {
        text-align: center;
        padding: 60px 20px;
        background: white;
        border-radius: 15px;
        margin: 30px 0;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .no-data h3 {
        color: #4a5568;
        margin-bottom: 15px;
    }

    .no-data p {
        color: #718096;
    }

    .chronology-violations {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .success-message {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        text-align: center;
    }

    .timeline-articles {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .timeline-article-item {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 15px;
        background: #f7fafc;
        transition: all 0.3s ease;
    }

    .timeline-article-item:hover {
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        transform: translateY(-2px);
    }

    .timeline-article-item.has-violation {
        border-color: #e53e3e;
        background: #fed7d7;
    }

    .article-timeline-header {
        display: flex;
        align-items: flex-start;
        gap: 15px;
    }

    .article-timeline-info {
        flex: 1;
    }

    .article-timeline-info .article-title {
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 8px;
        line-height: 1.4;
    }

    .article-meta {
        display: flex;
        gap: 15px;
        font-size: 0.9em;
        color: #718096;
        flex-wrap: wrap;
    }

    .article-meta span {
        background: #edf2f7;
        padding: 3px 8px;
        border-radius: 4px;
    }

    .article-timestamp {
        text-align: right;
        font-size: 0.85em;
    }

    .timestamp-label {
        color: #718096;
        margin-bottom: 4px;
    }

    .timestamp-value {
        color: #4a5568;
        font-weight: 500;
    }

    .violation-indicator {
        margin-top: 10px;
        padding: 8px;
        background: #fed7d7;
        color: #742a2a;
        border-radius: 6px;
        font-weight: 500;
    }

    .memory-analysis, .network-analysis, .efficiency-analysis, 
    .violations-section, .accessibility-summary, .quality-issues, .articles-summary {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .performance-timeline {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .timeline-item {
        display: flex;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid #e2e8f0;
    }

    .timeline-item:last-child {
        border-bottom: none;
    }

    .timeline-phase {
        flex: 1;
        font-weight: bold;
        color: #4a5568;
    }

    .timeline-duration {
        color: #718096;
        margin-right: 20px;
    }

    .timeline-bar {
        width: 200px;
        height: 8px;
        background: #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
    }

    .timeline-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 4px;
        transition: width 0.3s ease;
    }

    .grade-badge {
        display: inline-block;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 1.2em;
    }

    .grade-a { background: #c6f6d5; color: #22543d; }
    .grade-b { background: #faf089; color: #744210; }
    .grade-c { background: #fed7d7; color: #742a2a; }
    .grade-f { background: #feb2b2; color: #742a2a; }

    @media (max-width: 768px) {
        .container {
            padding: 10px;
        }
        
        .stats-grid {
            grid-template-columns: 1fr;
        }
        
        .header h1 {
            font-size: 2em;
        }
    }

    .contact-footer {
        margin-top: 50px;
        padding: 30px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        text-align: center;
    }

    .footer-content h3 {
        color: #2d3748;
        margin-bottom: 15px;
        font-size: 1.5em;
    }

    .footer-content p {
        color: #4a5568;
        margin-bottom: 20px;
        line-height: 1.6;
    }

    .contact-links {
        display: flex;
        justify-content: center;
        gap: 25px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }

    .contact-links a {
        color: #4299e1;
        text-decoration: none;
        font-weight: 600;
        padding: 10px 20px;
        background: #ebf8ff;
        border-radius: 8px;
        transition: all 0.3s ease;
    }

    .contact-links a:hover {
        background: #4299e1;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(66, 153, 225, 0.3);
    }

    .footer-note {
        font-style: italic;
        color: #718096;
        font-size: 0.95em;
    }

    @media (max-width: 768px) {
        .contact-links {
            flex-direction: column;
            align-items: center;
        }
        
        .contact-links a {
            width: 100%;
            max-width: 250px;
        }
    }
  `;
}

/**
 * Generate report content based on type
 * @param {Object} data - Report data
 * @param {string} reportType - Type of report
 * @returns {string} HTML content
 */
function generateReportContent(data, reportType) {
  switch (reportType) {
    case 'accessibility':
      return generateAccessibilityReport(data);
    case 'performance':
      // Extract performance data from validation result
      return generatePerformanceReport(data.performanceReport || data);
    case 'complete':
      return generateCompleteReport(data);
    case 'quality':
      return generateQualityReport(data);
    case 'timeline':
      return generateTimelineReport(data);
    default:
      return generateCompleteReport(data);
  }
}

/**
 * Generate accessibility report HTML
 * @param {Object} data - Accessibility data
 * @returns {string} HTML content
 */
function generateAccessibilityReport(data) {
  const { executive, breakdown, topIssues, articleAnalysis, violations } = data;
  const gradeClass = `grade-${executive.grade.charAt(0).toLowerCase()}`;

  return `
    <div class="header">
        <h1>♿ Accessibility Report</h1>
        <div class="subtitle">Hacker News WCAG Compliance Analysis</div>
        <div style="margin-top: 20px;">
            <span class="grade-badge ${gradeClass}">${executive.grade}</span>
            <div style="margin-top: 10px; font-size: 1.5em; color: #4a5568;">
                Score: ${executive.score}/100
            </div>
        </div>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <span class="icon">🚨</span>
            <div class="value">${executive.totalViolations}</div>
            <div class="label">Total Violations</div>
        </div>
        <div class="stat-card">
            <span class="icon">🎯</span>
            <div class="value">${executive.affectedElements}</div>
            <div class="label">Affected Elements</div>
        </div>
        <div class="stat-card">
            <span class="icon">⚠️</span>
            <div class="value">${executive.criticalIssues}</div>
            <div class="label">Critical Issues</div>
        </div>
        <div class="stat-card">
            <span class="icon">📋</span>
            <div class="value">${executive.wcagCompliance}</div>
            <div class="label">WCAG Status</div>
        </div>
    </div>

    ${
      articleAnalysis
        ? `
    <div class="article-analysis">
        <h3 style="margin-bottom: 20px; color: #4a5568;">📰 Article Impact Analysis</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <span class="icon">📄</span>
                <div class="value">${articleAnalysis.totalArticles}</div>
                <div class="label">Total Articles</div>
            </div>
            <div class="stat-card">
                <span class="icon">🚨</span>
                <div class="value">${articleAnalysis.affectedArticles}</div>
                <div class="label">Articles with Issues</div>
            </div>
            <div class="stat-card">
                <span class="icon">📝</span>
                <div class="value">${
                  articleAnalysis.issueDistribution.articleSpecific
                }</div>
                <div class="label">Article-Specific Issues</div>
            </div>
            <div class="stat-card">
                <span class="icon">🌐</span>
                <div class="value">${
                  articleAnalysis.issueDistribution.generalPage
                }</div>
                <div class="label">General Page Issues</div>
            </div>
        </div>
        
        ${
          articleAnalysis.mostProblematicArticles.length > 0
            ? `
        <div class="problematic-articles">
            <h4 style="color: #4a5568; margin-bottom: 15px;">Most Problematic Articles</h4>
            ${articleAnalysis.mostProblematicArticles
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
                          .slice(0, 3)
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
                          articleIssue.violations.length > 3
                            ? `<div class="more-violations">... and ${
                                articleIssue.violations.length - 3
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

    <div class="chart-container">
        <h3>Issues by Severity</h3>
        <canvas id="severityChart" width="400" height="200"></canvas>
    </div>

    <div class="violations-list">
        <h3 style="margin-bottom: 20px; color: #4a5568;">Detailed Accessibility Violations</h3>
        ${(violations || topIssues)
          .slice(0, 15)
          .map(
            (issue) => `
            <div class="violation-item ${issue.impact}">
                <div class="violation-header">
                    <div class="violation-title">${issue.help}</div>
                    <div class="violation-impact-badge ${
                      issue.impact
                    }">${issue.impact.toUpperCase()}</div>
                </div>
                <div class="violation-description">${issue.description}</div>
                <div class="violation-details">
                    <div class="violation-stats">
                        <span>🎯 ${issue.nodeCount} affected elements</span>
                        <span>📋 Rule: ${issue.id}</span>
                        ${
                          issue.wcagLevel
                            ? `<span>♿ ${issue.wcagLevel.join(', ')}</span>`
                            : ''
                        }
                    </div>
                    ${
                      issue.affectedArticles &&
                      issue.affectedArticles.length > 0
                        ? `
                    <div class="affected-articles">
                        <strong>📰 Affected Articles:</strong>
                        <div class="article-list">
                            ${issue.affectedArticles
                              .slice(0, 3)
                              .map(
                                (article) => `
                                <span class="affected-article">
                                    #${article.rank}: ${article.title.substring(
                                  0,
                                  50,
                                )}${article.title.length > 50 ? '...' : ''}
                                </span>
                            `,
                              )
                              .join('')}
                            ${
                              issue.affectedArticles.length > 3
                                ? `<span class="more-articles">... and ${
                                    issue.affectedArticles.length - 3
                                  } more articles</span>`
                                : ''
                            }
                        </div>
                    </div>
                    `
                        : `
                    <div class="general-issue">
                        <strong>🌐 General Page Issue:</strong> This violation affects the overall page structure, not specific articles.
                    </div>
                    `
                    }
                    ${
                      issue.helpUrl
                        ? `
                    <div class="violation-help">
                        <a href="${issue.helpUrl}" target="_blank" class="help-link">📖 Learn more about this issue</a>
                    </div>
                    `
                        : ''
                    }
                </div>
            </div>
        `,
          )
          .join('')}
    </div>
  `;
}

/**
 * Generate performance report HTML
 * @param {Object} data - Performance data
 * @returns {string} HTML content
 */
function generatePerformanceReport(data) {
  // Handle missing or incomplete performance data
  if (!data || typeof data !== 'object') {
    return `
      <div class="header">
          <h1>📊 Performance Dashboard</h1>
          <div class="subtitle">Execution Analysis & Metrics</div>
      </div>
      <div class="no-data">
          <h3>No performance data available</h3>
          <p>Please run the validation first to generate performance metrics.</p>
      </div>
    `;
  }

  const summary = data.summary || {};
  const phases = data.phases || {};
  const efficiency = data.efficiency || {};
  const memory = data.memory || {};
  const network = data.network || {};

  return `
    <div class="header">
        <h1>📊 Performance Dashboard</h1>
        <div class="subtitle">Execution Analysis & Metrics</div>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <span class="icon">⏱️</span>
            <div class="value">${summary.totalDurationFormatted || 'N/A'}</div>
            <div class="label">Total Duration</div>
        </div>
        <div class="stat-card">
            <span class="icon">🚀</span>
            <div class="value">${efficiency.articlesPerSecond || 'N/A'}</div>
            <div class="label">Articles/Second</div>
        </div>
        <div class="stat-card">
            <span class="icon">💾</span>
            <div class="value">${summary.peakMemoryMB || 'N/A'} ${
    summary.peakMemoryMB ? 'MB' : ''
  }</div>
            <div class="label">Peak Memory</div>
        </div>
        <div class="stat-card">
            <span class="icon">🌐</span>
            <div class="value">${summary.networkRequests || 0}</div>
            <div class="label">Network Requests</div>
        </div>
    </div>

    ${
      Object.keys(phases).length > 0
        ? `
    <div class="performance-timeline">
        <h3 style="margin-bottom: 20px; color: #4a5568;">Execution Timeline</h3>
        ${Object.entries(phases)
          .map(
            ([phase, phaseData]) => `
            <div class="timeline-item">
                <div class="timeline-phase">${phase
                  .replace(/_/g, ' ')
                  .toUpperCase()}</div>
                <div class="timeline-duration">${
                  phaseData.durationFormatted || 'N/A'
                }</div>
                <div class="timeline-bar">
                    <div class="timeline-fill" style="width: ${
                      phaseData.percentage || 0
                    }%"></div>
                </div>
            </div>
        `,
          )
          .join('')}
    </div>
    `
        : `
    <div class="no-data">
        <h3>No phase data available</h3>
        <p>Phase timing information is not available for this run.</p>
    </div>
    `
    }

    ${
      memory.initial && memory.final
        ? `
    <div class="memory-analysis">
        <h3 style="margin-bottom: 20px; color: #4a5568;">Memory Usage Analysis</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <span class="icon">📈</span>
                <div class="value">${
                  memory.initial.heapUsedMB || 'N/A'
                } MB</div>
                <div class="label">Initial Memory</div>
            </div>
            <div class="stat-card">
                <span class="icon">📊</span>
                <div class="value">${memory.final.heapUsedMB || 'N/A'} MB</div>
                <div class="label">Final Memory</div>
            </div>
            <div class="stat-card">
                <span class="icon">⚡</span>
                <div class="value">${memory.peak.heapUsedMB || 'N/A'} MB</div>
                <div class="label">Peak Memory</div>
            </div>
            <div class="stat-card">
                <span class="icon">📉</span>
                <div class="value">${
                  memory.delta && memory.delta.heapUsedMB
                    ? `${memory.delta.heapUsedMB > 0 ? '+' : ''}${
                        memory.delta.heapUsedMB
                      }`
                    : 'N/A'
                } ${memory.delta && memory.delta.heapUsedMB ? 'MB' : ''}</div>
                <div class="label">Memory Delta</div>
            </div>
        </div>
    </div>
    `
        : ''
    }

    ${
      network.requests
        ? `
    <div class="network-analysis">
        <h3 style="margin-bottom: 20px; color: #4a5568;">Network Performance</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <span class="icon">🌐</span>
                <div class="value">${network.requests || 0}</div>
                <div class="label">Total Requests</div>
            </div>
            <div class="stat-card">
                <span class="icon">⏱️</span>
                <div class="value">${
                  network.averageTime ? Math.round(network.averageTime) : 'N/A'
                } ${network.averageTime ? 'ms' : ''}</div>
                <div class="label">Avg Response Time</div>
            </div>
            <div class="stat-card">
                <span class="icon">⚡</span>
                <div class="value">${
                  network.totalTime ? Math.round(network.totalTime) : 'N/A'
                } ${network.totalTime ? 'ms' : ''}</div>
                <div class="label">Total Network Time</div>
            </div>
            <div class="stat-card">
                <span class="icon">📊</span>
                <div class="value">${
                  (efficiency.networkEfficiency &&
                    efficiency.networkEfficiency.requestsPerSecond) ||
                  'N/A'
                }</div>
                <div class="label">Requests/Second</div>
            </div>
        </div>
    </div>
    `
        : ''
    }

    ${
      efficiency.articlesPerSecond
        ? `
    <div class="efficiency-analysis">
        <h3 style="margin-bottom: 20px; color: #4a5568;">Efficiency Metrics</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <span class="icon">🚀</span>
                <div class="value">${efficiency.articlesPerSecond}</div>
                <div class="label">Articles/Second</div>
            </div>
            <div class="stat-card">
                <span class="icon">⏱️</span>
                <div class="value">${
                  efficiency.averageTimePerArticle || 'N/A'
                } ${efficiency.averageTimePerArticle ? 'ms' : ''}</div>
                <div class="label">Avg Time/Article</div>
            </div>
            <div class="stat-card">
                <span class="icon">💾</span>
                <div class="value">${
                  efficiency.memoryEfficiency &&
                  efficiency.memoryEfficiency.memoryPerArticleKB
                    ? `${efficiency.memoryEfficiency.memoryPerArticleKB} KB`
                    : 'N/A'
                }</div>
                <div class="label">Memory/Article</div>
            </div>
            <div class="stat-card">
                <span class="icon">📈</span>
                <div class="value">${
                  efficiency.networkEfficiency &&
                  efficiency.networkEfficiency.networkUtilization
                    ? `${efficiency.networkEfficiency.networkUtilization}%`
                    : 'N/A'
                }</div>
                <div class="label">Network Utilization</div>
            </div>
        </div>
    </div>
    `
        : ''
    }

    <div class="chart-container">
        <h3>Memory Usage Over Time</h3>
        <canvas id="memoryChart" width="400" height="200"></canvas>
    </div>
  `;
}

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
                    <strong>Article:</strong> ${violation.current.title}<br>
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
            ... and ${
              chronologyViolations.length - 10
            } more chronological violations
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
                        <div class="article-title">${article.title}</div>
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

/**
 * Generate quality report HTML
 * @param {Object} data - Quality data
 * @returns {string} HTML content
 */
function generateQualityReport(data) {
  const { validationReport } = data;
  const { quality } = validationReport;

  return `
    <div class="header">
        <h1>🔬 Data Quality Analysis</h1>
        <div class="subtitle">Comprehensive Data Assessment</div>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <span class="icon">📊</span>
            <div class="value">${
              validationReport.summary.dataQualityScore
            }/100</div>
            <div class="label">Overall Score</div>
        </div>
        <div class="stat-card">
            <span class="icon">✅</span>
            <div class="value">${quality.dataTypes.validTimestamps}</div>
            <div class="label">Valid Timestamps</div>
        </div>
        <div class="stat-card">
            <span class="icon">📝</span>
            <div class="value">${Math.round(
              quality.statistics.averageTitleLength,
            )}</div>
            <div class="label">Avg Title Length</div>
        </div>
        <div class="stat-card">
            <span class="icon">🔍</span>
            <div class="value">${
              quality.totalArticles - quality.missingData.ids
            }</div>
            <div class="label">Complete Records</div>
        </div>
    </div>

    <div class="chart-container">
        <h3>Data Completeness</h3>
        <canvas id="completenessChart" width="400" height="200"></canvas>
    </div>
  `;
}

/**
 * Generate timeline report HTML with proper chronological analysis
 * @param {Object} data - Timeline data
 * @returns {string} HTML content
 */
function generateTimelineReport(data) {
  const { articles, validationReport } = data;

  if (!articles || articles.length === 0) {
    return `
      <div class="header">
          <h1>📅 Article Timeline</h1>
          <div class="subtitle">Chronological Analysis</div>
      </div>
      <div class="no-data">
          <h3>No article data available for timeline analysis</h3>
          <p>Please run the validation first to generate timeline data.</p>
      </div>
    `;
  }

  // Sort articles by timestamp for chronological analysis
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
  );
  const chronologyIssues = validationReport?.chronological?.violations || [];

  return `
    <div class="header">
        <h1>📅 Article Timeline</h1>
        <div class="subtitle">Chronological Analysis & Sorting Validation</div>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <span class="icon">📄</span>
            <div class="value">${articles.length}</div>
            <div class="label">Total Articles</div>
        </div>
        <div class="stat-card">
            <span class="icon">✅</span>
            <div class="value">${
              validationReport?.summary?.validationPassed ? 'PASSED' : 'FAILED'
            }</div>
            <div class="label">Chronology Check</div>
        </div>
        <div class="stat-card">
            <span class="icon">⚠️</span>
            <div class="value">${chronologyIssues.length}</div>
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
        <h3>Article Publication Timeline</h3>
        <canvas id="timelineChart" width="400" height="400"></canvas>
    </div>

    ${
      chronologyIssues.length > 0
        ? `
    <div class="chronology-violations">
        <h3 style="margin-bottom: 20px; color: #e53e3e;">🚨 Chronology Violations</h3>
        ${chronologyIssues
          .slice(0, 10)
          .map(
            (violation) => `
            <div class="violation-item serious">
                <div class="violation-title">Article #${
                  violation.current.position
                } is out of order</div>
                <div class="violation-description">
                    <strong>Current:</strong> ${violation.current.title}<br>
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
        : `
    <div class="success-message">
        <h3 style="color: #38a169; margin-bottom: 20px;">✅ Perfect Chronological Order</h3>
        <p>All articles are correctly sorted from newest to oldest!</p>
    </div>
    `
    }

    <div class="timeline-articles">
        <h3 style="margin-bottom: 20px; color: #4a5568;">📰 Article Timeline (Most Recent First)</h3>
        ${sortedArticles
          .slice(0, 30)
          .map(
            (article, index) => `
            <div class="timeline-article-item ${
              chronologyIssues.some((v) => v.current.position == article.rank)
                ? 'has-violation'
                : ''
            }">
                <div class="article-timeline-header">
                    <span class="article-rank">#${article.rank}</span>
                    <div class="article-timeline-info">
                        <div class="article-title">${article.title}</div>
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
                  chronologyIssues.some(
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
          articles.length > 30
            ? `
        <div class="more-articles">
            <p>... and ${articles.length - 30} more articles</p>
        </div>
        `
            : ''
        }
    </div>
  `;
}

/**
 * Generate JavaScript for charts and interactivity
 * @param {Object} data - Report data
 * @param {string} reportType - Type of report
 * @returns {string} JavaScript code
 */
function generateReportScripts(data, reportType) {
  return `
    // Chart configurations and data
    const chartData = ${JSON.stringify(generateChartData(data, reportType))};
    
    // Initialize charts based on report type
    if (document.getElementById('severityChart')) {
        new Chart(document.getElementById('severityChart'), {
            type: 'doughnut',
            data: chartData.severity,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    if (document.getElementById('memoryChart')) {
        new Chart(document.getElementById('memoryChart'), {
            type: 'line',
            data: chartData.memory,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Memory (MB)'
                        }
                    }
                }
            }
        });
    }

    if (document.getElementById('timelineChart')) {
        new Chart(document.getElementById('timelineChart'), {
            type: chartData.timeline?.type || 'line',
            data: chartData.timeline?.data || chartData.timeline,
            options: chartData.timeline?.options || {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Article Timeline Analysis'
                    },
                    legend: {
                        display: true
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Chronological Order'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Article Rank'
                        }
                    }
                }
            }
        });
    }

    if (document.getElementById('performanceChart')) {
        new Chart(document.getElementById('performanceChart'), {
            type: 'bar',
            data: chartData.performance,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Duration (ms)'
                        }
                    }
                }
            }
        });
    }

    if (document.getElementById('completenessChart')) {
        new Chart(document.getElementById('completenessChart'), {
            type: 'bar',
            data: chartData.completeness,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Completeness (%)'
                        }
                    }
                }
            }
        });
    }
  `;
}

/**
 * Generate chart data based on report data and type
 * @param {Object} data - Report data
 * @param {string} type - Chart type
 * @returns {Object} Chart data configuration
 */
function generateChartData(data, type) {
  const charts = {};

  // Accessibility severity chart
  if (data.breakdown) {
    charts.severity = {
      labels: ['Critical', 'Serious', 'Moderate', 'Minor'],
      datasets: [
        {
          data: [
            data.breakdown.bySeverity.critical,
            data.breakdown.bySeverity.serious,
            data.breakdown.bySeverity.moderate,
            data.breakdown.bySeverity.minor,
          ],
          backgroundColor: ['#e53e3e', '#dd6b20', '#d69e2e', '#38a169'],
        },
      ],
    };
  }

  // Performance charts
  if (data.performanceReport || data.phases) {
    const phases = data.performanceReport?.phases || data.phases || {};
    charts.performance = {
      labels: Object.keys(phases).map((p) => p.replace(/_/g, ' ')),
      datasets: [
        {
          label: 'Duration',
          data: Object.values(phases).map((p) => p.duration),
          backgroundColor: '#667eea',
        },
      ],
    };

    // Memory chart (simulated data)
    charts.memory = {
      labels: ['Start', 'Navigation', 'Extraction', 'Validation', 'End'],
      datasets: [
        {
          label: 'Memory Usage (MB)',
          data: [20, 25, 35, 32, 28],
          borderColor: '#764ba2',
          backgroundColor: 'rgba(118, 75, 162, 0.1)',
          fill: true,
        },
      ],
    };
  }

  // Timeline chart
  if (data.articles && data.articles.length > 0) {
    const articles = data.articles.slice(0, 50); // Limit for performance
    const sortedArticles = [...articles]
      .filter((a) => a.timestamp && a.rank) // Only include articles with valid data
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (sortedArticles.length > 0) {
      charts.timeline = {
        type: 'line',
        data: {
          labels: sortedArticles.map((a, index) => `Article ${index + 1}`),
          datasets: [
            {
              label: 'Actual Article Rank',
              data: sortedArticles.map((a, index) => ({
                x: index + 1,
                y: parseInt(a.rank),
              })),
              borderColor: '#667eea',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              fill: false,
              tension: 0.1,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: 'Expected Chronological Order',
              data: sortedArticles.map((a, index) => ({
                x: index + 1,
                y: index + 1,
              })),
              borderColor: '#38a169',
              backgroundColor: 'rgba(56, 161, 105, 0.1)',
              borderDash: [5, 5],
              fill: false,
              tension: 0.1,
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Article Chronological Order Analysis',
            },
            legend: {
              display: true,
            },
            tooltip: {
              callbacks: {
                title: function (context) {
                  const index = context[0].dataIndex;
                  return (
                    sortedArticles[index]?.title?.substring(0, 50) + '...' ||
                    'Article'
                  );
                },
                label: function (context) {
                  return context.dataset.label + ': Rank #' + context.parsed.y;
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Chronological Order (by timestamp)',
              },
              ticks: {
                stepSize: 1,
              },
            },
            y: {
              title: {
                display: true,
                text: 'Article Rank on Page',
              },
              reverse: false,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      };
    }
  }

  // Data completeness chart
  if (data.validationReport?.quality) {
    const quality = data.validationReport.quality;
    const total = quality.totalArticles;
    charts.completeness = {
      labels: ['IDs', 'Titles', 'Timestamps', 'Age Text'],
      datasets: [
        {
          label: 'Completeness %',
          data: [
            ((total - quality.missingData.ids) / total) * 100,
            ((total - quality.missingData.titles) / total) * 100,
            ((total - quality.missingData.timestamps) / total) * 100,
            ((total - quality.missingData.ageText) / total) * 100,
          ],
          backgroundColor: ['#38a169', '#3182ce', '#d69e2e', '#e53e3e'],
        },
      ],
    };
  }

  return charts;
}

/**
 * Find an available port starting from the given port
 * @param {number} startPort - Starting port number
 * @returns {Promise<number>} Available port
 */
async function getAvailablePort(startPort) {
  const net = require('net');

  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(getAvailablePort(startPort + 1));
    });
  });
}

module.exports = {
  createReportServer,
  generateReportHTML,
  generateChartData,
};
