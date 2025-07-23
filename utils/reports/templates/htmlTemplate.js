/**
 * HTML Template Generator
 * Handles the generation of complete HTML documents with CSS and JavaScript
 */

const { generateReportContent } = require('../generators/reportGenerator');
const { generateReportStyles } = require('./cssStyles');
const { generateReportScripts } = require('./jsScripts');

/**
 * Generate complete HTML report
 * @param {Object} data - Report data
 * @param {string} reportType - Type of report
 * @returns {string} Complete HTML document
 */
function generateReportHTML(data, reportType) {
  const baseHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Joshua Bautista - QA Wolf Take Home - ${
      reportType.charAt(0).toUpperCase() + reportType.slice(1)
    }</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        ${generateReportStyles()}
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

module.exports = {
  generateReportHTML,
};
