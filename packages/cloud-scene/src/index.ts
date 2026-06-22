import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	ShaderMaterial,
	Color,
	Vector3,
	Clock,
	Mesh,
	SphereGeometry,
	BackSide,
	type Group,
} from "three";
import { vertexShader } from "./shaders/cloud.vert";
import { fragmentShader } from "./shaders/cloud.frag";
import { createCloudCluster } from "./create-cloud";

interface CloudCluster {
	group: Group;
	driftSpeed: number;
	bobPhase: number;
	bobAmplitude: number;
	baseY: number;
	baseZ: number;
}

class CloudSceneElement extends HTMLElement {
	private renderer: WebGLRenderer | null = null;
	private scene: Scene | null = null;
	private camera: PerspectiveCamera | null = null;
	private clock: Clock | null = null;
	private material: ShaderMaterial | null = null;
	private skyMaterial: ShaderMaterial | null = null;
	private clusters: CloudCluster[] = [];
	private rafId: number | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private intersectionObserver: IntersectionObserver | null = null;
	private isVisible = false;
	private reducedMotion = false;
	private spanLeft = 0;
	private spanRight = 0;
	private coveredHalfWidth = 0;
	private elapsed = 0;

	connectedCallback() {
		this.reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;
		this.setup();
	}

	disconnectedCallback() {
		this.dispose();
	}

