import {
	Group,
	InstancedMesh,
	InstancedBufferAttribute,
	Object3D,
	SphereGeometry,
	Vector3,
	type ShaderMaterial,
} from "three";

export interface ClusterParams {
	sphereCount: number;
	spread: { x: number; y: number; z: number };
	baseScale: number;
	material: ShaderMaterial;
}

interface Billow {
	x: number;
	y: number;
	z: number;
	radius: number;
}

interface Placement {
	x: number;
	y: number;
	z: number;
	sx: number;
	sy: number;
	sz: number;
	radius: number;
}

// Drop a sphere placement, slightly flattened, onto the build list.
function addPlacement(out: Placement[], b: Billow, radius: number) {
	const round = 0.9 + Math.random() * 0.2;
	out.push({
		x: b.x,
		y: Math.max(b.y, 0), // flat base: nothing hangs below the y=0 shelf
		z: b.z,
		sx: radius * round,
		sy: radius * round * 0.94,
		sz: radius * round,
		radius,
	});
}

export function createCloudCluster(params: ClusterParams): Group {
	const { sphereCount, spread, baseScale, material } = params;
	const group = new Group();

	// --- Hierarchical billow placement (matches the pixel-art breakdown) ---
	// A convincing cumulus silhouette is the union of many overlapping circles of
	// widely varying size: big interior masses, fringed by rings of smaller lobes
	// along every edge, with occasional small puffs jutting out as outcroppings.
	// We stamp the same rim-fringe rule at three shrinking scales.
	const placements: Placement[] = [];

	// Budget the sphere count across tiers (primaries are few; fringe is many).
	const primaryCount = Math.max(3, Math.round(sphereCount * 0.06));

	// --- Tier 1: primary masses — the body, flat base + doming crown ---
	const primaries: Billow[] = [];
	const baseCount = Math.max(2, Math.round(primaryCount * 0.45));
	for (let l = 0; l < primaryCount; l++) {
		let b: Billow;
		if (l < baseCount) {
			// Wide low billows along a flat shelf.
			const u = baseCount > 1 ? l / (baseCount - 1) : 0.5;
			b = {
				x: (u - 0.5) * spread.x * 0.95 + (Math.random() - 0.5) * spread.x * 0.25,
				y: Math.random() * 0.16 * spread.y,
				z: (Math.random() - 0.5) * spread.z,
				radius: baseScale * (1.1 + Math.random() * 0.5),
			};
		} else {
			// Crown billows climb upward and pull toward the centre (sqrt bias),
			// tapering so the cloud domes into a cauliflower top.
			const ut = (l - baseCount) / Math.max(1, primaryCount - baseCount - 1);
			const h = 0.3 + Math.sqrt(ut) * 0.7;
			const taper = 1.0 - h * 0.6;
			b = {
				x: (Math.random() - 0.5) * spread.x * taper,
				y: h * spread.y,
				z: (Math.random() - 0.5) * spread.z * 0.65,
				radius: baseScale * (0.8 - h * 0.28) * (0.85 + Math.random() * 0.3),
			};
		}
		primaries.push(b);
		addPlacement(placements, b, b.radius);
	}

	// How many child lobes each remaining tier gets, distributed across parents.
	const remaining = sphereCount - placements.length;
	const rimTotal = Math.round(remaining * 0.45); // tier 2
	const fringeTotal = remaining - rimTotal; // tier 3

	// --- Tier 2: rim lobes — medium puffs on the OUTWARD rim of each primary ---
	const rimLobes: Billow[] = [];
	const totalPrimRadius = primaries.reduce((s, p) => s + p.radius, 0);
	for (let i = 0; i < rimTotal; i++) {
		// Pick a primary weighted by radius (bigger masses get more rim lobes).
		let pick = Math.random() * totalPrimRadius;
		let parent = primaries[0];
		for (const p of primaries) {
			pick -= p.radius;
			if (pick <= 0) {
				parent = p;
				break;
			}
		}
		// Random direction, biased upward/sideways (busy detail on top & sides,
		// flatter underside) — push OUTWARD past the parent rim.
		const dir = new Vector3(
			Math.random() - 0.5,
			(Math.random() - 0.2) * 0.9, // upward bias
			(Math.random() - 0.5) * 0.7
		).normalize();
		// Heavy overlap: place the lobe close enough that it fuses with the
		// parent mass (centre distance < parent radius) while still bumping out
		// the silhouette. Bigger lobes than before so puffs read as solid mass.
		const radius = parent.radius * (0.5 + Math.random() * 0.3);
		const offset = parent.radius * (0.45 + Math.random() * 0.4);
		const b: Billow = {
			x: parent.x + dir.x * offset,
			y: parent.y + dir.y * offset,
			z: parent.z + dir.z * offset,
			radius,
		};
		rimLobes.push(b);
		addPlacement(placements, b, radius);
	}

	// --- Tier 3: fringe + outcroppings — small puffs on the rim of rim lobes ---
	const parentsForFringe = rimLobes.length ? rimLobes : primaries;
	const totalRimRadius = parentsForFringe.reduce((s, p) => s + p.radius, 0);
	for (let i = 0; i < fringeTotal; i++) {
		let pick = Math.random() * totalRimRadius;
		let parent = parentsForFringe[0];
		for (const p of parentsForFringe) {
			pick -= p.radius;
			if (pick <= 0) {
				parent = p;
				break;
			}
		}
		const dir = new Vector3(
			Math.random() - 0.5,
			(Math.random() - 0.15) * 0.9,
			(Math.random() - 0.5) * 0.7
		).normalize();
		// ~25% jut out as outcroppings; the rest tighten the fringe with heavy
		// overlap so the cloud edge stays a solid scalloped mass, not popcorn.
		const outcrop = Math.random() < 0.25;
		const radius = parent.radius * (0.45 + Math.random() * 0.25);
		const offset =
			parent.radius * (outcrop ? 0.8 + Math.random() * 0.5 : 0.4 + Math.random() * 0.35);
		const b: Billow = {
			x: parent.x + dir.x * offset,
			y: parent.y + dir.y * offset,
			z: parent.z + dir.z * offset,
			radius,
		};
		addPlacement(placements, b, radius);
	}

	let maxY = 0.0001;
	for (const p of placements) maxY = Math.max(maxY, p.y);

	// --- Build InstancedMesh per LOD bucket (size-based) ---
	// Large/medium spheres get more segments; small fringe puffs use low poly
	// (displacement + soft shading hide it). Two draw calls instead of ~150.
	const bigGeo = new SphereGeometry(1, 24, 18);
	const smallGeo = new SphereGeometry(1, 12, 10);
	const lodThreshold = baseScale * 0.6;

	const big = placements.filter((p) => p.radius >= lodThreshold);
	const small = placements.filter((p) => p.radius < lodThreshold);

	const dummy = new Object3D();

	for (const [geo, list] of [
		[bigGeo, big],
		[smallGeo, small],
	] as const) {
		if (list.length === 0) {
			geo.dispose();
			continue;
		}
		const mesh = new InstancedMesh(geo, material, list.length);
		const seeds = new Float32Array(list.length * 3);
		const heights = new Float32Array(list.length);

		for (let i = 0; i < list.length; i++) {
			const p = list[i];
			dummy.position.set(p.x, p.y, p.z);
			dummy.scale.set(p.sx, p.sy, p.sz);
			dummy.rotation.set(0, 0, 0);
			dummy.updateMatrix();
			mesh.setMatrixAt(i, dummy.matrix);

			seeds[i * 3] = Math.random() * 100;
			seeds[i * 3 + 1] = Math.random() * 100;
			seeds[i * 3 + 2] = Math.random() * 100;
			heights[i] = p.y / maxY;
		}
		mesh.instanceMatrix.needsUpdate = true;
		geo.setAttribute("aBrushSeed", new InstancedBufferAttribute(seeds, 3));
		geo.setAttribute("aCloudHeight", new InstancedBufferAttribute(heights, 1));

		// Clouds drift; their bounds change — skip frustum culling to avoid pop-out.
		mesh.frustumCulled = false;
		group.add(mesh);
	}

	return group;
}
