// utils/validation.js
// Advanced validation utilities for Hacker News article analysis

const { formatTimestamp, getRelativeTime } = require('./time');

/**
 * Validate chronological order of articles
 * @param {Array} articles - Array of article objects with timestamps
 * @returns {Object} Validation results with detailed analysis
 */
function validateChronologicalOrder(articles) {
  const violations = [];
  const gaps = [];
  let newest = null;
  let oldest = null;

  for (let i = 0; i < articles.length; i++) {
    const current = articles[i];

    if (!current.timestamp) continue;

    // Track newest and oldest
    if (!newest || current.timestamp > newest) newest = current.timestamp;
    if (!oldest || current.timestamp < oldest) oldest = current.timestamp;

    // Check chronological order
    if (i > 0) {
      const previous = articles[i - 1];
      if (previous.timestamp && current.timestamp > previous.timestamp) {
        violations.push({
          position: i + 1,
          previous: {
            position: i,
            id: previous.id,
            title: previous.title,
            timestamp: previous.timestamp,
            formatted: formatTimestamp(previous.timestamp),
          },
          current: {
            position: i + 1,
            id: current.id,
            title: current.title,
            timestamp: current.timestamp,
            formatted: formatTimestamp(current.timestamp),
          },
          timeDifference: current.timestamp - previous.timestamp,
        });
      }

      // Calculate time gaps
      if (previous.timestamp && current.timestamp) {
        const gap = Math.abs(previous.timestamp - current.timestamp);
        gaps.push({
          position: i,
          gap: gap,
          gapMinutes: Math.round(gap / (1000 * 60)),
        });
      }
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
    gaps,
    newest,
    oldest,
    totalTimeSpan: newest && oldest ? newest - oldest : 0,
    averageGap:
      gaps.length > 0
        ? gaps.reduce((sum, g) => sum + g.gap, 0) / gaps.length
        : 0,
  };
}

/**
 * Detect duplicate articles
 * @param {Array} articles - Array of article objects
 * @returns {Object} Duplicate analysis results
 */
function detectDuplicates(articles) {
  const seenIds = new Set();
  const seenTitles = new Map();
  const duplicates = {
    byId: [],
    byTitle: [],
    bySimilarTitle: [],
  };

  articles.forEach((article, index) => {
    // Check for duplicate IDs
    if (seenIds.has(article.id)) {
      duplicates.byId.push({
        position: index + 1,
        id: article.id,
        title: article.title,
      });
    } else {
      seenIds.add(article.id);
    }

    // Check for duplicate titles
    const normalizedTitle = article.title.toLowerCase().trim();
    if (seenTitles.has(normalizedTitle)) {
      duplicates.byTitle.push({
        position: index + 1,
        title: article.title,
        originalPosition: seenTitles.get(normalizedTitle),
      });
    } else {
      seenTitles.set(normalizedTitle, index + 1);
    }
  });

  return {
    hasDuplicates: duplicates.byId.length > 0 || duplicates.byTitle.length > 0,
    duplicates,
    uniqueArticles: seenIds.size,
    totalArticles: articles.length,
  };
}

/**
 * Analyze data quality and completeness
 * @param {Array} articles - Array of article objects
 * @returns {Object} Data quality analysis
 */
function analyzeDataQuality(articles) {
  const quality = {
    totalArticles: articles.length,
    missingData: {
      ids: 0,
      titles: 0,
      timestamps: 0,
      ageText: 0,
    },
    dataTypes: {
      validTimestamps: 0,
      invalidTimestamps: 0,
      emptyTitles: 0,
      longTitles: 0,
    },
    statistics: {
      averageTitleLength: 0,
      titleLengths: [],
      timestampRange: null,
    },
  };

  let totalTitleLength = 0;
  const titleLengths = [];
  const validTimestamps = [];

  articles.forEach((article) => {
    // Check for missing data
    if (!article.id) quality.missingData.ids++;
    if (!article.title) quality.missingData.titles++;
    if (!article.timestamp) quality.missingData.timestamps++;
    if (!article.ageText) quality.missingData.ageText++;

    // Analyze data types and quality
    if (article.timestamp instanceof Date && !isNaN(article.timestamp)) {
      quality.dataTypes.validTimestamps++;
      validTimestamps.push(article.timestamp);
    } else if (article.timestamp) {
      quality.dataTypes.invalidTimestamps++;
    }

    if (article.title) {
      const titleLength = article.title.length;
      totalTitleLength += titleLength;
      titleLengths.push(titleLength);

      if (titleLength === 0) quality.dataTypes.emptyTitles++;
      if (titleLength > 200) quality.dataTypes.longTitles++;
    }
  });

  // Calculate statistics
  quality.statistics.averageTitleLength =
    articles.length > 0 ? totalTitleLength / articles.length : 0;
  quality.statistics.titleLengths = titleLengths;

  if (validTimestamps.length > 0) {
    const minTime = Math.min(...validTimestamps.map((t) => t.getTime()));
    const maxTime = Math.max(...validTimestamps.map((t) => t.getTime()));
    quality.statistics.timestampRange = {
      earliest: new Date(minTime),
      latest: new Date(maxTime),
      span: maxTime - minTime,
    };
  }

  return quality;
}

/**
 * Generate comprehensive validation report
 * @param {Array} articles - Array of article objects
 * @returns {Object} Complete validation report
 */
function generateValidationReport(articles) {
  const chronological = validateChronologicalOrder(articles);
  const duplicates = detectDuplicates(articles);
  const quality = analyzeDataQuality(articles);

  return {
    summary: {
      totalArticles: articles.length,
      isChronologicallyValid: chronological.isValid,
      hasDuplicates: duplicates.hasDuplicates,
      validationPassed: chronological.isValid && !duplicates.hasDuplicates,
    },
    chronological,
    duplicates,
    quality,
    generatedAt: new Date(),
    recommendations: generateRecommendations(
      chronological,
      duplicates,
      quality,
    ),
  };
}

/**
 * Generate recommendations based on validation results
 * @param {Object} chronological - Chronological validation results
 * @param {Object} duplicates - Duplicate detection results
 * @param {Object} quality - Data quality analysis
 * @returns {Array} Array of recommendation strings
 */
function generateRecommendations(chronological, duplicates, quality) {
  const recommendations = [];

  if (!chronological.isValid) {
    recommendations.push(
      `Found ${chronological.violations.length} chronological violations - consider investigating data source`,
    );
  }

  if (duplicates.hasDuplicates) {
    recommendations.push(
      `Found ${duplicates.duplicates.byId.length} duplicate IDs - check data collection logic`,
    );
  }

  if (quality.missingData.timestamps > 0) {
    recommendations.push(
      `${quality.missingData.timestamps} articles missing timestamps - improve data extraction`,
    );
  }

  if (quality.dataTypes.invalidTimestamps > 0) {
    recommendations.push(
      `${quality.dataTypes.invalidTimestamps} invalid timestamps - review time parsing logic`,
    );
  }

  if (quality.statistics.averageTitleLength < 10) {
    recommendations.push(
      'Average title length is very short - verify title extraction',
    );
  }

  return recommendations;
}

module.exports = {
  validateChronologicalOrder,
  detectDuplicates,
  analyzeDataQuality,
  generateValidationReport,
  generateRecommendations,
};
