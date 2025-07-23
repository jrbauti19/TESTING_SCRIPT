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
    <title>HN Validator Report - ${
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
      return generatePerformanceReport(data);
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
  const { executive, breakdown, topIssues } = data;
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

    <div class="chart-container">
        <h3>Issues by Severity</h3>
        <canvas id="severityChart" width="400" height="200"></canvas>
    </div>

    <div class="violations-list">
        <h3 style="margin-bottom: 20px; color: #4a5568;">Top Accessibility Issues</h3>
        ${topIssues
          .slice(0, 10)
          .map(
            (issue) => `
            <div class="violation-item ${issue.impact}">
                <div class="violation-title">${issue.help}</div>
                <div class="violation-description">${issue.description}</div>
                <div class="violation-elements">${issue.nodeCount} affected elements</div>
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
  const { summary, phases, efficiency } = data;

  return `
    <div class="header">
        <h1>📊 Performance Dashboard</h1>
        <div class="subtitle">Execution Analysis & Metrics</div>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <span class="icon">⏱️</span>
            <div class="value">${summary.totalDurationFormatted}</div>
            <div class="label">Total Duration</div>
        </div>
        <div class="stat-card">
            <span class="icon">🚀</span>
            <div class="value">${efficiency.articlesPerSecond}</div>
            <div class="label">Articles/Second</div>
        </div>
        <div class="stat-card">
            <span class="icon">💾</span>
            <div class="value">${summary.peakMemoryMB} MB</div>
            <div class="label">Peak Memory</div>
        </div>
        <div class="stat-card">
            <span class="icon">🌐</span>
            <div class="value">${summary.networkRequests}</div>
            <div class="label">Network Requests</div>
        </div>
    </div>

    <div class="performance-timeline">
        <h3 style="margin-bottom: 20px; color: #4a5568;">Execution Timeline</h3>
        ${Object.entries(phases)
          .map(
            ([phase, data]) => `
            <div class="timeline-item">
                <div class="timeline-phase">${phase
                  .replace(/_/g, ' ')
                  .toUpperCase()}</div>
                <div class="timeline-duration">${data.durationFormatted}</div>
                <div class="timeline-bar">
                    <div class="timeline-fill" style="width: ${
                      data.percentage
                    }%"></div>
                </div>
            </div>
        `,
          )
          .join('')}
    </div>

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
  const { articles, validationReport, performanceReport } = data;
  const success = validationReport.summary.validationPassed;

  return `
    <div class="header">
        <h1>🐺 HN Validator Report</h1>
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
            <div class="value">${articles.length}</div>
            <div class="label">Articles Validated</div>
        </div>
        <div class="stat-card">
            <span class="icon">🎯</span>
            <div class="value">${
              validationReport.summary.dataQualityScore
            }/100</div>
            <div class="label">Quality Score</div>
        </div>
        <div class="stat-card">
            <span class="icon">⏱️</span>
            <div class="value">${
              performanceReport.summary.totalDurationFormatted
            }</div>
            <div class="label">Duration</div>
        </div>
        <div class="stat-card">
            <span class="icon">🔍</span>
            <div class="value">${
              validationReport.chronological.violations.length
            }</div>
            <div class="label">Violations</div>
        </div>
    </div>

    <div class="chart-container">
        <h3>Article Timeline</h3>
        <canvas id="timelineChart" width="400" height="200"></canvas>
    </div>

    <div class="chart-container">
        <h3>Performance Breakdown</h3>
        <canvas id="performanceChart" width="400" height="200"></canvas>
    </div>
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
 * Generate timeline report HTML
 * @param {Object} data - Timeline data
 * @returns {string} HTML content
 */
function generateTimelineReport(data) {
  const { articles } = data;

  return `
    <div class="header">
        <h1>📅 Article Timeline</h1>
        <div class="subtitle">Chronological Analysis</div>
    </div>

    <div class="chart-container">
        <h3>Article Publication Timeline</h3>
        <canvas id="timelineChart" width="400" height="400"></canvas>
    </div>

    <div class="violations-list">
        <h3 style="margin-bottom: 20px; color: #4a5568;">Recent Articles</h3>
        ${articles
          .slice(0, 20)
          .map(
            (article) => `
            <div class="violation-item minor">
                <div class="violation-title">${article.title}</div>
                <div class="violation-description">by ${article.author} • ${article.ageText}</div>
                <div class="violation-elements">Rank: ${article.rank} • Score: ${article.score}</div>
            </div>
        `,
          )
          .join('')}
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
            type: 'line',
            data: chartData.timeline,
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        title: {
                            display: true,
                            text: 'Time'
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
  if (data.articles) {
    const articles = data.articles.slice(0, 50); // Limit for performance
    charts.timeline = {
      labels: articles.map((a) => a.timestamp),
      datasets: [
        {
          label: 'Article Rank',
          data: articles.map((a) => ({ x: a.timestamp, y: parseInt(a.rank) })),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
        },
      ],
    };
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
