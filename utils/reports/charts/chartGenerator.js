/**
 * Chart Data Generator
 * Generates Chart.js compatible data structures for visualizations
 */

/**
 * Generate chart data for different visualization types
 * @param {Object} data - Report data
 * @param {string} chartType - Type of chart to generate
 * @returns {Object} Chart.js compatible data structure
 */
function generateChartData(data, chartType) {
  try {
    switch (chartType) {
      case 'performance':
        return generatePerformanceChart(data);
      case 'accessibility':
        return generateAccessibilityChart(data);
      default:
        return {
          type: 'line',
          data: {
            labels: ['No Data'],
            datasets: [
              {
                label: 'No Data Available',
                data: [0],
                borderColor: '#e2e8f0',
                backgroundColor: '#f7fafc',
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Chart data not available',
              },
            },
          },
        };
    }
  } catch (error) {
    console.error('Chart generation error:', error);
    return {
      type: 'line',
      data: {
        labels: ['Error'],
        datasets: [
          {
            label: 'Chart Error',
            data: [0],
            borderColor: '#e53e3e',
            backgroundColor: '#fed7d7',
          },
        ],
      },
    };
  }
}

/**
 * Generate performance chart data
 * @param {Object} data - Performance report data
 * @returns {Object} Chart.js performance chart configuration
 */
function generatePerformanceChart(data) {
  const performanceData = data.performanceReport || data;

  if (!performanceData || !performanceData.phases) {
    return {
      type: 'bar',
      data: {
        labels: ['No Data'],
        datasets: [
          {
            label: 'No Performance Data',
            data: [0],
          },
        ],
      },
    };
  }

  const phases = Object.entries(performanceData.phases);
  const labels = phases.map(([name]) => name.replace(/([A-Z])/g, ' $1').trim());
  const durations = phases.map(([, phase]) => phase.duration || 0);

  return {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Duration (ms)',
          data: durations,
          backgroundColor: [
            'rgba(66, 153, 225, 0.8)',
            'rgba(56, 161, 105, 0.8)',
            'rgba(237, 137, 54, 0.8)',
            'rgba(159, 122, 234, 0.8)',
            'rgba(236, 72, 153, 0.8)',
          ],
          borderColor: ['#4299e1', '#38a169', '#ed8936', '#9f7aea', '#ec4899'],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Performance Breakdown by Phase',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Duration (milliseconds)',
          },
        },
      },
    },
  };
}

/**
 * Generate accessibility chart data
 * @param {Object} data - Accessibility report data
 * @returns {Object} Chart.js accessibility chart configuration
 */
function generateAccessibilityChart(data) {
  const accessibilityData = data.accessibilityReport || data;

  if (!accessibilityData || !accessibilityData.breakdown) {
    return {
      type: 'doughnut',
      data: {
        labels: ['No Data'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#e2e8f0'],
          },
        ],
      },
    };
  }

  const breakdown = accessibilityData.breakdown;
  const labels = Object.keys(breakdown);
  const values = Object.values(breakdown);

  return {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            '#fed7d7', // Critical - red
            '#feebc8', // Serious - orange
            '#faf089', // Moderate - yellow
            '#c6f6d5', // Minor - green
          ],
          borderColor: ['#e53e3e', '#dd6b20', '#d69e2e', '#38a169'],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Accessibility Issues by Severity',
        },
        legend: {
          position: 'bottom',
        },
      },
    },
  };
}

module.exports = {
  generateChartData,
  generatePerformanceChart,
  generateAccessibilityChart,
};
