// config.js
// Centralized configuration for the Hacker News sorting validation script

module.exports = {
  HN_URL: 'https://news.ycombinator.com/newest',
  ARTICLE_COUNT: 100,
  TIMEOUT: 15000, // ms
  SELECTORS: {
    ARTICLE_ROW: 'tr.athing',
    TITLE: '.titleline > a',
    SUBTEXT: 'td.subtext',
    AGE: 'span.age',
    MORE_LINK: 'a.morelink',
  },
  EXPORT_PATH: './hn_articles',
  USER_AGENT:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  VIEWPORT: { width: 1280, height: 800 },
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000, // ms
};
