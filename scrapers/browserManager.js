/**
 * Browser Manager Module
 * Handles browser setup, launch, and cleanup operations
 */

const { chromium } = require('playwright');
const config = require('../config');
const logger = require('../logger');

/**
 * Browser manager class for handling Playwright browser operations
 */
class BrowserManager {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  /**
   * Launch browser with specified configuration
   * @param {Object} options - Browser launch options
   * @returns {Promise<void>}
   */
  async launch(options = {}) {
    const {
      headless = true,
      userAgent = config.USER_AGENT,
      viewport = config.VIEWPORT,
      timeout = config.TIMEOUT,
    } = options;

    try {
      // Launch browser
      this.browser = await chromium.launch({ headless });

      // Create context with custom settings
      this.context = await this.browser.newContext({
        userAgent,
        viewport,
      });

      // Create new page
      this.page = await this.context.newPage();

      // Set default timeout
      this.page.setDefaultTimeout(timeout);

      logger.debug('Browser launched successfully');
    } catch (error) {
      logger.error('Failed to launch browser:', error.message);
      throw error;
    }
  }

  /**
   * Navigate to Hacker News and wait for page load
   * @param {number} timeout - Navigation timeout
   * @returns {Promise<number>} Load time in milliseconds
   */
  async navigateToHackerNews(timeout = config.TIMEOUT) {
    const startTime = Date.now();

    try {
      await this.page.goto(config.HN_URL, { timeout });
      await this.page.waitForSelector(config.SELECTORS.ARTICLE_ROW, {
        timeout,
      });

      const loadTime = Date.now() - startTime;
      logger.debug(`Navigation completed in ${loadTime}ms`);

      return loadTime;
    } catch (error) {
      logger.error('Failed to navigate to Hacker News:', error.message);
      throw error;
    }
  }

  /**
   * Get the current page instance
   * @returns {Object} Playwright page object
   */
  getPage() {
    if (!this.page) {
      throw new Error('Browser not initialized. Call launch() first.');
    }
    return this.page;
  }

  /**
   * Close browser and cleanup resources
   */
  async close() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.context = null;
        this.page = null;
        logger.debug('Browser closed successfully');
      }
    } catch (error) {
      logger.warn('Error closing browser:', error.message);
    }
  }

  /**
   * Check if browser is currently active
   * @returns {boolean} True if browser is active
   */
  isActive() {
    return this.browser !== null && !this.browser.isClosed();
  }
}

module.exports = {
  BrowserManager,
};
