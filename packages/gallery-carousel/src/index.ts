const DEFAULT_SPEED = 3; // horizontal px scrubbed per vertical px scrolled
const MIN_SPEED = 0.05; // guard against div-by-~0 producing absurd heights
const MAX_HEIGHT_PX = 60000; // absolute safety clamp

/**
 * Scroll-driven horizontal carousel. The element pins its track (`position:
 * sticky`) while a tall spacer region scrolls past; this class maps that
 * vertical scroll progress directly onto the track's `translateX` so the scrub
 * always lands exactly on the last item.
 *
 * A single lever, `--carousel-speed` (unitless: horizontal px per vertical px
 * scrolled, higher = faster), controls the feel. The required scrub distance is
 * `travel = trackWidth - viewportWidth`; the pinned scroll region needed to
 * cover it at the requested speed is `travel / speed`, so the element height is:
 *
 *   carouselHeight = viewportHeight + travel / speed
 *
 * The transform is driven in JS rather than via a CSS `view-timeline` because
 * the `contain` animation-range is not reliably supported across browsers
 * (Firefox never scrolled, and others stopped short of the last item).
 */
export class GalleryCarouselElement extends HTMLElement {
	private track: HTMLElement | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private reducedMotion: MediaQueryList | null = null;
	private listeners: Array<() => void> = [];
	private rafId: number | null = null;
	private travel = 0; // px the track must translate, from layout measurement

	connectedCallback() {
		this.track = this.querySelector<HTMLElement>("[data-carousel-track]");
		if (!this.track) return;

		this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const onMotionChange = () => this.measure();
		this.reducedMotion.addEventListener("change", onMotionChange);
		this.listeners.push(() =>
			this.reducedMotion?.removeEventListener("change", onMotionChange)
		);

		// Items are sized `height: 48vh; width: auto`, so the track width changes
		// on viewport resize and as media resolves its natural dimensions.
		this.resizeObserver = new ResizeObserver(() => this.measure());
		this.resizeObserver.observe(this);
		this.resizeObserver.observe(this.track);

		const media = this.track.querySelectorAll<HTMLImageElement | HTMLVideoElement>(
			"img, video"
		);
		media.forEach((el) => {
			const recalc = () => this.measure();
			el.addEventListener("load", recalc);
			el.addEventListener("loadedmetadata", recalc);
			this.listeners.push(() => {
				el.removeEventListener("load", recalc);
				el.removeEventListener("loadedmetadata", recalc);
			});
		});

		const onScroll = () => this.scheduleRender();
		window.addEventListener("scroll", onScroll, { passive: true });
		this.listeners.push(() => window.removeEventListener("scroll", onScroll));

		// ResizeObserver catches width changes (and media resolving), but the top
		// inset and height also depend on viewport *height* (e.g. a guard pinned at
		// `20vh`), which a width-only observer can miss. Re-measure on resize too.
		const onResize = () => this.measure();
		window.addEventListener("resize", onResize, { passive: true });
		this.listeners.push(() => window.removeEventListener("resize", onResize));

		this.measure();
	}

	disconnectedCallback() {
		this.resizeObserver?.disconnect();
		this.resizeObserver = null;
		this.listeners.forEach((off) => off());
		this.listeners = [];
		if (this.rafId !== null) cancelAnimationFrame(this.rafId);
		this.rafId = null;
		this.style.removeProperty("--carousel-height");
		if (this.track) this.track.style.transform = "";
	}

