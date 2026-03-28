# CLAUDE.md — Personal Academic Website

## Project Overview

This is a **Quarto website** (`project: type: website`) forked from Silvia Canelón's personal site and being personalized for **Ramiro Barrantes** (University of Vermont / MBSR researcher). The source renders to `_site/` and is deployed via Netlify. R is used lightly for redirect generation at render time.

**Personalization goals:**
- Name: Ramiro Barrantes-Reynolds
- Affiliation: University of Vermont (UVM)
- Research focus: Bioinformatics, Bayesian Statistics, Epigenomics
- Replace all Silvia Canelón identity (name, photo, bio, social links, credentials, content)

---

## Framework & Rendering

- **Quarto** website. Render with `quarto render` or `quarto preview` (live preview server).
- R is required for the redirect-generation code block in `index.qmd` (uses `{here}`, `{readr}`, `{dplyr}`).
- `execute: freeze: auto` is set globally — computed outputs are cached in `_freeze/` and only rerun when source changes.
- Individual sections override freeze to `true` in their `_metadata.yml`.
- Output goes to `_site/`. Do not manually edit files in `_site/` — they are overwritten on render.

---

## Key Configuration Files

### `_quarto.yml` — Master site config
Everything site-wide lives here. Most personalization starts here:
- `website.title`, `website.site-url`, `website.description`
- `website.favicon`
- `website.navbar` — logo, nav links, GitHub icon link
- `website.page-footer` — copyright, social icon links
- `website.twitter-card` — social sharing metadata
- `website.comments.utterances` — GitHub repo for comments (currently `spcanelon/silvia`)
- `format.html.theme` — SCSS theme stack (cosmo base + custom overrides)
- `include-in-header` — analytics and search console snippets

### `assets/` — Styling
| File | Purpose |
|---|---|
| `silvia-theme-light.scss` | Light theme SCSS defaults (Bootstrap variable overrides) |
| `silvia-theme-dark.scss` | Dark theme SCSS defaults |
| `_bootstrap-variables.scss` | Shared Bootstrap variable definitions |
| `about.css` | Styles for the About page |
| `index.css` | Styles for the homepage |
| `listing-default.css` | Styles for listing pages (blog, projects, talks) |
| `contact.css` | Styles for the contact page |

SCSS theme files follow the Quarto SCSS layer structure: `/*-- scss:defaults --*/`, `/*-- scss:rules --*/`.

### Section `_metadata.yml` files
Each content section has a `_metadata.yml` that sets defaults for all posts in that section:
- `blog/_metadata.yml` — freeze, title-block-banner, CC license, TOC, citation, comments, author
- `project/_metadata.yml` — same pattern, no author default
- `talk/_metadata.yml` — freeze, title-block-banner, no citation
- `publication/_metadata.yml` — freeze, citation settings

These cascade: values here override `_quarto.yml` but are overridden by individual post front matter.

---

## Site Structure

```
_quarto.yml              # Master config
index.qmd                # Homepage (Quarto "solana" about template, full-page layout)
about/
  index.qmd              # About page (trestles template; shows latest from all sections)
  sidebar/
    avatar.png           # Profile photo — REPLACE THIS
blog/
  index.qmd              # Blog listing page
  _metadata.yml          # Section defaults
  YYYY-MM-DD-slug/       # Each post in its own dated directory
    index.qmd            # Post content
    featured.jpg         # Post thumbnail
project/
  index.qmd              # Project listing page
  _metadata.yml
  YYYY-MM-DD-slug/       # Each project in its own dated directory
    index.qmd or index.markdown
  external-items/
    metadata.yml         # For externally-hosted projects (no local index.qmd)
talk/
  index.qmd              # Talks listing page
  _metadata.yml
  YYYY-MM-DD-slug/
publication/
  index.qmd              # Publications listing page
  _metadata.yml
  YYYY-MM-DD-slug/
contact.qmd
accessibility.qmd
license.qmd
404.qmd
assets/                  # CSS, SCSS theme files
_extensions/             # fontawesome, lightbox, academicons, bsicons, include-code-files
_partials/               # Custom HTML partial for title block link buttons
static/
  _manualredirects.txt   # URL redirect table (processed at render by index.qmd R chunk)
```

---

## Content Conventions

### Post front matter (blog/project/talk)
```yaml
---
title: "Post Title"
author: Ramiro Barrantes
date: YYYY-MM-DD
date-modified: YYYY-MM-DD
image: featured.jpg
image-alt: "Descriptive alt text"
categories:
  - category-name
subtitle: "One-line subtitle shown in listings"
description: ""       # Usually empty; subtitle is used for listings
links:
  - icon: github      # Bootstrap icon name
    name: Repo
    url: https://github.com/...
---
```

### Listing pages (`index.qmd` in each section)
- Use `listing:` key with `contents:` globs
- `type: default` for blog (linear), `type: grid` for projects/talks/publications
- `fields:` controls which metadata columns appear
- `sort: "date desc"` or `"date-modified desc"`

### External/assets images
- Each post carries its own `featured.jpg` (thumbnail) and `img/` subdirectory
- Homepage hero image: `assets/silvia/img/` — rename directory to your own name when replacing

### Redirects
`static/_manualredirects.txt` contains old-URL → new-URL mappings (space-separated, one per line). The R chunk in `index.qmd` writes these to `_site/_redirects` at render time for Netlify.

---

## Personalization Checklist

### High priority — identity
- [ ] `_quarto.yml`: `website.title`, `website.site-url`, `website.description`
- [ ] `_quarto.yml`: `website.favicon` path
- [ ] `_quarto.yml`: navbar GitHub link
- [ ] `_quarto.yml`: footer copyright and all social icon `href` values
- [ ] `_quarto.yml`: `twitter-card.creator` and `site`
- [ ] `_quarto.yml`: `website.comments.utterances.repo` → your own GitHub repo
- [ ] `assets/silvia/umami.html` → replace or remove analytics snippet
- [ ] `assets/silvia/google-search-console.html` → replace with your verification

### Homepage (`index.qmd`)
- [ ] `title`, `subtitle`, `pagetitle`
- [ ] `image` and `image-alt` (hero/banner image)
- [ ] `twitter-card` title, description, image
- [ ] `about.links` social URLs
- [ ] Bio paragraph

### About page (`about/index.qmd`)
- [ ] `image: sidebar/avatar.png` → your photo
- [ ] Social `links` URLs
- [ ] Bio text, institution, research focus
- [ ] Credentials and education list

### Section defaults
- [ ] `blog/_metadata.yml`: `author` name, utterances repo
- [ ] `talk/_metadata.yml`: utterances repo
- [ ] `project/_metadata.yml`, `publication/_metadata.yml`: utterances repo

### Content
- [ ] Replace or archive all existing blog posts, projects, talks, publications
- [ ] Add your own content following the front matter conventions above

---

## Extensions Available

| Extension | Usage |
|---|---|
| `fontawesome` | `{{< fa icon-name >}}` or `{{< fa brands brand-name >}}` |
| `academicons` | `{{< ai orcid >}}`, `{{< ai google-scholar >}}`, etc. |
| `bsicons` | `{{< bi icon-name >}}` |
| `lightbox` | Enabled globally via `lightbox: true` in `_quarto.yml` |
| `include-code-files` | Include external code files in code blocks |

---

## Do Not Edit
- `_site/` — auto-generated, overwritten on every render
- `_freeze/` — render cache, committed to git but not manually edited
- `.Rproj` file — R project settings
