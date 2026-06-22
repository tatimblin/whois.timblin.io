export const fragmentShader = /* glsl */ `
uniform vec3 uLightDir;
uniform vec3 uColorHighlight;
uniform vec3 uColorMid;
uniform vec3 uColorShadow;
uniform vec3 uColorDeep;
uniform vec3 uColorAccent;
uniform vec3 uEdgeColor;
uniform float uEdgeStrength;
uniform float uEdgeFalloff;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform float uBandSoftness;
uniform float uFormNoise;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vLocalPosition;
varying vec3 vInstanceCenter;
varying vec3 vBrushSeed;
varying float vCloudHeight;

// --- Noise primitives ---

float hash(vec3 p) {
    p = fract(p * vec3(443.8975, 397.2973, 491.1871));
    p += dot(p.zxy, p.yxz + 19.19);
    return fract(p.x * p.y * p.z);
}

float valueNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x),
            mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
        mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
            mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
        f.z
    );
}

float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
        v += a * valueNoise(p);
        p *= 2.01;
        a *= 0.48;
    }
    return v;
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uLightDir);

    // Stable per-surface coordinate for the subtle painterly mottle (anchored
    // to local space + per-mesh seed so it sticks to the cloud and doesn't
    // shimmer as the cloud drifts).
    vec3 bp = vLocalPosition + vBrushSeed;

    // --- Painted, form-driven toon shading ---
    // Instead of lighting each fragment by its own sphere normal (which makes
    // every sphere read as a separately-lit 3D ball), a painter places a few
    // flat value zones according to the OVERALL form: tops catch light, bellies
    // fall into shadow, the sun-facing side is brighter. We build that "form
    // value", wander its boundaries with noise (so they read as brushwork, not
    // geometry), then posterize into a few flat tones — the cel / toon look.

    // 1) Form value — a painter keeps the cloud mostly bright, dropping the
    //    lower body and away-from-sun side into shadow. The value is driven by
    //    POSITION IN THE OVERALL FORM, not by each sphere's own curvature (that
    //    is what made every puff read as a separately-lit ball). Two big terms:
    //    height in the cluster, and which side of the whole mass faces the sun.
    float heightTerm = smoothstep(-0.15, 0.55, vCloudHeight);      // base→crown

    //    Mass-wide sun gradient: project the INSTANCE CENTRE (cluster-local, so
    //    it spans the whole cloud) onto the light direction. One coherent lit
    //    side / shadow side across the entire mass — not a per-sphere gradient.
    //    Scaled by ~0.12 so a cluster a few units across spans most of the ramp.
    float sunGradient = smoothstep(-0.45, 0.45, dot(vInstanceCenter, lightDir) * 0.12);

    //    Per-billow form shading. Light comes from above, so each rounded billow
    //    catches light on its TOP and falls into soft shadow on its UNDERSIDE —
    //    this is what gives Ghibli cumulus its sculpted, detailed lobes (the
    //    references are built on it). It reads as painted, not as "separate
    //    balls", because the geometry is soft and the value is posterised +
    //    noise-wandered below. normal.y is the up/down-facing of the displaced
    //    surface.
    float upFacing = smoothstep(-0.65, 0.85, normal.y);             // under→top of each billow
    float form = 0.30                       // floor
               + heightTerm * 0.22          // tops of the whole tower brightest
               + sunGradient * 0.15         // whole sun-side of the mass lifts
               + upFacing * 0.33;           // lit billow-tops, shadowed undersides

    // 2) Wander the band boundaries with low-frequency surface noise so the
    //    value edges meander like brush strokes rather than tracing curvature.
    form += (fbm(bp * 1.3) - 0.5) * uFormNoise;

    // 2b) Soft shadow recesses — broad darker hollows carved by the low spots of
    //     a LOW-frequency noise (large, rounded recesses following the billow
    //     clefts, not tight angular speckle). Stronger toward the base, sparse up
    //     top. Low frequency + soft edge keeps the underside soft, not jagged.
    float pocketNoise = fbm(bp * 1.25);
    float pocket = smoothstep(0.58, 0.34, pocketNoise); // 1 in broad noise dips
    float pocketWeight = mix(0.42, 0.14, heightTerm);   // stronger low, sparse high
    form -= pocket * pocketWeight * 0.11;
    form = clamp(form, 0.0, 1.0);

    // 3) Posterize into 4 flat tones with soft painted boundaries (toon ramp).
    //    Ramp order darkest→lightest: deep → shadow → mid → highlight, driven by
    //    three thresholds low→high. Spread so the whole cloud carves into all
    //    four tones — billow undersides reach shadow/deep, lit tops reach
    //    highlight — rather than collapsing the crown into one flat slab.
    float s = uBandSoftness;
    float t1 = smoothstep(0.30 - s, 0.30 + s, form); // deep → shadow
    float t2 = smoothstep(0.52 - s, 0.52 + s, form); // shadow → mid
    float t3 = smoothstep(0.74 - s, 0.74 + s, form); // mid → light
    vec3 color = mix(uColorDeep, uColorShadow, t1);
    color = mix(color, uColorMid, t2);
    color = mix(color, uColorHighlight, t3);

    // 4) Faint pink/gold accent — a warm glow ONLY in the narrow upper-transition
    //    band near the lit crown edge (absent from mid-mass and shadows). Applied
    //    as a mix toward the accent colour, not additive, so luminance stays
    //    controlled and the lavender zone doesn't go muddy.
    float accent = smoothstep(0.60, 0.74, form) * (1.0 - smoothstep(0.74, 0.9, form));
    color = mix(color, uColorAccent, accent * 0.35);

    // --- Soft feathered edges (directional silver lining) ---
    // Lighten thin silhouette fringes toward a pale sky tint at grazing view
    // angles, but ONLY where the surface also faces the sun — so it reads as the
    // reference's directional backlit rim, not a uniform halo around the cloud.
    // Stays opaque (no alpha sorting): just a colour lift at the rim.
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), uEdgeFalloff);
    float sunSide = max(dot(normal, lightDir), 0.0); // 0 on the shadow side
    color = mix(color, uEdgeColor, fresnel * sunSide * uEdgeStrength);

    // --- Atmospheric depth fade ---
    // Use forward (camera-Z) distance, not radial distance, so clouds spread
    // far to the left/right don't fog out just for being off-centre — only
    // genuinely distant (deeper) clouds fade into the sky.
    float depth = abs(cameraPosition.z - vWorldPosition.z);
    float fogFactor = smoothstep(uFogNear, uFogFar, depth);
    color = mix(color, uFogColor, fogFactor);

    gl_FragColor = vec4(color, 1.0);
}
`;
