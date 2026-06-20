export class StickyHeadingElement extends HTMLElement {
	private cleanup: (() => void) | null = null;

	static get observedAttributes() {
		return ["reveal"];
	}

	connectedCallback() {
		if (this.hasAttribute("reveal")) this.setupReveal();
	}

	disconnectedCallback() {
		this.cleanup?.();
		this.cleanup = null;
	}

	attributeChangedCallback() {
		this.cleanup?.();
		this.cleanup = null;
		if (this.hasAttribute("reveal")) this.setupReveal();
	}

	private setupReveal() {
		const parent = this.parentElement;
		if (!parent) return;

		let stickyTop = parseFloat(getComputedStyle(this).top);
		let headingHeight = this.offsetHeight;

		this.style.clipPath = "inset(100% 0 0 0)";

		const update = () => {
			const parentTop = parent.getBoundingClientRect().top;

			if (parentTop > stickyTop) {
				this.style.transform = `translateY(${stickyTop - parentTop}px)`;
			} else {
				this.style.transform = "";
			}

			const clipPx = Math.max(0, Math.min(headingHeight, parentTop - stickyTop));
			this.style.clipPath = `inset(${clipPx}px 0 0 0)`;
		};

		const onScroll = () => requestAnimationFrame(update);
		window.addEventListener("scroll", onScroll, { passive: true });

		const ro = new ResizeObserver(() => {
			stickyTop = parseFloat(getComputedStyle(this).top);
			headingHeight = this.offsetHeight;
			update();
		});
		ro.observe(this);

		update();

		this.cleanup = () => {
			window.removeEventListener("scroll", onScroll);
			ro.disconnect();
			this.style.clipPath = "";
			this.style.transform = "";
		};
	}
}

if (typeof customElements !== "undefined" && !customElements.get("sticky-heading")) {
	customElements.define("sticky-heading", StickyHeadingElement);
}
