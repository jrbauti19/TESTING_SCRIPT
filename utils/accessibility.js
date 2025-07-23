// utils/accessibility.js
// Comprehensive accessibility testing utilities

const { AxePuppeteer } = require('axe-puppeteer');
const logger = require('../logger');

/**
 * Perform comprehensive accessibility audit on a page
 * @param {Page} page - Playwright page object
 * @param {Object} options - Testing options
 * @returns {Promise<Object>} Accessibility audit results
 */
async function performAccessibilityAudit(page, options = {}) {
  const {
    includeRules = [],
    excludeRules = [],
    tags = ['wcag2a', 'wcag2aa', 'wcag21aa'],
    debug = false,
  } = options;

  try {
    if (debug) logger.info('Starting accessibility audit...');

    // Configure axe-puppeteer
    const axeBuilder = new AxePuppeteer(page);

    // Set tags (WCAG compliance levels)
    if (tags.length > 0) {
      axeBuilder.withTags(tags);
    }

    // Include/exclude specific rules
    if (includeRules.length > 0) {
      axeBuilder.include(includeRules);
    }
    if (excludeRules.length > 0) {
      axeBuilder.exclude(excludeRules);
    }

    // Run the audit
    const results = await axeBuilder.analyze();

    // Process and enhance results
    const processedResults = processAxeResults(results);

    if (debug) {
      logger.info(
        `Accessibility audit completed: ${processedResults.violations.length} violations found`,
      );
    }

    return processedResults;
  } catch (error) {
    logger.error('Accessibility audit failed:', error.message);
    return {
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: [],
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Process and enhance axe results with additional metadata
 * @param {Object} axeResults - Raw results from axe-core
 * @returns {Object} Enhanced results
 */
function processAxeResults(axeResults) {
  const processViolations = (violations) => {
    return violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      tags: violation.tags,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map((node) => ({
        html: node.html,
        impact: node.impact,
        target: node.target,
        failureSummary: node.failureSummary,
        element: node.element,
      })),
      nodeCount: violation.nodes.length,
      wcagLevel: getWCAGLevel(violation.tags),
      severity: getSeverityScore(violation.impact),
      category: categorizeViolation(violation.id, violation.tags),
    }));
  };

  const violations = processViolations(axeResults.violations);
  const passes = axeResults.passes.length;
  const incomplete = axeResults.incomplete.length;
  const inapplicable = axeResults.inapplicable.length;

  return {
    violations,
    passes,
    incomplete,
    inapplicable,
    summary: {
      violationCount: violations.length,
      nodeCount: violations.reduce((sum, v) => sum + v.nodeCount, 0),
      criticalCount: violations.filter((v) => v.impact === 'critical').length,
      seriousCount: violations.filter((v) => v.impact === 'serious').length,
      moderateCount: violations.filter((v) => v.impact === 'moderate').length,
      minorCount: violations.filter((v) => v.impact === 'minor').length,
      wcagAAFailures: violations.filter((v) => v.wcagLevel.includes('AA'))
        .length,
      wcagAAAFailures: violations.filter((v) => v.wcagLevel.includes('AAA'))
        .length,
    },
    categories: categorizeViolations(violations),
    score: calculateAccessibilityScore(violations, passes),
    timestamp: new Date().toISOString(),
    url: axeResults.url,
    testEngine: axeResults.testEngine,
    testRunner: axeResults.testRunner,
  };
}

/**
 * Get WCAG compliance level from tags
 * @param {Array} tags - Rule tags
 * @returns {Array} WCAG levels
 */
function getWCAGLevel(tags) {
  const wcagLevels = [];
  if (tags.includes('wcag2a')) wcagLevels.push('WCAG 2.0 A');
  if (tags.includes('wcag2aa')) wcagLevels.push('WCAG 2.0 AA');
  if (tags.includes('wcag2aaa')) wcagLevels.push('WCAG 2.0 AAA');
  if (tags.includes('wcag21a')) wcagLevels.push('WCAG 2.1 A');
  if (tags.includes('wcag21aa')) wcagLevels.push('WCAG 2.1 AA');
  if (tags.includes('wcag21aaa')) wcagLevels.push('WCAG 2.1 AAA');
  return wcagLevels;
}

/**
 * Get numeric severity score
 * @param {string} impact - Impact level
 * @returns {number} Severity score
 */
function getSeverityScore(impact) {
  const scores = { critical: 4, serious: 3, moderate: 2, minor: 1 };
  return scores[impact] || 0;
}

