---
title: "feat: Add wobble text effect as pluggable custom element"
type: feat
created: 2026-06-20
origin: docs/shader-website.html
---

## Summary

Create a self-contained `@whois/wobble-text` workspace package that wraps the SVG feTurbulence + feDisplacementMap filter animation from `docs/shader-website.html` into a custom element. The element can wrap any content to apply the hand-drawn wobble effect. Section one's heading and body will use it.

---

## Problem Frame

The wobble effect in `docs/shader-website.html` is compelling but tightly coupled to that standalone HTML file. The goal is to extract the core technique — SVG displacement filter with animated seed/baseFrequency — into a reusable custom element that follows the existing `@whois/sticky-heading` package pattern, keeping the Astro content layer clean.

---

## Requirements

- R1. The wobble effect must be a standalone workspace package (`@whois/wobble-text`) with no coupling to Astro internals
- R2. The element animates via SVG feTurbulence + feDisplacementMap — same technique as the reference
- R3. Section one's heading and body text must have the wobble effect applied
- R4. The element must be composable — wrappable around any content without breaking layout
- R5. The effect must respect `prefers-reduced-motion`

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Package shape | Custom element (`<wobble-text>`) in `packages/wobble-text/` | Mirrors `@whois/sticky-heading` — consistent monorepo pattern |
| SVG filter injection | Element injects its own `<svg>` filter defs on first connection, reuses across instances | Avoids polluting the Layout and keeps the package self-contained |
| Animation driver | `requestAnimationFrame` loop updating seed + baseFrequency | Same approach as reference; enables smooth organic motion |
| Configuration | Attributes: `scale`, `speed`, `frequency` with sensible defaults from reference (`scale=2`, `speed=1`, `freq=0.025`) | Keeps the element flexible without requiring config |
| Filter scope | CSS `filter: url(#id)` applied to the host element | Targets only wrapped content; no global bleed |

---

## Implementation Units

### U1. Create `@whois/wobble-text` package scaffold

**Goal:** Establish the workspace package with the same structure as `@whois/sticky-heading`.

**Requirements:** R1

**Dependencies:** None

**Files:**
- `packages/wobble-text/package.json`
- `packages/wobble-text/tsconfig.json`
- `packages/wobble-text/src/index.ts`
- `packages/wobble-text/src/styles.css`

**Approach:** Mirror the `sticky-heading` package layout. The `package.json` exports `"."` pointing at `src/index.ts` and `"./styles.css"` at `src/styles.css`. Add `@whois/wobble-text` as a workspace dependency in the root `package.json`.

**Patterns to follow:** `packages/sticky-heading/package.json` structure exactly.

**Test expectation:** none — scaffolding only.

---

### U2. Implement the `WobbleTextElement` custom element

**Goal:** Build the core custom element that injects the SVG filter and runs the animation loop.

**Requirements:** R2, R4, R5

**Dependencies:** U1

**Files:**
- `packages/wobble-text/src/index.ts`
- `packages/wobble-text/src/styles.css`

**Approach:**

On `connectedCallback`:
1. Generate a unique filter ID (to support multiple instances)
2. Inject a shared `<svg>` element into `document.body` (or reuse if already present) containing the `<filter>` with `feTurbulence` + `feDisplacementMap`
3. Apply `filter: url(#<id>)` to the host element via inline style
4. Start a `requestAnimationFrame` loop that updates `seed` and `baseFrequency` attributes on the turbulence element (same math as reference: `drift = sin(t * 0.0003 * speed) * 0.004`, seed cycles)
5. Read `scale`, `speed`, `frequency` from attributes with defaults

On `disconnectedCallback`:
1. Cancel the rAF loop
2. Remove the filter element if no other instances reference it

Styles: The element is `display: contents` by default so it doesn't break layout flow. A `position: relative` fallback for browsers where `display: contents` doesn't compose well with filters.

`prefers-reduced-motion`: Skip animation loop entirely; apply a static filter with fixed seed for the hand-drawn look without motion.

**Patterns to follow:** `StickyHeadingElement` lifecycle pattern (observedAttributes, connectedCallback/disconnectedCallback, cleanup pattern).

**Test scenarios:**
- Single instance renders with wobble filter applied and animating
- Two instances each get their own filter ID and animate independently
- Removing element from DOM cancels its animation loop
- `scale="0"` effectively disables displacement
- Content inside the element remains interactive (pointer-events pass through)
- `prefers-reduced-motion: reduce` stops animation but keeps static displacement

---

### U3. Wire wobble-text into section one

**Goal:** Apply the wobble effect to section one's heading and body.

**Requirements:** R3

**Dependencies:** U2

**Files:**
- `package.json` (root — add workspace dep)
- `src/pages/index.astro`

**Approach:**

Add `@whois/wobble-text` to root dependencies. In `index.astro`:
- Import the element: `import "@whois/wobble-text"`
- Wrap section one's `<sticky-heading>` and `<p>` in `<wobble-text>` elements (or wrap the entire slot content in a single `<wobble-text>`)

The custom element composes naturally with `<sticky-heading>` since both use non-invasive patterns (sticky-heading uses clip-path, wobble-text uses CSS filter).

**Patterns to follow:** How `@whois/sticky-heading` is imported and used in `index.astro`.

**Test scenarios:**
- Section one heading and body visually wobble
- Section two and three remain unaffected
- Sticky heading reveal animation still works correctly with wobble applied
- Page renders without JS errors

---

## Scope Boundaries

### In scope
- The wobble text custom element package
- Applying it to section one

### Deferred to Follow-Up Work
- WebGL background canvas (the Three.js portion of the reference)
- Wobble border effects (the `::before`/`::after` pseudo-element technique)
- Controls panel for live-tuning parameters
- Applying wobble to other sections

---

## Open Questions

- None blocking. The reference implementation provides all the technical details needed.

---

## Sources & Research

- `docs/shader-website.html` — reference implementation of the full wobble technique
- `packages/sticky-heading/` — package pattern to follow
