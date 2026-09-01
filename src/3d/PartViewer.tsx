"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { PrimitiveShape } from "@/core/content/types";
import { centeredAndScaled, ModelShape, ModelsReadySignal, StudioEnvironment } from "./modelUtils";

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

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-2 select-none">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <span className="text-xs font-medium text-text-muted">Loading model…</span>
      </div>
    </div>
  );
}

export interface PartViewerProps {
  shape: PrimitiveShape;
  color?: string;
  rotation?: [number, number, number];
}

/** Shows a single 3D part the player can freely orbit and zoom to inspect. */
export function PartViewer({ shape, color, rotation }: PartViewerProps) {
  const shapeKey = shape.kind === "model" ? shape.url : `${shape.kind}:${JSON.stringify(shape)}`;
  const [loading, setLoading] = useState(true);
  // A new part (e.g. the next quiz question's model) means new async content to wait on --
  // PartViewer isn't always remounted between them (no `key` at every call site), so this can't
  // rely on initial state alone. Reset during render (comparing against the last-seen key,
  // React's documented pattern for this) rather than in an effect, which would show one already-
  // stale frame of the old part before the reset caught up.
  const [prevShapeKey, setPrevShapeKey] = useState(shapeKey);
  if (shapeKey !== prevShapeKey) {
    setPrevShapeKey(shapeKey);
    setLoading(true);
  }
  const handleReady = useCallback(() => setLoading(false), []);

  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [3.2, 1.9, 3.6], fov: 40 }} style={{ touchAction: "none" }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1.3} color="#eef4ff" />
        <directionalLight position={[-4, -2, -3]} intensity={0.3} color="#6ea8ff" />

        <StudioEnvironment />

        <Suspense fallback={null}>
          <ModelsReadySignal onReady={handleReady} />
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
      {loading && <LoadingOverlay />}
    </div>
  );
}
