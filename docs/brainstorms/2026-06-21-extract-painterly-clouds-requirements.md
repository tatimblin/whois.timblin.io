# Extract `painterly-clouds` — a shareable Three.js cloud primitive

**Date:** 2026-06-21
**Status:** Requirements (ready for planning)
**Scope:** Standard (extraction + small refactor into reusable layers)

## Problem & Goal

The painterly cloud system in `packages/cloud-scene` is good enough to share, but
today it ships as an opinionated, website-specific Web Component (`<cloud-scene>`)
that owns its own renderer, camera, animation loop, and a hero-section-tuned sky
composition. The genuinely reusable parts — the procedural billow generator and the
painterly toon shader material — are fused into that scene code and cannot be used
independently.

**Goal:** Publish a standalone package, **`painterly-clouds`**, that exposes the cloud
as composable Three.js primitives. Anyone who wants Kiki's-Delivery-Service–style
painterly clouds can install it, add a cloud to **their own** scene, and tune the look
via configuration ("the sliders"). They bring their own renderer, camera, lights, sky,
and animation loop.

## Target User

A **Three.js developer building their own scene** who wants this specific painterly
cloud look as a drop-in primitive — not a finished background, not a tutorial. They
have a camera and a render loop already; they want a cloud `Group` to place and a
material whose look they can tune.

> **Assumption (unvalidated):** Demand is inferred from the quality/novelty of the look,
> not from a specific person who asked. This is a share-the-craft / portfolio effort.
> The bar for success is therefore "a developer can drop it in and get the look," plus
> the repo being compelling enough to travel (see Reception below).

## Scope — what ships

The package exposes **two primitives**:

1. **`createCloudCluster(params)`** — builds one painterly cloud as a Three.js `Group`
   of instanced spheres (the hierarchical billow placement from `create-cloud.ts`).
   Returns a `Group` the user adds to their scene and positions themselves.
2. **`createCloudMaterial(options)`** — returns the painterly toon `ShaderMaterial`
   (vertex + fragment shader) with sensible defaults and overridable options. **This
   factory does not exist yet** — uniforms are currently hardcoded inline in
   `packages/cloud-scene/src/index.ts:82`. Creating it is the core refactor.

### Configuration surface (the "sliders")

Derived from the existing uniforms (`cloud.frag.ts`, `cloud.vert.ts`) and cluster params
(`create-cloud.ts`). All must be settable at creation and ideally mutable at runtime
(they are `ShaderMaterial` uniforms, so runtime tuning is natural).

**Material — palette:** `colorHighlight`, `colorMid`, `colorShadow`, `colorDeep`,
`colorAccent` (warm crown glow).
**Material — light & edge:** `lightDir`, `edgeColor`, `edgeStrength`, `edgeFalloff`.
**Material — form:** `displacementStrength`, `noiseScale`, `bandSoftness`, `formNoise`,
`weldAmount`.
**Material — atmosphere:** `fogColor`, `fogNear`, `fogFar`.
**Material — animation:** `time` (user advances this from their own loop).
**Cluster — shape:** `sphereCount`, `spread {x,y,z}`, `baseScale`, `flatten`, `edgeSoft`.

### Required technical changes for a publishable package

- **`three` becomes a `peerDependency`** (currently a regular `dependency: ^0.170.0`).
  Shipping a bundled `three` causes "multiple instances of Three.js imported" errors and
  breaks `instanceof` checks in consumer projects. This is a correctness requirement, not
  a nicety.
- **Ship built output** (compiled ESM + `.d.ts` types), not raw `.ts` via `exports`
  pointing at `src/` (the current monorepo setup). _How_ to build is a planning decision.
- **License + package metadata** for npm (MIT is the ecosystem default).

## Scope — what does NOT ship (and why)

- **The `<cloud-scene>` Web Component.** It owns a renderer and RAF loop, which directly
  contradicts "configure it in your own scene." Out of the package's API.
- **The near/mid/far band layout** (`BASE_CONFIGS`, `index.ts:175`). These x/y/z, scale,
  and drift values are tuned to this website's hero section (camera at z=42 looking up at
  a cumulus tower). They are *a composition*, not a primitive. → becomes a **demo/README
  example**, not shipped API.
- **The gradient sky dome** (`addSkyDome`, `index.ts:249`). Generic-ish, but a backdrop is
  the consumer's concern. → demonstrated in the example, not shipped (revisit only if
  demo work shows the cloud reads poorly without a bundled backdrop helper).
- **The drift/bob/tiling loop.** The *idea* (advance `time`, translate the group) is one
  line of README guidance; the tiling/wrap implementation is coupled to the band layout.
- **Models / texture assets.** There are none — the clouds are fully procedural. "Zero
  assets" is itself a selling point, not a gap.

## Reception requirements (table stakes for a visual repo)

A composable primitive in this space gets positive feedback only when paired with a
showcase. These are part of the deliverable, not optional polish:

- **Live demo page** with the configuration wired to live controls — drag sliders, watch
  one cloud re-form. (A single tweakable cloud is more compelling and easier to ship than
  a static whole-sky.)
- **Animated GIF/video at the top of the README**, above any prose.
- **Copy-paste minimal example** that actually runs and produces the hero look.
- **Configuration/options table** in the README.
- Optional but high-leverage: a short **technique writeup** ("painterly Ghibli clouds from
  instanced spheres, no raymarching") — this is the kind of thing that travels.

## Success Criteria

1. A developer can `npm install painterly-clouds`, add `createCloudCluster` +
   `createCloudMaterial` to an existing scene in <15 lines, and get the painterly look.
2. No "multiple instances of Three.js" warning in a consumer project (peer dep verified).
3. The look is tunable to a visibly different palette/mood by changing options alone — no
   shader editing.
4. The repo has a live demo and an above-the-fold visual; a stranger understands what it
   is in one screen.
5. This website still renders its hero clouds correctly after the extraction (whether by
   consuming the new package or keeping a thin local layer — a planning decision).

## Open Questions (for planning)

1. **New standalone repo vs. a publishable package in this monorepo?** Affects build,
   versioning, and how this site consumes it.
2. **Does this site consume the published package, or keep `cloud-scene` as a thin
   wrapper** (band layout + dome + element) that imports the new primitives? Recommended:
   the latter, so the site keeps its composition while the package stays un-opinionated.
3. **Demo hosting/build** (GitHub Pages, Vercel, StackBlitz embed) and whether the demo
   lives in the package repo or separately.
4. **Camera-coupling in the fog term:** the fragment shader fogs on
   `abs(cameraPosition.z - vWorldPosition.z)` (`cloud.frag.ts:188`), assuming a camera
   looking down −Z. Document this assumption, or generalize? Likely just document.
5. **API ergonomics:** flat options object vs. grouped (`palette`, `form`, `atmosphere`)?
   Naming of the package and exports.
6. **Build toolchain** for ESM + types (the repo currently uses Astro/Bun and ships raw
   `.ts`).

## Key source references

- `packages/cloud-scene/src/create-cloud.ts` — billow generator (`createCloudCluster`),
  ships ~as-is.
- `packages/cloud-scene/src/shaders/cloud.frag.ts` / `cloud.vert.ts` — the painterly toon
  shader; uniforms become `createCloudMaterial` options.
- `packages/cloud-scene/src/index.ts` — the Web Component; source of the inline uniform
  defaults (`:82`), band layout (`:175`), and sky dome (`:249`) — the parts to leave
  behind or demote to an example.
