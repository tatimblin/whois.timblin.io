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

		this.camera = new PerspectiveCamera(50, 1, 0.1, 120);
		// Positioned so the cumulus forms read at a dramatic scale (towering
		// billows) while still sitting as a band in the upper part of the wide,
		// short hero section. Look slightly upward to emphasise the tower height.
		this.camera.position.set(0, -1, 30);
		this.camera.lookAt(0, 6, -6);

		this.clock = new Clock();

		// Bright daytime sky gradient — deeper blue overhead fading to a pale
		// near-white blue at the horizon.
		const skyTop = new Color(0x3d7fc4); // clear blue zenith
		const skyHorizon = new Color(0xcfe4f5); // pale haze near horizon

		this.material = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uNoiseScale: { value: 0.2 },
				uDisplacementStrength: { value: 0.85 },
				uLightDir: { value: new Vector3(-0.3, 0.55, -0.5).normalize() },
				uColorHighlight: { value: new Color(0xffffff) }, // sunlit white tops
				uColorMid: { value: new Color(0xeef3fb) }, // soft white
				uColorShadow: { value: new Color(0x9fb3d4) }, // cool blue-grey base
				uColorRim: { value: new Color(0xfff4dd) }, // warm sun rim
				uSkyColor: { value: new Color(0xbcd6ee) }, // sky bounce (above)
				uGroundColor: { value: new Color(0x8aa0bd) }, // cool fill (below)
				uFogColor: { value: new Color(0xbcd6ee) },
				uFogNear: { value: 40 },
				uFogFar: { value: 60 },
				uBands: { value: 6.0 },
			},
			transparent: true,
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
	// repeats seamlessly when tiled horizontally to fill any screen width.
	private static readonly TILE_WIDTH = 36;
	// Each cloud builds upward from its group origin (flat base, doming crown),
	// so `y` is the base height and `spread.y` is how tall the cumulus stacks.
	// Y values are raised so the clouds gather near the top of the section.
	// A mix of larger "hero" cumulus and smaller puffs for a natural skyline.
	// Counts are high now that spheres are instanced — each cloud is the union of
	// many overlapping puffs (hierarchical billows + rim fringe + outcroppings).
	// Counts are high now that spheres are instanced — each cloud is the union of
	// many overlapping puffs (hierarchical billows + rim fringe + outcroppings).
	// Composition: one dominant hero cumulus mass + a supporting secondary, with
	// small distant puffs filling the skyline (matching the reference).
	private static readonly BASE_CONFIGS = [
		// Hero cumulus — large, dense, dominant mass. Tighter spread.x so the
		// many puffs concentrate into one big billowing cloud rather than a row.
		{ count: 200, x: -2, y: 2, z: -4, spread: { x: 5, y: 9, z: 3.5 }, scale: 2.6, drift: 0.04, bob: 0.10 },
		// Secondary cumulus, clearly smaller, offset to balance the composition.
		{ count: 110, x: 13, y: 3, z: -7, spread: { x: 4.5, y: 6, z: 3 }, scale: 2.0, drift: 0.05, bob: 0.10 },
		// Small distant puffs for depth and a natural skyline.
		{ count: 45, x: -15, y: 7, z: -12, spread: { x: 4, y: 2.5, z: 2 }, scale: 1.2, drift: 0.03, bob: 0.08 },
		{ count: 38, x: 6, y: 9, z: -14, spread: { x: 3.5, y: 2, z: 2 }, scale: 1.0, drift: 0.03, bob: 0.07 },
		{ count: 34, x: 20, y: 8, z: -15, spread: { x: 3, y: 2, z: 2 }, scale: 1.0, drift: 0.02, bob: 0.06 },
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
				});
				group.position.set(cfg.x + offset, cfg.y, cfg.z);

				this.scene!.add(group);
				this.clusters.push({
					group,
					driftSpeed: cfg.drift,
					bobPhase: Math.random() * Math.PI * 2,
					bobAmplitude: cfg.bob,
					baseY: cfg.y,
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
					float h = clamp(vPos.y / 60.0 * 0.5 + 0.5, 0.0, 1.0);
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

		const dome = new Mesh(new SphereGeometry(60, 32, 16), this.skyMaterial);
		dome.renderOrder = -1;
		this.scene!.add(dome);
	}

	private handleResize() {
		const width = this.clientWidth || 1;
		const height = this.clientHeight || 1;

		this.camera!.aspect = width / height;
		this.camera!.updateProjectionMatrix();
		this.renderer!.setSize(width, height);

		// Half-width of the camera frustum at the clouds' average depth. The
		// clouds live around z ≈ -6; camera is at z = 30, so the view distance to
		// that plane is ~36. We add a tile's margin so clouds fully cover the
		// edges as the section bleeds to full viewport width.
		const cloudDepth = 36;
		const halfFovV = (this.camera!.fov * Math.PI) / 180 / 2;
		const halfH = Math.tan(halfFovV) * cloudDepth * this.camera!.aspect;
		this.coveredHalfWidth = halfH + CloudSceneElement.TILE_WIDTH / 2;

		this.layoutClouds();
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
		const elapsed = this.clock!.getElapsedTime();
		this.material!.uniforms.uTime.value = elapsed;

		const span = this.spanRight - this.spanLeft;
		for (const cluster of this.clusters) {
			cluster.group.position.x += cluster.driftSpeed * 0.01;
			cluster.group.position.y =
				cluster.baseY +
				Math.sin(elapsed * 0.5 + cluster.bobPhase) * cluster.bobAmplitude;

			// Wrap drift within the full tiled span so clouds recirculate across
			// the entire width rather than a fixed window.
			if (cluster.group.position.x > this.spanRight) {
				cluster.group.position.x -= span;
			}
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
