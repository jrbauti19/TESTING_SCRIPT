// utils/retry.js
// Utility for retrying async operations

async function retry(fn, attempts = 3, delay = 1000, logger) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (logger) logger.warn(`Retry ${i + 1} failed:`, err.message);
      if (i < attempts - 1) await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw lastErr;
}

module.exports = {
  retry,
};
