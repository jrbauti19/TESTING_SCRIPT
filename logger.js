// logger.js
// Enhanced logger utility with beautiful UI/UX elements

const chalk = require('chalk');
const boxen = require('boxen');
const gradient = require('gradient-string');
const figlet = require('figlet');

const icons = {
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  success: '✅',
  debug: '🔍',
  loading: '⏳',
  rocket: '🚀',
  chart: '📊',
  clock: '⏱️',
  memory: '💾',
  network: '🌐',
  article: '📄',
  check: '✓',
  cross: '✗',
};

const colors = {
  info: chalk.cyan,
  warn: chalk.yellow,
  error: chalk.red,
  success: chalk.green,
  debug: chalk.gray,
  primary: chalk.blue,
  secondary: chalk.magenta,
};

function formatMessage(level, message, ...args) {
  const icon = icons[level] || '';
  const color = colors[level] || ((x) => x);
  const timestamp = chalk.gray(`[${new Date().toLocaleTimeString()}]`);
  return `${timestamp} ${icon} ${color(message)} ${args.join(' ')}`;
}

function log(level, message, ...args) {
  console.log(formatMessage(level, message, ...args));
}

function banner(text) {
  const ascii = figlet.textSync(text, { font: 'Small' });
  const gradientText = gradient(['#ff6b6b', '#4ecdc4', '#45b7d1'])(ascii);
  console.log(
    boxen(gradientText, {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'cyan',
      backgroundColor: '#1a1a1a',
    }),
  );
}

function box(content, options = {}) {
  const defaultOptions = {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'blue',
    ...options,
  };
  console.log(boxen(content, defaultOptions));
}

function successBox(title, details) {
  const content = `${chalk.green.bold(title)}\n\n${details
    .map((d) => `${icons.check} ${d}`)
    .join('\n')}`;
  box(content, { borderColor: 'green', borderStyle: 'double' });
}

function errorBox(title, details) {
  const content = `${chalk.red.bold(title)}\n\n${details
    .map((d) => `${icons.cross} ${d}`)
    .join('\n')}`;
  box(content, { borderColor: 'red', borderStyle: 'double' });
}

function statsBox(stats) {
  const content = Object.entries(stats)
    .map(([key, value]) => `${chalk.cyan(key)}: ${chalk.white.bold(value)}`)
    .join('\n');
  box(content, {
    title: '📊 Statistics',
    titleAlignment: 'center',
    borderColor: 'magenta',
    borderStyle: 'round',
  });
}

function separator(char = '─', length = 50) {
  console.log(chalk.gray(char.repeat(length)));
}

function progress(current, total, message = '') {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * 20);
  const empty = 20 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const color = percentage === 100 ? chalk.green : chalk.blue;
  console.log(`${color(bar)} ${percentage}% ${message}`);
}

module.exports = {
  info: (message, ...args) => log('info', message, ...args),
  warn: (message, ...args) => log('warn', message, ...args),
  error: (message, ...args) => log('error', message, ...args),
  success: (message, ...args) => log('success', message, ...args),
  debug: (message, ...args) => log('debug', message, ...args),
  banner,
  box,
  successBox,
  errorBox,
  statsBox,
  separator,
  progress,
  icons,
  colors,
  chalk,
  gradient,
};
