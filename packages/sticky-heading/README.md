# @whois/sticky-heading

A drop-in custom element that produces a "rising curtain" sticky-reveal effect via pure CSS. Author the same `<sticky-heading>` tag at the top of a page and once inside each scrolling section; as a section scrolls over the page-level instance, its background occludes the page heading from the bottom up while the section's own heading paints in at the same row. No JavaScript runs after registration.

## Quick start

```ts
// once, anywhere in the page's client bundle
import "@whois/sticky-heading";
import "@whois/sticky-heading/styles.css";
```

```html
<header>
	<sticky-heading class="page-heading">Hi, I'm Tristan.</sticky-heading>
</header>

<main>
	<section class="section section--1">
		<sticky-heading class="page-heading">Hi, I'm Tristan.</sticky-heading>
		<p>...</p>
	</section>
	<section class="section section--2">
		<sticky-heading class="page-heading">Hi, I'm Tristan.</sticky-heading>
		<p>...</p>
	</section>
</main>
```

```css
.page-heading {
	font: 700 var(--font-size-3xl) / 1.15 var(--font-sans);
	letter-spacing: -0.02em;
}
```

The same tag, the same class, every position. Typography matches because every instance shares one class. That's the whole API.

## Per-instance color

Color belongs to your CSS, not to the component. Target each section's heading with standard selectors:

```css
.section--2 .page-heading {
	color: var(--section-2-fg);
}
```

The component does not expose attributes, custom properties, or props for color, accent, or background.

## Section backgrounds

The rising-curtain effect depends on each section having a non-transparent background. A transparent section will simply stack the section's heading over the page-level heading at the same coordinates — valid usage, but not the curtain effect. Set a background on each section.

## The single CSS variable

`--sticky-heading-top` (default `0`) controls the sticky top offset. Set it on the page root to apply uniformly, or on a single instance to override:

```css
:root {
	--sticky-heading-top: 1rem;
}
```

## Sticky containing-block gotcha

`position: sticky` silently stops working if any ancestor sets `overflow: hidden | auto | scroll | clip`, `transform`, `filter`, or `perspective`. If the heading isn't pinning, walk up the ancestor tree and remove the offending property.

## Browser support

Custom elements and `position: sticky` are Baseline-supported in current Chrome, Firefox, and Safari with no flags.

## What this is not

- Not a React, Vue, or Svelte adapter — custom elements work natively in JSX, templates, and SFCs.
- Not a scroll-progress reveal, opacity transition, or animation framework.
- Does not auto-clone heading text into sections; you author each instance.
- Does not manage color, gradient, accent, or background.
