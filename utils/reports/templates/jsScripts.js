/**
 * JavaScript Scripts Generator
 * Generates client-side JavaScript for charts and interactivity
 */

const { generateChartData } = require('../charts/chartGenerator');

/**
 * Generate timeline chart data
 * @param {Object} data - Report data
 * @returns {Object} Chart.js configuration
 */
function generateTimelineChartData(data) {
  return generateChartData(data, 'timeline');
}

/**
 * Generate performance chart data
 * @param {Object} data - Report data
 * @returns {Object} Chart.js configuration
 */
function generatePerformanceChartData(data) {
  return generateChartData(data, 'performance');
}

/**
 * Generate accessibility chart data
 * @param {Object} data - Report data
 * @returns {Object} Chart.js configuration
 */
function generateAccessibilityChartData(data) {
  return generateChartData(data, 'accessibility');
}

function generateReportScripts(data, reportType) {
  return `
    // Chart.js initialization
    console.log('Report scripts loaded for:', '${reportType}');
    console.log('Data available:', Object.keys(${JSON.stringify(
      data || {},
    )}).join(', '));

    // Initialize charts when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
      initializeCharts();
    });

    async function initializeCharts() {
      // Timeline Chart
      const timelineCanvas = document.getElementById('timelineChart');
      if (timelineCanvas) {
        try {
          const response = await fetch('/api/chart/timeline');
          const timelineData = await response.json();
          new Chart(timelineCanvas, timelineData);
          console.log('Timeline chart initialized');
        } catch (error) {
          console.error('Timeline chart error:', error);
          // Fallback to embedded data
          try {
            const fallbackData = ${JSON.stringify(
              generateTimelineChartData(data),
            )};
            new Chart(timelineCanvas, fallbackData);
          } catch (fallbackError) {
            console.error('Timeline chart fallback failed:', fallbackError);
          }
        }
      }

      // Performance Chart
      const performanceCanvas = document.getElementById('performanceChart');
      if (performanceCanvas) {
        try {
          const response = await fetch('/api/chart/performance');
          const performanceData = await response.json();
          new Chart(performanceCanvas, performanceData);
          console.log('Performance chart initialized');
        } catch (error) {
          console.error('Performance chart error:', error);
          // Fallback to embedded data
          try {
            const fallbackData = ${JSON.stringify(
              generatePerformanceChartData(data),
            )};
            new Chart(performanceCanvas, fallbackData);
          } catch (fallbackError) {
            console.error('Performance chart fallback failed:', fallbackError);
          }
        }
      }

      // Accessibility Chart
      const accessibilityCanvas = document.getElementById('accessibilityChart');
      if (accessibilityCanvas) {
        try {
          const response = await fetch('/api/chart/accessibility');
          const accessibilityData = await response.json();
          new Chart(accessibilityCanvas, accessibilityData);
          console.log('Accessibility chart initialized');
        } catch (error) {
          console.error('Accessibility chart error:', error);
          // Fallback to embedded data
          try {
            const fallbackData = ${JSON.stringify(
              generateAccessibilityChartData(data),
            )};
            new Chart(accessibilityCanvas, fallbackData);
          } catch (fallbackError) {
            console.error('Accessibility chart fallback failed:', fallbackError);
          }
        }
      }
    }

    // Interactive violations expansion
    function expandAllViolations() {
      const hiddenViolations = document.getElementById('hiddenViolations');
      const expandBtn = document.getElementById('expandViolationsBtn');
      
      if (hiddenViolations && expandBtn) {
        if (hiddenViolations.style.display === 'none') {
          // Show violations
          hiddenViolations.style.display = 'block';
          expandBtn.innerHTML = '📋 Hide additional violations';
          expandBtn.setAttribute('title', 'Click to hide the additional violations');
          
          // Smooth scroll to the newly revealed content
          setTimeout(() => {
            hiddenViolations.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }, 100);
        } else {
          // Hide violations
          hiddenViolations.style.display = 'none';
          expandBtn.innerHTML = '📋 Show all ${
            (data.validationReport?.chronological?.violations || []).length - 10
          } remaining violations';
          expandBtn.setAttribute('title', 'Click to show all remaining chronological violations');
          
          // Scroll back to the expand button
          expandBtn.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }
    }

    // Add click tracking for article links
    document.addEventListener('DOMContentLoaded', function() {
      const articleLinks = document.querySelectorAll('.article-link');
      articleLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          console.log('Article clicked:', this.textContent.trim());
          // Track analytics or add other click behavior here
        });
      });

      // Add keyboard support for expand button
      const expandBtn = document.getElementById('expandViolationsBtn');
      if (expandBtn) {
        expandBtn.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            expandAllViolations();
          }
        });
      }
    });

    // Add visual feedback for external links
    document.addEventListener('DOMContentLoaded', function() {
      const externalLinks = document.querySelectorAll('a[target="_blank"]');
      externalLinks.forEach(link => {
        // Add external link indicator
        if (!link.querySelector('.external-indicator')) {
          const indicator = document.createElement('span');
          indicator.className = 'external-indicator';
          indicator.innerHTML = ' 🔗';
          indicator.style.fontSize = '0.8em';
          indicator.style.opacity = '0.7';
          link.appendChild(indicator);
        }
      });
    });
  `;
}

module.exports = {
  generateReportScripts,
};
