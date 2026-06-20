---
title: "feat: Sticky reveal web component"
type: feat
created: 2026-06-19
status: ready
---

# feat: Sticky reveal web component

## Summary

A single drop-in custom element, `<sticky-heading>`, that produces a "rising curtain" sticky-reveal effect when the same element is rendered both at the page level (above sections) and inside scrolling sections that pass over it. The element is one tag with no role distinction — pure CSS sticky positioning, plus the natural occlusion of one section scrolling over another, produces the effect. The consumer authors the same element multiple times, applies the same CSS class to make the typography match, and that's it. The component itself is color-agnostic, behavior-agnostic, and contains no JavaScript scroll detection.

---

## Problem Frame

Provide a primitive that lets a consumer author a heading once at the top of a page and once inside each scrolling section, and have the per-section instances appear to "rise up" and replace the page-level heading as the user scrolls — without writing any scroll logic, JavaScript state, or coordination code.

The mechanism is pure CSS:

- `<sticky-heading>` is `position: sticky` at a configurable top offset
- Multiple instances on a page each pin at the same top offset
- Sections (the consumer's existing layout) scroll over the page-level instance
- A section with a non-transparent background occludes the page-level heading from the bottom up as the section rises
- The section's own `<sticky-heading>` instance pins at the same offset, painting upward as the section's background reveals it
- When the section's body scrolls past, sticky releases and the per-section heading rides up with the body

The consumer's job is to:
1. Drop `<sticky-heading>` wherever the heading should appear (at the top of the page, inside each relevant section)
2. Style each instance with their existing CSS (typically a shared class to match typography, plus per-instance color overrides if desired)

The component's job is to:
1. Be a sticky-positioned wrapper that doesn't impose color, typography, or behavior

That's it.

The previous plan iteration (this same file) described a two-element design (`<sticky-anchor>` and `<sticky-reveal>`) with a documented "alignment contract" requiring the consumer to mirror typography across two different element types. That's friction the consumer doesn't need: if the same element type is used everywhere with a shared CSS class, typography matching is automatic via standard CSS authoring. This plan supersedes that design.

Goals:

1. **One element type.** A single custom element used identically in every position.
2. **Zero JavaScript runtime.** The element registers a tag name and applies sticky positioning via CSS. No scroll detection, no state, no observers.
3. **Color- and style-agnostic.** The component does not impose, manage, or expose any color, gradient, or accent attribute. Whatever color or background the consumer's CSS assigns to the slotted content is what renders.
4. **Section background is a consumer concern.** A transparent section produces a "broken-looking" stacked overlay, which the component documents as the consumer's responsibility, not as a runtime error.

---

## Requirements

- **R1.** A single custom element registered: `<sticky-heading>`. No role attribute, no anchor/reveal distinction in the markup.
- **R2.** Light DOM only. The element renders a `<slot>` so slotted content (e.g., the heading text and any nested elements) inherits consumer CSS naturally and is part of the document tree.
- **R3.** Structural CSS sets `position: sticky` and `top: var(--sticky-heading-top, 0)` on the element. No other styles imposed.
- **R4.** Consumers style instances via standard CSS. To match typography across all instances on a page, the consumer applies a shared CSS class (e.g., `class="page-heading"`) to each instance. The component does nothing special to enforce or coordinate this.
- **R5.** The component is color-agnostic. No accent attribute, no gradient generation, no per-instance styling props. Color comes from consumer CSS targeting the slotted content.
- **R6.** Section backgrounds are the consumer's concern. The component does not require, validate, or document a non-transparent background as a runtime constraint; the consumer's section CSS determines whether the rising-curtain effect is visible. Transparent sections produce stacked overlays — visually unusual but not a component error.
- **R7.** Pixel-aligned overlap between instances is achieved when the consumer (a) gives each instance the same CSS class for typography, (b) places each instance in the same horizontal layout column, and (c) sets the same `top:` offset on each. Item (c) is automatic via the default `var(--sticky-heading-top, 0)`; the consumer overrides on the page root if non-zero.
- **R8.** SSR-safe by construction: custom elements upgrade after parse with no client/server DOM mismatch. Initial HTML is exactly what the consumer authored.
- **R9.** Browser baseline: works in current Chrome, Firefox, Safari with no flags. Custom elements and `position: sticky` have been Baseline-supported for years.

### Out of scope

- A separate "anchor" element type. One element handles every position.
- JavaScript scroll detection, IntersectionObserver, or `data-stuck` toggling.
- Color, accent, gradient, or background management.
- Auto-cloning the heading content into sections.
- Adapter components for React/Vue/Svelte (custom elements work natively in JSX/templates).
- npm publish workflow.

---

## Key Technical Decisions

### KTD1. One element, same tag everywhere

`<sticky-heading>` is the single tag the consumer authors at every position. No role attribute, no anchor/reveal distinction. An instance becomes "the page-level heading" because the consumer placed it at the top of the page; an instance becomes "the section heading" because the consumer placed it inside a section. The component does not introspect or care.

**Why:** Half the friction in earlier iterations came from asking the consumer to think about which role each instance plays. With one tag and standard CSS classes, the consumer authors normally — same component, same class, different parent context. The effect emerges from the parent context, not from the component knowing its role.

### KTD2. Pure CSS sticky positioning, zero JavaScript runtime

The custom element class registers the tag name and does nothing else. No `connectedCallback` logic, no observed attributes, no event listeners. The styles.css file applies `position: sticky` and a default top offset. The "rising curtain" effect is the natural consequence of two stickies at the same top, with the section's background occluding the page-level heading as the section scrolls over it.

**Why:** Multiple iterations previously tried IntersectionObserver-based stuck detection, opacity gating, and JS coordination. The user clarified during prior review that the effect is positional (rising curtain), not opacity-based. With that recognition, the entire JS runtime collapses. The custom element exists only because tag-name registration is the standard way to get a reusable component contract in HTML.

### KTD3. Color-agnostic — no accent or styling API

The component does not expose attributes, custom properties, or props for color, gradient, accent, or background. The slotted content's color is whatever the consumer's CSS sets. Different colors per section are achieved via consumer CSS targeting their own selectors (e.g., `.section-1 .page-heading { color: ... }`).

**Why:** Earlier iterations exposed `--sticky-reveal-accent` and per-section color tokens. The user's clarification is that color management belongs to the consumer's existing styling system, not the component. Removing all color-related API leaves the component truly drop-in: it does sticky positioning and nothing else.

### KTD4. Section background is documented but not enforced

A transparent section will not occlude the page-level heading; the consumer will see both instances stacked at the same coordinates. The component does not detect, warn about, or compensate for this. The README mentions it once.

**Why:** Enforcing a background on the consumer's sections would require the component to manage section markup, which is far outside its scope. The transparent-section case is "valid usage that produces a stacked appearance" — visually unusual but not broken in any technical sense (no errors, no inconsistent state). The consumer adjusts their section CSS if they want the rising-curtain effect.

### KTD5. Bun workspace, source-only

Convert to a Bun workspace with `packages/sticky-heading/`. The package ships TypeScript source plus a CSS file. No bundler, no build step. Astro/Vite consume the source directly.

**Why:** No npm consumer exists, no Next.js/RSC concerns apply (the package has no React anyway). Workspace-aliased imports of TypeScript source are the simplest possible distribution path.

---

## High-Level Technical Design

### Component composition

```
<body>
  <header class="sticky-header">
    <sticky-heading class="page-heading">Hi, I'm Tristan.</sticky-heading>
  </header>

  <main>
    <section class="section section--1">
      <sticky-heading class="page-heading">Hi, I'm Tristan.</sticky-heading>
      <p>...section body...</p>
    </section>

    <section class="section section--2">
      <sticky-heading class="page-heading">Section two.</sticky-heading>
      <p>...section body...</p>
    </section>
  </main>
</body>
```

The same tag, same class, same authoring pattern in every position. The `.page-heading` class sets typography (font-family, size, weight, line-height) shared by all instances. Per-section color or other variations come from consumer CSS targeting `.section--1 .page-heading`, `.section--2 .page-heading`, etc. — standard CSS specificity, nothing component-specific.

### State flow

There is no JavaScript state. The visible effect emerges from three CSS facts:

1. Every `<sticky-heading>` is `position: sticky; top: var(--sticky-heading-top, 0)`.
2. The page-level instance pins to viewport top while the page scrolls.
3. Each section's instance also pins at the same offset when its parent section reaches that scroll position. The section's background (whatever the consumer set) occludes the page-level heading from the bottom up as the section scrolls over it; meanwhile the section's own `<sticky-heading>` paints in the section's color at the same row, also from the bottom up.

The "rising curtain" is the natural composition of these facts. There is no component code that runs after registration.

### Stacking diagram (single time slice, mid-transition)

```
Viewport
┌────────────────────────────────────┐
│ section's bg (covers viewport top) │  ← section #2 has scrolled up;
│ section's <sticky-heading> here    │     its sticky heading sits at the
│                                    │     same y as the page heading was
├────────────────────────────────────┤  ← pin line (sticky top)
│ page <sticky-heading> still here   │  ← page-level heading still pinned;
│ but its lower rows are occluded    │     section's bg paints over it
│ by section #2's bg                 │     from the bottom up
├────────────────────────────────────┤  ← section #2's top edge
│ previous content / gap             │
└────────────────────────────────────┘
```

When the section's top edge passes the pin row, the crossover happens one pixel row at a time. The user perceives a single heading whose color (or text) changes from bottom to top.

---

## Output Structure

```
/                                     ← repo root (Astro app)
├── package.json                       (MODIFY — add `workspaces: ["packages/*"]`)
├── packages/
│   └── sticky-heading/                (NEW)
│       ├── package.json               (NEW — minimal)
│       ├── tsconfig.json              (NEW — extends root strict)
│       ├── README.md                  (NEW — usage example, alignment notes)
│       └── src/
│           ├── index.ts               (NEW — registers <sticky-heading>)
│           └── styles.css             (NEW — structural sticky rules)
└── src/
    └── pages/
        └── sticky-heading/
            └── index.astro            (NEW — demo page)
```

---

## Implementation Units

### U1. Workspace + package scaffold + element registration + structural CSS

**Goal:** Convert the repo to a Bun workspace, scaffold the package, define and register the `<sticky-heading>` custom element, ship the structural stylesheet.

**Requirements:** R1, R2, R3, R8, R9.

**Dependencies:** none.

**Files:**
- `package.json` (modify — add `workspaces: ["packages/*"]`)
- `packages/sticky-heading/package.json` (new)
- `packages/sticky-heading/tsconfig.json` (new)
- `packages/sticky-heading/README.md` (new — placeholder, finalized in U3)
- `packages/sticky-heading/src/index.ts` (new — defines + registers the element)
- `packages/sticky-heading/src/styles.css` (new)

**Approach:**
- Root `package.json`: add `"workspaces": ["packages/*"]`.
- `packages/sticky-heading/package.json`: name `@whois/sticky-heading` (placeholder), `private: true`, `type: "module"`, `exports: { ".": "./src/index.ts", "./styles.css": "./src/styles.css" }`.
- `tsconfig.json`: extend `astro/tsconfigs/strict`; `lib: ["ES2022", "DOM"]`.
- `index.ts`: a `StickyHeadingElement` class extending `HTMLElement` with no body (empty class). At module top level, guard-register: `if (!customElements.get('sticky-heading')) customElements.define('sticky-heading', StickyHeadingElement);`. Top-of-file block comment explains the no-behavior intent.
- `styles.css`:
  ```css
  sticky-heading {
    display: block;
    position: sticky;
    top: var(--sticky-heading-top, 0);
  }
  ```
  That's the entire stylesheet.

**Patterns to follow:** Existing Astro source uses tabs, double quotes, top-of-file block comments. Standard custom-element registration pattern (see MDN's Web Components guide). Light DOM only; no shadow root.

**Test scenarios:**
- `bun install` succeeds; the workspace resolves.
- The Astro app at root continues to build (`bun run build`).
- Importing `@whois/sticky-heading` from a test file registers the element (verify via `customElements.get('sticky-heading')` returning the class).
- Re-importing the module a second time does not throw.
- A `<sticky-heading>` rendered in the DOM upgrades to `StickyHeadingElement` (verify via `instanceof`).
- Slotted children render in the document tree (Light DOM) and are queryable from outside the element.
- Computed `position` on a `<sticky-heading>` is `sticky` after the stylesheet is applied.
- Setting `--sticky-heading-top: 64px` on a parent and reading the element's computed `top` returns `64px`.

**Verification:** Tests pass under jsdom (jsdom supports custom elements and applies CSS).

---

### U2. Demo page

**Goal:** An Astro page that uses `<sticky-heading>` at the top of the page and inside three scrolling sections, demonstrating the rising-curtain effect with consumer-side CSS handling typography (via shared class) and per-section color (via section-specific selectors).

**Requirements:** R4, R5, R6, R7.

**Dependencies:** U1.

**Files:**
- `src/pages/sticky-heading/index.astro` (new)

**Approach:**
- Page imports `@whois/sticky-heading` (registers the element on import) and `@whois/sticky-heading/styles.css` (applies the structural sticky rules).
- Sets `--sticky-heading-top: 1rem` on the page root via the page's `<style>` block.
- Page structure:
  - A sticky `<header>` containing `<sticky-heading class="page-heading">Hi, I'm Tristan.</sticky-heading>`
  - Three sections in `<main>`, each containing the same component:
    - Section 1 (same color as the anchor) — the "invisible" mode
    - Section 2 (different color) — the color-shift mode
    - Section 3 (different text) — the word-changes mode
- The page's own `<style>` block:
  - `.page-heading` sets shared typography (font, size, weight, line-height) for all instances
  - `.section--1 .page-heading` matches the page-root color (invisible swap)
  - `.section--2 .page-heading` uses a different color
  - `.section--3` carries different slotted text already; no color override needed
  - Each section has a non-transparent background color and matching horizontal padding/max-width to the header
  - Sections have `min-height: 100vh` and a generous gap so the page-level heading is fully visible between them

**Patterns to follow:** Existing `src/pages/index.astro` uses `<main class="container">` with global tokens from `src/styles/global.css`. The demo page uses the same container/grid conventions.

**Test scenarios:**
- `bun run dev` serves the demo at `/sticky-heading/` without errors.
- Page loads with the page-level heading visible at the top.
- Scrolling section 1 over the page heading produces NO visible change (same color, same text — invisible swap).
- Scrolling section 2 over the page heading: the heading's color shifts to section 2's color one pixel row at a time as the section's top crosses the pin row.
- Scrolling section 3 over the page heading: the text changes from "Hi, I'm Tristan." to "Section three." one row at a time.
- Reverse-scrolling produces the inverse effect.
- View-source confirms the static HTML contains the actual heading text in each instance (no JS-generated DOM, no auto-cloning).
- No console errors, no warnings.

**Verification:** Manual scroll-through in Chrome and Firefox; record a quick screen capture.

---

### U3. README

**Goal:** Document the component for a drop-in consumer.

**Requirements:** R4, R6, R7.

**Dependencies:** U1, U2.

**Files:**
- `packages/sticky-heading/README.md` (modify — finalize)

**Approach:**
- README sections:
  - **What it is** — one paragraph: a custom element that, when used multiple times on a page, produces a sticky-reveal "rising curtain" effect via pure CSS.
  - **Quick start** — minimal example: import the JS, import the CSS, drop `<sticky-heading class="page-heading">…</sticky-heading>` at the top of the page and once inside each section. One CSS class on every instance for typography matching. Done.
  - **Per-instance color** — a one-paragraph note: use standard CSS to target `.your-class` inside each section to vary color. The component does not manage color.
  - **Section backgrounds** — a one-paragraph note: for the rising-curtain effect to be visible, sections need a non-transparent background. A transparent section just stacks the per-section heading over the page-level heading, which is valid but doesn't produce the effect.
  - **The single CSS variable** — `--sticky-heading-top` (default `0`). Set on the page root or on each instance to control the sticky offset.
  - **Browser support** — Baseline custom elements + `position: sticky`; works in current Chrome, Firefox, Safari with no flags.
  - **What this is not** — no React/Vue/Svelte adapter (custom elements work natively); no scroll-progress reveal; no opacity transition; no auto-cloning of heading text.
- Total length target: under one screen of markdown when viewed in a typical IDE preview.

**Test scenarios:**
- README renders cleanly when previewed (no broken links, no malformed code blocks).
- The Quick Start section's example, copied verbatim into a fresh Astro page, produces a working rising-curtain effect.

**Verification:** README review; quick-start verification by copy-paste into a scratch Astro page.

---

## Scope Boundaries

### In scope
- One custom element (`<sticky-heading>`) with structural CSS.
- Pure CSS sticky positioning; zero runtime JS.
- Bun workspace conversion (source-only, no build).
- Astro demo page exercising three modes.
- README under one screen.

### Deferred to Follow-Up Work
- npm publish — defer until a publish need exists.
- React/Vue/Svelte adapter components — custom elements work natively in those frameworks.
- Multi-anchor coordination, auto-cloning, accent attributes.

### Outside this product's identity
- A general-purpose scroll animation framework. This package does ONE thing: a sticky-reveal heading via pure CSS sticky composition.

---

## Risks & Dependencies

### D1. Sticky containing-block silent failure
`position: sticky` silently stops working if any ancestor has `overflow: hidden|auto|scroll|clip`, `transform`, `filter`, or `perspective`. Consumers may unwittingly wrap an instance in such an ancestor.

**Mitigation:** README mentions the constraint once. The component cannot detect this at runtime; CSS sticky failure is silent by spec.

### D2. Transparent section produces stacked appearance
If a section has no background color, the section's heading instance and the page-level heading both render at the same coordinates simultaneously. R6 documents this as valid-but-unusual usage.

**Mitigation:** README's "Section backgrounds" note. No runtime check.

### D3. Custom-element registration timing
A consumer who imports the package after document parse may see a brief flash of the element before it upgrades. Standard custom-element timing.

**Mitigation:** README recommends importing in the page's frontmatter (Astro) or in the `<head>` for plain HTML.

---

## Open Questions

- **Final package name.** `@whois/sticky-heading` is a placeholder. **Default tilt:** scoped to `@whois`, `private: true` until publish is needed.
- **Tag name.** `<sticky-heading>` is concise. A vendor prefix (`<wt-sticky-heading>`) would prevent collision with future site-level custom elements but is optional. **Default tilt:** no prefix initially.

---

## Sources & Research

- **External research (best-practices):** Custom elements are Baseline-supported across modern browsers; Light DOM is appropriate when the element should defer styling to slotted children; `position: sticky` is Baseline. Sources: MDN Web Components guide, MDN `position: sticky`.
- **Repo state:** Astro 6.4.8 single-app site; Bun toolchain; no React; the simplified site at the root (`Layout.astro` + `global.css` + `Section.astro` variant system) is the canonical baseline.
- **Origin:** This plan supersedes the prior iteration that proposed a two-element design (`<sticky-anchor>` + `<sticky-reveal>`) with a documented alignment contract. The user clarified during review that the effect should be a single drop-in component; typography matching happens via standard CSS classes, not component-specific contracts; and the component should be color-agnostic. This plan reflects those clarifications.
