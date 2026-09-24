// Generates public/models/rj45-connector.glb and public/models/cat-cable.glb from scratch with
// three.js primitives, rather than sourcing them externally. No free, directly-downloadable
// (no-login) GLB of an RJ45 plug or a UTP cable's internal twisted-pair construction turned up
// during research -- Sketchfab/CGTrader/TurboSquid gate their free downloads behind an account
// login, which this one-off script can't do. Building them procedurally instead means: no
// licensing/attribution question, and every dimension and color below is pinned to the real
// 8P8C/T568B spec, which is the "accurate" part the quiz needs -- not just "some 3D model that
// looks like it". Run once with `node scripts/generate-rj45-cable-models.mjs`; the two GLBs it
// writes are committed like any other public/models asset.
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// GLTFExporter's binary path reads its Blob back out through the browser FileReader API, which
// Node doesn't have -- minimal polyfill covering just the two read modes it actually calls.
globalThis.FileReader = class {
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = `data:${blob.type || "application/octet-stream"};base64,${Buffer.from(buf).toString("base64")}`;
      this.onload?.();
      this.onloadend?.();
    }, (err) => this.onerror?.(err));
  }
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      this.onload?.();
      this.onloadend?.();
    }, (err) => this.onerror?.(err));
  }
};

const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "models");

// Real T568B pin-out order (pins 1-8), used for both the RJ45 plug's internal wire stubs and the
// cable's twisted pairs so the two models agree with each other and with module-2/quiz.ts.
const T568B = [
  { color: 0xffffff, stripe: 0xff8c1a }, // 1: white/orange
  { color: 0xff8c1a, stripe: null }, //      2: orange
  { color: 0xffffff, stripe: 0x2ecc40 }, // 3: white/green
  { color: 0x1a56ff, stripe: null }, //      4: blue
  { color: 0xffffff, stripe: 0x1a56ff }, // 5: white/blue
  { color: 0x2ecc40, stripe: null }, //      6: green
  { color: 0xffffff, stripe: 0x8b5a2b }, // 7: white/brown
  { color: 0x8b5a2b, stripe: null }, //      8: brown
];
// The four physical pairs, as actually twisted together (1-2, 3-6, 4-5, 7-8) -- not sequential
// pin order, which is exactly the point a learner needs to see to understand "split pairs".
const PAIRS = [
  [T568B[0], T568B[1]],
  [T568B[2], T568B[5]],
  [T568B[3], T568B[4]],
  [T568B[6], T568B[7]],
];

// Shared per-color materials, reused across every wire/pin/stripe in both models -- lets the
// merge-by-material step below collapse thousands of tiny segments into a handful of draw calls
// instead of one glTF node+mesh+accessor set per segment, which is what actually inflates file
// size (the raw triangle count here is trivial; JSON/accessor bookkeeping per mesh is not).
const materialCache = new Map();
function getMaterial(hex, extra = {}) {
  const key = `${hex}:${JSON.stringify(extra)}`;
  if (!materialCache.has(key)) {
    materialCache.set(key, new THREE.MeshStandardMaterial({ color: hex, roughness: 0.5, ...extra }));
  }
  return materialCache.get(key);
}

/** A baked (already-transformed) cylinder geometry between two points -- no Mesh, no Object3D,
 * just vertex data ready to be merged with every other geometry of the same color. */
function segmentGeometry(p1, p2, radius, radialSegments = 6) {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const length = dir.length();
  if (length < 1e-6) return null;
  const geometry = new THREE.CylinderGeometry(radius, radius, length, radialSegments);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  const matrix = new THREE.Matrix4().compose(p1.clone().add(p2).multiplyScalar(0.5), quaternion, new THREE.Vector3(1, 1, 1));
  geometry.applyMatrix4(matrix);
  return geometry;
}

/** Adds one twisted pair (two wires spiraling around a shared local axis) as baked geometry,
 * bucketed by color hex into `geometriesByColor` for later merging -- real UTP wire, not a smooth
 * curve, is what a learner sees on an actual stripped cable end. */
