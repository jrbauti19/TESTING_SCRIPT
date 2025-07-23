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

    .timeline-articles {
        background: white;
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .timeline-article-item {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 15px;
        background: #f7fafc;
        transition: all 0.3s ease;
    }

    .timeline-article-item:hover {
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        transform: translateY(-2px);
    }

    .timeline-article-item.has-violation {
        border-color: #e53e3e;
        background: #fed7d7;
    }

    .article-timeline-header {
        display: flex;
        align-items: flex-start;
        gap: 15px;
    }

    .article-timeline-info {
        flex: 1;
    }

    .article-timeline-info .article-title {
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
