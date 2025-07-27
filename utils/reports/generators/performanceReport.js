/**
 * Performance Report Generator
 * Generates detailed performance analysis reports
 */

function generatePerformanceReport(data) {
  const performanceData = data.performanceReport || data;

  if (!performanceData || !performanceData.phases) {
    return `
      <div class="header">
          <h1>📊 Performance Dashboard</h1>
          <div class="subtitle">Execution Analysis & Metrics</div>
      </div>
      <div class="no-data">
          <h3>No Performance Data Available</h3>
          <p>Performance metrics were not collected during this validation run.</p>
      </div>
    `;
  }

  const { summary, phases, memory, network, pagination, efficiency } =
    performanceData;

  // Generate phase breakdown
  const phaseBreakdown = Object.entries(phases)
    .map(
      ([name, phase]) => `
      <div class="phase-item">
        <div class="phase-header">
          <h4>${name.charAt(0).toUpperCase() + name.slice(1)}</h4>
          <span class="phase-duration">${phase.durationFormatted}</span>
        </div>
        <div class="phase-details">
          <div class="phase-bar">
            <div class="phase-fill" style="width: ${phase.percentage}%"></div>
          </div>
          <div class="phase-stats">
            <span class="percentage">${phase.percentage}%</span>
            <span class="memory-delta">${phase.memoryDeltaMB} MB</span>
          </div>
        </div>
      </div>
    `,
    )
    .join('');

  return `
    <div class="header">
        <h1>📊 Performance Dashboard</h1>
        <div class="subtitle">Execution Analysis & Metrics</div>
        <div class="timestamp">Generated: ${new Date().toLocaleString()}</div>
    </div>

    <div class="stats-grid">
        <div class="stat-card total-time">
            <div class="stat-icon">⏱️</div>
            <div class="stat-number">${summary.totalDurationFormatted}</div>
            <div class="stat-label">Total Execution Time</div>
        </div>
        <div class="stat-card memory">
            <div class="stat-icon">💾</div>
            <div class="stat-number">${summary.peakMemoryMB} MB</div>
            <div class="stat-label">Peak Memory Usage</div>
        </div>
        <div class="stat-card network">
            <div class="stat-icon">🌐</div>
            <div class="stat-number">${summary.networkRequests}</div>
            <div class="stat-label">Network Requests</div>
        </div>
        <div class="stat-card efficiency">
            <div class="stat-icon">⚡</div>
            <div class="stat-number">${efficiency.articlesPerSecond}</div>
            <div class="stat-label">Articles/Second</div>
        </div>
    </div>

    <div class="chart-container">
        <h3>Performance Breakdown by Phase</h3>
        <canvas id="performanceChart" width="400" height="200"></canvas>
    </div>

    <div class="performance-timeline">
        <h3>Phase-by-Phase Analysis</h3>
        <div class="timeline-container">
            ${phaseBreakdown}
        </div>
    </div>

    <div class="memory-analysis">
        <h3>Memory Analysis</h3>
        <div class="memory-stats">
            <div class="memory-item">
                <span class="memory-label">Initial Memory:</span>
                <span class="memory-value">${
                  memory.initial.heapUsedMB
                } MB</span>
            </div>
            <div class="memory-item">
                <span class="memory-label">Final Memory:</span>
                <span class="memory-value">${memory.final.heapUsedMB} MB</span>
            </div>
            <div class="memory-item">
                <span class="memory-label">Peak Memory:</span>
                <span class="memory-value">${memory.peak.heapUsedMB} MB</span>
            </div>
            <div class="memory-item">
                <span class="memory-label">Memory Delta:</span>
                <span class="memory-value">${summary.memoryDeltaMB} MB</span>
            </div>
        </div>
    </div>

    <div class="network-analysis">
        <h3>Network Performance</h3>
        <div class="network-stats">
            <div class="network-item">
                <span class="network-label">Total Requests:</span>
                <span class="network-value">${network.requests}</span>
            </div>
            <div class="network-item">
                <span class="network-label">Average Request Time:</span>
                <span class="network-value">${Math.round(
                  network.averageTime,
                )}ms</span>
            </div>
            <div class="network-item">
                <span class="network-label">Total Network Time:</span>
                <span class="network-value">${Math.round(
                  network.totalTime,
                )}ms</span>
            </div>
        </div>
    </div>

    <div class="efficiency-analysis">
        <h3>Efficiency Metrics</h3>
        <div class="efficiency-stats">
            <div class="efficiency-item">
                <span class="efficiency-label">Articles Processed:</span>
                <span class="efficiency-value">${
                  efficiency.articlesPerSecond !== 'N/A'
                    ? (
                        (summary.totalDuration / 1000) *
                        parseFloat(efficiency.articlesPerSecond)
                      ).toFixed(0)
                    : 'N/A'
                }</span>
            </div>
            <div class="efficiency-item">
                <span class="efficiency-label">Processing Rate:</span>
                <span class="efficiency-value">${
                  efficiency.articlesPerSecond
                } articles/sec</span>
            </div>
            <div class="efficiency-item">
                <span class="efficiency-label">Average Time per Article:</span>
                <span class="efficiency-value">${
                  efficiency.averageTimePerArticle !== 'N/A'
                    ? efficiency.averageTimePerArticle + 'ms'
                    : 'N/A'
                }</span>
            </div>
            <div class="efficiency-item">
                <span class="efficiency-label">Memory per Article:</span>
                <span class="efficiency-value">${
                  efficiency.memoryEfficiency.memoryPerArticleKB
                } KB</span>
            </div>
        </div>
    </div>

    <div class="pagination-analysis">
        <h3>Pagination Performance</h3>
        <div class="pagination-stats">
            <div class="pagination-item">
                <span class="pagination-label">Total Clicks:</span>
                <span class="pagination-value">${pagination.clicks}</span>
            </div>
            <div class="pagination-item">
                <span class="pagination-label">Average Wait Time:</span>
                <span class="pagination-value">${Math.round(
                  pagination.averageWaitTime,
                )}ms</span>
            </div>
            <div class="pagination-item">
                <span class="pagination-label">Total Wait Time:</span>
                <span class="pagination-value">${Math.round(
                  pagination.totalWaitTime,
                )}ms</span>
            </div>
        </div>
    </div>
  `;
}

module.exports = {
  generatePerformanceReport,
};
