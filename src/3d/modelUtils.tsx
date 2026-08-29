"use client";

import { useMemo } from "react";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";

/** World-unit size a single normalized part is scaled to (see centeredAndScaled). */
export const DISPLAY_SIZE = 2.4;

export function centeredAndScaled(object: THREE.Object3D, displaySize = DISPLAY_SIZE) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = displaySize / maxDim;
  // Position and scale are independent local-transform components (not
  // nested), so the re-centering offset must be applied in the same
  // already-scaled space -- otherwise the geometric centroid lands at
  // center * (scale - 1) instead of the origin.
  object.scale.setScalar(scale);
  object.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  return object;
}

/** Like centeredAndScaled, but the caller supplies an absolute scale instead of normalizing to
 * a target box size. Several of the case-interior GLBs (case, motherboard, CPU, side panel) were
 * exported from one shared source scene, so their untouched local coordinates already place them
 * correctly relative to each other -- applying the *same* fixed scale to each (rather than each
 * independently filling the same box) is what lets them recombine into one accurately-proportioned,
 * correctly-nested assembly instead of same-size blobs. */
export function centeredAtFixedScale(object: THREE.Object3D, scale: number) {
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  box.getCenter(center);
  object.scale.setScalar(scale);
  object.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  return object;
}

/** A GLB, loaded and centered. Normalizes to `size` (defaults to DISPLAY_SIZE) by default -- every
 * part fills the same footprint regardless of its real-world scale, so a case panel and a RAM
 * stick fill the same box unless told otherwise. Pass `fixedScale` instead for parts that should
 * keep their real size/position relative to other fixedScale parts (see centeredAtFixedScale). */
export function ModelShape({ url, size = DISPLAY_SIZE, fixedScale }: { url: string; size?: number; fixedScale?: number }) {
  const { scene } = useGLTF(url);
  const object = useMemo(
    () =>
      fixedScale !== undefined
        ? centeredAtFixedScale(scene.clone(true), fixedScale)
        : centeredAndScaled(scene.clone(true), size),
    [scene, size, fixedScale],
  );
  return <primitive object={object} />;
}

/** Procedural, zero-asset studio lighting -- gives models a specular sheen
 * without fetching an HDR from an external CDN (which previously could hang
 * the whole viewer if that network request was slow or blocked). */
export function StudioEnvironment() {
  return (
    <Environment resolution={256}>
      <Lightformer intensity={2} position={[3, 3, 2]} scale={[4, 4, 1]} color="#eef4ff" />
      <Lightformer intensity={1} position={[-3, -1, 2]} scale={[3, 3, 1]} color="#6ea8ff" />
      <Lightformer intensity={0.6} position={[0, 4, -3]} scale={[6, 2, 1]} color="#ffffff" />
    </Environment>
  );
}
