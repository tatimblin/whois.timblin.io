---
title: "feat: Scroll-driven section framework for homepage"
type: feat
created: 2026-06-19
deepened: 2026-06-19
status: ready
---

# feat: Scroll-driven section framework for homepage

## Summary

Build a layered scroll-driven section framework on the Astro homepage. The architecture separates a stable **framework core** (a CSS variable contract + a viewport-bound progress driver + a JS fallback) from a set of **primitives** (each a self-contained CSS module that reads the contract). Sections opt into primitives individually via boolean props. Future primitives — parallax, slide-in, fade-up, etc. — drop in as new modules without modifying any existing file. The deliverable proves the framework with a small set of demo sections (lorem ipsum + colored rectangles).

**Terminology.** The page heading uses `position: sticky` throughout. "Sticky" refers to the CSS mechanism. "Shrunk" refers to the post-trigger visual state. "Pin" / "pinned" refers to the configured trigger point at which the heading transitions to its shrunk state. "Fixed" is not used (the page heading does not use `position: fixed`).

---

## Problem Frame

The current homepage is the default Astro 6 scaffold (`Welcome.astro`). There is no homepage content, no scroll behavior, and no reusable section primitive. We need a foundation that nails the scroll choreography first so adding real sections later is trivial — and, critically, that supports adding *new kinds* of scroll primitives later without rewriting the framework.

The user's modularity goals, stated explicitly:

1. Use any subset of the available primitives on any section in any order.
2. Add new primitives in the future as additive work — each primitive should be a self-contained module with no edits to other primitives, the controller, or the Section component beyond a single boolean prop and a single data attribute.

The initial primitive set:

- **Page heading shrink-and-pin.** A page-level sticky heading that, at a configured scroll point, shrinks and pins to the top so subsequent sections render *behind* it instead of *over* it.
- **Section heading clip-swap (wipe).** An opt-in, single-element heading wipe that overlays and visually recolors the page heading as the section enters. Decoupled from "having a heading slot" — sections without `wipe` opt-in render their slotted heading in-flow.
- **Full-bleed expand.** An opt-in animation from grid-width to viewport-width on scroll-in, collapsing back on scroll-past.

The deliverable proves the framework with placeholder content — there is no real homepage copy in this plan.

---

## Requirements

### Framework core (R1–R5)

- **R1.** A registered-property contract documents the only stable variable inputs primitives may consume: `--scroll-progress` (per `[data-section]` element, `<number>`, 0..1) and `--shrink` (on the page heading element, `<number>`, 0..1, written by sentinels). Primitives MUST NOT consume any other framework variable; they MAY register their own output properties.
- **R2.** A shared scroll controller. In browsers with native CSS scroll-driven animations (`@supports (animation-timeline: view())`), the controller short-circuits and native CSS drives every variable. In browsers without, the controller (a) feature-detects, (b) discovers `[data-section]` elements and `[data-scroll-sentinel]` elements at module load, (c) walks a primitive registry to know which data attributes correspond to which output variables and timeline ranges, (d) writes the appropriate variables on each visible element per frame.
- **R3.** A primitive registry pattern. Each primitive registers itself by name with: an opt-in data-attribute selector, an output variable name, an `@property` registration, and a scroll-timeline range. The controller iterates the registry; it does not know any primitive name at compile time.
- **R4.** `prefers-reduced-motion: reduce` collapses every animation to a static end-state. The framework core publishes one rule (`* { animation-timeline: none !important }`); each primitive contributes its own end-state snap value.
- **R5.** No new runtime dependencies. Plain Astro 6 + TypeScript + CSS.

### Section component (R6–R8)

- **R6.** `<Section>` accepts a slotted heading and a slotted body; takes typed boolean props for each primitive opt-in (`wipe`, `expand`, `pinHeadingAfter`, plus future primitive names); writes corresponding `data-*` attributes on its root `<section>` element.
- **R7.** A section without `wipe` renders its slotted heading as ordinary in-flow content. A section with `wipe` renders its slotted heading inside an overlay wrapper that absolutely positions during the wipe window and detaches after. This decouples "I have a heading slot" from "I want a wipe."
- **R8.** A section with `pinHeadingAfter` renders its own `[data-scroll-sentinel="page-heading-shrink"]` immediately above its content as part of the component output — not as a hand-authored sibling in the page. This closes the encapsulation gap: setting the prop is sufficient.

### Primitives (R9–R12)

- **R9.** **Page-heading-shrink primitive.** A self-contained module; reads `--shrink` and animates `font-size`, `padding`, `color`, and `backdrop` on the page heading. Can be removed by deleting one CSS file + one TS registration without affecting other primitives.
- **R10.** **Wipe primitive.** A self-contained module; reads `--scroll-progress` of the parent section, derives `--wipe`, applies `clip-path: inset(0 var(--wipe) 0 0)` to the section heading overlay. Independent of expand and shrink.
- **R11.** **Expand primitive.** A self-contained module; reads `--scroll-progress` of the parent section, derives `--bleed`, animates `width`, `margin-inline`, `border-radius`. Independent of wipe and shrink.
- **R12.** Composability. Any combination of primitive opt-ins on any section in any order MUST work. Specifically: `wipe + expand`, `wipe + pinHeadingAfter`, `expand + pinHeadingAfter`, all three together, none of them, and any ordering of sections including the sentinel position.

### Demo and qualities (R13–R15)

- **R13.** Demo: at least five sections in `index.astro` exercising the combinatorial matrix — plain, wipe-only, expand-only, wipe+expand, and one with `pinHeadingAfter` — with lorem ipsum body content and colored rectangles to make scroll positions visible. Each section is a `<Section>` instance authored using only props; no hand-authored sentinels, no hand-authored timeline-scope wiring.
- **R14.** Cross-browser baseline: current Chrome, Firefox, Safari. Native CSS scroll-driven animations where supported; JS fallback otherwise. Both paths produce visually equivalent output (within timing-formula tolerance).
- **R15.** Framework / demo separation. Deleting all files under `src/site/` (demo content, demo tokens, demo `index.astro`) leaves a clean, working framework under `src/framework/scroll/`. No framework file references demo content.

### Out of scope

- Real homepage content (copy, imagery, links).
- Routing or additional pages.
- Design system or theming primitives beyond a small set of demo tokens.
- Server-rendered content collections.
- Mobile-first responsive polish beyond ensuring the framework doesn't break on narrow viewports.
- Performance optimization beyond passive scroll listeners and IO gating.
- Dynamic section addition after initial mount (controller scans on load only — documented limitation).
- View transitions / `<ClientRouter />` integration.

---

## Key Technical Decisions

### KTD1. Hybrid animation engine: native CSS + JS fallback with primitive registry