function addTwistedPair(geometriesByColor, wireA, wireB, { centerX, centerZOffset, turnsPerUnit, wireRadius, pairRadius, length, segmentsPerTurn = 10 }) {
  const totalTurns = length * turnsPerUnit;
  const steps = Math.max(8, Math.round(totalTurns * segmentsPerTurn));

  function pointAt(step, phaseOffset) {
    const t = step / steps;
    const y = t * length;
    const angle = t * totalTurns * Math.PI * 2 + phaseOffset;
    return new THREE.Vector3(centerX + Math.cos(angle) * pairRadius, y, centerZOffset + Math.sin(angle) * pairRadius);
  }

  function push(hex, geometry) {
    if (!geometry) return;
    if (!geometriesByColor.has(hex)) geometriesByColor.set(hex, []);
    geometriesByColor.get(hex).push(geometry);
  }

  for (let i = 0; i < steps; i++) {
    const a1 = pointAt(i, 0);
    const a2 = pointAt(i + 1, 0);
    const b1 = pointAt(i, Math.PI);
    const b2 = pointAt(i + 1, Math.PI);
    push(wireA.color, segmentGeometry(a1, a2, wireRadius));
    push(wireB.color, segmentGeometry(b1, b2, wireRadius));

    // A striped wire (e.g. white/orange) gets a short band of its pair color painted over the
    // white base every couple of segments -- cheap approximation of the printed color stripe
    // real T568B wire has.
    if (wireA.stripe !== null && i % 3 === 0) push(wireA.stripe, segmentGeometry(a1, a2, wireRadius * 1.01));
    if (wireB.stripe !== null && i % 3 === 0) push(wireB.stripe, segmentGeometry(b1, b2, wireRadius * 1.01));
  }
}

/** Merges every geometry bucketed under the same color into one mesh per color -- collapses
 * thousands of tiny segments down to (at most) one draw call per distinct wire color. */
function mergedMeshesByColor(geometriesByColor) {
  const meshes = [];
  for (const [hex, geometries] of geometriesByColor) {
    const merged = mergeGeometries(geometries, false);
    meshes.push(new THREE.Mesh(merged, getMaterial(hex)));
  }
  return meshes;
}

function buildRJ45Connector() {
  const root = new THREE.Group();

  // Real 8P8C dimensions, scaled 1 unit = 1 cm: body ~11.68mm wide x 6.35mm tall x 16mm long,
  // gold contacts along the top-front edge, latch tab on the underside, strain-relief boot at
  // the back tapering down to the round cable.
  const bodyW = 1.168;
  const bodyH = 0.635;
  const bodyL = 1.6;

  const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0xe5edf7, roughness: 0.2, transparent: true, opacity: 0.5 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, bodyL), bodyMat);
  body.position.set(0, 0, bodyL / 2);
  root.add(body);

  // 8 gold-plated contacts, evenly spaced across the front top edge, each with the matching
  // internal wire stub visible through the clear body underneath it -- ties the plug's pin-out
  // visually to the cable's T568B color order. Baked and merged by material, same as the cable.
  const pinGeometries = [];
  const wiresByColor = new Map();
  const pinW = bodyW / 10;
  const pinGap = bodyW / 8;
  for (let i = 0; i < 8; i++) {
    const x = -bodyW / 2 + pinGap * (i + 0.5);
    const pin = new THREE.BoxGeometry(pinW, 0.05, 0.5);
    pin.translate(x, bodyH / 2 + 0.02, bodyL - 0.3);
    pinGeometries.push(pin);

    const hex = T568B[i].color;
    const wire = new THREE.CylinderGeometry(0.035, 0.035, bodyL * 0.85, 6);
    wire.rotateX(Math.PI / 2);
    wire.translate(x, 0, bodyL * 0.45);
    if (!wiresByColor.has(hex)) wiresByColor.set(hex, []);
    wiresByColor.get(hex).push(wire);
  }
  root.add(new THREE.Mesh(mergeGeometries(pinGeometries, false), getMaterial(0xd4af37, { metalness: 0.85, roughness: 0.3 })));
  for (const [hex, geometries] of wiresByColor) {
    root.add(new THREE.Mesh(mergeGeometries(geometries, false), getMaterial(hex)));
  }

  // Retention latch: a cantilevered tab molded to the underside, free end toward the front.
  const latchMat = getMaterial(0xd8e0ee, { roughness: 0.35 });
  const latch = new THREE.Mesh(new THREE.BoxGeometry(bodyW * 0.55, 0.09, bodyL * 0.75), latchMat);
  latch.position.set(0, -bodyH / 2 - 0.05, bodyL * 0.45);
  root.add(latch);
  const latchBump = new THREE.Mesh(new THREE.BoxGeometry(bodyW * 0.55, 0.08, 0.18), latchMat);
  latchBump.position.set(0, -bodyH / 2 - 0.12, bodyL * 0.15);
  root.add(latchBump);

  // Strain-relief boot, tapering from the body's cross-section down to the round cable jacket.
  const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, Math.max(bodyW, bodyH) / 1.7, 0.5, 16), getMaterial(0x2c3e50, { roughness: 0.6 }));
  boot.rotation.x = Math.PI / 2;
  boot.position.set(0, 0, bodyL + 0.25);
  root.add(boot);

  // A short stub of the round cable jacket continuing out the back of the boot.
  const jacket = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 16), getMaterial(0x3a6fb5));
  jacket.rotation.x = Math.PI / 2;
  jacket.position.set(0, 0, bodyL + 0.95);
  root.add(jacket);

  root.rotation.x = -Math.PI / 2; // model built along +Z; stand it so Y is "up" for the viewer
  return root;
}

