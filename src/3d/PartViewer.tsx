"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  Environment,
  Lightformer,
  ContactShadows,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import * as THREE from "three";
import type { PrimitiveShape } from "@/core/content/types";

/** World-unit size every part is normalized to, so small parts (CPU) and
 * large ones (Case) both fill the viewer consistently. */
const DISPLAY_SIZE = 2.4;

function centeredAndScaled(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = DISPLAY_SIZE / maxDim;
  // Position and scale are independent local-transform components (not
  // nested), so the re-centering offset must be applied in the same
  // already-scaled space -- otherwise the geometric centroid lands at
  // center * (scale - 1) instead of the origin, and OrbitControls (which
  // always orbits its fixed target at [0,0,0]) ends up rotating around a
  // point that isn't the model's actual center, reading as "drift".
  object.scale.setScalar(scale);
  object.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  return object;
}

function ModelShape({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const object = useMemo(() => centeredAndScaled(scene.clone(true)), [scene]);
  return <primitive object={object} />;
}

function PrimitiveShapeMesh({ shape, color }: { shape: Exclude<PrimitiveShape, { kind: "model" }>; color: string }) {
  const group = useMemo(() => {
    const mesh = new THREE.Mesh(
      shape.kind === "box"
        ? new THREE.BoxGeometry(...shape.size)
        : new THREE.CylinderGeometry(shape.radiusTop, shape.radiusBottom, shape.height, 24),
      new THREE.MeshStandardMaterial({ color }),
    );
    const wrapper = new THREE.Group();
    wrapper.add(mesh);
    return centeredAndScaled(wrapper);
  }, [shape, color]);

  return <primitive object={group} />;
}

/** Procedural, zero-asset studio lighting -- gives models a specular sheen
 * without fetching an HDR from an external CDN (which previously could hang
 * the whole viewer if that network request was slow or blocked). */
function StudioEnvironment() {
  return (
    <Environment resolution={256}>
      <Lightformer intensity={2} position={[3, 3, 2]} scale={[4, 4, 1]} color="#eef4ff" />
      <Lightformer intensity={1} position={[-3, -1, 2]} scale={[3, 3, 1]} color="#6ea8ff" />
      <Lightformer intensity={0.6} position={[0, 4, -3]} scale={[6, 2, 1]} color="#ffffff" />
    </Environment>
  );
}

function LoadingIndicator() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 select-none">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <span className="text-xs font-medium text-text-muted">
          Loading model{progress > 0 ? ` -- ${Math.round(progress)}%` : "…"}
        </span>
      </div>
    </Html>
  );
}

export interface PartViewerProps {
  shape: PrimitiveShape;
  color?: string;
  rotation?: [number, number, number];
}

/** Shows a single 3D part the player can freely orbit and zoom to inspect. */
export function PartViewer({ shape, color, rotation }: PartViewerProps) {
  return (
    <Canvas camera={{ position: [3.2, 1.9, 3.6], fov: 40 }} style={{ touchAction: "none" }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.3} color="#eef4ff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.3} color="#6ea8ff" />

      <StudioEnvironment />

      <Suspense fallback={<LoadingIndicator />}>
        <group rotation={rotation ?? [0, 0, 0]}>
          {shape.kind === "model" ? (
            <ModelShape url={shape.url} />
          ) : (
            <PrimitiveShapeMesh shape={shape} color={color ?? "#64748b"} />
          )}
        </group>

        <ContactShadows
          position={[0, -1.3, 0]}
          opacity={0.5}
          scale={6}
          blur={2.4}
          far={3}
          resolution={512}
          color="#000814"
        />
      </Suspense>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.12}
        minDistance={1.6}
        maxDistance={7}
        maxPolarAngle={Math.PI * 0.9}
        target={[0, 0, 0]}
        enablePan={false}
      />
    </Canvas>
  );
}
