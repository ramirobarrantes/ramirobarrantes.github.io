#!/usr/bin/env node

/**
 * Pre-render script: Fetch GitLab activity calendar and generate heatmap HTML
 *
 * This script:
 * 1. Fetches the GitLab activity calendar JSON from your profile
 * 2. Extracts contribution data
 * 3. Generates an interactive HTML heatmap
 * 4. Saves it to gitlab-heatmap.html for inclusion in the site
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const GITLAB_URL = 'https://gitlab.uvm.edu/users/Ramiro.Barrantes/calendar.json';
const OUTPUT_FILE = path.join(__dirname, '../gitlab-heatmap.html');

/**
 * Fetch JSON from URL
 */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 10000 }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 100)}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Fetch failed: ${err.message}`));
    });
  });
}

/**
 * Generate HTML heatmap from GitLab activity data
 */
function generateHeatmap(activityData) {
  // Convert activity data to a format suitable for visualization
  // GitLab returns data as { "2024-01-15": 5, "2024-01-16": 12, ... }

  const dataJson = JSON.stringify(activityData, null, 2);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitLab Activity Heatmap</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
      padding: 20px;
      background: #f9fafb;
      color: #1f2937;
      margin: 0;
    }
    .heatmap-container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    h2 {
      margin-top: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }
    .heatmap-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(12px, 1fr));
      gap: 4px;
      margin: 20px 0;
      max-width: 800px;
    }
    .heatmap-cell {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    .heatmap-cell:hover {
      transform: scale(1.3);
      z-index: 10;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    .heatmap-cell[data-count="0"] { background-color: #ebedf0; }
    .heatmap-cell[data-count="1"] { background-color: #c6e48b; }
    .heatmap-cell[data-count="2"] { background-color: #7bc96f; }
    .heatmap-cell[data-count="3"] { background-color: #239a3b; }
    .heatmap-cell[data-count="4"] { background-color: #196127; }

    .legend {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 20px;
      font-size: 0.875rem;
      color: #6b7280;
    }
    .legend-label { margin-right: 8px; }
    .legend-cells {
      display: flex;
      gap: 4px;
    }
    .legend-cell {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    .stats {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }
    .stat {
      text-align: center;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #7c3aed;
    }
    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 4px;
    }
    .updated-at {
      font-size: 0.8rem;
      color: #9ca3af;
      margin-top: 16px;
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="heatmap-container">
    <h2>GitLab Contribution Activity</h2>
    <div class="heatmap-grid" id="heatmap"></div>

    <div class="legend">
      <span class="legend-label">Less</span>
      <div class="legend-cells">
        <div class="legend-cell" style="background-color: #ebedf0;"></div>
        <div class="legend-cell" style="background-color: #c6e48b;"></div>
        <div class="legend-cell" style="background-color: #7bc96f;"></div>
        <div class="legend-cell" style="background-color: #239a3b;"></div>
        <div class="legend-cell" style="background-color: #196127;"></div>
      </div>
      <span style="margin-left: 8px;">More</span>
    </div>

    <div class="stats" id="stats"></div>

    <div class="updated-at" id="updated"></div>
  </div>

  <script>
    // Activity data from GitLab
    const data = ${dataJson};

    // Render heatmap
    function renderHeatmap() {
      const heatmapEl = document.getElementById('heatmap');
      const statsEl = document.getElementById('stats');
      const updatedEl = document.getElementById('updated');

      // Sort dates
      const sortedDates = Object.keys(data).sort();

      // Statistics
      let totalContributions = 0;
      let maxCount = 0;
      let daysWithContributions = 0;

      Object.entries(data).forEach(([date, count]) => {
        totalContributions += count;
        maxCount = Math.max(maxCount, count);
        if (count > 0) daysWithContributions++;
      });

      // Render cells
      sortedDates.forEach(date => {
        const count = data[date];
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        cell.setAttribute('data-count', Math.min(count, 4)); // Cap at 4 for color scale
        cell.title = \`\${date}: \${count} contribution\${count !== 1 ? 's' : ''}\`;
        heatmapEl.appendChild(cell);
      });

      // Render stats
      statsEl.innerHTML = \`
        <div class="stat">
          <div class="stat-value">\${totalContributions}</div>
          <div class="stat-label">Total Contributions</div>
        </div>
        <div class="stat">
          <div class="stat-value">\${daysWithContributions}</div>
          <div class="stat-label">Days Active</div>
        </div>
        <div class="stat">
          <div class="stat-value">\${maxCount}</div>
          <div class="stat-label">Highest Day</div>
        </div>
      \`;

      // Updated timestamp
      updatedEl.textContent = \`Last updated: \${new Date().toLocaleString()}\`;
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderHeatmap);
    } else {
      renderHeatmap();
    }
  </script>
</body>
</html>`;

  return html;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log(`Fetching GitLab activity from ${GITLAB_URL}...`);
    const activityData = await fetchJSON(GITLAB_URL);

    console.log(`Received activity data for ${Object.keys(activityData).length} days`);

    const html = generateHeatmap(activityData);

    fs.writeFileSync(OUTPUT_FILE, html, 'utf8');
    console.log(`✓ Generated GitLab heatmap: ${OUTPUT_FILE}`);

  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