function buildCatCable() {
  const root = new THREE.Group();
  const totalLength = 3.4;
  const jacketLength = 2.0; // remaining 1.4 units are the stripped/exposed twisted pairs

  const pairPositions = [
    { x: 0.13, z: 0 },
    { x: 0, z: 0.13 },
    { x: -0.13, z: 0 },
    { x: 0, z: -0.13 },
  ];
  const twistRates = [3.2, 2.7, 3.6, 3.0]; // turns per unit length, staggered like a real cable

  const geometriesByColor = new Map();
  PAIRS.forEach((pair, i) => {
    const pos = pairPositions[i];
    addTwistedPair(geometriesByColor, pair[0], pair[1], {
      centerX: pos.x,
      centerZOffset: pos.z,
      turnsPerUnit: twistRates[i],
      wireRadius: 0.045,
      pairRadius: 0.06,
      length: totalLength,
    });
  });
  for (const mesh of mergedMeshesByColor(geometriesByColor)) root.add(mesh);

  // Outer jacket over the intact portion, plus a thin ring at the cut edge to read as a real
  // wall thickness rather than an infinitely thin shell.
  const jacketMat = getMaterial(0x2f6fb0);
  const jacket = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, jacketLength, 20, 1, true), jacketMat);
  jacket.position.set(0, jacketLength / 2, 0);
  root.add(jacket);

  const cutEdge = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.02, 8, 24), getMaterial(0x1c4a7a));
  cutEdge.rotation.x = Math.PI / 2;
  cutEdge.position.set(0, jacketLength, 0);
  root.add(cutEdge);

  const cap = new THREE.Mesh(new THREE.CircleGeometry(0.32, 20), jacketMat);
  cap.rotation.x = Math.PI / 2;
  cap.position.set(0, 0, 0);
  root.add(cap);

  root.rotation.x = -Math.PI / 2; // stand the cable upright-ish for the single-part viewer
  return root;
}

async function exportGLB(object, filename) {
  const exporter = new GLTFExporter();
  const arrayBuffer = await exporter.parseAsync(object, { binary: true });
  const outPath = path.join(OUT_DIR, filename);
  await writeFile(outPath, Buffer.from(arrayBuffer));
  console.log(`Wrote ${outPath} (${(arrayBuffer.byteLength / 1024).toFixed(1)} KB)`);
}

async function main() {
  await exportGLB(buildRJ45Connector(), "rj45-connector.glb");
  await exportGLB(buildCatCable(), "cat-cable.glb");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
