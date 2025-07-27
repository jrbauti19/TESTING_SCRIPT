/**
 * Report Content Generator
 * Routes to specific report generators based on report type
 */

const { generateCompleteReport } = require('./completeReport');
const { generateAccessibilityReport } = require('./accessibilityReport');
const { generatePerformanceReport } = require('./performanceReport');
const { generateQualityReport } = require('./qualityReport');

/**
 * Generate report content based on type
 * @param {Object} data - Report data
 * @param {string} reportType - Type of report
 * @returns {string} HTML content
 */
function generateReportContent(data, reportType) {
  try {
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
      default:
        return generateCompleteReport(data);
    }
  } catch (error) {
    return `
      <div class="header">
          <h1>⚠️ Report Generation Error</h1>
          <div class="subtitle">Unable to generate ${reportType} report</div>
      </div>
      <div class="no-data">
          <h3>Error: ${error.message}</h3>
          <p>Please check the console for more details and try again.</p>
          <p>Report Type: ${reportType}</p>
          <p>Available Data: ${Object.keys(data || {}).join(', ')}</p>
      </div>
    `;
  }
}

module.exports = {
  generateReportContent,
};
