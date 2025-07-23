/**
 * Main Report Server
 * Handles HTTP server setup and routing for interactive reports
 */

const express = require('express');
const path = require('path');
const open = require('open');
const logger = require('../../logger');
const { generateReportHTML } = require('./templates/htmlTemplate');

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
    try {
      const html = generateReportHTML(data, reportType);
      res.send(html);
    } catch (error) {
      logger.error('Error generating report:', error.message);
      res.status(500).send(`
        <h1>Report Generation Error</h1>
        <p>Sorry, there was an error generating the report: ${error.message}</p>
        <p>Please check the console for more details.</p>
      `);
    }
  });

  // API endpoints for dynamic data
  app.get('/api/data', (req, res) => {
    res.json(data);
  });

  app.get('/api/chart/:type', (req, res) => {
    try {
      const { generateChartData } = require('./charts/chartGenerator');
      const chartData = generateChartData(data, req.params.type);
      res.json(chartData);
    } catch (error) {
      logger.error('Error generating chart data:', error.message);
      res.status(500).json({ error: 'Chart generation failed' });
    }
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
  process.on('SIGTERM', () => {
    logger.info('Shutting down report server...');
    server.close(() => {
      logger.info('Report server closed.');
      process.exit(0);
    });
  });

  return server;
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
  getAvailablePort,
};