Native engine: `animation-timeline: view()` referencing `view-timeline-name: --section` declared on each `<section>` root. Primitives bind to `--section` from inside the section subtree (descendant resolution — no `timeline-scope` enumeration required). The page-heading-shrink primitive is the one cross-element case: the sentinel declares `view-timeline-name: --shrink` and the page heading consumes `animation-timeline: --shrink` from a sibling, which is resolved via a single `timeline-scope: --shrink` declared on the static layout root (`<body>` or a layout wrapper). This is one fixed declaration in `Layout.astro` — adding sections does NOT extend it.

Fallback engine: `src/framework/scroll/controller.ts` runs only when `CSS.supports('animation-timeline: view()')` returns false. The controller maintains a primitive registry (populated at module load by each primitive's `.ts` file) and walks it generically. Adding a new primitive does not require editing the controller.

**Why:** Native runs on the compositor (zero main-thread cost). The fallback is open-for-extension via the registry. Avoids GSAP and bundle weight. (Per round-1 research: Chrome 115+, Safari 26 fall 2025; Firefox flag-gated as of mid-2026.)

### KTD2. Layered file architecture: framework / site / demo

```
src/
├── framework/scroll/                        ← STABLE FRAMEWORK
│   ├── core.css                             (registered properties contract, reduced-motion baseline, layout-root timeline-scope)
│   ├── controller.ts                        (feature-detect, IO+rAF, primitive registry walk)
│   ├── registry.ts                          (registerPrimitive() API + types)
│   └── primitives/
│       ├── wipe.css                         (registers --wipe, applies via [data-wipe])
│       ├── wipe.ts                          (registers in JS fallback)
│       ├── expand.css                       (registers --bleed, applies via [data-expand])
│       ├── expand.ts
│       ├── page-heading-shrink.css          (registers --shrink, applies via [data-page-heading])
│       └── page-heading-shrink.ts
├── components/                              ← FRAMEWORK CONSUMERS (stable)
│   ├── Section.astro                        (generic primitive consumer; takes prop per primitive, writes data attribute)
│   └── PageHeading.astro                    (page chrome; reads --shrink)
└── site/                                    ← DEMO (deletable)
    ├── tokens.css                           (demo accent colors, demo grid sizing)
    └── index.astro                          (demo page; lives at src/pages/index.astro via re-export or direct authoring)
```

Demo accent colors and demo grid sizing live in `src/site/tokens.css` — never in `src/framework/scroll/`. Deleting `src/site/` and the page entrypoint leaves a clean framework.

**Why:** Direct answer to the user's modularity question. The framework / site boundary is documented in code structure, not just in prose.

### KTD3. Primitive registry — open-for-extension JS fallback

```ts
// registry.ts (directional, not implementation)
export type Primitive = {
  name: string;                     // "wipe"
  attribute: string;                // "data-wipe"
  variable: string;                 // "--wipe"
  initialValue: string;             // "100%"
  range: ScrollRange;               // describes mapping from section's view() progress to variable value
  reducedMotionValue: string;       // "0%"
};
export type ScrollRange = { from: RangeBoundary; to: RangeBoundary };
// RangeBoundary mirrors CSS `animation-range` semantics: { phase: "entry"|"contain"|"exit"|"cover", percent: number }.

export const primitives: Primitive[] = [];
export function registerPrimitive(p: Primitive): void { primitives.push(p); }
```

Each primitive's `.ts` calls `registerPrimitive(...)` at module load. The controller's per-frame loop, for each visible section, iterates `primitives`; for each primitive whose `attribute` is present on the section, computes `mapProgress(viewProgress, primitive.range)` and writes the result to `primitive.variable` via `style.setProperty`. Adding a new primitive: drop a `.ts` file in `primitives/`, import it in `controller.ts`'s entry list (single-line addition), done.

**Why:** Closes the round-2 finding that the JS fallback is hardcoded to four variables. New primitives extend the registry, never modify the controller.

### KTD4. Section component — generic, primitive-agnostic

`Section.astro` knows about prop names but not primitive *behavior*. It takes a typed Props interface that maps boolean opt-ins to data attributes:

```astro
---
interface Props {
  id: string;
  accentColor?: string;
  wipe?: boolean;             // primitive opt-in
  expand?: boolean;           // primitive opt-in
  pinHeadingAfter?: boolean;  // primitive opt-in (also emits a sentinel)
}
const { id, accentColor, wipe, expand, pinHeadingAfter } = Astro.props;
---

{pinHeadingAfter && (
  <div data-scroll-sentinel="page-heading-shrink" style="view-timeline-name: --shrink"></div>
)}

<section
  id={id}
  data-section
  data-wipe={wipe ? '' : null}
  data-expand={expand ? '' : null}
  data-pin-heading-after={pinHeadingAfter ? '' : null}
  style={`--section-accent: ${accentColor ?? 'currentColor'}; view-timeline-name: --section;`}
>
  {wipe ? (
    <div class="section-heading-overlay" aria-hidden="true">
      <slot name="heading" />
    </div>
  ) : (
    <slot name="heading" />
  )}
  <div class="section-body"><slot /></div>
</section>
```

When `wipe` is false (default), the slotted heading renders in-flow. When `wipe` is true, the heading slot is wrapped in `.section-heading-overlay` (positioned absolutely, aria-hidden); the wipe primitive's CSS targets `[data-wipe] .section-heading-overlay`.

The `pinHeadingAfter` prop emits its own sentinel — no hand-authoring. Adding a new primitive: add one boolean prop and one conditional data attribute; the rest lives in the primitive's CSS/TS files.

**Why:** Closes the ghost-prop finding (`pinHeadingAfter` previously did nothing). Closes the wipe-coupling finding (heading slot is no longer mandatorily an overlay). The Section component stays small and primitive-agnostic.

### KTD5. Single-element wipe via `background-clip: text` + `clip-path: inset()`

The wipe primitive operates on a *single* heading element (no dual layer). The page heading underneath remains a plain element in its base color. The overlay heading uses `background: var(--section-accent); background-clip: text; color: transparent;` and reveals/hides via `clip-path: inset(0 var(--wipe) 0 0)`.

**Why:** True per-glyph anti-aliasing; no subpixel mismatch from stacked `<h2>` elements. Plugs into the same `--scroll-progress` contract.

### KTD6. View-timeline scoping minimized to one fixed declaration

Per-section `view-timeline-name: --section` is referenced *only* from descendants of each section, so descendant resolution is sufficient — no cross-element scoping needed for wipe or expand. The single cross-element case is the page-heading-shrink: a sentinel sibling declares `view-timeline-name: --shrink` and `<PageHeading>` consumes `animation-timeline: --shrink`. This is resolved by one `timeline-scope: --shrink` declared on the layout root in `Layout.astro` — fixed for the lifetime of the project, not extended per section.

**Why:** Closes the "edit Layout.astro every time you add a section" coupling. Adding sections does not modify the layout's timeline-scope; only adding new *cross-element* primitives would (and only if they introduce a new shared timeline name).

### KTD7. `prefers-reduced-motion` strategy: animation-timeline disabled globally; per-primitive snap to end-state

`core.css` publishes `* { animation-timeline: none !important }` under reduced-motion. Each primitive's CSS contributes a snap value for its output variable (e.g., wipe sets `--wipe: 0%`, expand sets `--bleed: 0px`, shrink uses an IO-driven class flip rather than a global snap so the heading is full-size pre-trigger and shrunk post-trigger). The controller's reduced-motion behavior is documented in U4 — it stays running for the page-heading-shrink IO trigger when reduced-motion is on, but skips per-frame variable writes.

**Why:** Resolves the round-1 contradiction where global `--shrink: 1` snapped the heading to permanently-shrunk on initial paint. Each primitive owns its own reduced-motion semantics.

---

## Extension Contract: How to Add a New Primitive

This section documents the recipe an implementer follows to add a new primitive (e.g., `parallax`, `fadeUp`, `slideIn`) to the framework. The recipe MUST work without modifying any existing primitive, the controller, the registry, or the demo.

**The full surface area of a new primitive:**

1. **Create `src/framework/scroll/primitives/<name>.css`.** This file:
   - Registers its output variable via `@property` (with type and initial value).
   - Defines keyframes that consume the variable.
   - Applies the keyframes via the attribute selector `[data-<name>]` (or for cross-element primitives, the appropriate target selector).
   - Adds the reduced-motion snap value for its variable inside `@media (prefers-reduced-motion: reduce)`.

2. **Create `src/framework/scroll/primitives/<name>.ts`.** This file:
   - Imports `registerPrimitive` from `../registry.ts`.
   - Calls `registerPrimitive({ name, attribute, variable, initialValue, range, reducedMotionValue })` at module top level.

3. **Add one line to `src/framework/scroll/controller.ts`'s primitive-import list** (e.g., `import './primitives/<name>';`). This registers the primitive in both engines (native and JS fallback): the CSS module is loaded by the same `.ts` import chain.

4. **Add one boolean prop to `src/components/Section.astro`'s `Props` interface** (e.g., `parallax?: boolean`).

5. **Add one conditional data attribute to `Section.astro`'s rendered `<section>`** (e.g., `data-parallax={parallax ? '' : null}`).

6. **(Optional)** If the primitive needs DOM scaffolding inside the section (like wipe's `.section-heading-overlay`), add a conditional render block in `Section.astro` keyed off the same prop. Most primitives won't need this.

**Forbidden:** modifying any existing primitive's `.css` or `.ts`; modifying the controller's per-frame loop; modifying the registry's data shape; modifying any other section's behavior.

**Cross-element primitives** (those that, like page-heading-shrink, drive a variable on an element outside the section) MUST emit a sentinel via `data-scroll-sentinel="<name>"` and rely on the layout-root's `timeline-scope` only if they need a shared timeline name. New shared timeline names require a one-line addition to the layout root's `timeline-scope` and are noted as the only framework-level edit a cross-element primitive may require.

**Worked example: adding `fadeUp`.**

```css
/* src/framework/scroll/primitives/fade-up.css */
@property --fade-up-progress { syntax: "<number>"; inherits: false; initial-value: 0; }
[data-fade-up] {
  view-timeline-name: --section;
  animation: fade-up linear both;
  animation-timeline: --section;
  animation-range: entry 0% entry 100%;
  opacity: var(--fade-up-progress);
  transform: translateY(calc((1 - var(--fade-up-progress)) * 24px));
}
@keyframes fade-up { to { --fade-up-progress: 1; } }
@media (prefers-reduced-motion: reduce) {
  [data-fade-up] { --fade-up-progress: 1; transform: none; }
}
```

```ts
// src/framework/scroll/primitives/fade-up.ts
import { registerPrimitive } from '../registry';
import './fade-up.css';
registerPrimitive({
  name: 'fadeUp',
  attribute: 'data-fade-up',
  variable: '--fade-up-progress',
  initialValue: '0',
  range: { from: { phase: 'entry', percent: 0 }, to: { phase: 'entry', percent: 100 } },
  reducedMotionValue: '1',
});
```

Then: `import './primitives/fade-up';` in `controller.ts`; add `fadeUp?: boolean` and `data-fade-up={fadeUp ? '' : null}` in `Section.astro`. Done — no other files touched.

---

## High-Level Technical Design

### Layered architecture

```
┌───────────────────────────────────────────────────────────────┐
│ Site / Demo (src/site, src/pages/index.astro)                 │
│   Demo accent colors, lorem ipsum, demo Section authoring     │
└──────────────────────────┬────────────────────────────────────┘
                           │ consumes
┌──────────────────────────▼────────────────────────────────────┐
│ Components (src/components/Section.astro, PageHeading.astro)  │
│   Generic primitive opt-in props → data attributes            │
│   pinHeadingAfter emits its own sentinel                      │
└──────────────────────────┬────────────────────────────────────┘
                           │ consumes
┌──────────────────────────▼────────────────────────────────────┐
│ Primitives (src/framework/scroll/primitives/*.{css,ts})       │
│   wipe, expand, page-heading-shrink                           │
│   each: one .css module + one .ts registration                │
│   each consumes --scroll-progress (or its own sentinel)       │
└──────────────────────────┬────────────────────────────────────┘
                           │ binds to
┌──────────────────────────▼────────────────────────────────────┐
│ Framework Core (src/framework/scroll/{core.css, controller.ts,│
│                                       registry.ts})           │
│   @property --scroll-progress + --shrink contract             │
│   reduced-motion baseline                                     │
│   primitive registry + controller (JS fallback)               │
│   layout-root timeline-scope: --shrink                        │
└───────────────────────────────────────────────────────────────┘
```

### Per-section progress contract

The framework exposes exactly one variable to primitives that operate on a section:

- `--scroll-progress: 0..1` per `[data-section]` element.

In the native engine, the section root declares `view-timeline-name: --section`; primitive CSS resolves `animation-timeline: --section` from inside the section's subtree (descendant resolution; no `timeline-scope` enumeration). In the JS fallback, the controller writes `--scroll-progress` directly via `style.setProperty`, then primitive CSS reads it via `var(--scroll-progress)`.

For cross-element primitives (currently only page-heading-shrink), a sentinel exposes its own named timeline; the consuming element resolves it via `timeline-scope` declared on the layout root.

### Composition diagram

```
<body>
  <div class="layout-root" style="timeline-scope: --shrink">
    <PageHeading />                            ← consumes --shrink (animation-timeline: --shrink)
    <main>
      <Section id="intro">                     ← plain
        <h2 slot="heading">…</h2>              ← in-flow
        <div slot>…</div>
      </Section>
      <Section id="work" wipe expand>          ← wipe + expand
        <h2 slot="heading">…</h2>              ← inside .section-heading-overlay
        <div slot>…</div>
      </Section>
      <Section id="about" pinHeadingAfter>     ← emits sentinel → triggers --shrink
        <div data-scroll-sentinel="page-heading-shrink"
             style="view-timeline-name: --shrink"></div>
        <h2 slot="heading">…</h2>              ← in-flow
        <div slot>…</div>
      </Section>
      <Section id="contact" expand>            ← expand only; renders behind shrunk heading
        <h2 slot="heading">…</h2>
        <div slot>…</div>
      </Section>
    </main>
    <script>import '/src/framework/scroll/controller.ts';</script>
  </div>
</body>
```

### Scroll choreography (timeline view)

```
viewport top
│
│  [ Page heading: sticky, large ]   ← pre-shrink state
│
│  ─ Section 1 (plain) ─
│  Heading scrolls in-flow with section body.
│
│  ─ Section 2 (wipe + expand) ─
│  Section heading wipes over page heading (clip-path 100%→0%)
│  Section width grows grid → 100vw, radius shrinks
│  Reverses on exit.
│
│  ─ Section 3 (pinHeadingAfter) ─
│  Sentinel triggers --shrink on PageHeading: shrunk + pinned.
│  Heading renders in-flow (no wipe opt-in).
│
│  ─ Section 4 (expand only), behind shrunk heading ─
│  Width grows grid → 100vw; heading scrolls in-flow.
│
viewport bottom
```

---

## Output Structure

```
src/
├── framework/
│   └── scroll/
│       ├── core.css                              (NEW — @property contract, reduced-motion, timeline-scope)
│       ├── controller.ts                         (NEW — feature-detect, IO+rAF, registry walk)
│       ├── registry.ts                           (NEW — registerPrimitive() API + types)
│       └── primitives/
│           ├── wipe.css                          (NEW)
│           ├── wipe.ts                           (NEW)
│           ├── expand.css                        (NEW)
│           ├── expand.ts                         (NEW)
│           ├── page-heading-shrink.css           (NEW)
│           └── page-heading-shrink.ts            (NEW)
├── components/
│   ├── PageHeading.astro                         (NEW)
│   ├── Section.astro                             (NEW)
│   └── Welcome.astro                             (DELETE)
├── layouts/
│   └── Layout.astro                              (MODIFY — render PageHeading + main, set timeline-scope on layout-root, drop body height: 100%, import controller)
├── pages/
│   └── index.astro                               (REWRITE — demo)
├── site/
│   └── tokens.css                                (NEW — demo accent colors, demo grid sizing)
└── assets/
    ├── astro.svg                                 (DELETE)
    └── background.svg                            (DELETE)
```

The split is the contract: `src/framework/scroll/` is stable; `src/components/` is stable but consumes the framework; `src/site/`, `src/pages/index.astro`, and demo accent colors are deletable without breaking the framework.

---

## Implementation Units

### U1. Framework core: contract, registry, reduced-motion baseline

**Goal:** Establish the stable framework surface that every primitive consumes.

**Requirements:** R1, R3, R4, R5.

**Dependencies:** none.

**Files:**
- `src/framework/scroll/core.css` (new)
- `src/framework/scroll/registry.ts` (new)
- `src/layouts/Layout.astro` (modify — link `core.css`, declare `timeline-scope: --shrink` on the layout-root wrapper, remove the existing `html, body { height: 100% }` rule because it clamps the document scroller and blocks sticky/scroll-driven behavior)

**Approach:**
- `core.css`:
  - Register `--scroll-progress` (`<number>`, initial `0`) and `--shrink` (`<number>`, initial `0`) via `@property`. These are the framework's only contract variables; primitives register their own outputs in their own files.
  - Layout tokens: `--grid-max-width`, `--grid-padding-inline`, `--default-radius`. These are framework-neutral structural tokens, not demo accent values.
  - Reduced-motion baseline: `@media (prefers-reduced-motion: reduce) { * { animation-timeline: none !important; } }`. Per-primitive snap values live in primitive CSS files (KTD7).
- `registry.ts`:
  - Export `Primitive` and `ScrollRange` types per KTD3.
  - Export `registerPrimitive(p: Primitive): void` and `primitives: Primitive[]`.
  - Export `mapProgress(viewProgress: number, range: ScrollRange): number` — maps the section's 0..1 view progress to a 0..1 progress over the primitive's declared range (mirroring native `animation-range` semantics).
- `Layout.astro` modifications:
  - Wrap `<slot />` in `<div class="layout-root" style="timeline-scope: --shrink">` (or apply on `<body>` directly).
  - Remove `html, body { height: 100% }`. Keep `margin: 0` and `width: 100%`.
  - Add `<link rel="stylesheet" href={...core.css} />` or import `core.css` from a layout-imported `.ts` (Astro idiom).

**Patterns to follow:** Astro 6 styling guide; `@property` registration from research digest. Don't put `<style is:global>` inside components.

**Test scenarios:**
- DevTools shows `--scroll-progress` and `--shrink` registered with correct types and initial values on the layout root.
- Toggling `prefers-reduced-motion` in DevTools sets `animation-timeline: none` site-wide.
- `timeline-scope: --shrink` is present on the layout-root wrapper in computed styles.
- `body` does not have `height: 100%` after the modification.

**Verification:** `bun dev` runs without errors; computed styles confirm registration; sticky elements would no longer be clamped by an ancestor `height: 100%`.

---

### U2. Section component: generic primitive consumer

**Goal:** A primitive-agnostic Section that takes one boolean prop per primitive and writes data attributes. Section knows no primitive *behavior*; only prop-to-attribute plumbing.

**Requirements:** R6, R7, R8.

**Dependencies:** U1.

**Files:**
- `src/components/Section.astro` (new)

**Approach:**
- `Props` interface: `id: string`, `accentColor?: string`, `wipe?: boolean`, `expand?: boolean`, `pinHeadingAfter?: boolean`. (Future primitives add one optional boolean each.)
- Render a sentinel `<div data-scroll-sentinel="page-heading-shrink" style="view-timeline-name: --shrink"></div>` immediately above the `<section>` root *only* when `pinHeadingAfter` is set. This closes the ghost-prop gap — setting the prop is the entire authoring API.
- Render `<section>` root with: `id`, `data-section`, `data-wipe`/`data-expand`/`data-pin-heading-after` (each `''` when set, `null` to omit), inline `style` carrying `--section-accent` and `view-timeline-name: --section`.
- Two slots:
  - `heading` slot (named): when `wipe` is set, wrap the slot in `<div class="section-heading-overlay" aria-hidden="true">`. When `wipe` is unset, render the slot as ordinary in-flow content. This is the only place Section knows about a primitive's DOM scaffolding; it's keyed off one prop and could be lifted into the wipe primitive's own component if more flexibility is needed later.
  - default slot for body, wrapped in `<div class="section-body">`.
- Scoped `<style>` block uses `:global(:where(h1, h2, h3))` only to give slotted headings the section accent color with zero specificity. No primitive-specific styles.

**Patterns to follow:** Astro 6 component guide; `null` to omit data attributes, `''` to render valueless. Don't use `is:global` on the component's `<style>`.

**Test scenarios:**
- `<Section id="x">` with no primitive props: rendered `<section>` has `data-section`, `view-timeline-name: --section`, no other primitive data attributes; slotted `<h2 slot="heading">` renders in-flow (not wrapped in overlay).
- `<Section id="x" wipe>`: slotted heading is wrapped in `.section-heading-overlay` with `aria-hidden="true"`; `data-wipe=""` present.
- `<Section id="x" expand>`: `data-expand=""` present; heading still in-flow (no overlay).
- `<Section id="x" pinHeadingAfter>`: sentinel `<div data-scroll-sentinel="page-heading-shrink">` is rendered immediately above `<section>`; `data-pin-heading-after=""` is on the section root.
- `<Section id="x" wipe expand pinHeadingAfter>`: all three data attributes present; sentinel rendered; heading wrapped in overlay.
- `accentColor="#ff0066"`: appears as `style="--section-accent: #ff0066"`.

**Verification:** Component renders correctly in isolation across the matrix; DOM inspector confirms each prop combination produces the documented output.

---

### U3. PageHeading component: page chrome consuming `--shrink`

**Goal:** The page-level sticky heading. Consumes the `--shrink` variable but doesn't define how shrink animates — that's the page-heading-shrink primitive's job.

**Requirements:** R6 (consumer side), R14.

**Dependencies:** U1.

**Files:**
- `src/components/PageHeading.astro` (new)
- `src/layouts/Layout.astro` (modify — render `<PageHeading />` above `<main>` slot)

**Approach:**
- Render heading as `position: sticky; top: 0` inside the layout root.
- Component declares its sticky positioning, default size, default font tokens (`--page-heading-top`, `--page-heading-left`, `--page-heading-font-size`, `--page-heading-letter-spacing`) via inline `style` so the wipe primitive can read them.
- Component declares `[data-page-heading]` on its root for the page-heading-shrink primitive's selector to target.
- Single heading element only (no dual layer; KTD5).
- `text-rendering: geometricPrecision` for subpixel stability with the wipe overlay.

**Patterns to follow:** sentinel-driven sticky pattern from research digest. Avoid putting the heading inside any element with `overflow: hidden|clip` or `transform` (see D1).

**Test scenarios:**
- PageHeading renders inside the layout-root above the slot.
- `position: sticky; top: 0` in computed styles.
- `[data-page-heading]` present on the root element.
- Page-heading positioning/typography custom properties exposed for downstream primitives to read.

**Verification:** Visual confirmation; sticky behavior holds during scroll without any primitive yet attached.

---

### U4. Scroll controller: feature-detect, IO+rAF, registry walk

**Goal:** The single shared controller that drives the JS fallback. Open-for-extension via the primitive registry — adding a new primitive does not require editing this file (other than one import line).

**Requirements:** R2, R3, R5.

**Dependencies:** U1.

**Files:**
- `src/framework/scroll/controller.ts` (new)
- `src/layouts/Layout.astro` (modify — import controller via `<script>import '../framework/scroll/controller';</script>`)

**Approach:**
- Single import block at the top: `import './primitives/wipe'; import './primitives/expand'; import './primitives/page-heading-shrink';` — and that's the entire set of edits required to add a new primitive.
- Feature-detect: `if (CSS.supports('animation-timeline: view()')) return;` — bail in browsers with native support.
- Discover `[data-section]` and `[data-scroll-sentinel]` elements at module load.
- For each section, compute `viewProgress` per frame:
  - `viewProgress = clamp01((innerHeight - rect.top) / (innerHeight + rect.height))` — but this is the whole-traversal formula. The native engine uses `animation-range` (e.g., `entry 50% cover 50%`) which is per-range. The fallback must reproduce that mapping.
  - For each registered primitive whose `attribute` is present on the section, compute `mapProgress(viewProgress, primitive.range)` and `el.style.setProperty(primitive.variable, formatValue(progress, primitive.initialValue))`.
- For each sentinel with `data-scroll-sentinel="page-heading-shrink"`, compute progress over its view-timeline range and write `--shrink` on the page heading element (selected via `[data-page-heading]`).
- IntersectionObserver gates which sections are "live" — only ticking visible sections in the per-frame loop. Sparse thresholds `[0, 0.25, 0.5, 0.75, 1]` and `rootMargin: "20% 0px"`.
- Reduced-motion: skip per-frame writes; let the per-primitive snap values from each primitive's CSS handle the static end-state.

**Patterns to follow:** IO-gated rAF pattern from research digest. Do NOT hardcode primitive names or variable names in the controller.

**Execution note:** Test in a Firefox build (no flag enabled) to validate the fallback path.

**Test scenarios:**
- In a browser without `animation-timeline: view()`, scrolling a section through the viewport monotonically updates `--scroll-progress`-equivalent variables (`--wipe`, `--bleed`) over their respective ranges.
- In a browser *with* native support, the controller bails immediately — confirmed by checking that no `style="--wipe: ..."` is written to elements (the native engine drives keyframes directly).
- Controller's per-frame loop iterates `primitives` from the registry; adding a fourth primitive (e.g., `fadeUp`) by importing it from the controller and adding the prop to `Section.astro` produces fallback support without any controller-loop edit.
- Reduced-motion: controller does not write per-frame variables; primitive CSS reduced-motion snap values handle static end-state.
- Performance: 6 sections × 3 primitives each, scroll remains 60fps in DevTools Performance.
- Adding a `<Section>` after initial mount: documented limitation — controller scans on load only.

**Verification:** Manual cross-browser; DevTools Performance recording; Elements panel shows variables updating during scroll in Firefox; no updates in Chrome with native support.

---

### U9. Page-heading-shrink primitive module

**Goal:** A self-contained CSS+TS module that drives the page heading's shrink-and-pin behavior off a sentinel. Removable by deleting two files.

**Requirements:** R9, R12.

**Dependencies:** U1, U3, U4.

**Files:**
- `src/framework/scroll/primitives/page-heading-shrink.css` (new)
- `src/framework/scroll/primitives/page-heading-shrink.ts` (new)

**Approach:**
- `page-heading-shrink.css`:
  - Register `@property --shrink-progress` (`<number>`, initial `0`). (Note: `--shrink` is the framework-contract variable on `[data-page-heading]`; `--shrink-progress` is this primitive's internal interpolated progress. The primitive writes `--shrink` from `--shrink-progress`.)
  - Define keyframes `@keyframes page-heading-shrink { to { --shrink: 1; } }`.
  - Apply to `[data-page-heading]` with `animation: page-heading-shrink linear both; animation-timeline: --shrink; animation-range: cover 0% cover 100%; animation-fill-mode: both;`.
  - Define visual interpolation: font-size, padding, color, backdrop-filter all derived from `--shrink` via `calc()` and `color-mix()`.
  - Reduced-motion: rely on an IO-driven class flip (controller adds `[data-shrunk]` to the page heading when the user scrolls past the sentinel). The CSS branches on `[data-page-heading][data-shrunk]` for the snap. This preserves the user's stated semantics (full-size pre-trigger, shrunk post-trigger, no animation).
- `page-heading-shrink.ts`:
  - Import CSS module.
  - Import `registerPrimitive` from `../registry`.
  - Register the primitive: `{ name: 'pageHeadingShrink', attribute: 'data-scroll-sentinel="page-heading-shrink"', variable: '--shrink', initialValue: '0', range: { from: 'cover 0%', to: 'cover 100%' }, reducedMotionValue: '1' }`.
  - The controller's IO branch reads sentinels with the matching attribute and writes `--shrink` to `[data-page-heading]`.

**Patterns to follow:** sentinel-driven sticky animations from research digest.

**Test scenarios:**
- Scrolling past the first `pinHeadingAfter` section's sentinel triggers `--shrink` 0→1 on `[data-page-heading]`; visual transitions to small + flush-top + with-backdrop.
- Scrolling back up reverses (bidirectional, since `view()` timelines are bidirectional in their range).
- Reduced-motion: heading is full-size at top of page, snaps to shrunk once past sentinel via class flip.
- Multiple `pinHeadingAfter` sections (R12 composition): controller honors the first one fired (or document explicit single-active constraint); secondary sentinels redundantly write the same variable — no conflict.
- Removing this primitive's two files (and its import line in `controller.ts`) leaves the framework working: PageHeading no longer shrinks but the rest of the page renders correctly.

**Verification:** Visual smoke; DevTools shows `--shrink` interpolating; Firefox fallback matches Chrome native within timing tolerance.

---

### U5. Wipe primitive module

**Goal:** A self-contained CSS+TS module that drives the section heading clip-swap. Decoupled from "every section has a heading" — only sections opted into via `wipe` prop participate.

**Requirements:** R10, R12.

**Dependencies:** U1, U2, U3, U4.

**Files:**
- `src/framework/scroll/primitives/wipe.css` (new)
- `src/framework/scroll/primitives/wipe.ts` (new)

**Approach:**
- `wipe.css`:
  - Register `@property --wipe` (`<percentage>`, initial `100%`).
  - Apply to `[data-wipe] .section-heading-overlay`:
    - Position absolutely at the page heading's coordinates using `--page-heading-top`, `--page-heading-left`, `--page-heading-font-size`, `--page-heading-letter-spacing` (read from PageHeading's exported tokens).
    - During the wipe window, the overlay needs `position: fixed` (or its own sticky band) to track the viewport-pinned page heading. Use `position: fixed; top: var(--page-heading-top); left: var(--page-heading-left)` while the wipe is active; transition to `position: static` once the wipe completes (controller-added class `[data-wipe-detached]` toggles this).
    - `background: var(--section-accent); background-clip: text; -webkit-background-clip: text; color: transparent;`
    - `clip-path: inset(0 var(--wipe) 0 0);`
  - Keyframes: `@keyframes wipe { from { --wipe: 100%; } to { --wipe: 0%; } }`.
  - Bind via `animation: wipe linear both; animation-timeline: --section; animation-range: entry 50% entry 100%;`.
  - Reduced-motion: snap `--wipe: 0%` and disable `position: fixed`.
  - **Post-pin suppression:** when `[data-page-heading][data-shrunk]` is set, the wipe is suppressed (no overlay positioning, heading inside `.section-heading-overlay` falls back to in-flow rendering). Implemented via a CSS `:has()` on the layout-root: `.layout-root:has([data-page-heading][data-shrunk]) [data-wipe] .section-heading-overlay { position: static; clip-path: none; ... }`.
- `wipe.ts`:
  - Register the primitive: `{ name: 'wipe', attribute: 'data-wipe', variable: '--wipe', initialValue: '100%', range: { from: 'entry 50%', to: 'entry 100%' }, reducedMotionValue: '0%' }`.
  - The controller (in fallback mode) writes `--wipe` per range-mapped progress on each `[data-wipe]` section.

**Patterns to follow:** background-clip text technique from research digest; single-element wipe (KTD5).

**Test scenarios:**
- Section with `wipe` prop: scrolling into view drives `--wipe` 100% → 0%; visual confirms the section heading wipes left-to-right over the page heading position.
- Section without `wipe` prop: heading renders in-flow; no overlay positioning; `--wipe` is not written.
- After the page heading enters its shrunk state (`[data-shrunk]` present): wipe overlays on subsequent sections are suppressed; section headings render in-flow.
- Two sections with different `accentColor` produce different recoloring effects.
- Reverse-scrolling reverses the wipe (bidirectional).
- Reduced-motion: heading appears in final position with no wipe animation; `position: fixed` not applied.
- Pixel alignment: at peak overlap, the section heading is visually indistinguishable from the page heading at the same coordinates.
- Removing this primitive's files leaves the framework working: sections with `wipe` prop simply have the prop ignored (no CSS attaches to `[data-wipe]`).

**Verification:** Visual smoke with at least two sections of different accent colors; pixel-comparison screenshots before, mid-wipe, after; static-mockup gate (see Pre-implementation gate below).

---

### U6. Expand primitive module

**Goal:** A self-contained CSS+TS module that drives the full-bleed expand-on-view behavior.

**Requirements:** R11, R12.

**Dependencies:** U1, U2, U4.

**Files:**
- `src/framework/scroll/primitives/expand.css` (new)
- `src/framework/scroll/primitives/expand.ts` (new)

**Approach:**
- `expand.css`:
  - Register `@property --bleed` (`<length>`, initial `0px`). (Length, not percentage — round-1 finding resolved.)
  - Apply to `[data-expand]`:
    - `width: calc(var(--grid-max-width) + var(--bleed) * 2);` clamped at `100vw`.
    - `margin-inline: calc(var(--bleed) * -1);`
    - `border-radius: max(0px, calc(var(--default-radius) - var(--bleed) * 0.4));`
  - Keyframes interpolate `--bleed` from `0px` → `50vw` over `animation-range: entry 50% cover 50%`, symmetric on exit.
  - Bind via `animation: expand linear both; animation-timeline: --section; ...`.
  - Avoid `overflow: hidden`; use `clip-path: inset(0 round var(--default-radius))` to avoid creating a sticky containing block (D1).
  - Reduced-motion: snap `--bleed: 0px`; section renders at grid width.
- `expand.ts`:
  - Register the primitive: `{ name: 'expand', attribute: 'data-expand', variable: '--bleed', initialValue: '0px', range: { from: 'entry 50%', to: 'cover 50%' }, reducedMotionValue: '0px' }`.

**Patterns to follow:** registered-property animation from research digest.

**Test scenarios:**
- Section with `expand` prop: scrolling into view animates from grid width to viewport width with border-radius collapsing to 0; reverses on exit.
- A non-expanding section sandwiched between two expanding sections renders at grid width throughout.
- `expand + wipe + pinHeadingAfter` on the same section: width animates correctly; wipe overlay tracks page heading; sentinel triggers shrink. No conflicts.
- Reduced-motion: section renders at grid width; no animation.
- No horizontal scrollbar at any wipe progress value.
- No text reflow during expand (verified with lorem ipsum + colored rectangle children).
- Removing this primitive's files leaves the framework working: sections with `expand` prop ignore it.

**Verification:** Visual scroll-through; DevTools confirms no horizontal scrollbar; combinatorial test with `wipe + expand` and `expand + pinHeadingAfter`.

---

### U7. Demo `index.astro` — combinatorial section matrix

**Goal:** A demo that exercises the combinatorial primitive matrix R12 promises. Five sections, all authored with props alone, no hand-authored sentinels or timeline-scope.

**Requirements:** R13, R15.

**Dependencies:** U2, U3, U5, U6, U9.

**Files:**
- `src/pages/index.astro` (rewrite)
- `src/site/tokens.css` (new — demo accent colors, demo grid sizing values)
- `src/components/Welcome.astro` (delete)
- `src/assets/astro.svg`, `src/assets/background.svg` (delete)

**Approach:**
- `tokens.css`: define demo-only values: `--demo-accent-1` through `--demo-accent-5`, `--grid-max-width: 1200px`, `--grid-padding-inline: 1.5rem`, `--default-radius: 16px`. Imported only by `index.astro`, never by framework files.
- Page heading text: a single short string ("Tristan Timblin").
- Five `<Section>` instances exercising the combinatorial matrix:
  1. `<Section id="intro">` — plain. Heading in-flow. Lorem ipsum + one rectangle.
  2. `<Section id="work" wipe expand>` — both wipe and expand. Different accent. Lorem ipsum + rectangles.
  3. `<Section id="bridge" wipe>` — wipe only, no expand. Different accent. Lorem ipsum + rectangle.
  4. `<Section id="about" pinHeadingAfter>` — pin trigger. Heading in-flow (no wipe opt-in). Sentinel emitted automatically by `<Section>`. Lorem ipsum + rectangle.
  5. `<Section id="contact" expand>` — expand only; renders behind shrunk heading. Different accent. Lorem ipsum + rectangle.
- For sections with `wipe`, the slotted `<h2>` text MUST match the page heading text exactly (the visual illusion requires it). Document this in a comment in `index.astro`. Sections without `wipe` may use any heading text.
- Add ~120vh of vertical space per section for desktop scroll choreography.
- Use `scroll-margin-top` matching the pinned heading height on focusable section content (keyboard a11y).

**Patterns to follow:** primitive opt-in via props alone; demo content is obvious placeholder, not pretend marketing copy.

**Test scenarios:**
- All five sections render in document order.
- Scrolling top-to-bottom hits every primitive at least once: wipe (sections 2, 3), expand (sections 2, 5), pin (section 4 onward).
- Section 2's `wipe + expand` combination works without conflicts (no horizontal scrollbar; wipe still tracks page heading).
- Section 3's wipe-only confirms wipe is independent of expand.
- Section 4's heading is in-flow (not wrapped in overlay), confirming `wipe` is opt-in.
- Section 5 renders behind the shrunk heading; expanding still works.
- Removing `src/site/tokens.css` and `src/pages/index.astro` (the demo) leaves `src/framework/scroll/` and `src/components/` as a clean, working framework. Verified by `bun build` succeeding with the demo deleted.
- No console errors, no layout shift on initial paint, no horizontal scroll.

**Verification:** `bun dev`, scroll through in Chrome and Firefox; record a screen capture; confirm framework/demo separation by deleting demo and rebuilding.

---

### U8. Reduced-motion + cross-browser smoke + extension recipe verification

**Goal:** Final pass — validate reduced-motion, cross-browser parity, and the extension recipe works as documented.

**Requirements:** R4, R12, R14.

**Dependencies:** U1–U7, U9.

**Files:**
- `src/framework/scroll/core.css` (final tuning)
- `src/framework/scroll/controller.ts` (final tuning)
- per-primitive CSS files (final tuning)

**Approach:**
- DevTools: emulate `prefers-reduced-motion: reduce`. Verify all sections render at static end-states; page heading is full-size pre-trigger and snaps to shrunk post-trigger via class flip (not animated).
- DevTools: disable JavaScript. Native engine should still drive every animation in supporting browsers.
- Firefox: with scroll-driven animations off (default flag state in mid-2026), the JS fallback should produce visually equivalent results.
- **Extension recipe verification.** Add a fourth primitive `fadeUp` per the worked example in the Extension Contract section:
  1. Create `src/framework/scroll/primitives/fade-up.css` and `fade-up.ts`.
  2. Add one import line to `controller.ts`.
  3. Add `fadeUp?: boolean` and `data-fade-up={fadeUp ? '' : null}` to `Section.astro`.
  4. Add `fadeUp` to one demo section.
  Verify it works in both engines without modifying any other file. After verifying, delete the four touchpoints to restore the framework's initial primitive set. This proves the Extension Contract empirically.
- Edge cases: very tall section (>200vh body), very short section (<50vh body), narrow viewport (~360px).

**Test scenarios:**
- Reduced-motion: zero scroll-driven animation; content readable; primitives apply their snap values.
- JS disabled in Chrome: native CSS path still drives wipes, expands, and shrink-pin.
- Firefox without flag: JS fallback drives every variable; visually matches Chrome path within timing tolerance.
- Adding `fadeUp` per the recipe takes only the four documented touchpoints; no edits to existing primitive files, no edits to the controller's per-frame loop, no edits to the registry.
- Removing `fadeUp` (delete the two files and revert the four touchpoints) leaves the framework in its starting state with no orphan code.

**Verification:** Manual cross-browser smoke; recipe verification documented in the PR description with diff showing the four-and-only-four touchpoints.

---

## Pre-implementation Gate (before U5)

Before building U5 in full, produce a static, non-scrolling mockup that places the page heading and one section heading at three wipe progress values (0%, 50%, 100%) using identical typography and the chosen `position: fixed` overlay strategy. Confirm visually that the wipe reads as "the page heading recoloring," not as "two separate headings ghosting through each other." If the illusion fails, return to the heading-positioning question (Open Questions below) and pick again. Cost: ~30 minutes; saves the U5/U7 cascade if the premise doesn't deliver.

---

## Scope Boundaries

### In scope
- Layered framework: `src/framework/scroll/` (core, controller, registry, three primitives).
- Section + PageHeading components consuming the framework.
- Demo with five sections proving the combinatorial primitive matrix.
- Cross-browser baseline (current Chrome, Firefox, Safari).
- Reduced-motion handling (per-primitive snap values).
- Extension Contract documented + empirically verified in U8.

### Deferred to Follow-Up Work
- Real homepage content (copy, imagery, links).
- Additional pages and routing.
- Design system / theming primitives beyond demo tokens.
- Mobile-first responsive design beyond "doesn't break".
- Per-section image / video media support.
- Dynamic section addition after initial mount (controller scans on load only).
- View transitions integration (`<ClientRouter />` hook on `astro:page-load`).
- Performance budget (LCP, CLS) measurement and tuning.
- Numeric `pinHeadingAfter={0.5}` variant (boolean only in this iteration).

### Outside this product's identity
- A general-purpose, externally-published scroll animation library. The framework is bespoke for this site; if extracted later, the public API surface would need design beyond what's in scope here.

---

## Risks & Dependencies

### D1. Sticky containing-block silent failure
`position: sticky` silently stops working if any ancestor has `overflow: hidden|auto|scroll|clip`, `transform`, `filter`, or `perspective`. The expand primitive's natural temptation is `overflow: hidden` to clip rounded corners — this would break the sticky page heading inside any section that wraps it.

**Mitigation:** Keep `<PageHeading>` as a sibling of all sections inside the layout-root (top of layout-root, never as a child of any section). For expanding sections, use `clip-path: inset(0 round var(--r))` instead of `overflow: hidden` (U6 specifies this). Document the constraint in `Section.astro` comments.

### D2. Subpixel drift between page heading and section heading
The clip-swap illusion requires the section heading overlay to overlay the page heading at exact pixel coordinates with identical text rendering. Any mismatch in font-size rounding, sub-pixel positioning, or text-rendering hint produces a visible shimmer.

**Mitigation:** Drive both headings from the same shared CSS custom properties (`--page-heading-font-size`, `--page-heading-letter-spacing`) declared on PageHeading. Apply `text-rendering: geometricPrecision` to both. Single-element clip technique (KTD5). Visual smoke test required (U5 pre-implementation gate; U8 final smoke).

### D3. Cross-element view-timeline scoping (single shared name only)
The framework's only cross-element timeline is `--shrink`, declared by `data-scroll-sentinel="page-heading-shrink"` and consumed by `<PageHeading>`. Resolved by a single `timeline-scope: --shrink` on the layout-root.

**Mitigation:** Keep cross-element timeline names to the framework-published set. Per-section timelines (`--section`) use descendant resolution and require no `timeline-scope`. New cross-element primitives that introduce a new shared timeline name are the only case requiring an addition to the layout-root's `timeline-scope` — documented in the Extension Contract.

### D4. Browser support gap — Firefox
Firefox still has scroll-driven animations behind a flag in mid-2026. The JS fallback must be visually equivalent, not just functional.

**Mitigation:** U4 builds the fallback with the same registry-driven contract as the native engine. Each primitive's `range` declaration drives both engines identically. U8 explicitly tests Firefox.

### D5. JS fallback frame budget
N sections × M primitives × scroll-listener rAF could push frame budget on lower-end hardware.

**Mitigation:** Sparse IO thresholds, single shared scroll listener (passive), gate by intersection (only ticking visible sections). Registry-walk overhead is O(visible-sections × registered-primitives) per frame — small constant. U4's verification step records DevTools Performance with 6 sections × 3 primitives.

### D6. Multiple `pinHeadingAfter` sections
Two sections opting into `pinHeadingAfter` each emit a sentinel — both write `--shrink` on the same page heading. Within their respective ranges, both are bidirectional.

**Mitigation:** Document that the first sentinel scrolled past wins for the post-trigger state; secondary sentinels are redundant but not harmful. If a use case needs distinct shrink stages, that's a new primitive (e.g., `pinHeadingProgressively`) added per the Extension Contract — not a modification to the existing one.

---

## Open Questions

These are decisions the implementer must resolve before or during U5. Each carries a default tilt; pick one before starting.

- **Wipe direction.** Left-to-right? Top-to-bottom? Diagonal? **Default:** left-to-right (`clip-path: inset(0 var(--wipe) 0 0)`). Trivially configurable later via a per-section `--wipe-direction` custom property.
- **Page heading content during shrink.** Does the heading text change between full and shrunk states (e.g., full name → initials)? **Default:** no, same text, just smaller.
- **Section heading positioning during the wipe.** U5 commits to `position: fixed` during the wipe window (overlay tracks viewport-pinned page heading) with controller-driven `[data-wipe-detached]` toggle for the post-wipe in-flow phase. Validate with the U5 pre-implementation mockup gate.
- **Post-wipe detach mechanism.** Controller-added class `[data-wipe-detached]` on the section root after the wipe completes. CSS branches `[data-wipe][data-wipe-detached] .section-heading-overlay` to `position: static`. Universally supported; U4 already runs.
- **Bidirectional shrink on reverse scroll.** Bidirectional (`view()` timelines are bidirectional within their range). Heading unshrinks when scrolled back above the sentinel.
- **Range parity native vs JS fallback.** Each primitive's `range` declaration is the single source of truth for both engines. Native consumes `animation-range`; fallback consumes `mapProgress(viewProgress, range)`. Primitive author writes `range` once.
- **Accessibility model.** Section heading overlay is `aria-hidden="true"` (decorative). The page heading remains the semantic anchor. Section headings without `wipe` (in-flow) are real headings and screen-reader-announced normally.
- **Keyboard navigation past the pinned heading.** Add `scroll-margin-top: var(--pinned-heading-height)` on focusable elements inside sections that render after the pin. Implemented in U7's demo and documented as a pattern consumers should follow.

---

## Sources & Research

- **External research (best-practices):** Hybrid native + JS-fallback engine recommendation, sticky-overflow gotcha, single-element clip-swap technique, `@property` registration for animatable custom properties, `prefers-reduced-motion` collapse pattern. Sources: developer.chrome.com/docs/css-ui/scroll-driven-animations, MDN `animation-timeline`, MDN `position`, webkit.org/blog WWDC25.
- **External research (Astro 6 framework docs):** Confirmed slot syntax unchanged; recommended layout-imported `.ts` script over `<script>` in component for shared controllers; `define:vars` on `<script>` implies `is:inline` (avoid); inline `style` attribute is the right path for runtime-mutated custom properties; `<ViewTransitions />` removed in v6, `<ClientRouter />` is opt-in (we don't use it). Sources: docs.astro.build/en/basics/astro-components/, /guides/styling/, /guides/client-side-scripts/, /guides/upgrade-to/v6/.
- **Round-2 architecture deepening:** layered architecture (framework / components / site / demo); primitive registry pattern for open-for-extension JS fallback; descendant-resolution for per-section timelines (no `timeline-scope` enumeration); `pinHeadingAfter` emits its own sentinel; `wipe` decoupled from heading slot via opt-in prop. Findings synthesized from coherence, feasibility, and adversarial reviewers.
- **Repo state:** Astro 6.4.8 confirmed in `package.json`; default scaffold (`Welcome.astro`); empty `astro.config.mjs`; strict TypeScript via `astro/tsconfigs/strict`.
