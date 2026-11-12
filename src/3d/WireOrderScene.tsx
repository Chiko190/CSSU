"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { ModelsReadySignal, StudioEnvironment } from "./modelUtils";
import type { WireOrderStep } from "@/core/content/types";

/** How quickly a wire glides to its spot (tray, pin, or the pointer while dragged) -- reaches
 * ~95% of the way there in ~0.35s, independent of frame rate. Dragging uses a faster rate so the
 * wire stays glued to the pointer. */
const SETTLE_RATE = 8;
const DRAG_RATE = 24;

/** How long the "wrong pin" flash stays up after a bad drop. */
const MISS_FLASH_MS = 900;

const WIRE_RADIUS = 0.055;
const WIRE_HEIGHT = 0.6;

/** Height of the invisible horizontal plane a dragged wire slides along -- lifted above the tray
 * and connector so it never clips through them. */
const DRAG_PLANE_Y = 0.65;

/** How close (world units, on the ground plane) the pointer has to be to a pin slot for a drop to
 * count as "on" that pin. Pins are 0.2 apart, so half that picks the nearest one unambiguously. */
const PIN_SNAP_X = 0.1;
const PIN_SNAP_Z = 0.75;

/** The RJ45 connector's plastic body, the row of 8 gold pin slots on top of it, and the pin
 * numbers in front -- the always-present backdrop every wire gets dropped into. Static geometry,
 * not a GLB: an RJ45 plug's shape is simple and generic enough that a real asset would add nothing
 * a learner needs. */
function ConnectorBody({ pinXs, pinZ, hoverPin }: { pinXs: number[]; pinZ: number; hoverPin: number | null }) {
  return (
    <group position={[0, 0, pinZ]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.7, 0.3, 0.8]} />
        <meshPhysicalMaterial color="#e5edf7" roughness={0.25} transparent opacity={0.55} />
      </mesh>
      {pinXs.map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.17, -0.28]}>
            <boxGeometry args={[0.1, 0.04, 0.28]} />
            <meshStandardMaterial
              color={hoverPin === i ? "#38bdf8" : "#d4af37"}
              emissive={hoverPin === i ? "#0284c7" : "#000000"}
              emissiveIntensity={hoverPin === i ? 0.6 : 0}
              metalness={0.85}
              roughness={0.3}
            />
          </mesh>
          <Html position={[x, 0.02, 0.48]} center distanceFactor={6} zIndexRange={[10, 0]}>
            <span
              className={`pointer-events-none select-none font-mono-tabular text-[11px] font-bold ${
                hoverPin === i ? "text-primary" : "text-text-muted"
              }`}
            >
              {i + 1}
            </span>
          </Html>
        </group>
      ))}
    </group>
  );
}

/** A flat ring marking the pin slot a dragged wire would land in if dropped right now. */
function DropMarker({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.12, 0.17, 24]} />
      <meshBasicMaterial color="#0284c7" transparent opacity={0.85} side={THREE.DoubleSide} />
    </mesh>
  );
}

function WireMesh({ color, stripeColor }: { color: string; stripeColor?: string }) {
  if (!stripeColor) {
    return (
      <mesh>
        <cylinderGeometry args={[WIRE_RADIUS, WIRE_RADIUS, WIRE_HEIGHT, 16]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
    );
  }
  // A striped pair wire renders as two stacked half-height cylinders -- color on the bottom,
  // white stripe on top -- enough to read as "white/X" at a glance without needing a real
  // textured material.
  return (
    <group>
      <mesh position={[0, -WIRE_HEIGHT / 4, 0]}>
        <cylinderGeometry args={[WIRE_RADIUS, WIRE_RADIUS, WIRE_HEIGHT / 2, 16]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, WIRE_HEIGHT / 4, 0]}>
        <cylinderGeometry args={[WIRE_RADIUS, WIRE_RADIUS, WIRE_HEIGHT / 2, 16]} />
        <meshStandardMaterial color={stripeColor} roughness={0.55} />
      </mesh>
    </group>
  );
}

