/**
 * Article Extractor Module
 * Handles extraction and parsing of individual articles from Hacker News DOM
 */

const config = require('../config');
const logger = require('../logger');
const { parseHackerNewsTime } = require('../utils/time');

/**
 * Extract article data from a single DOM row
 * @param {Object} row - Playwright element handle for article row
 * @param {number} position - Position in the extraction sequence
 * @param {number} pageNumber - Current page number
 * @param {boolean} debug - Debug mode flag
 * @returns {Promise<Object>} Extracted article data
 */
async function extractArticleData(row, position, pageNumber, debug = false) {
  try {
    // Get article ID
    const id = await row.getAttribute('id');
    if (!id) {
      throw new Error('Article ID not found');
    }

    // Extract title
    const titleEl = await row.$(config.SELECTORS.TITLE);
    const title = titleEl ? await titleEl.innerText() : '';
    if (!title) {
      throw new Error('Article title not found');
    }

    // Extract rank number
    const rankEl = await row.$('td.title .rank');
    const rank = rankEl ? await rankEl.innerText() : '';

    // Get subtext row (contains age, score, author)
    const subtextRow = await row.evaluateHandle((r) => r.nextElementSibling);

    // Extract age/timestamp
    const ageEl = await subtextRow.$(config.SELECTORS.AGE);
    const ageText = ageEl ? await ageEl.innerText() : '';

    let timestamp = null;
    try {
      timestamp = parseHackerNewsTime(ageText);
    } catch (e) {
      if (debug) {
        logger.warn(`Failed to parse timestamp for article ${id}:`, ageText);
      }
    }

    // Extract score
    const scoreEl = await subtextRow.$('.score');
    const score = scoreEl ? await scoreEl.innerText() : '0 points';

    // Extract author
    const authorEl = await subtextRow.$('.hnuser');
    const author = authorEl ? await authorEl.innerText() : 'unknown';

    // Build article object
    const article = {
      position,
      id,
      title,
      rank: rank.replace('.', ''),
      ageText,
      timestamp,
      score,
      author,
      pageNumber,
      extractedAt: new Date(),
    };

    if (debug) {
      logger.debug(`Extracted article: ${article.title} (ID: ${article.id})`);
    }

    return article;
  } catch (error) {
    logger.error(`Failed to extract article data: ${error.message}`);
    throw error;
  }
}

/**
 * Extract all articles from the current page
 * @param {Object} page - Playwright page object
 * @param {Array} existingArticles - Already extracted articles (for duplicate checking)
 * @param {number} targetCount - Target number of articles to extract
 * @param {number} pageNumber - Current page number
 * @param {boolean} debug - Debug mode flag
 * @returns {Promise<Array>} Array of extracted articles
 */
async function extractArticlesFromPage(
  page,
  existingArticles,
  targetCount,
  pageNumber,
  debug = false,
) {
  const articles = [];

  try {
    // Get all article rows from current page
    const rows = await page.$$(config.SELECTORS.ARTICLE_ROW);

    if (debug) {
      logger.info(`Page ${pageNumber}: Found ${rows.length} article rows`);
    }

    // Extract articles from each row
    for (let i = 0; i < rows.length && articles.length < targetCount; i++) {
      const row = rows[i];
      const id = await row.getAttribute('id');

      // Skip if we already have this article (avoid duplicates)
      if (existingArticles.some((article) => article.id === id)) {
        if (debug) {
          logger.debug(`Skipping duplicate article: ${id}`);
        }
        continue;
      }

      try {
        const article = await extractArticleData(
          row,
          existingArticles.length + articles.length + 1,
          pageNumber,
          debug,
        );
        articles.push(article);
      } catch (error) {
        if (debug) {
          logger.warn(`Failed to extract article ${id}:`, error.message);
        }
        // Continue with next article
      }
    }

    if (debug) {
      logger.info(
        `Extracted ${articles.length} new articles from page ${pageNumber}`,
      );
    }

    return articles;
  } catch (error) {
    logger.error(
      `Failed to extract articles from page ${pageNumber}:`,
      error.message,
    );
    throw error;
  }
}

/**
 * Check if an article is a duplicate
 * @param {Object} article - Article object to check
 * @param {Array} existingArticles - Array of existing articles
 * @returns {boolean} True if article is a duplicate
 */
function isDuplicateArticle(article, existingArticles) {
  return existingArticles.some((existing) => existing.id === article.id);
}

/**
 * Validate extracted article data
 * @param {Object} article - Article object to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateArticleData(article) {
  const errors = [];

  if (!article.id) {
    errors.push('Missing article ID');
  }

  if (!article.title || article.title.trim() === '') {
    errors.push('Missing or empty title');
  }

  if (!article.rank) {
    errors.push('Missing rank');
  }

  if (!article.timestamp) {
    errors.push('Invalid timestamp');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  extractArticleData,
  extractArticlesFromPage,
  isDuplicateArticle,
  validateArticleData,
};