	private setup() {
		const renderer = new WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer = renderer;
		this.appendChild(renderer.domElement);

		this.scene = new Scene();
		this.scene.background = new Color(0x6fa8dc);

		this.camera = new PerspectiveCamera(50, 1, 0.1, 160);
		// Pulled well back so the full height of the grand cumulus tower fits the
		// frame and reads at a dramatic scale, sitting in the upper band of the
		// wide, short hero section. Look upward to emphasise the tower's height.
		this.camera.position.set(0, 0, 42);
		this.camera.lookAt(0, 8, -10);

		this.clock = new Clock();

		// Bright daytime sky gradient — deeper blue overhead fading to a pale
		// near-white blue at the horizon. Zenith pulled a touch deeper to give the
		// warm cloud crowns more value contrast to read against (still daytime, not
		// dusk — the high-contrast backlit "crown glow" of the reference needs a
		// dark sky and is intentionally out of scope here).
		const skyTop = new Color(0x336fbe); // clear blue zenith (slightly deeper)
		const skyHorizon = new Color(0xcfe4f5); // pale haze near horizon

		this.material = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uNoiseScale: { value: 0.2 },
				// Lowered so the per-sphere fBm displacement no longer spikes the
				// silhouette into discrete cauliflower beads — the cloud reads as one
				// softer cohesive mass (the bumpy outline, not just shading, was part
				// of the "pile of balls" look).
				uDisplacementStrength: { value: 0.55 },
				uLightDir: { value: new Vector3(-0.3, 0.55, -0.5).normalize() },
				// Painted multi-hue ramp (darkest → lightest): muted blue-violet
				// deep bellies → lavender shadow → soft warm white mid → warm
				// cream/peach lit crowns, plus a faint pink/gold accent used only in
				// the narrow upper transition near the crown edge.
				uColorHighlight: { value: new Color(0xfffaf2) }, // warm-white lit tops
				uColorMid: { value: new Color(0xeef0f6) }, // soft cool white
				uColorShadow: { value: new Color(0xc4cbe0) }, // soft blue-grey shadow
				uColorDeep: { value: new Color(0xa6acc9) }, // deeper blue-grey undersides
				uColorAccent: { value: new Color(0xffeeda) }, // faint warm glow
				// Soft feathered edge: pale sky tint the sunward silhouette fringes
				// lift toward, how strong that lift is, and how tightly it hugs the
				// grazing rim (higher = thinner rim).
				uEdgeColor: { value: new Color(0xe8eef8) },
				uEdgeStrength: { value: 0.35 },
				uEdgeFalloff: { value: 2.5 },
				// Atmospheric recession: distant clouds fade toward the pale SKY
				// HORIZON colour (matching the sky dome's horizon) so the far band
				// melts into the sky like real atmosphere, rather than into a separate
				// haze tint. Near band (camera-Z depth ~52) stays crisp; mid band
				// (~66) softens; far band (~86+) hazes out strongly.
				uFogColor: { value: new Color(0xcfe4f5) },
				uFogNear: { value: 58 },
				uFogFar: { value: 86 },
				// Painted toon banding: step softness (0 = crisp cel, higher =
				// softer painted boundary) and how much surface noise wanders the
				// band edges so they read as brushwork, not sphere curvature.
				uBandSoftness: { value: 0.13 },
				uFormNoise: { value: 0.35 },
				// Seam weld: how strongly the per-billow shading normal bends toward
				// the shared mass-outward direction at grazing/overlap angles, so
				// deeply-overlapping spheres read as one mass instead of showing a
				// hard intersection line. 0 = off, ~0.5 = balanced.
				uWeldAmount: { value: 0.5 },
			},
		});

		this.addSkyDome(skyTop, skyHorizon);

		this.handleResize();

		this.resizeObserver = new ResizeObserver(() => this.handleResize());
		this.resizeObserver.observe(this);

		this.intersectionObserver = new IntersectionObserver(
			([entry]) => {
				this.isVisible = entry.isIntersecting;
				if (this.isVisible && !this.rafId && !this.reducedMotion) {
					this.startLoop();
				} else if (!this.isVisible && this.rafId) {
					this.stopLoop();
				}
			},
			{ threshold: 0 }
		);
		this.intersectionObserver.observe(this);

		document.addEventListener(
			"visibilitychange",
			this.handleVisibility
		);

		if (this.reducedMotion) {
			this.renderFrame();
		} else {
			this.isVisible = true;
			this.startLoop();
		}
	}

	// One "tile" of clouds. The x values stay within ±tileWidth/2 so the pattern
	// repeats seamlessly when tiled horizontally to fill any screen width. Wider
	// now so each depth band has room for sky gaps between discrete clouds.
	private static readonly TILE_WIDTH = 60;
	// Composition: three DISTINCT DEPTH BANDS (Kiki's Delivery Service reference) —
	// discrete cumulus separated by sky gaps, arranged so nearer clouds are larger,
	// higher, and crisp, while farther clouds are smaller, lower (toward a horizon
	// line), and haze into the sky via fog. `y` is each cloud's base height,
	// `spread.y` how tall it stacks; `drift` is parallax (nearer = faster). Depth is
	// baked into `z` per band and is NOT animated (see update()), so the bands stay
	// visually distinct as the clouds drift. x values are spread across the tile
	// with gaps and staggered between bands so the gaps don't line up into columns.
	private static readonly BASE_CONFIGS = [
		// --- NEAR band (z ≈ -10): few large crisp cumulus, HIGH in the frame ---
		{ count: 520, x: -16, y: 11, z: -10, spread: { x: 13, y: 9, z: 5 }, scale: 2.4, drift: 0.07, bob: 0.06, flatten: 0.62 },
		{ count: 260, x: 14, y: 13, z: -11, spread: { x: 9, y: 7, z: 4 }, scale: 1.9, drift: 0.065, bob: 0.07 },
		// --- MID band (z ≈ -24): medium clouds, clearly BELOW the near band ---
		{ count: 150, x: -2, y: 6, z: -24, spread: { x: 8, y: 4, z: 3 }, scale: 1.5, drift: 0.045, bob: 0.05, edgeSoft: 0.5 },
		{ count: 130, x: -26, y: 7, z: -25, spread: { x: 7, y: 4, z: 3 }, scale: 1.35, drift: 0.045, bob: 0.05, flatten: 0.62, edgeSoft: 0.5 },
		{ count: 110, x: 24, y: 5, z: -26, spread: { x: 7, y: 3.5, z: 3 }, scale: 1.3, drift: 0.04, bob: 0.06, edgeSoft: 0.5 },
		// --- FAR band (z ≈ -42): SPARSE long, low, wispy strips along the horizon
		// line, wide and flat (stretched x, squashed y) so they read as distant
		// haze rather than little puffs. Only two per tile with big sky gaps
		// between them — most of the horizon is open sky. ---
		{ count: 64, x: -18, y: 0, z: -42, spread: { x: 13, y: 1.1, z: 2 }, scale: 1.0, drift: 0.022, bob: 0.02, flatten: 0.45, edgeSoft: 1.0 },
		{ count: 54, x: 16, y: 0.3, z: -45, spread: { x: 11, y: 0.9, z: 2 }, scale: 0.85, drift: 0.02, bob: 0.018, flatten: 0.45, edgeSoft: 1.0 },
	];
	private tilesEachSide = -1;

	// Build (or rebuild) cloud clusters by tiling the base pattern across the
	// full visible frustum width, so the clouds fill the section no matter how
	// wide it expands. Only rebuilds when the required tile count actually
	// changes, to avoid thrashing geometry on every resize tick.
	private layoutClouds() {
		const tilesEachSide = Math.max(
			0,
			Math.ceil(
				(this.coveredHalfWidth - CloudSceneElement.TILE_WIDTH / 2) /
					CloudSceneElement.TILE_WIDTH
			)
		);
		if (tilesEachSide === this.tilesEachSide) return;
		this.tilesEachSide = tilesEachSide;

		// Tear down any existing clusters first.
		for (const cluster of this.clusters) {
			this.scene!.remove(cluster.group);
			cluster.group.traverse((obj) => {
				if ("geometry" in obj) {
					(obj as any).geometry?.dispose();
				}
			});
		}
		this.clusters = [];

		for (let tile = -tilesEachSide; tile <= tilesEachSide; tile++) {
			const offset = tile * CloudSceneElement.TILE_WIDTH;
			for (const cfg of CloudSceneElement.BASE_CONFIGS) {
				const group = createCloudCluster({
					sphereCount: cfg.count,
					spread: cfg.spread,
					baseScale: cfg.scale,
					material: this.material!,
					flatten: (cfg as { flatten?: number }).flatten,
					edgeSoft: (cfg as { edgeSoft?: number }).edgeSoft,
				});
				group.position.set(cfg.x + offset, cfg.y, cfg.z);

				this.scene!.add(group);
				this.clusters.push({
					group,
					driftSpeed: cfg.drift,
					bobPhase: Math.random() * Math.PI * 2,
					bobAmplitude: cfg.bob,
					baseY: cfg.y,
					baseZ: cfg.z,
				});
			}
		}

		// Drift wrap bounds span the full tiled width.
		const totalTiles = tilesEachSide * 2 + 1;
		this.spanRight = (totalTiles * CloudSceneElement.TILE_WIDTH) / 2;
		this.spanLeft = -this.spanRight;
	}

	private addSkyDome(top: Color, horizon: Color) {
		// Large inward-facing sphere with a vertical gradient, rendered behind
		// the clouds. Static (never drifts/bobs) and excluded from the cloud
		// cluster list so the animation loop leaves it alone.
		this.skyMaterial = new ShaderMaterial({
			side: BackSide,
			depthWrite: false,
			uniforms: {
				uSkyTop: { value: top.clone() },
				uSkyHorizon: { value: horizon.clone() },
			},
			vertexShader: /* glsl */ `
				varying vec3 vPos;
				void main() {
					vPos = position;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: /* glsl */ `
				uniform vec3 uSkyTop;
				uniform vec3 uSkyHorizon;
				varying vec3 vPos;

				// Cheap 2D value noise for faint atmospheric wisps.
				float h21(vec2 p) {
					return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
				}
				float vnoise(vec2 p) {
					vec2 i = floor(p), f = fract(p);
					f = f * f * (3.0 - 2.0 * f);
					return mix(mix(h21(i), h21(i + vec2(1,0)), f.x),
					           mix(h21(i + vec2(0,1)), h21(i + vec2(1,1)), f.x), f.y);
				}
				float fbm2(vec2 p) {
					float v = 0.0, a = 0.5;
					for (int i = 0; i < 4; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
					return v;
				}

				void main() {
					float h = clamp(vPos.y / 100.0 * 0.5 + 0.5, 0.0, 1.0);
					vec3 c = mix(uSkyHorizon, uSkyTop, smoothstep(0.15, 0.95, h));

					// Direction on the dome, used as stable UVs for sky detail.
					vec3 dir = normalize(vPos);
					vec2 uv = vec2(dir.x, dir.y);

					// Faint high wisps (cirrus) — stretched horizontally, only in the
					// upper sky, very subtle so they read as atmosphere not clouds.
					float wisp = fbm2(uv * vec2(3.0, 9.0) + vec2(2.0, 0.0));
					wisp = smoothstep(0.55, 0.95, wisp);
					wisp *= smoothstep(0.1, 0.6, dir.y); // upper sky only
					c = mix(c, vec3(1.0), wisp * 0.10);

					// Soft diagonal light shaft (crepuscular streak) from upper-left,
					// a gentle brightening band — the tutorial's step-6 accent.
					float shaft = dir.x * 0.6 + dir.y;
					shaft = exp(-pow((shaft - 0.7) * 2.2, 2.0));
					c += vec3(1.0, 0.98, 0.92) * shaft * 0.06 * smoothstep(0.0, 0.5, dir.y);

					gl_FragColor = vec4(c, 1.0);
				}
			`,
		});

		const dome = new Mesh(new SphereGeometry(100, 32, 16), this.skyMaterial);
		dome.renderOrder = -1;
		this.scene!.add(dome);
	}

	private handleResize() {
		const width = this.clientWidth || 1;
		const height = this.clientHeight || 1;

		this.camera!.aspect = width / height;
		this.camera!.updateProjectionMatrix();
		this.renderer!.setSize(width, height);

		// Half-width of the camera frustum at the FARTHEST cloud band's depth. The
		// far band lives around z ≈ -46; camera is at z = 42, so the view distance
		// to that plane is ~88 — the frustum is widest there, so covering it
		// guarantees every band reaches the screen edges (nearer bands are simply
		// over-covered off-screen, which is harmless). We add a tile's margin so
		// clouds fully cover the edges as the section bleeds to full viewport width.
		const cloudDepth = 88;
		const halfFovV = (this.camera!.fov * Math.PI) / 180 / 2;
		const halfH = Math.tan(halfFovV) * cloudDepth * this.camera!.aspect;
		this.coveredHalfWidth = halfH + CloudSceneElement.TILE_WIDTH / 2;

		this.layoutClouds();

		// setSize() clears the drawing buffer. When no animation loop is running
		// (reduced-motion, or paused off-screen) nothing would repaint it, leaving
		// a blank canvas after a resize — so render one static frame here.
		if (!this.rafId && this.scene && this.camera) {
			this.renderFrame();
		}
	}

	private handleVisibility = () => {
		if (document.hidden && this.rafId) {
			this.stopLoop();
		} else if (!document.hidden && this.isVisible && !this.rafId && !this.reducedMotion) {
			this.startLoop();
		}
	};

	private startLoop() {
		const tick = () => {
			this.rafId = requestAnimationFrame(tick);
			this.update();
			this.renderFrame();
		};
		this.rafId = requestAnimationFrame(tick);
	}

	private stopLoop() {
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
	}

	private update() {
		// NOTE: Clock.getElapsedTime() internally advances the delta, so calling
		// both it and getDelta() would leave getDelta() ~0. Use getDelta() alone
		// and accumulate elapsed time ourselves.
		const dt = Math.min(this.clock!.getDelta(), 0.05); // clamp tab-stall spikes
		this.elapsed += dt;
		const elapsed = this.elapsed;
		this.material!.uniforms.uTime.value = elapsed;

		const span = this.spanRight - this.spanLeft;
		// Gentle, frame-rate-independent wind toward the right. driftSpeed (~0.02
		// –0.06 per cluster) × this gives ~0.2–0.6 world units/sec, so a cloud
		// takes a minute or two to cross — a slow, dreamy drift with gentle
		// parallax (nearer clouds drift a touch faster).
		const wind = 3.0;
		for (const cluster of this.clusters) {
			cluster.group.position.x += cluster.driftSpeed * wind * dt;

			// Wrap drift within the full tiled span so clouds recirculate across
			// the entire width — a cloud leaving the right edge re-enters at left.
			if (cluster.group.position.x > this.spanRight) {
				cluster.group.position.x -= span;
			}

			// Depth is baked statically per band (see BASE_CONFIGS) so the near /
			// mid / far lines stay visually distinct; we deliberately do NOT push z
			// over time here. Parallax comes from per-band drift speed (nearer bands
			// drift faster). Only the gentle vertical bob is animated.
			cluster.group.position.y =
				cluster.baseY +
				Math.sin(elapsed * 0.5 + cluster.bobPhase) * cluster.bobAmplitude;
		}
	}

	private renderFrame() {
		this.renderer!.render(this.scene!, this.camera!);
	}

	private dispose() {
		this.stopLoop();
		document.removeEventListener("visibilitychange", this.handleVisibility);
		this.resizeObserver?.disconnect();
		this.intersectionObserver?.disconnect();

		this.scene?.traverse((obj) => {
			if ("geometry" in obj) {
				(obj as any).geometry?.dispose();
			}
		});
		this.material?.dispose();
		this.skyMaterial?.dispose();
		this.renderer?.dispose();
		this.renderer?.domElement.remove();

		this.renderer = null;
		this.scene = null;
		this.camera = null;
		this.material = null;
		this.skyMaterial = null;
		this.clusters = [];
	}
}

if (typeof customElements !== "undefined" && !customElements.get("cloud-scene")) {
	customElements.define("cloud-scene", CloudSceneElement);
}
