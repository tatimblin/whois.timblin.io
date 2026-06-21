export const fragmentShader = /* glsl */ `
uniform vec3 uLightDir;
uniform vec3 uColorHighlight;
uniform vec3 uColorMid;
uniform vec3 uColorShadow;
uniform vec3 uColorRim;
uniform vec3 uSkyColor;
uniform vec3 uGroundColor;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform float uBands;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vWorldPosition;
varying vec3 vLocalPosition;
varying vec3 vBrushSeed;
varying float vDisplacement;
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
    vec3 viewDir = normalize(vViewDir);
    vec3 lightDir = normalize(uLightDir);

    // Stable per-surface coordinate for the subtle painterly mottle (anchored
    // to local space + per-mesh seed so it sticks to the cloud and doesn't
    // shimmer as the cloud drifts).
    vec3 bp = vLocalPosition + vBrushSeed;

    // --- Soft mesh-cloud shading (procedural-clouds skill) ---
    // The reference Ghibli clouds are smooth, rounded white masses with gentle
    // cool shadows — no cel facets, no brush grain. We shade the displaced
    // surface with a soft wrap-diffuse and let the geometry's lumps carry the
    // form.

    // Wrap diffuse — very soft terminator so light wraps generously around the
    // billows instead of a hard light/dark split.
    float ndl = dot(normal, lightDir);
    float diffuse = smoothstep(-0.7, 0.9, ndl);

    // Top-lit bias: cloud tops catch the sky's light and read brightest.
    float upFacing = normal.y * 0.5 + 0.5;
    float topBias = smoothstep(-0.1, 0.7, normal.y) * 0.25;

    // Soft subsurface glow where light pushes through from behind (matte, not
    // a glossy specular bead).
    float sss = pow(max(dot(-normal, lightDir), 0.0), 2.0) * 0.2;

    // Gentle self-shadowing: undersides and the lower part of each cloud go
    // into soft cool shadow (the cumulus grey-base signature), kept light so
    // the clouds stay airy and bright.
    float verticalAO = mix(0.74, 1.0, smoothstep(-0.1, 0.7, normal.y));
    float baseDarken = mix(0.82, 1.0, smoothstep(0.0, 0.6, vCloudHeight));
    float ao = verticalAO * baseDarken;

    // Combine into a single soft lit term. The value range is compressed (high
    // floor, lower gain) so the shading reacts gently to normal direction —
    // this is what minimises the hard seam lines where two opaque spheres
    // interpenetrate (their abrupt normal jump becomes a soft value step, not a
    // crisp line). Flatter, but in the spirit of painterly clouds.
    float lit = clamp((diffuse + topBias + sss) * ao, 0.0, 1.0);
    lit = 0.5 + lit * 0.5;

    // Whisper of low-frequency mottle so large flats aren't dead-uniform —
    // far gentler than brush grain, just enough to read as painted.
    float mottle = (fbm(bp * 1.6) - 0.5) * 0.06;
    lit = clamp(lit + mottle, 0.0, 1.0);

    // --- Smooth colour ramp: cool shadow → soft white → bright white ---
    vec3 color = mix(uColorShadow, uColorMid, smoothstep(0.0, 0.55, lit));
    color = mix(color, uColorHighlight, smoothstep(0.5, 0.95, lit));

    // Hemisphere ambient so shadowed areas glow with sky/ground bounce instead
    // of going dark.
    vec3 ambient = mix(uGroundColor, uSkyColor, upFacing);
    color = mix(ambient, color, 0.85);

    // --- Cool shadows / warm lights (tutorial step 5) ---
    // Push the temperature split so undersides read cool blue-violet and the
    // sunlit crowns read warm-white — the contrast that gives cumulus its punch.
    float shadowAmt = 1.0 - smoothstep(0.18, 0.62, lit);
    color *= mix(vec3(1.0), vec3(0.90, 0.94, 1.10), shadowAmt * 0.55);
    float lightAmt = smoothstep(0.62, 0.97, lit);
    color *= mix(vec3(1.0), vec3(1.07, 1.04, 0.95), lightAmt * 0.35);

    // --- Soft lit scallop edges (tutorial step 2) ---
    // The tops of the billows that protrude and face the sun catch a highlight.
    // Softened (wider transition, lower strength) so it reads as a gentle glow
    // on the crowns rather than a crisp band — a crisp scallop also fires along
    // sphere-intersection seams and reinforces those hard lines.
    float sunUp = smoothstep(-0.1, 0.55, ndl) * smoothstep(-0.15, 0.55, normal.y);
    float protrude = smoothstep(0.1, 0.7, vDisplacement);
    float scallop = smoothstep(0.3, 1.0, sunUp * protrude);
    color = mix(color, uColorHighlight, scallop * 0.3);

    // --- Soft warm rim where the sun grazes thin edges (very subtle) ---
    // Kept gentle: a tight fresnel traces every sphere-intersection seam (where
    // the normal grazes the view), so a strong rim re-draws the hard lines.
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    float rimLight = fresnel * smoothstep(0.0, 0.8, ndl) * 0.08;
    color = mix(color, uColorRim, rimLight);

    // Translucent glow where light passes through thin/protruding edges
    // (sun behind the cloud).
    float backScatter = pow(max(dot(viewDir, -lightDir), 0.0), 3.0);
    float thinEdge = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    color += uColorRim * backScatter * thinEdge * 0.4;

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
