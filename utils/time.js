// utils/time.js
// Utility for parsing and normalizing Hacker News timestamps

const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

/**
 * Parses a Hacker News relative timestamp (e.g., '3 minutes ago') to a UTC Date object.
 * @param {string} hnTime - The relative time string from HN (e.g., '3 minutes ago')
 * @returns {Date} UTC Date object
 */
function parseHackerNewsTime(hnTime) {
  if (!hnTime || typeof hnTime !== 'string') {
    throw new Error('Invalid time string');
  }

  // Clean up the input
  const clean = hnTime
    .replace(/\s*ago$/, '')
    .trim()
    .toLowerCase();

  // Handle edge cases
  if (clean === 'now' || clean === 'just now') {
    return new Date();
  }

  // Parse different formats
  const timeRegex = /^(\d+)\s*(second|minute|hour|day|week|month|year)s?$/;
  const match = clean.match(timeRegex);

  if (!match) {
    throw new Error(`Unable to parse time format: "${hnTime}"`);
  }

  const [, amount, unit] = match;
  const now = dayjs();

  // Map units to dayjs units
  const unitMap = {
    second: 'second',
    minute: 'minute',
    hour: 'hour',
    day: 'day',
    week: 'week',
    month: 'month',
    year: 'year',
  };

  const dayUnit = unitMap[unit];
  if (!dayUnit) {
    throw new Error(`Unknown time unit: "${unit}"`);
  }

  return now.subtract(parseInt(amount), dayUnit).toDate();
}

/**
 * Format a timestamp for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatTimestamp(date) {
  if (!date) return 'N/A';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss UTC');
}

/**
 * Get relative time from now
 * @param {Date} date - Date to get relative time for
 * @returns {string} Relative time string
 */
function getRelativeTime(date) {
  if (!date) return 'N/A';
  return dayjs(date).fromNow();
}

module.exports = {
  parseHackerNewsTime,
  formatTimestamp,
  getRelativeTime,
};
