// utils/performance.js
// Performance monitoring and analytics utilities

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      startTime: null,
      endTime: null,
      phases: {},
      memory: {},
      network: {
        requests: 0,
        totalTime: 0,
        averageTime: 0,
      },
      pagination: {
        clicks: 0,
        totalWaitTime: 0,
        averageWaitTime: 0,
      },
    };
    this.currentPhase = null;
  }

  start() {
    this.metrics.startTime = Date.now();
    this.metrics.memory.initial = this.getMemoryUsage();
    return this;
  }

  startPhase(name) {
    if (this.currentPhase) {
      this.endPhase();
    }
    this.currentPhase = name;
    this.metrics.phases[name] = {
      startTime: Date.now(),
      endTime: null,
      duration: null,
      memoryStart: this.getMemoryUsage(),
      memoryEnd: null,
      memoryDelta: null,
    };
    return this;
  }

  endPhase() {
    if (!this.currentPhase) return this;

    const phase = this.metrics.phases[this.currentPhase];
    phase.endTime = Date.now();
    phase.duration = phase.endTime - phase.startTime;
    phase.memoryEnd = this.getMemoryUsage();
    phase.memoryDelta = phase.memoryEnd.heapUsed - phase.memoryStart.heapUsed;

    this.currentPhase = null;
    return this;
  }

  recordNetworkRequest(duration) {
    this.metrics.network.requests++;
    this.metrics.network.totalTime += duration;
    this.metrics.network.averageTime =
      this.metrics.network.totalTime / this.metrics.network.requests;
    return this;
  }

  recordPaginationClick(waitTime) {
    this.metrics.pagination.clicks++;
    this.metrics.pagination.totalWaitTime += waitTime;
    this.metrics.pagination.averageWaitTime =
      this.metrics.pagination.totalWaitTime / this.metrics.pagination.clicks;
    return this;
  }

  end() {
    if (this.currentPhase) {
      this.endPhase();
    }
    this.metrics.endTime = Date.now();
    this.metrics.memory.final = this.getMemoryUsage();
    this.metrics.memory.peak = this.getPeakMemoryUsage();
    return this;
  }

  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      heapUsedMB: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(usage.heapTotal / 1024 / 1024),
    };
  }

  getPeakMemoryUsage() {
    // Get peak memory from all recorded phases
    let peak = this.metrics.memory.initial;
    Object.values(this.metrics.phases).forEach((phase) => {
      if (phase.memoryEnd && phase.memoryEnd.heapUsed > peak.heapUsed) {
        peak = phase.memoryEnd;
      }
    });
    return peak;
  }

  getTotalDuration() {
    return this.metrics.endTime - this.metrics.startTime;
  }

  getReport() {
    const totalDuration = this.getTotalDuration();
    const memoryDelta =
      this.metrics.memory.final.heapUsed - this.metrics.memory.initial.heapUsed;

    return {
      summary: {
        totalDuration: totalDuration,
        totalDurationFormatted: this.formatDuration(totalDuration),
        memoryDelta: memoryDelta,
        memoryDeltaMB: Math.round(memoryDelta / 1024 / 1024),
        peakMemoryMB: this.metrics.memory.peak.heapUsedMB,
        networkRequests: this.metrics.network.requests,
        paginationClicks: this.metrics.pagination.clicks,
      },
      phases: this.getPhaseReport(),
      memory: this.getMemoryReport(),
      network: this.metrics.network,
      pagination: this.metrics.pagination,
      efficiency: this.calculateEfficiencyMetrics(),
    };
  }

  getPhaseReport() {
    const report = {};
    Object.entries(this.metrics.phases).forEach(([name, phase]) => {
      report[name] = {
        duration: phase.duration,
        durationFormatted: this.formatDuration(phase.duration),
        memoryDeltaMB: Math.round(phase.memoryDelta / 1024 / 1024),
        percentage: Math.round(
          (phase.duration / this.getTotalDuration()) * 100,
        ),
      };
    });
    return report;
  }

  getMemoryReport() {
    return {
      initial: this.metrics.memory.initial,
      final: this.metrics.memory.final,
      peak: this.metrics.memory.peak,
      delta: {
        heapUsed:
          this.metrics.memory.final.heapUsed -
          this.metrics.memory.initial.heapUsed,
        heapUsedMB:
          this.metrics.memory.final.heapUsedMB -
          this.metrics.memory.initial.heapUsedMB,
      },
    };
  }

  calculateEfficiencyMetrics() {
    const totalDuration = this.getTotalDuration();
    const articlesPerSecond = this.metrics.articlesProcessed
      ? (this.metrics.articlesProcessed / (totalDuration / 1000)).toFixed(2)
      : 'N/A';

    return {
      articlesPerSecond,
      averageTimePerArticle: this.metrics.articlesProcessed
        ? Math.round(totalDuration / this.metrics.articlesProcessed)
        : 'N/A',
      memoryEfficiency: this.calculateMemoryEfficiency(),
      networkEfficiency: this.calculateNetworkEfficiency(),
    };
  }

  calculateMemoryEfficiency() {
    const memoryDelta =
      this.metrics.memory.final.heapUsed - this.metrics.memory.initial.heapUsed;
    const articlesProcessed = this.metrics.articlesProcessed || 1;
    return {
      memoryPerArticle: Math.round(memoryDelta / articlesProcessed),
      memoryPerArticleKB: Math.round(memoryDelta / articlesProcessed / 1024),
    };
  }

  calculateNetworkEfficiency() {
    if (this.metrics.network.requests === 0) return { efficiency: 'N/A' };

    return {
      averageRequestTime: Math.round(this.metrics.network.averageTime),
      requestsPerSecond: (
        this.metrics.network.requests /
        (this.getTotalDuration() / 1000)
      ).toFixed(2),
      networkUtilization: Math.round(
        (this.metrics.network.totalTime / this.getTotalDuration()) * 100,
      ),
    };
  }

  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }

  setArticlesProcessed(count) {
    this.metrics.articlesProcessed = count;
    return this;
  }
}

/**
 * Create a new performance monitor instance
 * @returns {PerformanceMonitor} New performance monitor
 */
function createMonitor() {
  return new PerformanceMonitor();
}

/**
 * Measure execution time of an async function
 * @param {Function} fn - Async function to measure
 * @param {string} name - Name for the measurement
 * @returns {Promise<{result: any, duration: number}>} Result and duration
 */
async function measureAsync(fn, name = 'operation') {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration, name, success: true };
  } catch (error) {
    const duration = Date.now() - start;
    return { error, duration, name, success: false };
  }
}

/**
 * Get system performance information
 * @returns {Object} System performance data
 */
function getSystemInfo() {
  const usage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  return {
    memory: {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024),
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system,
    },
    uptime: Math.round(process.uptime()),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };
}

module.exports = {
  PerformanceMonitor,
  createMonitor,
  measureAsync,
  getSystemInfo,
};