/** Projects a pointer position (client px) onto the horizontal drag plane, in world space. */
function useDragPlaneProjector() {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const raycaster = useRef(new THREE.Raycaster());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), -DRAG_PLANE_Y));
  const ndc = useRef(new THREE.Vector2());
  const hit = useRef(new THREE.Vector3());

  return (clientX: number, clientY: number): THREE.Vector3 | null => {
    const rect = gl.domElement.getBoundingClientRect();
    ndc.current.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.current.setFromCamera(ndc.current, camera);
    return raycaster.current.ray.intersectPlane(plane.current, hit.current) ? hit.current.clone() : null;
  };
}

function WirePart({
  step,
  restPosition,
  placed,
  draggable,
  pinAt,
  onHoverPin,
  onDrop,
}: {
  step: WireOrderStep;
  /** Where this wire sits when not being dragged (tray or its seated pin). */
  restPosition: [number, number, number];
  /** Already seated at its pin -- locked in place for good. */
  placed: boolean;
  /** False while a drop is being judged / saved, or once everything's done. */
  draggable: boolean;
  /** Which pin (0-7) a world point is over, or null. */
  pinAt: (point: THREE.Vector3) => number | null;
  onHoverPin: (pin: number | null) => void;
  /** Called on release over a pin. Returns true if the drop was correct (the wire then stays). */
  onDrop: (pin: number) => boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [mountPosition] = useState(() => restPosition);
  const target = useRef(new THREE.Vector3(...restPosition));
  const [dragging, setDragging] = useState(false);
  const [missFlash, setMissFlash] = useState(false);
  const getThree = useThree((s) => s.get);
  // Stops/restarts camera orbiting while a wire is held. Read through get() so it always hits the
  // live OrbitControls instance (registered via makeDefault).
  function setOrbitEnabled(enabled: boolean) {
    const orbit = getThree().controls as unknown as { enabled: boolean } | null;
    if (orbit) orbit.enabled = enabled;
  }
  const project = useDragPlaneProjector();

  // Follow the rest position whenever it changes (seated, or round reset) -- unless mid-drag.
  useEffect(() => {
    if (!dragging) target.current.set(...restPosition);
  });

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    group.position.lerp(target.current, 1 - Math.exp(-(dragging ? DRAG_RATE : SETTLE_RATE) * delta));
  });

  // Window-level move/up listeners while dragging, so the drag keeps tracking even when the
  // pointer slides off the wire mesh (which it always does -- the wire is thin).
  useEffect(() => {
    if (!dragging) return;
    let lastPin: number | null = null;

    function handleMove(e: PointerEvent) {
      const point = project(e.clientX, e.clientY);
      if (!point) return;
      target.current.set(point.x, DRAG_PLANE_Y, point.z);
      const pin = pinAt(point);
      if (pin !== lastPin) {
        lastPin = pin;
        onHoverPin(pin);
      }
    }

    function handleUp(e: PointerEvent) {
      setDragging(false);
      document.body.style.cursor = "auto";
      setOrbitEnabled(true);
      onHoverPin(null);
      const point = project(e.clientX, e.clientY);
      const pin = point ? pinAt(point) : null;
      if (pin !== null && !onDrop(pin)) {
        setMissFlash(true);
        window.setTimeout(() => setMissFlash(false), MISS_FLASH_MS);
      }
      // Correct or not, the wire glides to its (possibly new) rest position on the next effect.
      target.current.set(...restPosition);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [dragging, project, pinAt, onHoverPin, onDrop, restPosition]);

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    if (placed || !draggable) return;
    e.stopPropagation();
    setOrbitEnabled(false);
    document.body.style.cursor = "grabbing";
    const point = project(e.nativeEvent.clientX, e.nativeEvent.clientY);
    if (point) target.current.set(point.x, DRAG_PLANE_Y, point.z);
    setDragging(true);
  }

  function handlePointerOver(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    if (!dragging) document.body.style.cursor = placed || !draggable ? "auto" : "grab";
  }

  function handlePointerOut() {
    if (!dragging) document.body.style.cursor = "auto";
  }

  return (
    <group
      ref={groupRef}
      position={mountPosition}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* A fatter invisible grab target -- the visible wire is very thin to hit with a pointer. */}
      {!placed && (
        <mesh>
          <cylinderGeometry args={[0.16, 0.16, WIRE_HEIGHT, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      <WireMesh color={step.color} stripeColor={step.stripeColor} />
      {missFlash && (
        <Html position={[0, 0.55, 0]} center distanceFactor={6}>
          <div className="whitespace-nowrap rounded-full bg-danger px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
            Wrong pin -- lost a heart
          </div>
        </Html>
      )}
    </group>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-2 select-none">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <span className="text-xs font-medium text-text-muted">Loading connector…</span>
      </div>
    </div>
  );
}

export interface WireOrderSceneProps {
  /** The 8 wires of the connector being wired right now, in pin order (pin 1 first). */
  steps: WireOrderStep[];
  /** Step ids already seated. */
  completedItemIds: Set<string>;
  /** False locks every wire (e.g. once the connector is finished). */
  interactive?: boolean;
  /** A wire was dropped on its correct pin. */
  onStepComplete: (itemId: string) => void;
  /** A wire was dropped on an empty pin it doesn't belong in. */
  onWrongDrop: (itemId: string, pinIndex: number) => void;
}

/** Drag each wire from the tray and drop it on its RJ45 pin slot. Dropping on the wrong empty pin
 * costs a heart and the wire springs back; dropping anywhere else (or on a filled pin) just
 * returns it to the tray for free. */
export function WireOrderScene({ steps, completedItemIds, interactive = true, onStepComplete, onWrongDrop }: WireOrderSceneProps) {
  const [loading, setLoading] = useState(true);
  const [hoverPin, setHoverPin] = useState<number | null>(null);
  const pinXs = steps.map((s) => s.installedPosition[0]);
  const pinZ = steps[0]?.installedPosition[2] ?? -1.1;

  // Same fix as AssemblyScene: the canvas's parent height settles from a CSS calc a couple of
  // ancestors up, after R3F's first ResizeObserver measurement -- force a re-measure once layout
  // has actually settled.
  useEffect(() => {
    const timers = [50, 300].map((delay) => setTimeout(() => window.dispatchEvent(new Event("resize")), delay));
    return () => timers.forEach(clearTimeout);
  }, []);

  const filledPins = new Set(steps.filter((s) => completedItemIds.has(s.id)).map((s) => s.pinIndex));

  function pinAt(point: THREE.Vector3): number | null {
    if (Math.abs(point.z - pinZ) > PIN_SNAP_Z) return null;
    let best: number | null = null;
    let bestDx = PIN_SNAP_X;
    pinXs.forEach((x, i) => {
      const dx = Math.abs(point.x - x);
      if (dx <= bestDx) {
        best = i;
        bestDx = dx;
      }
    });
    return best;
  }

  function handleDrop(step: WireOrderStep, pin: number): boolean {
    if (filledPins.has(pin)) return true; // occupied: just bounce back, no penalty
    if (pin === step.pinIndex) {
      onStepComplete(step.id);
      return true;
    }
    onWrongDrop(step.id, pin);
    return false;
  }

  return (
    <div className="relative w-full h-full select-none">
      <Canvas camera={{ position: [0, 3.6, 5.4], fov: 42 }} style={{ touchAction: "none" }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 8, 5]} intensity={2.4} color="#eef4ff" />
        <directionalLight position={[-4, -2, -3]} intensity={0.7} color="#6ea8ff" />
        <directionalLight position={[0, 3, 8]} intensity={1.1} color="#ffffff" />
        <StudioEnvironment />

        <Suspense fallback={null}>
          <ModelsReadySignal onReady={() => setLoading(false)} />
          <ConnectorBody pinXs={pinXs} pinZ={pinZ} hoverPin={hoverPin} />

          {hoverPin !== null && <DropMarker x={pinXs[hoverPin]} z={pinZ} />}

          {steps.map((step) => {
            const placed = completedItemIds.has(step.id);
            return (
              <WirePart
                key={step.id}
                step={step}
                restPosition={placed ? step.installedPosition : step.trayPosition}
                placed={placed}
                draggable={interactive}
                pinAt={pinAt}
                onHoverPin={setHoverPin}
                onDrop={(pin) => handleDrop(step, pin)}
              />
            );
          })}

          <ContactShadows position={[0, -0.4, 0]} opacity={0.35} scale={10} blur={2.2} far={3} resolution={512} color="#000814" />
        </Suspense>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.12}
          minDistance={2.5}
          maxDistance={9}
          maxPolarAngle={Math.PI * 0.48}
          target={[0, 0.15, -0.2]}
          enablePan={false}
        />
      </Canvas>
      {loading && <LoadingOverlay />}
    </div>
  );
}
