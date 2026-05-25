#!/bin/bash

# Pre-render script: Fetch GitLab activity calendar and generate heatmap HTML
#
# This script:
# 1. Fetches the GitLab activity calendar JSON from your profile
# 2. Extracts contribution data
# 3. Generates an interactive HTML heatmap
# 4. Saves it to gitlab-heatmap.html for inclusion in the site

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OUTPUT_FILE="$PROJECT_ROOT/gitlab-heatmap.html"
GITLAB_URL="https://gitlab.uvm.edu/users/Ramiro.Barrantes/calendar.json"

echo "Fetching GitLab activity from $GITLAB_URL..."

# Fetch JSON data
ACTIVITY_JSON=$(curl -s "$GITLAB_URL" 2>/dev/null || echo '{}')

if [ "$ACTIVITY_JSON" = '{}' ]; then
  echo "✗ Failed to fetch GitLab activity data or received empty response"
  exit 1
fi

# Count data points
DATA_POINTS=$(echo "$ACTIVITY_JSON" | grep -o '"[0-9-]*":[0-9]*' | wc -l)
echo "Received activity data for $DATA_POINTS days"

# Create HTML fragment file with embedded JSON data (no doctype/html/head for inclusion)
cat > "$OUTPUT_FILE" << 'HTMLEOF'
<style>
    .gitlab-heatmap {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
      padding: 0;
    }

    .heatmap-chart {
      display: flex;
      gap: 2px;
      align-items: flex-end;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .heatmap-cell {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    .heatmap-cell:hover {
      box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.3);
    }

    .heatmap-cell[data-count="0"] { background-color: #ebedf0; }
    .heatmap-cell[data-count="1"] { background-color: #c6e48b; }
    .heatmap-cell[data-count="2"] { background-color: #7bc96f; }
    .heatmap-cell[data-count="3"] { background-color: #239a3b; }
    .heatmap-cell[data-count="4"] { background-color: #196127; }

    .heatmap-months {
      display: flex;
      gap: 2px;
      font-size: 0.7rem;
      color: #999;
      position: relative;
    }

    .month-marker {
      min-width: 12px;
      height: 16px;
      position: absolute;
      font-size: 0.75rem;
      color: #999;
      white-space: nowrap;
    }

    .month-marker.first {
      text-align: left;
    }

    .month-marker.last {
      text-align: right;
      right: 0;
    }

    .heatmap-legend {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      font-size: 0.75rem;
      color: #999;
    }

    .legend-label { margin-right: 4px; }
    .legend-cells { display: flex; gap: 3px; }
    .legend-cell {
      width: 10px;
      height: 10px;
      border-radius: 1px;
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
  </style>

<div class="gitlab-heatmap">
    <div class="heatmap-chart" id="heatmap"></div>
    <div class="heatmap-months" id="months"></div>
</div>

<div class="heatmap-legend">
  <span class="legend-label">Less</span>
  <div class="legend-cells">
    <div class="legend-cell" style="background-color: #ebedf0;"></div>
    <div class="legend-cell" style="background-color: #c6e48b;"></div>
    <div class="legend-cell" style="background-color: #7bc96f;"></div>
    <div class="legend-cell" style="background-color: #239a3b;"></div>
    <div class="legend-cell" style="background-color: #196127;"></div>
  </div>
  <span style="margin-left: 4px;">More</span>
</div>

  <script>
HTMLEOF

# Append JSON data
echo "    const data = $ACTIVITY_JSON;" >> "$OUTPUT_FILE"

# Append rest of HTML
cat >> "$OUTPUT_FILE" << 'HTMLEOF'

    // Render heatmap as a simple horizontal strip
    function renderHeatmap() {
      const heatmapEl = document.getElementById('heatmap');
      const monthsEl = document.getElementById('months');

      // Get all dates sorted
      const allDates = Object.keys(data).sort();
      if (allDates.length === 0) return;

      // Get date range for filling gaps
      const startDate = new Date(allDates[0]);
      const endDate = new Date(allDates[allDates.length - 1]);

      // Generate all dates in range (including days with 0 contributions)
      const allDateRange = [];
      const monthPositions = {};
      let currentDate = new Date(startDate);
      let dateIndex = 0;

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const monthKey = dateStr.substring(0, 7); // YYYY-MM
        const monthStr = currentDate.toLocaleDateString('en-US', { month: 'short' });

        // Track first position of each month
        if (!monthPositions[monthKey]) {
          monthPositions[monthKey] = { index: dateIndex, label: monthStr };
        }

        allDateRange.push(dateStr);
        dateIndex++;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Render cells
      let cellsHtml = '';
      allDateRange.forEach(dateStr => {
        const count = data[dateStr] || 0;
        const colorLevel = Math.min(count, 4);
        const tooltipCount = count || 'No';
        cellsHtml += `<div class="heatmap-cell" data-count="${colorLevel}" title="${dateStr}: ${tooltipCount} contribution${count !== 1 ? 's' : ''}"></div>`;
      });
      heatmapEl.innerHTML = cellsHtml;

      // Render only first and last month labels
      const sortedMonths = Object.entries(monthPositions).sort((a, b) => a[1].index - b[1].index);

      const firstEntry = sortedMonths[0];
      const lastEntry = sortedMonths[sortedMonths.length - 1];

      const firstMonthKey = firstEntry[0];
      const lastMonthKey = lastEntry[0];
      const [firstYear, firstMonth] = firstMonthKey.split('-');
      const [lastYear, lastMonth] = lastMonthKey.split('-');

      const firstMonthName = firstEntry[1].label;
      const lastMonthName = lastEntry[1].label;
      const firstLabel = `${firstMonthName} '${firstYear.substring(2)}`;
      const lastLabel = `${lastMonthName} '${lastYear.substring(2)}`;

      const monthLabels = `
        <div class="month-marker first" style="margin-left: ${firstEntry[1].index * 14}px;">${firstLabel}</div>
        <div class="month-marker last" style="margin-left: ${lastEntry[1].index * 14}px;">${lastLabel}</div>
      `;
      monthsEl.innerHTML = monthLabels;
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderHeatmap);
    } else {
      renderHeatmap();
    }
  </script>
HTMLEOF

echo "✓ Generated GitLab heatmap: $OUTPUT_FILE"
