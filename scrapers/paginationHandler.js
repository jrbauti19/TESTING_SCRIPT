/**
 * Pagination Handler Module
 * Manages pagination and "More" button navigation on Hacker News
 */

const config = require('../config');
const logger = require('../logger');
const { retry } = require('../utils/retry');

/**
 * Click the "More" button and wait for new articles to load
 * @param {Object} page - Playwright page object
 * @param {Array} existingArticles - Currently extracted articles
 * @param {number} pageNumber - Current page number
 * @param {boolean} debug - Debug mode flag
 * @returns {Promise<boolean>} True if new articles were loaded successfully
 */
async function clickMoreAndWaitForArticles(
  page,
  existingArticles,
  pageNumber,
  debug = false,
) {
  try {
    // Find the More link fresh each time to avoid stale element references
    const moreLink = await page.$(config.SELECTORS.MORE_LINK);
    if (!moreLink) {
      throw new Error('More link not found');
    }

    if (debug) {
      logger.info(`Before click: Current articles=${existingArticles.length}`);
    }

    // Click the More link
    await moreLink.click();

    // Wait for navigation to complete and new articles to load
    const newArticlesFound = await waitForNewArticles(
      page,
      existingArticles,
      debug,
    );

    if (!newArticlesFound) {
      throw new Error('No new articles found after clicking More');
    }

    if (debug) {
      logger.info(`Successfully loaded page ${pageNumber + 1}`);
    }

    return true;
  } catch (error) {
    logger.error(`Failed to load more articles: ${error.message}`);
    throw error;
  }
}

/**
 * Wait for new articles to load after clicking "More"
 * @param {Object} page - Playwright page object
 * @param {Array} existingArticles - Currently extracted articles
 * @param {boolean} debug - Debug mode flag
 * @returns {Promise<boolean>} True if new articles were detected
 */
async function waitForNewArticles(page, existingArticles, debug = false) {
  let attempts = 0;
  const maxAttempts = 10;
  let newArticlesFound = false;

  while (attempts < maxAttempts && !newArticlesFound) {
    await page.waitForTimeout(1000);
    attempts++;

    try {
      // Wait for article rows to be present
      await page.waitForSelector(config.SELECTORS.ARTICLE_ROW, {
        timeout: 2000,
      });

      // Get all article rows
      const newRows = await page.$$(config.SELECTORS.ARTICLE_ROW);

      // Check if we have new articles by looking at the first article's ID
      if (newRows.length > 0) {
        const firstNewRow = newRows[0];
        const firstNewId = await firstNewRow.getAttribute('id');

        // If this is a new article we haven't seen, we're good
        if (!existingArticles.some((article) => article.id === firstNewId)) {
          newArticlesFound = true;
          if (debug) {
            logger.info(`Found new articles starting with ID: ${firstNewId}`);
          }
        }
      }

      if (debug && attempts % 3 === 0) {
        logger.info(`Attempt ${attempts}: Checking for new articles...`);
      }
    } catch (e) {
      if (debug) {
        logger.warn(`Attempt ${attempts}: Error checking articles`);
      }
    }
  }

  return newArticlesFound;
}

/**
 * Check if more articles are available
 * @param {Object} page - Playwright page object
 * @returns {Promise<boolean>} True if "More" link is present
 */
async function hasMoreArticles(page) {
  try {
    const moreLink = await page.$(config.SELECTORS.MORE_LINK);
    return moreLink !== null;
  } catch (error) {
    logger.debug('Error checking for more articles:', error.message);
    return false;
  }
}

/**
 * Get current page information
 * @param {Object} page - Playwright page object
 * @returns {Promise<Object>} Page information including URL and title
 */
async function getPageInfo(page) {
  try {
    const url = page.url();
    const title = await page.title();

    return {
      url,
      title,
      timestamp: new Date(),
    };
  } catch (error) {
    logger.warn('Failed to get page info:', error.message);
    return {
      url: 'unknown',
      title: 'unknown',
      timestamp: new Date(),
    };
  }
}

/**
 * Wait for page to be fully loaded
 * @param {Object} page - Playwright page object
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<void>}
 */
async function waitForPageLoad(page, timeout = 5000) {
  try {
    await page.waitForLoadState('networkidle', { timeout });
    await page.waitForSelector(config.SELECTORS.ARTICLE_ROW, { timeout });
  } catch (error) {
    logger.warn('Page load timeout, continuing anyway:', error.message);
  }
}

module.exports = {
  clickMoreAndWaitForArticles,
  waitForNewArticles,
  hasMoreArticles,
  getPageInfo,
  waitForPageLoad,
};
