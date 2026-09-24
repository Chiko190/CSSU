"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { ModelsReadySignal, StudioEnvironment } from "./modelUtils";
import type { WireOrderStep } from "@/core/content/types";

/** How quickly a wire glides to its new spot after being tapped -- same feel as AssemblyScene's
 * part glide (reach ~95% of the way there in ~0.35s), independent of frame rate. */
const SETTLE_RATE = 8;

/** How long the "not yet" flash stays up after a wrong-wire tap. */
const MISS_FLASH_MS = 900;

const WIRE_RADIUS = 0.055;
const WIRE_HEIGHT = 0.6;

/** The RJ45 connector's plastic body, and the row of 8 gold pin slots on top of it -- the always-
 * present backdrop every wire gets seated into, one at a time. Static geometry, not a GLB: an
 * RJ45 plug's shape is simple and generic enough that a real asset would add nothing a learner
 * needs, unlike the PC case in AssemblyScene. */
function ConnectorBody({ pinXs }: { pinXs: number[] }) {
  return (
    <group position={[0, 0, -1.1]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.7, 0.3, 0.8]} />
        <meshPhysicalMaterial color="#e5edf7" roughness={0.25} transparent opacity={0.55} />
      </mesh>
      {pinXs.map((x, i) => (
        <mesh key={i} position={[x, 0.17, -0.28]}>
          <boxGeometry args={[0.1, 0.04, 0.28]} />
          <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/** A flat ring marking the pin slot the active wire needs to go into. */
function TargetMarker({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={[position[0], 0.02, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.14, 0.19, 24]} />
      <meshBasicMaterial color="#5b8cff" transparent opacity={0.85} side={THREE.DoubleSide} />
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

function WirePart({
  step,
  targetPosition,
  active,
  onPress,
  onWrongPress,
}: {
  step: WireOrderStep;
  /** Where this wire belongs right now (tray or installed) -- it glides here on its own whenever
   * this changes, so callers never set a live drag position. */
  targetPosition: [number, number, number];
  active: boolean;
  onPress: () => void;
  onWrongPress: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [mountPosition] = useState(() => targetPosition);
  const target = useRef(new THREE.Vector3(...targetPosition));
  const [hovered, setHovered] = useState(false);
  const [missFlash, setMissFlash] = useState(false);

  useEffect(() => {
    target.current.set(...targetPosition);
  });

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    group.position.lerp(target.current, 1 - Math.exp(-SETTLE_RATE * delta));
  });

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    if (active) {
      onPress();
      return;
    }
    onWrongPress();
    setMissFlash(true);
    window.setTimeout(() => setMissFlash(false), MISS_FLASH_MS);
  }

  function handlePointerOver(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = active ? "pointer" : "not-allowed";
  }

  function handlePointerOut() {
    setHovered(false);
    document.body.style.cursor = "auto";
  }

  return (
    <group
      ref={groupRef}
      position={mountPosition}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <WireMesh color={step.color} stripeColor={step.stripeColor} />
      {active && (
        <Html position={[0, 0.55, 0]} center distanceFactor={6}>
          <button
            type="button"
            onClick={onPress}
            className={`whitespace-nowrap rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg transition-transform ${
              hovered ? "scale-105" : ""
            }`}
          >
            Tap to seat this wire
          </button>
        </Html>
      )}
      {missFlash && (
        <Html position={[0, 0.55, 0]} center distanceFactor={6}>
          <div className="whitespace-nowrap rounded-full bg-danger px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
            Not yet -- lost a heart
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

/** A wire is "in the tray" until its step is completed, then it's seated at its pin. */
function settledPosition(step: WireOrderStep, completedItemIds: Set<string>) {
  return completedItemIds.has(step.id) ? step.installedPosition : step.trayPosition;
}

export interface WireOrderSceneProps {
  /** All 8 wires, in correct T568B pin order. */
  steps: WireOrderStep[];
  /** Step ids already confirmed placed. */
  completedItemIds: Set<string>;
  /** The one wire the learner may act on right now -- always the next unplaced pin in sequence. */
  activeItemId: string | null;
  onStepComplete: (itemId: string) => void;
  onWrongPress: () => void;
}

/** A persistent scene: tap the highlighted wire in the tray to seat it into its RJ45 pin slot,
 * one at a time in T568B order -- the interactive core of Module 2 Task 1's practical check. */
export function WireOrderScene({ steps, completedItemIds, activeItemId, onStepComplete, onWrongPress }: WireOrderSceneProps) {
  const currentStep = steps.find((s) => s.id === activeItemId) ?? null;
  const [loading, setLoading] = useState(true);
  const pinXs = steps.map((s) => s.installedPosition[0]);

  // Same fix as AssemblyScene: the canvas's parent height settles from a CSS calc a couple of
  // ancestors up, after R3F's first ResizeObserver measurement -- force a re-measure once layout
  // has actually settled.
  useEffect(() => {
    const timers = [50, 300].map((delay) => setTimeout(() => window.dispatchEvent(new Event("resize")), delay));
    return () => timers.forEach(clearTimeout);
  }, []);

  function handlePress() {
    if (!currentStep) return;
    onStepComplete(currentStep.id);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!currentStep) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      const activeTag = (document.activeElement as HTMLElement | null)?.tagName;
      if (activeTag === "BUTTON" || activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "A") return;
      e.preventDefault();
      onStepComplete(currentStep.id);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, onStepComplete]);

  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [0, 3.6, 5.4], fov: 42 }} style={{ touchAction: "none" }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 8, 5]} intensity={2.4} color="#eef4ff" />
        <directionalLight position={[-4, -2, -3]} intensity={0.7} color="#6ea8ff" />
        <directionalLight position={[0, 3, 8]} intensity={1.1} color="#ffffff" />
        <StudioEnvironment />

        <Suspense fallback={null}>
          <ModelsReadySignal onReady={() => setLoading(false)} />
          <ConnectorBody pinXs={pinXs} />

          {currentStep && <TargetMarker position={currentStep.installedPosition} />}

          {steps.map((step) => (
            <WirePart
              key={step.id}
              step={step}
              targetPosition={settledPosition(step, completedItemIds)}
              active={step.id === activeItemId}
              onPress={handlePress}
              onWrongPress={onWrongPress}
            />
          ))}

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
