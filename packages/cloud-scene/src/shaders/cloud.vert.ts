export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uNoiseScale;
uniform float uDisplacementStrength;

attribute vec3 aBrushSeed;
attribute float aCloudHeight;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vLocalPosition;
varying vec3 vBrushSeed;
varying float vCloudHeight;

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

    vec4 worldPosition = mm * vec4(displacedPosition, 1.0);
    vWorldPosition = worldPosition.xyz;
    vLocalPosition = displacedPosition;
    vBrushSeed = aBrushSeed;
    vCloudHeight = aCloudHeight;
    // Instance scales are near-uniform, so transforming the perturbed normal by
    // the instance rotation/scale via normalMatrix * (instanceMatrix's 3x3) is
    // approximated well enough by normalMatrix alone here.
    vNormal = normalize(normalMatrix * mat3(instanceMatrix) * perturbedNormal);

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;
