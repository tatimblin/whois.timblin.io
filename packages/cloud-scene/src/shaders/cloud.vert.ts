export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uNoiseScale;
uniform float uDisplacementStrength;

attribute vec3 aBrushSeed;
attribute float aCloudHeight;
attribute vec3 aClusterCentroid;
attribute float aEdgeSoft;

varying vec3 vNormal;
varying vec3 vNormalSmooth;
varying vec3 vWorldPosition;
varying vec3 vLocalPosition;
varying vec3 vInstanceCenter;
varying vec3 vMassOut;
varying vec3 vBrushSeed;
varying float vCloudHeight;
varying float vEdgeSoft;

// Simplex-style 3D noise (Ashima Arts)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// 5-octave fBm for the big billowing lobes (carries the silhouette)
float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
        value += amplitude * snoise(p * frequency);
        amplitude *= 0.45;
        frequency *= 2.01;
    }
    return value;
}

// 3-octave fBm for the high-frequency cauliflower grain (cheaper)
float fbmDetail(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 3; i++) {
        value += amplitude * snoise(p * frequency);
        amplitude *= 0.45;
        frequency *= 2.01;
    }
    return value;
}

// 2-octave fBm for the SHADING normal only — just the broadest lobe forms. The
// higher octaves of the 5-octave fbm above still wiggle several times across a
// large billow at meaningful slope, which the interior shading reads as ripple;
// keeping only the two lowest octaves makes a big billow face resolve to one
// near-constant normal (a single flat colour in its centre).
float fbmBroad(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 2; i++) {
        value += amplitude * snoise(p * frequency);
        amplitude *= 0.45;
        frequency *= 2.01;
    }
    return value;
}

// Layered displacement: big low-freq lobes for form + fine grain for cauliflower.
// Used for the base position AND the finite-difference normal samples so the
// recomputed normal always matches the displaced surface.
float displace(vec3 p) {
    // Big rounded billows dominate; only a touch of fine detail so the
    // silhouette stays smooth and soft (Ghibli reference) rather than spiky.
    // The uTime scroll makes the surface gently boil/warp in place. Sampled in
    // cluster-local space, so this boil is the ONLY shape change — the cloud
    // doesn't additionally morph from drifting across the sky.
    float lobes = fbm(p * (uNoiseScale * 0.45) + uTime * 0.02);
    float detail = fbmDetail(p * (uNoiseScale * 1.8) + uTime * 0.042);
    return (lobes * 0.88 + detail * 0.12) * uDisplacementStrength;
}

// Smooth displacement: ONLY the low-frequency lobe component, no cauliflower
// grain. The grain is a small fraction of the amplitude but, being high
// frequency, dominates the surface SLOPE — so a normal built from the full
// displace() above is peppered with little wiggles that ripple across flat
// interior faces. We build the interior shading normal from this smooth field
// instead, so the middle of each cloud reads as broad flat value zones. The
// detailed silhouette still comes from the full displace() geometry.
float displaceSmooth(vec3 p) {
    float lobes = fbmBroad(p * (uNoiseScale * 0.45) + uTime * 0.02);
    return lobes * 0.88 * uDisplacementStrength;
}

void main() {
    // Combined model-space → world transform for this instance. modelMatrix is
    // shared across all instances of the cluster, so instanceMatrix is what
    // gives each sphere its own world position (and thus its own noise domain).
    mat4 mm = modelMatrix * instanceMatrix;

    // Sample the displacement in CLUSTER-LOCAL space (instanceMatrix only — no
    // drifting modelMatrix translation), so each cloud keeps a fixed shape as
    // the cluster drifts across the sky instead of morphing through a world
    // noise field.
    vec3 localPos = (instanceMatrix * vec4(position, 1.0)).xyz;
    float displacement = displace(localPos);

    vec3 displacedPosition = position + normal * displacement;

    // Compute perturbed normal via finite differences, sampling the noise in
    // the same cluster-local space as the base point.
    float eps = 0.01;
    vec3 tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
    if (length(cross(normal, vec3(0.0, 1.0, 0.0))) < 0.001) {
        tangent = normalize(cross(normal, vec3(1.0, 0.0, 0.0)));
    }
    vec3 bitangent = normalize(cross(normal, tangent));

    vec3 lp1 = (instanceMatrix * vec4(position + tangent * eps, 1.0)).xyz;
    vec3 lp2 = (instanceMatrix * vec4(position + bitangent * eps, 1.0)).xyz;
    float n1 = displace(lp1);
    float n2 = displace(lp2);

    vec3 p0 = displacedPosition;
    vec3 p1 = (position + tangent * eps) + normal * n1;
    vec3 p2 = (position + bitangent * eps) + normal * n2;

    vec3 perturbedNormal = normalize(cross(p1 - p0, p2 - p0));

    // Second normal from the SMOOTH (grain-free) displacement, sampled at the
    // same points. This drives the interior shading so flat faces read flat,
    // while the detailed perturbedNormal above still shapes the silhouette edge.
    float ns1 = displaceSmooth(lp1);
    float ns2 = displaceSmooth(lp2);
    vec3 sp0 = position + normal * displaceSmooth(localPos);
    vec3 sp1 = (position + tangent * eps) + normal * ns1;
    vec3 sp2 = (position + bitangent * eps) + normal * ns2;
    vec3 perturbedNormalSmooth = normalize(cross(sp1 - sp0, sp2 - sp0));

    vec4 worldPosition = mm * vec4(displacedPosition, 1.0);
    vWorldPosition = worldPosition.xyz;
    vLocalPosition = displacedPosition;
    // Centre of this instance in CLUSTER-LOCAL space (instanceMatrix translation
    // only — excludes the drifting modelMatrix). This spans the whole cluster, so
    // projecting it onto the light gives ONE lit/shadow side across the entire
    // mass rather than a per-sphere gradient. Drift-stable: the cloud keeps its
    // light read as the cluster slides across the sky.
    vInstanceCenter = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    // Mass-outward direction: from the cluster centroid to this surface point, in
    // cluster-local space (instanceMatrix only, drift-stable). Surfaces facing
    // outward from the mass are the true outer silhouette; surfaces facing inward
    // are interior sphere overlaps (where the seam should be welded away). No
    // rotation in the matrices, so this direction is valid against vNormal.
    vec3 clusterPos = (instanceMatrix * vec4(displacedPosition, 1.0)).xyz;
    vMassOut = normalize(clusterPos - aClusterCentroid);
    vBrushSeed = aBrushSeed;
    vCloudHeight = aCloudHeight;
    vEdgeSoft = aEdgeSoft;
    // World-space normal. Clusters and instances carry only translation and
    // near-uniform scale (no rotation — see create-cloud.ts), so the world normal
    // is just the instance-space normal: modelMatrix/instanceMatrix rotation is
    // identity. Computing it in WORLD space (not view space) lets the fragment
    // shader's fresnel and sun-side terms use world-space cameraPosition/uLightDir
    // directly.
    vNormal = normalize(mat3(instanceMatrix) * perturbedNormal);
    vNormalSmooth = normalize(mat3(instanceMatrix) * perturbedNormalSmooth);

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;
