---
title: "fix: Section headings participate in curtain reveal"
type: fix
date: 2026-06-20
---

# fix: Section headings participate in curtain reveal

## Summary

Make section-level sticky headings invisible until their section's canvas reveals them during scroll, and fix the vertical offset so incoming and outgoing heading text aligns pixel-perfectly at the sticky position.

---

## Problem Frame

The curtain reveal works for the root heading — as a section scrolls up, its `.section__canvas` (absolutely positioned, full-section-height) occludes the root heading from below. But section-level `<sticky-heading>` elements are visible the entire time because they paint above the canvas.

The complication: the canvas has `position: absolute; inset: 0` — it fills the entire section height. Unlike the root heading (which is occluded by a *different* section scrolling over it), a section heading lives *inside* its own section. Simply putting it behind the canvas via z-index would hide it permanently, not progressively reveal it — because the canvas never "scrolls past" the heading; both move together within the section.

The solution is `overflow: clip` on the section element itself. The heading is sticky (pinned to viewport top), but `overflow: clip` on the section means the heading is only painted within the section's bounds. As the section enters from below, the heading starts clipped — only the portion of the heading that's within the section's visible area shows. As the user scrolls and more of the section passes the sticky position, more of the heading is revealed from below. This produces the same bottom-to-top reveal that the root heading experiences.

---

## Requirements

- R1. Section-level `<sticky-heading>` elements are clipped to their section's bounds, producing a bottom-to-top reveal as the section scrolls into the sticky position.
- R2. The reveal is pure CSS — `overflow: clip` on the section, no JavaScript scroll listeners or additional animations.
- R3. The incoming section heading and the outgoing heading (root or previous section) align at the same vertical pixel position during the crossover.
- R4. The curtain reveal still works correctly for the root heading (no regression).
- R5. The `clip-path` bleed animation on `.section__canvas` continues to work.
- R6. Section body content remains visible and interactive (not clipped).

---

## Key Technical Decisions

### KTD1. `overflow: clip` on the section for heading containment

The section gets `overflow: clip` which clips any content that overflows its bounds — including the sticky heading when the section hasn't fully scrolled into the viewport yet. Unlike `overflow: hidden`, `overflow: clip` does NOT create a scroll container, so it won't interfere with sticky positioning behavior within the section.

**Why:** This is the only pure-CSS mechanism that clips a sticky child without breaking the sticky behavior itself. `overflow: hidden` would create a scroll container and break sticky. `clip-path` on the heading would need a scroll-driven animation. `overflow: clip` clips without those side effects.

**Note:** `overflow: clip` does NOT break `position: sticky` — sticky continues to work relative to the nearest scroll ancestor (the viewport), but the element's paint is clipped to the section bounds. This is the key difference from `overflow: hidden`.

### KTD2. Section content must escape the clip

`.section__content` needs to remain visible and not be clipped. Since `overflow: clip` applies to all children, and the content is within the section bounds anyway (it doesn't overflow), this should work naturally — the content only lives within the section's height. The heading is the only element that would "overflow" the section (because sticky pins it to the viewport top, which may be above the section's top edge during the scroll-in).

### KTD3. Offset alignment via matching box model

Both the root heading and section headings share `.page-title` with identical `padding-inline` and `--sticky-heading-top`. Vertical misalignment would come from extra margin or padding on the section heading's context. Since the heading is a direct child of `<section>` (not inside `.section__content`), and sections have no padding-block on the section element itself (padding is on `.section__content`), the heading should pin at the same pixel position. If a discrepancy exists, a CSS custom property offset on the section heading corrects it.

---

## Implementation Units

### U1. Add `overflow: clip` to sections

**Goal:** Clip section headings to their section bounds so they reveal from below as the section scrolls into the sticky position.

**Requirements:** R1, R2, R4, R5, R6.

**Dependencies:** none.

**Files:**
- `src/components/Section.astro` (modify — add `overflow: clip` to `.section`)

**Approach:**
- Add `overflow: clip` to the `.section` rule.
- Verify that the canvas `clip-path` animation still works (it should — `overflow: clip` and `clip-path` are independent).
- Verify that section body content is not adversely clipped (it shouldn't be — content lives within section bounds).
- The heading, being sticky, will pin at `top: var(--sticky-heading-top)` relative to the viewport. But because the section clips its children, the heading is only visible within the section's rectangle. As the section top edge scrolls above the heading's pin position, more of the heading is revealed — bottom-to-top, matching the root heading's occlusion pattern.

**Test scenarios:**
- On initial page load, section headings are NOT visible (their sections haven't scrolled into the sticky zone).
- Scrolling section 1 upward: the heading text reveals from bottom to top as the section's top edge crosses the sticky position line.
- The root heading is still occluded by the section canvas as before (no regression).
- Section body content remains fully visible and interactive.
- The `clip-path` bleed animation on `.section__canvas` still works.
- Between sections (in the gap), the root heading is visible as before.

**Verification:** Visual scroll test in the browser at `/`.

---

### U2. Fix vertical alignment offset

**Goal:** Ensure the incoming section heading text aligns pixel-perfectly with the outgoing root heading text at the sticky position.

**Requirements:** R3.

**Dependencies:** U1.

**Files:**
- `src/pages/index.astro` (modify — styles, if needed)
- `src/components/Section.astro` (modify — if heading needs position adjustment)

**Approach:**
- Both headings use `top: var(--sticky-heading-top)` (= `var(--space-4)` = 1rem) and share the `.page-title` class with the same `padding-inline`.
- After U1, check whether the text baselines of the root heading and a section heading align during the crossover moment. Measure using dev tools.
- If misaligned: the most likely cause is that the section heading has a different distance from the section top to the text baseline (e.g., the section has no top padding but the root heading has margin before it). Adjust by adding a matching `padding-block-start` or `margin-block-start` on the section-level heading so the text starts at exactly the same viewport-Y as the root heading.
- A CSS custom property `--sticky-heading-offset` could be introduced if the offset needs to vary, but prefer a static fix if one value works.

**Test scenarios:**
- During the crossover (both headings at sticky position), text baselines align — no vertical jump visible.
- Alignment holds at multiple viewport widths.
- Alignment holds at 90%, 100%, 110% browser zoom.

**Verification:** Slow-scroll visual inspection + dev tools computed-position comparison.

---

## Scope Boundaries

### In scope
- `overflow: clip` on sections for heading reveal.
- Vertical alignment fix for pixel-perfect crossover.
- Visual testing in Chrome, Firefox, Safari.

### Deferred to Follow-Up Work
- Mobile-specific touch-scroll behavior adjustments.
- Scroll-snap or scroll-linked timing refinements.

---

## Risks & Dependencies

### D1. `overflow: clip` browser support
`overflow: clip` is Baseline 2022 (Chrome 90+, Firefox 81+, Safari 16+). All target browsers support it. No polyfill needed.

### D2. `overflow: clip` interaction with canvas `clip-path`
The canvas already animates `clip-path` for the bleed effect. Adding `overflow: clip` to the parent section should not interfere — `clip-path` clips the element's own paint, while `overflow: clip` clips children to the parent bounds. These are independent.

**Mitigation:** Visual verification of the bleed animation after the change.

### D3. Sticky behavior preservation
`overflow: clip` does NOT create a scroll container (unlike `overflow: hidden`), so sticky positioning should continue to work relative to the viewport. If any browser treats `overflow: clip` as a scroll container, the heading would stop being sticky.

**Mitigation:** Test in Chrome, Firefox, Safari. Fallback: use `overflow: clip` only on the block axis via `overflow-y: clip` if needed.
