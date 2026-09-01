"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { PrimitiveShape } from "@/core/content/types";
import { centeredAndScaled, ModelShape, StudioEnvironment } from "./modelUtils";

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

// Deliberately doesn't use drei's useProgress -- its loading-manager updates land during
// GLTFLoader's own callback, which fires while a sibling <ModelShape> is still rendering. React
// treats that as "setState on a different component during render" and drops the update instead
// of committing it, so this fallback would silently never actually paint: the canvas would just
// stay blank for however long the (multi-megabyte) model takes to fetch, with nothing on screen
// to say it's working. A plain non-hook spinner has no such state to be dropped.
function LoadingIndicator() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 select-none">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <span className="text-xs font-medium text-text-muted">Loading model…</span>
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
