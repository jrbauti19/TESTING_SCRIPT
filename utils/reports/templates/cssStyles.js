/**
 * CSS Styles Module
 * Contains all CSS styles for the report interface
 */

/**
 * Generate CSS styles for the report
 * @returns {string} CSS styles
 */
function generateReportStyles() {
  return `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        color: #333;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    .header {
        text-align: center;
        background: rgba(255, 255, 255, 0.95);
        padding: 40px 20px;
        border-radius: 20px;
        margin-bottom: 30px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .header h1 {
        font-size: 3em;
        margin-bottom: 10px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .subtitle {
        font-size: 1.2em;
        color: #666;
        margin-bottom: 20px;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .stat-card {
        background: rgba(255, 255, 255, 0.95);
        padding: 25px;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }

    .stat-card .icon {
        font-size: 2em;
        margin-bottom: 15px;
        display: block;
    }

    .stat-card .value {
        font-size: 2.5em;
        font-weight: bold;
        color: #333;
        margin-bottom: 10px;
    }

    .stat-card .label {
        color: #666;
        font-weight: 500;
        text-transform: uppercase;
        font-size: 0.9em;
        letter-spacing: 1px;
    }

    .chart-container {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .chart-container h3 {
        margin-bottom: 20px;
        color: #333;
        text-align: center;
    }

    .violations-list {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .violation-item {
        border-left: 4px solid #e53e3e;
        padding: 15px;
        margin-bottom: 15px;
        background: #fed7d7;
        border-radius: 0 10px 10px 0;
    }

    .violation-item.serious {
        border-color: #dd6b20;
        background: #feebc8;
    }

    .violation-item.moderate {
        border-color: #d69e2e;
        background: #faf089;
    }

    .violation-item.minor {
        border-color: #38a169;
        background: #c6f6d5;
    }

    .violation-title {
        font-weight: bold;
        margin-bottom: 8px;
        color: #2d3748;
    }

    .violation-description {
        color: #4a5568;
        margin-bottom: 8px;
    }

    .violation-elements {
        font-size: 0.9em;
        color: #718096;
    }

    .article-analysis {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .problematic-articles {
        margin-top: 25px;
    }

    .article-issue-item {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 15px;
        background: #f7fafc;
        transition: all 0.3s ease;
    }

    .article-issue-item:hover {
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        transform: translateY(-2px);
    }

    .article-header {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    }

    .article-rank {
        background: #4299e1;
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-weight: bold;
        font-size: 0.9em;
        margin-right: 12px;
        min-width: 40px;
        text-align: center;
    }

    .article-title {
        font-weight: 600;
        color: #2d3748;
        flex: 1;
        line-height: 1.4;
    }

    .article-stats {
        display: flex;
        gap: 15px;
        font-size: 0.9em;
        color: #718096;
    }

    .article-stats span {
        background: #edf2f7;
        padding: 4px 8px;
        border-radius: 4px;
    }

    .severity-score {
        font-weight: 600;
        color: #e53e3e !important;
    }

    .violation-detail {
        margin: 8px 0;
        padding: 8px;
        background: #f7fafc;
        border-left: 3px solid #4299e1;
        border-radius: 4px;
        font-size: 0.9em;
    }

    .violation-impact {
        color: #718096;
        font-size: 0.85em;
        margin-top: 4px;
    }

    .more-violations {
        color: #4a5568;
        font-style: italic;
        margin-top: 8px;
        text-align: center;
    }

    .violation-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 10px;
    }

    .violation-impact-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.75em;
        font-weight: bold;
        text-transform: uppercase;
    }

    .violation-impact-badge.critical {
        background: #fed7d7;
        color: #742a2a;
    }

    .violation-impact-badge.serious {
        background: #feebc8;
        color: #744210;
    }

    .violation-impact-badge.moderate {
        background: #faf089;
        color: #744210;
    }

    .violation-impact-badge.minor {
        background: #c6f6d5;
        color: #22543d;
    }

    .violation-details {
        margin-top: 15px;
    }

    .violation-stats {
        display: flex;
        gap: 15px;
        margin-bottom: 10px;
        flex-wrap: wrap;
    }

    .violation-stats span {
        background: #edf2f7;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.9em;
        color: #4a5568;
    }

    .affected-articles {
        margin: 10px 0;
        padding: 10px;
        background: #ebf8ff;
        border-radius: 6px;
    }

    .article-list {
        margin-top: 8px;
    }

    .affected-article {
        display: inline-block;
        background: #bee3f8;
        color: #2b6cb0;
        padding: 4px 8px;
        margin: 2px;
        border-radius: 4px;
        font-size: 0.85em;
    }

    .more-articles {
        color: #4a5568;
        font-style: italic;
        margin-top: 5px;
    }

    .general-issue {
        margin: 10px 0;
        padding: 10px;
        background: #faf5ff;
        border-radius: 6px;
        color: #553c9a;
    }

    .violation-help {
        margin-top: 10px;
    }

    .help-link {
        color: #4299e1;
        text-decoration: none;
        font-weight: 500;
    }

    .help-link:hover {
        text-decoration: underline;
    }

    .no-data {
        text-align: center;
        padding: 60px 20px;
        background: white;
        border-radius: 15px;
        margin: 30px 0;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .no-data h3 {
        color: #4a5568;
        margin-bottom: 15px;
    }

    .no-data p {
        color: #718096;
    }

    /* Accessibility Report Styles */
    .executive-summary {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .stat-card {
        background: linear-gradient(135deg, #f7fafc, #edf2f7);
        padding: 25px;
        border-radius: 12px;
        text-align: center;
        border: 2px solid transparent;
        transition: all 0.3s ease;
    }

    .stat-card.critical {
        border-color: #e53e3e;
        background: linear-gradient(135deg, #fed7d7, #feb2b2);
    }

    .stat-card.serious {
        border-color: #dd6b20;
        background: linear-gradient(135deg, #feebc8, #fbd38d);
    }

    .stat-card.moderate {
        border-color: #d69e2e;
        background: linear-gradient(135deg, #fef5e7, #f6e05e);
    }

    .stat-card.minor {
        border-color: #38a169;
        background: linear-gradient(135deg, #c6f6d5, #9ae6b4);
    }

    .stat-card.passes {
        border-color: #3182ce;
        background: linear-gradient(135deg, #bee3f8, #90cdf4);
    }

    .stat-card.compliance {
        border-color: #805ad5;
        background: linear-gradient(135deg, #e9d8fd, #d6bcfa);
    }

    .stat-number {
        font-size: 2.5em;
        font-weight: bold;
        margin-bottom: 8px;
    }

    .stat-label {
        font-size: 0.9em;
        color: #4a5568;
        font-weight: 500;
    }

    .wcag-compliance {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .compliance-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .compliance-level {
        background: #f7fafc;
        padding: 25px;
        border-radius: 12px;
        text-align: center;
        border: 2px solid #e2e8f0;
    }

    .compliance-level h3 {
        margin-bottom: 15px;
        color: #2d3748;
    }

    .level-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 15px;
    }

    .status {
        padding: 5px 12px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 0.9em;
    }

    .status.pass {
        background: #c6f6d5;
        color: #22543d;
    }

    .status.fail {
        background: #fed7d7;
        color: #742a2a;
    }

    .violations-by-category {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .category-card {
        background: #f7fafc;
        padding: 20px;
        border-radius: 10px;
        border-left: 4px solid #3182ce;
    }

    .category-card h3 {
        margin-bottom: 10px;
        color: #2d3748;
    }

    .category-count {
        font-size: 1.2em;
        font-weight: bold;
        color: #3182ce;
        margin-bottom: 8px;
    }

    .category-description {
        color: #718096;
        font-size: 0.9em;
    }

    .top-issues {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .issues-list {
        margin-top: 20px;
    }

    .issue-card {
        background: #f7fafc;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 15px;
        border-left: 4px solid #e53e3e;
    }

    .issue-card.critical {
        border-left-color: #e53e3e;
        background: #fed7d7;
    }

    .issue-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }

    .issue-header h4 {
        color: #2d3748;
        margin: 0;
    }

    .impact {
        padding: 4px 10px;
        border-radius: 15px;
        font-size: 0.8em;
        font-weight: bold;
        text-transform: uppercase;
    }

    .impact.critical {
        background: #fed7d7;
        color: #742a2a;
    }

    .impact.serious {
        background: #feebc8;
        color: #744210;
    }

    .impact.moderate {
        background: #fef5e7;
        color: #744210;
    }

    .impact.minor {
        background: #c6f6d5;
        color: #22543d;
    }

    .detailed-violations {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .violations-container {
        margin-top: 20px;
    }

    .violation-card {
        background: #f7fafc;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 15px;
        border-left: 4px solid #e53e3e;
    }

    .violation-card.critical {
        border-left-color: #e53e3e;
        background: #fed7d7;
    }

    .violation-card.serious {
        border-left-color: #dd6b20;
        background: #feebc8;
    }

    .violation-card.moderate {
        border-left-color: #d69e2e;
        background: #fef5e7;
    }

    .violation-card.minor {
        border-left-color: #38a169;
        background: #c6f6d5;
    }

    .violation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }

    .violation-header h4 {
        color: #2d3748;
        margin: 0;
        flex: 1;
    }

    .violation-details {
        margin-bottom: 15px;
    }

    .violation-details p {
        margin-bottom: 8px;
        color: #4a5568;
    }

    .violation-nodes {
        background: #edf2f7;
        padding: 15px;
        border-radius: 8px;
        margin-top: 15px;
    }

    .violation-nodes h5 {
        margin-bottom: 10px;
        color: #2d3748;
    }

    .nodes-list {
        max-height: 200px;
        overflow-y: auto;
    }

    .node-item {
        background: white;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 8px;
        border: 1px solid #e2e8f0;
    }

    .node-item code {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.85em;
        color: #2d3748;
    }

    .more-nodes {
        text-align: center;
        color: #718096;
        font-style: italic;
        margin-top: 10px;
    }

    .recommendations {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .recommendations-list {
        margin-top: 20px;
    }

    .recommendation {
        background: #f7fafc;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 15px;
        border-left: 4px solid #3182ce;
    }

    .recommendation h4 {
        color: #2d3748;
        margin-bottom: 10px;
    }

    .recommendation p {
        color: #4a5568;
        line-height: 1.6;
    }

    .article-context {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .articles-summary {
        margin-top: 20px;
    }

    .articles-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .article-card {
        background: #f7fafc;
        padding: 20px;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
        transition: all 0.3s ease;
    }

    .article-card:hover {
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        transform: translateY(-2px);
    }

    .article-card h4 {
        color: #2d3748;
        margin-bottom: 10px;
        line-height: 1.4;
    }

    .article-meta {
        color: #718096;
        font-size: 0.9em;
        margin-bottom: 15px;
    }

    .article-link {
        color: #3182ce;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.3s ease;
    }

    .article-link:hover {
        color: #2c5282;
        text-decoration: underline;
    }

    .timestamp {
        color: #718096;
        font-size: 0.9em;
        margin-top: 10px;
    }

    .instructions {
        background: #f7fafc;
        padding: 20px;
        border-radius: 10px;
        margin-top: 20px;
        border-left: 4px solid #3182ce;
    }

    .instructions h4 {
        color: #2d3748;
        margin-bottom: 15px;
    }

    .instructions ol {
        color: #4a5568;
        line-height: 1.6;
    }

    .instructions code {
        background: #edf2f7;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }

    .chronology-violations {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .success-message {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        text-align: center;
    }



    .article-item {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 15px;
        background: #f7fafc;
        transition: all 0.3s ease;
    }

    .article-item:hover {
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        transform: translateY(-2px);
    }

    .article-item.has-violation {
        border-color: #e53e3e;
        background: #fed7d7;
    }

    .article-header {
        display: flex;
        align-items: flex-start;
        gap: 15px;
    }

    .article-info {
        flex: 1;
    }

    .article-info .article-title {
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 8px;
        line-height: 1.4;
    }

    .article-meta {
        display: flex;
        gap: 15px;
        font-size: 0.9em;
        color: #718096;
        flex-wrap: wrap;
    }

    .article-meta span {
        background: #edf2f7;
        padding: 3px 8px;
        border-radius: 4px;
    }

    .article-timestamp {
        text-align: right;
        font-size: 0.85em;
    }

    .timestamp-label {
        color: #718096;
        margin-bottom: 4px;
    }

    .timestamp-value {
        color: #4a5568;
        font-weight: 500;
    }

    .violation-indicator {
        margin-top: 10px;
        padding: 8px;
        background: #fed7d7;
        color: #742a2a;
        border-radius: 6px;
        font-weight: 500;
    }

    .memory-analysis, .network-analysis, .efficiency-analysis, 
    .violations-section, .accessibility-summary, .quality-issues, .articles-summary {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .performance-timeline {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .timeline-item {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        padding: 15px;
        background: #f7fafc;
        border-radius: 10px;
    }

    .timeline-item:last-child {
        margin-bottom: 0;
    }

    .timeline-phase {
        font-weight: bold;
        color: #2d3748;
        min-width: 200px;
    }

    .timeline-duration {
        font-family: monospace;
        color: #4a5568;
        margin-right: 20px;
    }

    .timeline-bar {
        width: 200px;
        height: 8px;
        background: #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
    }

    .timeline-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 4px;
        transition: width 0.3s ease;
    }

    .grade-badge {
        display: inline-block;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 1.2em;
    }

    .grade-a { background: #c6f6d5; color: #22543d; }
    .grade-b { background: #faf089; color: #744210; }
    .grade-c { background: #fed7d7; color: #742a2a; }
    .grade-f { background: #feb2b2; color: #742a2a; }

    .contact-footer {
        margin-top: 50px;
        padding: 30px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        text-align: center;
    }

    .footer-content h3 {
        color: #2d3748;
        margin-bottom: 15px;
        font-size: 1.5em;
    }

    .footer-content p {
        color: #4a5568;
        margin-bottom: 20px;
        line-height: 1.6;
    }

    .contact-links {
        display: flex;
        justify-content: center;
        gap: 25px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }

    .contact-links a {
        color: #4299e1;
        text-decoration: none;
        font-weight: 600;
        padding: 10px 20px;
        background: #ebf8ff;
        border-radius: 8px;
        transition: all 0.3s ease;
    }

    .contact-links a:hover {
        background: #4299e1;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(66, 153, 225, 0.3);
    }

    .footer-note {
        font-style: italic;
        color: #718096;
        font-size: 0.95em;
    }

    .expand-button {
        background: linear-gradient(135deg, #4299e1, #2b6cb0);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.95em;
        box-shadow: 0 2px 8px rgba(66, 153, 225, 0.3);
    }

    .expand-button:hover {
        background: linear-gradient(135deg, #2b6cb0, #2c5282);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
    }

    .expand-button:active {
        transform: translateY(0);
    }

    .hidden-violations {
        margin-top: 20px;
        border-top: 2px solid #e2e8f0;
        padding-top: 20px;
    }

    .article-link {
        color: #4299e1;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.2s ease;
        border-bottom: 1px solid transparent;
    }

    .article-link:hover {
        color: #2b6cb0;
        text-decoration: none;
        border-bottom: 1px solid #4299e1;
        transform: translateY(-1px);
    }

    .article-link:visited {
        color: #805ad5;
    }

    .article-item .article-link {
        color: #2d3748;
        font-weight: 600;
    }

    .article-item .article-link:hover {
        color: #4299e1;
    }

    .external-indicator {
        opacity: 0.6;
        font-size: 0.8em;
        margin-left: 4px;
    }

    .more-violations {
        text-align: center;
        margin: 25px 0;
        padding: 20px;
        background: #f7fafc;
        border-radius: 10px;
        border: 2px dashed #cbd5e0;
    }

    .hidden-violations {
        animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .expand-button:focus {
        outline: 3px solid rgba(66, 153, 225, 0.3);
        outline-offset: 2px;
    }

    /* Performance Report Specific Styles */
    .timeline-container {
        margin-top: 20px;
    }

    .phase-item {
        margin-bottom: 20px;
        padding: 15px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #f7fafc;
    }

    .phase-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .phase-header h4 {
        margin: 0;
        color: #2d3748;
        font-size: 1.1rem;
    }

    .phase-duration {
        font-weight: 600;
        color: #4299e1;
        font-size: 0.9rem;
    }

    .phase-details {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .phase-bar {
        flex: 1;
        height: 8px;
        background: #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
    }

    .phase-fill {
        height: 100%;
        background: linear-gradient(90deg, #4299e1, #38a169);
        border-radius: 4px;
        transition: width 0.3s ease;
    }

    .phase-stats {
        display: flex;
        gap: 15px;
        font-size: 0.85rem;
    }

    .percentage {
        color: #4299e1;
        font-weight: 600;
    }

    .memory-delta {
        color: #718096;
    }

    .memory-stats, .network-stats, .efficiency-stats, .pagination-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .memory-item, .network-item, .efficiency-item, .pagination-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: #f7fafc;
        border-radius: 8px;
        border-left: 4px solid #4299e1;
    }

    .memory-label, .network-label, .efficiency-label, .pagination-label {
        color: #4a5568;
        font-weight: 500;
    }

    .memory-value, .network-value, .efficiency-value, .pagination-value {
        color: #2d3748;
        font-weight: 600;
        font-size: 1.1rem;
    }

    .stat-card.total-time {
        border-left: 4px solid #4299e1;
    }

    .stat-card.memory {
        border-left: 4px solid #38a169;
    }

    .stat-card.network {
        border-left: 4px solid #ed8936;
    }

    .stat-card.efficiency {
        border-left: 4px solid #9f7aea;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .container {
            padding: 10px;
        }
        
        .stats-grid {
            grid-template-columns: 1fr;
        }
        
        .header h1 {
            font-size: 2em;
        }

        .contact-links {
            flex-direction: column;
            align-items: center;
        }
        
        .contact-links a {
            width: 100%;
            max-width: 250px;
        }
    }
  `;
}

module.exports = {
  generateReportStyles,
};
