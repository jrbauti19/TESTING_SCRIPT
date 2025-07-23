// utils/export.js
// Utility for exporting data to JSON and CSV

const fs = require('fs');
const path = require('path');

function exportJSON(data, filename) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf-8');
}

function exportCSV(data, filename) {
  if (!Array.isArray(data) || data.length === 0) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(',')]
    .concat(
      data.map((row) =>
        keys.map((k) => JSON.stringify(row[k] ?? '')).join(','),
      ),
    )
    .join('\n');
  fs.writeFileSync(filename, csv, 'utf-8');
}

module.exports = {
  exportJSON,
  exportCSV,
};
