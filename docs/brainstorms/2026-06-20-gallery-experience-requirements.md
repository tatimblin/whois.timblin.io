# Gallery Experience

## Outcome

A personal photo/video gallery that lives alongside the existing homepage sections — browsable from a scroll-driven carousel on the homepage, with a dedicated grid page and per-item detail views. All navigation between pages uses the View Transitions API so thumbnails morph into their full-size counterparts.

## User Experience

### Homepage Carousel

A new section positioned above the current Section One. As the user scrolls down the page, the carousel translates horizontally — no auto-play, no manual controls. Each media item parallaxes within its frame as it scrolls through the viewport.

- Clicking any item in the carousel navigates directly to that item's detail page (with a view transition morphing the thumbnail).
- A CTA element at the trailing end of the carousel links to the full gallery page.
- The carousel uses the same scroll-timeline/scroll-driven animation approach already in use across the site.

### Gallery Grid Page

A dedicated page (e.g., `/gallery`) showing all media in a grid.

- Uniform column widths; items retain their natural aspect ratio (masonry-style height variation, no cropping).
- Responsive column count (3 on mobile, scaling up on wider viewports).
- Clicking an item navigates to that item's detail page via View Transitions (thumbnail morphs to full media).

### Detail Page

A standalone page for a single media item.

- Displays the full image or video at large size.
- Shows caption text and date below or beside the media.
- Closing (back navigation) returns to the gallery grid with a reverse view transition.
- No prev/next navigation between items.

## Content Model

Media is managed as local static assets with a JSON manifest.

- A directory of image and video files in the repo (e.g., `src/content/gallery/`).
- A JSON file (or frontmatter-based content collection) providing metadata per item: file path/filename, caption, date, and aspect ratio (or derived at build time).
- Build-time processing generates optimized thumbnails and full-size variants.

## Animated Transitions

- **Home → Gallery page:** View Transition on navigation. The CTA or carousel section morphs/fades into the gallery grid.
- **Gallery → Detail:** The clicked grid thumbnail morphs (position + scale) into the full-size media on the detail page using `view-transition-name` matched between the grid item and detail media element.
- **Detail → Gallery:** Reverse of the above — media shrinks back into its grid position.
- **Home carousel → Detail:** Same morph pattern as gallery→detail, the carousel thumbnail transitions into the full detail view.

## Constraints

- Must work with Astro's built-in View Transitions (MPA mode, `<ViewTransitions />` component).
- Scroll-driven carousel must degrade gracefully where `animation-timeline: scroll()` is unsupported (static horizontal layout, scrollable).
- Respect `prefers-reduced-motion` — disable parallax and reduce transition animation.
- No JavaScript frameworks (React, Vue, etc.) — stays in Astro + vanilla JS web components, consistent with the existing codebase.

## Outstanding Questions

- Exact URL structure: `/gallery` + `/gallery/[slug]`, or `/gallery/[id]`?
- Video handling: autoplay muted in grid/carousel, or poster frame only until detail view?
- Image optimization pipeline: Astro's built-in `<Image>` with `getImage()`, or a custom sharp pipeline in the build?
