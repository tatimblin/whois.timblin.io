export class GalleryCarouselElement extends HTMLElement {
	private cleanup: (() => void) | null = null;

	connectedCallback() {
		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;

		const track = this.querySelector("[data-carousel-track]") as HTMLElement | null;
		if (!track) return;

		if (prefersReduced) {
			this.classList.add("gallery-carousel--fallback");
			return;
		}

		this.classList.add("gallery-carousel--active");

		let travel = 0;
		let isVisible = false;
		let rafId: number | null = null;

		const updateTrackWidth = () => {
			const trackWidth = track.scrollWidth;
			const viewportWidth = this.clientWidth;
			travel = Math.max(0, trackWidth - viewportWidth);
		};

		const tick = () => {
			if (!isVisible) {
				rafId = null;
				return;
			}
			const rect = this.getBoundingClientRect();
			const scrollableHeight = this.offsetHeight - window.innerHeight;
			if (scrollableHeight > 0) {
				const progress = Math.max(0, Math.min(1, -rect.top / scrollableHeight));
				track.style.transform = `translateX(${-progress * travel}px)`;
			}
			rafId = requestAnimationFrame(tick);
		};

		updateTrackWidth();

		const ro = new ResizeObserver(updateTrackWidth);
		ro.observe(this);
		ro.observe(track);

		const io = new IntersectionObserver(
			([entry]) => {
				isVisible = entry.isIntersecting;
				if (isVisible && rafId === null) {
					rafId = requestAnimationFrame(tick);
				}
			},
			{ threshold: 0 }
		);
		io.observe(this);

		this.cleanup = () => {
			ro.disconnect();
			io.disconnect();
			if (rafId !== null) cancelAnimationFrame(rafId);
			track.style.transform = "";
		};
	}

	disconnectedCallback() {
		this.cleanup?.();
		this.cleanup = null;
	}
}

if (
	typeof customElements !== "undefined" &&
	!customElements.get("gallery-carousel")
) {
	customElements.define("gallery-carousel", GalleryCarouselElement);
}
