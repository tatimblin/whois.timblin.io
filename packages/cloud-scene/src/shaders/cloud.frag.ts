export const fragmentShader = /* glsl */ `
uniform vec3 uLightDir;
uniform vec3 uColorHighlight;
uniform vec3 uColorMid;
uniform vec3 uColorShadow;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform float uBandSoftness;
uniform float uFormNoise;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vLocalPosition;
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

    float ndl = dot(normal, lightDir);

    // 1) Form value — a painter keeps the cloud mostly bright, dropping the
    //    lower body and away-from-sun side into shadow. Bias bright: the whole
    //    cloud floats high in value, with shadow reserved for the base.
    float heightTerm = smoothstep(-0.15, 0.55, vCloudHeight);      // base→crown
    float upFacing = normal.y * 0.5 + 0.5;                          // broad up/down
    float sunFacing = ndl * 0.5 + 0.5;                             // broad lit side
    float form = 0.42                       // bright floor — most of cloud is lit
               + heightTerm * 0.32          // tops brightest, base darkest
               + upFacing * 0.16            // up-faces catch sky light
               + sunFacing * 0.10;          // gentle sun-side lift

    // 2) Wander the band boundaries with low-frequency surface noise so the
    //    value edges meander like brush strokes rather than tracing curvature.
    form += (fbm(bp * 1.3) - 0.5) * uFormNoise;

    // 2b) Sparse shadow pockets — occasional darker dabs carved by the low spots
    //     of a higher-frequency noise. Frequent toward the base, but kept a
    //     little present up top so the crown isn't a flat white slab.
    float pocketNoise = fbm(bp * 2.6);
    float pocket = smoothstep(0.5, 0.32, pocketNoise); // 1 in noise dips, else 0
    float pocketWeight = mix(0.7, 0.3, heightTerm);    // stronger low, sparse high
    form -= pocket * pocketWeight * 0.16;
    form = clamp(form, 0.0, 1.0);

    // 3) Posterize into 3 flat tones (shadow / mid / light) with soft painted
    //    boundaries (toon ramp, replicated inline). Thresholds sit low so most
    //    of the cloud lands in mid/light and only the base reads as shadow.
    float s = uBandSoftness;
    float t1 = smoothstep(0.32 - s, 0.32 + s, form); // shadow → mid
    float t2 = smoothstep(0.62 - s, 0.62 + s, form); // mid → light
    vec3 color = mix(uColorShadow, uColorMid, t1);
    color = mix(color, uColorHighlight, t2);

    // 4) Cool shadows / warm lights, driven off the banded value so it stays
    //    flat and graphic (not a smooth per-normal gradient).
    float band = t1 * 0.5 + t2 * 0.5; // 0 shadow, ~0.5 mid, 1 light
    color *= mix(vec3(0.96, 0.98, 1.06), vec3(1.0), smoothstep(0.0, 0.5, band));
    color *= mix(vec3(1.0), vec3(1.05, 1.03, 0.96), smoothstep(0.5, 1.0, band));

    // 5) Subtle lit-top glow — a quiet lightening where the form is high and
    //    faces up toward the sun. No crisp stroke.
    float litTop = smoothstep(0.55, 1.0, form) * smoothstep(-0.1, 0.6, normal.y);
    color = mix(color, uColorHighlight, litTop * 0.12);

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