	/**
	 * Measure the track and derive the height from the speed lever, then render
	 * the transform for the current scroll position. Runs on connect, resize,
	 * media load, and reduced-motion changes.
	 */
	private measure() {
		if (!this.track) return;

		// Reduced motion: CSS drives a scroll-snap strip (height:auto). Stay out.
		if (this.reducedMotion?.matches) {
			this.style.removeProperty("--carousel-height");
			this.track.style.transform = "";
			this.travel = 0;
			return;
		}

		// The element may be inset from the viewport edge (e.g. inside a centered
		// max-width container), so the track's untranslated right edge is at
		// `element.left + scrollWidth`. Travel is how far that must move left to
		// bring the last item flush with the viewport's right edge. The transform
		// lives on the track, not the element, so element.left is transform-free.
		const originLeft = this.getBoundingClientRect().left;
		this.travel = originLeft + this.track.scrollWidth - window.innerWidth;

		// Track narrower than viewport (or no items): nothing to scrub.
		if (this.travel <= 0) {
			this.style.setProperty("--carousel-height", "auto");
			this.track.style.transform = "";
			return;
		}

		// Sit the track flush below whatever is pinned above it (e.g. a sticky page
		// title) rather than relying on a hand-tuned offset.
		this.style.setProperty("--carousel-top", `${Math.round(this.measureTopInset())}px`);

		const speed = this.readSpeed();
		const heightPx = Math.min(
			MAX_HEIGHT_PX,
			Math.max(window.innerHeight, window.innerHeight + this.travel / speed)
		);
		this.style.setProperty("--carousel-height", `${Math.round(heightPx)}px`);
		this.render();
	}

	/**
	 * How far down the track must start so it clears whatever is pinned above it.
	 * Walks earlier siblings up the ancestor chain looking for sticky/fixed
	 * elements; the inset is the lowest pinned bottom edge among them. Returns 0
	 * when nothing is pinned above (track sits flush to the viewport top).
	 */
	private measureTopInset(): number {
		let inset = 0;
		let node: Element | null = this;
		while (node && node !== document.body) {
			let sibling = node.previousElementSibling;
			while (sibling) {
				const style = getComputedStyle(sibling);
				if (style.position === "sticky" || style.position === "fixed") {
					// Pinned bottom = its resolved `top` offset + its own height,
					// independent of current scroll (a sticky element not yet pinned
					// still reserves this once scrolling reaches it).
					const top = Number.parseFloat(style.top) || 0;
					const bottom = top + sibling.getBoundingClientRect().height;
					if (bottom > inset) inset = bottom;
				}
				sibling = sibling.previousElementSibling;
			}
			node = node.parentElement;
		}
		// Add a breathing gap below the guard, reusing the carousel's own gap lever
		// so the spacing matches the inter-item gap. No gap when nothing is above.
		if (inset > 0 && this.track) {
			const gap = Number.parseFloat(getComputedStyle(this.track).columnGap);
			if (Number.isFinite(gap)) inset += gap;
		}
		return inset;
	}

	/** Coalesce scroll events to one transform write per frame. */
	private scheduleRender() {
		if (this.rafId !== null) return;
		this.rafId = requestAnimationFrame(() => {
			this.rafId = null;
			this.render();
		});
	}

	/** Map scroll progress through the pinned region onto the track translateX. */
	private render() {
		if (!this.track || this.travel <= 0) return;

		const rect = this.getBoundingClientRect();
		const pinned = rect.height - window.innerHeight;
		if (pinned <= 0) {
			this.track.style.transform = "";
			return;
		}

		// progress 0 when the element top hits the viewport top, 1 at the bottom
		// of the pinned region — clamped so we settle exactly on the last item.
		const progress = Math.min(1, Math.max(0, -rect.top / pinned));
		this.track.style.transform = `translateX(${-(progress * this.travel)}px)`;
	}

	/** The single lever: `--carousel-speed`. Falls back to DEFAULT_SPEED. */
	private readSpeed(): number {
		const raw = getComputedStyle(this).getPropertyValue("--carousel-speed").trim();
		const parsed = Number.parseFloat(raw);
		if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_SPEED;
		return Math.max(MIN_SPEED, parsed);
	}
}

if (
	typeof customElements !== "undefined" &&
	!customElements.get("gallery-carousel")
) {
	customElements.define("gallery-carousel", GalleryCarouselElement);
}