/**
 * Categorize violation by type
 * @param {string} id - Rule ID
 * @param {Array} tags - Rule tags
 * @returns {string} Category
 */
function categorizeViolation(id, tags) {
  if (tags.includes('keyboard')) return 'Keyboard Navigation';
  if (tags.includes('color')) return 'Color & Contrast';
  if (tags.includes('forms')) return 'Forms';
  if (tags.includes('images')) return 'Images & Media';
  if (tags.includes('headings')) return 'Headings & Structure';
  if (tags.includes('links')) return 'Links';
  if (tags.includes('tables')) return 'Tables';
  if (tags.includes('language')) return 'Language';
  if (tags.includes('aria')) return 'ARIA';
  return 'General';
}

/**
 * Categorize all violations by type
 * @param {Array} violations - All violations
 * @returns {Object} Categorized violations
 */
function categorizeViolations(violations) {
  const categories = {};
  violations.forEach((violation) => {
    const category = violation.category;
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(violation);
  });
  return categories;
}

/**
 * Calculate accessibility score (0-100)
 * @param {Array} violations - Violations array
 * @param {number} passes - Number of passed tests
 * @returns {number} Score from 0-100
 */
function calculateAccessibilityScore(violations, passes) {
  if (passes === 0 && violations.length === 0) return 0;

  const totalTests = passes + violations.length;
  const weightedViolations = violations.reduce((sum, v) => {
    return sum + v.severity * v.nodeCount;
  }, 0);

  const maxPossibleScore = totalTests * 4; // Max severity is 4
  const score = Math.max(
    0,
    100 - (weightedViolations / maxPossibleScore) * 100,
  );

  return Math.round(score);
}

/**
 * Generate detailed accessibility report
 * @param {Object} auditResults - Processed audit results
 * @returns {Object} Formatted report
 */
function generateAccessibilityReport(auditResults) {
  const { violations, summary, categories, score } = auditResults;

  return {
    executive: {
      score,
      grade: getAccessibilityGrade(score),
      totalViolations: summary.violationCount,
      affectedElements: summary.nodeCount,
      criticalIssues: summary.criticalCount,
      wcagCompliance:
        summary.wcagAAFailures === 0
          ? 'WCAG 2.1 AA Compliant'
          : 'Non-Compliant',
    },
    breakdown: {
      bySeverity: {
        critical: summary.criticalCount,
        serious: summary.seriousCount,
        moderate: summary.moderateCount,
        minor: summary.minorCount,
      },
      byCategory: Object.keys(categories).map((cat) => ({
        category: cat,
        count: categories[cat].length,
        violations: categories[cat],
      })),
    },
    topIssues: violations
      .sort((a, b) => b.severity * b.nodeCount - a.severity * a.nodeCount)
      .slice(0, 10),
    recommendations: generateRecommendations(violations, categories),
    technicalDetails: {
      testEngine: auditResults.testEngine,
      testRunner: auditResults.testRunner,
      timestamp: auditResults.timestamp,
      url: auditResults.url,
    },
  };
}

/**
 * Get accessibility grade based on score
 * @param {number} score - Accessibility score
 * @returns {string} Letter grade
 */
function getAccessibilityGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'C-';
  if (score >= 50) return 'D';
  return 'F';
}

/**
 * Generate accessibility recommendations
 * @param {Array} violations - All violations
 * @param {Object} categories - Categorized violations
 * @returns {Array} Recommendations
 */
function generateRecommendations(violations, categories) {
  const recommendations = [];

  // Priority recommendations based on critical issues
  const critical = violations.filter((v) => v.impact === 'critical');
  if (critical.length > 0) {
    recommendations.push(
      `🚨 Address ${critical.length} critical accessibility issues immediately`,
    );
  }

  // Category-specific recommendations
  Object.keys(categories).forEach((category) => {
    const count = categories[category].length;
    if (count > 0) {
      recommendations.push(
        `🔧 Fix ${count} ${category.toLowerCase()} issue(s)`,
      );
    }
  });

  // WCAG compliance recommendations
  const wcagViolations = violations.filter((v) => v.wcagLevel.includes('AA'));
  if (wcagViolations.length > 0) {
    recommendations.push(
      `📋 ${wcagViolations.length} violations prevent WCAG 2.1 AA compliance`,
    );
  }

  return recommendations;
}

module.exports = {
  performAccessibilityAudit,
  generateAccessibilityReport,
  processAxeResults,
  calculateAccessibilityScore,
  getAccessibilityGrade,
};
