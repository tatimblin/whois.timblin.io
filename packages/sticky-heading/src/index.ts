export class StickyHeadingElement extends HTMLElement {
	private cleanup: (() => void) | null = null;
	private wrapper: HTMLDivElement | null = null;

	static get observedAttributes() {
		return ["reveal", "duration"];
	}

	connectedCallback() {
		this.setupDuration();
		if (this.hasAttribute("reveal")) this.setupReveal();
	}

	disconnectedCallback() {
		this.cleanup?.();
		this.cleanup = null;
		this.teardownDuration();
	}

	attributeChangedCallback() {
		if (!this.isConnected) return;
		this.cleanup?.();
		this.cleanup = null;
		this.teardownDuration();
		this.setupDuration();
		if (this.hasAttribute("reveal")) this.setupReveal();
	}

	private setupDuration() {
		const duration = this.getAttribute("duration");
		if (duration === null) return;

		this.style.paddingTop = "0.01px";

		const wrapper = document.createElement("div");
		wrapper.style.position = "sticky";
		wrapper.style.top = "var(--sticky-heading-top, 0)";
		wrapper.style.zIndex = "2";

		while (this.firstChild) {
			wrapper.appendChild(this.firstChild);
		}
		this.appendChild(wrapper);
		this.wrapper = wrapper;

		requestAnimationFrame(() => {
			const naturalHeight = wrapper.offsetHeight;
			this.style.height = duration === "0"
				? `${naturalHeight}px`
				: `calc(${duration} + ${naturalHeight}px)`;
		});
	}

	private teardownDuration() {
		if (!this.wrapper) return;
		while (this.wrapper.firstChild) {
			this.appendChild(this.wrapper.firstChild);
		}
		this.wrapper.remove();
		this.wrapper = null;
		this.style.height = "";
	}

	private setupReveal() {
		const curtain = this.parentElement;
		if (!curtain) return;

		const target = this.wrapper || this;
		const stickyTop = parseFloat(getComputedStyle(target).top);
		let headingHeight = target.offsetHeight;

		target.style.clipPath = "inset(100% 0 0 0)";

		target.style.marginTop = `${-headingHeight}px`;
		if (!this.wrapper) {
			target.style.marginBottom = `${headingHeight}px`;
		}

		const update = () => {
			const curtainTop = curtain.getBoundingClientRect().top;
			const targetTop = target.getBoundingClientRect().top;

			// Clip: show only what's below the curtain line
			const clipFromTop = curtainTop - targetTop;
			if (clipFromTop <= 0) {
				target.style.clipPath = "inset(0 0 0 0)";
			} else if (clipFromTop >= headingHeight) {
				target.style.clipPath = "inset(100% 0 0 0)";
			} else {
				target.style.clipPath = `inset(${clipFromTop}px 0 0 0)`;
			}
		};

		window.addEventListener("scroll", update, { passive: true });

		const ro = new ResizeObserver(() => {
			headingHeight = target.offsetHeight;
			update();
		});
		ro.observe(target);

		update();

		this.cleanup = () => {
			window.removeEventListener("scroll", update);
			ro.disconnect();
			target.style.clipPath = "";
			target.style.marginTop = "";
			target.style.marginBottom = "";
		};
	}
}

if (typeof customElements !== "undefined" && !customElements.get("sticky-heading")) {
	customElements.define("sticky-heading", StickyHeadingElement);
}
