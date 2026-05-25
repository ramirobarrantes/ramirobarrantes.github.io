# Pre-render Scripts

This directory contains Quarto pre-render scripts that run before the site is built. These scripts generate additional content dynamically.

## `fetch-gitlab-heatmap.sh`

**Purpose:** Fetches your GitLab activity calendar and generates an interactive HTML heatmap visualization.

**What it does:**
1. Fetches JSON activity data from your GitLab profile calendar endpoint
2. Extracts contribution counts for each day
3. Generates an interactive heatmap with:
   - Color-coded grid showing contribution intensity
   - Hover tooltips with contribution counts
   - Legend showing color scale
   - Statistics: total contributions, days active, highest day

**Output:** `gitlab-heatmap.html` in the project root

**Configuration:**
- GitLab URL: `https://gitlab.uvm.edu/users/Ramiro.Barrantes/calendar.json`
- Change `Ramiro.Barrantes` to your GitLab username if using a different account

**Usage:**
The script is registered in `_quarto.yml` as a pre-render hook, so it runs automatically with:
```bash
quarto render
```

Or run it manually:
```bash
./_scripts/fetch-gitlab-heatmap.sh
```

**Include in pages:**
To include the heatmap in a page (e.g., on the About page), use:
```html
{{< include gitlab-heatmap.html >}}
```

Or in Quarto markdown:
```markdown
`r htmltools::includeHTML("../gitlab-heatmap.html")`
```

**Notes:**
- The generated file is in `.gitignore` — it's regenerated on each render
- Requires `curl` (standard on macOS/Linux)
- Network errors are handled gracefully (falls back to empty data)
- Heatmap renders client-side using JavaScript; works without server-side dependencies
