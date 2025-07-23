// utils/accessibility.js
// Comprehensive accessibility testing utilities

const fs = require('fs');
const path = require('path');
const logger = require('../logger');

/**
 * Comprehensive accessibility testing utility for web pages
 * Uses axe-core for WCAG 2.0/2.1 compliance testing
 */
class AccessibilityAuditor {
  constructor() {
    this.axeCorePath = require.resolve('axe-core/axe.min.js');
    this.axeSource = fs.readFileSync(this.axeCorePath, 'utf8');
  }

  /**
   * Performs comprehensive accessibility audit on the current page with article context
   * @param {Object} page - Playwright page object
   * @param {Array} articles - Array of article data for context mapping
   * @param {Object} options - Audit configuration options
   * @returns {Object} Detailed accessibility audit results
   */
  async auditPageWithContext(page, articles = [], options = {}) {
    try {
      logger.info('🔍 Injecting axe-core for accessibility testing...');

      // Inject axe-core directly as a script instead of loading from URL
      await page.addScriptTag({ content: this.axeSource });

      logger.info(
        '⚡ Running comprehensive accessibility scan with article context...',
      );

      // Configure axe options
      const axeOptions = {
        runOnly: options.runOnly || ['wcag2a', 'wcag2aa', 'wcag21aa'],
        reporter: 'v2',
        resultTypes: ['violations', 'incomplete', 'passes'],
        ...options.axeOptions,
      };

      // Run axe accessibility scan and get article context
      const results = await page.evaluate((axeOptions) => {
        return new Promise((resolve, reject) => {
          if (typeof axe === 'undefined') {
            reject(new Error('axe-core not loaded properly'));
            return;
          }

          axe.run(document, axeOptions, (err, results) => {
            if (err) {
              reject(err);
            } else {
              // Enhance results with article context
              const articleElements = document.querySelectorAll('.athing');
              const articleContextMap = {};

              articleElements.forEach((article, index) => {
                const id = article.id;
                const titleElement = article.querySelector('.titleline > a');
                const title = titleElement
                  ? titleElement.textContent.trim()
                  : `Article ${index + 1}`;
                const rank =
                  article
                    .querySelector('.rank')
                    ?.textContent?.replace('.', '') || index + 1;

                articleContextMap[id] = {
                  rank: parseInt(rank),
                  title: title,
                  url: titleElement?.href || '',
                  elementIndex: index,
                };
              });

              results.articleContext = articleContextMap;
              resolve(results);
            }
          });
        });
      }, axeOptions);

      // Process and enhance results with article context
      const processedResults = this.processResultsWithContext(
        results,
        articles,
      );

      logger.success(
        `✅ Accessibility audit completed - ${processedResults.summary.violationCount} violations found across ${processedResults.articleAnalysis.affectedArticles} articles`,
      );

      return processedResults;
    } catch (error) {
      logger.error(`❌ Accessibility audit failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  async auditPage(page, options = {}) {
    return this.auditPageWithContext(page, [], options);
  }

  /**
   * Process and enhance axe results with article context
   * @param {Object} axeResults - Raw results from axe-core
   * @param {Array} articles - Article data for context
   * @returns {Object} Enhanced results with article context
   */
  processResultsWithContext(axeResults, articles = []) {
    const articleContext = axeResults.articleContext || {};

    const processViolations = (violations) => {
      return violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        tags: violation.tags,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.map((node) => {
          const articleInfo = this.findArticleForElement(
            node.target,
            articleContext,
          );
          return {
            html: node.html,
            impact: node.impact,
            target: node.target,
            failureSummary: node.failureSummary,
            element: node.element,
            articleContext: articleInfo,
          };
        }),
        nodeCount: violation.nodes.length,
        wcagLevel: this.getWCAGLevel(violation.tags),
        severity: this.getSeverityScore(violation.impact),
        category: this.categorizeViolation(violation.id, violation.tags),
        affectedArticles: this.getAffectedArticles(
          violation.nodes,
          articleContext,
        ),
      }));
    };

    const violations = processViolations(axeResults.violations || []);
    const passes = axeResults.passes ? axeResults.passes.length : 0;
    const incomplete = axeResults.incomplete ? axeResults.incomplete.length : 0;
    const inapplicable = axeResults.inapplicable
      ? axeResults.inapplicable.length
      : 0;

    // Analyze article-specific issues
    const articleAnalysis = this.analyzeArticleIssues(
      violations,
      articleContext,
      articles,
    );

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
      categories: this.categorizeViolations(violations),
      score: this.calculateAccessibilityScore(violations, passes),
      articleAnalysis,
      timestamp: new Date().toISOString(),
      url: axeResults.url || 'unknown',
      testEngine: axeResults.testEngine || {
        name: 'axe-core',
        version: '4.7.2',
      },
      testRunner: axeResults.testRunner || { name: 'custom-integration' },
    };
  }

  /**
   * Legacy method for backward compatibility
   */
  processResults(axeResults) {
    return this.processResultsWithContext(axeResults, []);
  }

  /**
   * Get WCAG compliance level from tags
   * @param {Array} tags - Rule tags
   * @returns {Array} WCAG levels
   */
  getWCAGLevel(tags) {
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
  getSeverityScore(impact) {
    const scores = { critical: 4, serious: 3, moderate: 2, minor: 1 };
    return scores[impact] || 0;
  }

  /**
   * Categorize violation by type
   * @param {string} id - Rule ID
   * @param {Array} tags - Rule tags
   * @returns {string} Category
   */
  categorizeViolation(id, tags) {
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
  categorizeViolations(violations) {
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
  calculateAccessibilityScore(violations, passes) {
    if (passes === 0 && violations.length === 0) return 100; // No tests run, assume perfect

    const totalTests = passes + violations.length;
    if (totalTests === 0) return 100;

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
  generateReport(auditResults) {
    const { violations, summary, categories, score } = auditResults;

    return {
      executive: {
        score,
        grade: this.getAccessibilityGrade(score),
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
      recommendations: this.generateRecommendations(violations, categories),
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
  getAccessibilityGrade(score) {
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
  generateRecommendations(violations, categories) {
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

    if (recommendations.length === 0) {
      recommendations.push('🎉 Great job! No major accessibility issues found');
    }

    return recommendations;
  }

  /**
   * Find which article an element belongs to
   * @param {Array} targetSelectors - CSS selectors for the element
   * @param {Object} articleContext - Article context mapping
   * @returns {Object|null} Article information
   */
  findArticleForElement(targetSelectors, articleContext) {
    if (!targetSelectors || !targetSelectors.length) return null;

    const selector = targetSelectors[0];

    // Check if selector contains an article ID
    for (const [articleId, info] of Object.entries(articleContext)) {
      if (
        selector.includes(`#${articleId}`) ||
        selector.includes(`[id="${articleId}"]`)
      ) {
        return {
          id: articleId,
          rank: info.rank,
          title: info.title,
          url: info.url,
        };
      }
    }

    // Check if selector is within an article container
    const articleIdMatch = selector.match(/#(\d+)/);
    if (articleIdMatch && articleContext[articleIdMatch[1]]) {
      const info = articleContext[articleIdMatch[1]];
      return {
        id: articleIdMatch[1],
        rank: info.rank,
        title: info.title,
        url: info.url,
      };
    }

    return {
      context: 'General page element (not article-specific)',
      location: selector,
    };
  }

  /**
   * Get list of affected articles for a violation
   * @param {Array} nodes - Violation nodes
   * @param {Object} articleContext - Article context mapping
   * @returns {Array} List of affected articles
   */
  getAffectedArticles(nodes, articleContext) {
    const affectedArticles = new Set();

    nodes.forEach((node) => {
      const articleInfo = this.findArticleForElement(
        node.target,
        articleContext,
      );
      if (articleInfo && articleInfo.id) {
        affectedArticles.add(
          JSON.stringify({
            id: articleInfo.id,
            rank: articleInfo.rank,
            title: articleInfo.title,
          }),
        );
      }
    });

    return Array.from(affectedArticles).map((str) => JSON.parse(str));
  }

  /**
   * Analyze accessibility issues by article
   * @param {Array} violations - All violations
   * @param {Object} articleContext - Article context mapping
   * @param {Array} articles - Article data
   * @returns {Object} Article analysis
   */
  analyzeArticleIssues(violations, articleContext, articles) {
    const articleIssues = {};
    const generalIssues = [];
    let affectedArticlesCount = 0;

    violations.forEach((violation) => {
      const affectedArticles = violation.affectedArticles || [];

      if (affectedArticles.length === 0) {
        // General page issue, not article-specific
        generalIssues.push(violation);
      } else {
        affectedArticles.forEach((article) => {
          if (!articleIssues[article.id]) {
            articleIssues[article.id] = {
              article: article,
              violations: [],
              severityScore: 0,
              issueCount: 0,
            };
          }

          articleIssues[article.id].violations.push(violation);
          articleIssues[article.id].severityScore += violation.severity;
          articleIssues[article.id].issueCount += violation.nodeCount;
        });
      }
    });

    affectedArticlesCount = Object.keys(articleIssues).length;

    // Sort articles by severity
    const sortedArticleIssues = Object.values(articleIssues).sort(
      (a, b) => b.severityScore - a.severityScore,
    );

    return {
      affectedArticles: affectedArticlesCount,
      totalArticles: Object.keys(articleContext).length,
      articleIssues: sortedArticleIssues,
      generalPageIssues: generalIssues,
      mostProblematicArticles: sortedArticleIssues.slice(0, 5),
      issueDistribution: {
        articleSpecific: violations.length - generalIssues.length,
        generalPage: generalIssues.length,
      },
    };
  }
}

// Legacy function wrappers for backward compatibility
async function performAccessibilityAudit(page, options = {}) {
  const auditor = new AccessibilityAuditor();
  return await auditor.auditPage(page, options);
}

function generateAccessibilityReport(auditResults) {
  const auditor = new AccessibilityAuditor();
  return auditor.generateReport(auditResults);
}

function processAxeResults(axeResults) {
  const auditor = new AccessibilityAuditor();
  return auditor.processResults(axeResults);
}

function calculateAccessibilityScore(violations, passes) {
  const auditor = new AccessibilityAuditor();
  return auditor.calculateAccessibilityScore(violations, passes);
}

function getAccessibilityGrade(score) {
  const auditor = new AccessibilityAuditor();
  return auditor.getAccessibilityGrade(score);
}

module.exports = {
  AccessibilityAuditor,
  performAccessibilityAudit,
  generateAccessibilityReport,
  processAxeResults,
  calculateAccessibilityScore,
  getAccessibilityGrade,
};
