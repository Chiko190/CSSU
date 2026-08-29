"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, ContactShadows, useProgress } from "@react-three/drei";
import * as THREE from "three";
import { ModelShape, StudioEnvironment } from "./modelUtils";
import {
  CASE_FAMILY_SCALE,
  CASE_POSITION,
  CASE_SIZE,
  CASE_URL,
  COOLER_OFFSET_ON_MOTHERBOARD,
  COOLER_URL,
  CPU_OFFSET_ON_MOTHERBOARD,
  CPU_URL,
  FAN1_POSITION,
  FAN1_URL,
  FAN2_POSITION,
  FAN2_URL,
  GPU_OFFSET_ON_MOTHERBOARD,
  GPU_URL,
  MOTHERBOARD_URL,
  SIDE_COVER_URL,
} from "./caseGeometry";

/** One physical placement step in the disassembly/reassembly sequence. Two steps (a "remove"
 * and an "install") sharing the same `url` are the same physical part at its two checkpoints --
 * they share installedPosition/trayPosition by construction. */
export interface AssemblyStep {
  itemId: string;
  url: string;
  label: string;
  phase: "remove" | "install";
  installedPosition: [number, number, number];
  trayPosition: [number, number, number];
}

/** Fallback footprint for any part not listed in PART_DISPLAY below. */
const PART_SIZE = 0.9;

/** Every part in this scene checks out at one real-world-proportional coordinate space (see
 * caseGeometry.ts) and renders at the same fixedScale. `size` remains as a fallback for any part
 * not listed below. */
type PartDisplay = { size: number } | { fixedScale: number };

const PART_DISPLAY: Record<string, PartDisplay> = {
  [MOTHERBOARD_URL]: { fixedScale: CASE_FAMILY_SCALE },
  [SIDE_COVER_URL]: { fixedScale: CASE_FAMILY_SCALE },
  "/models/psu.glb": { fixedScale: CASE_FAMILY_SCALE },
  "/models/ssd.glb": { fixedScale: CASE_FAMILY_SCALE },
  "/models/ram.glb": { fixedScale: CASE_FAMILY_SCALE },
};

/** The motherboard is never desocketed as its own checklist step -- a real tech pulls it with the
 * CPU, GPU, and cooler still attached (the fans mount to the case, not the board -- see
 * FAN_PARTS below). They ride along at the motherboard's own position (tray or installed) purely
 * for visual accuracy; none of them are separately interactive. Riding along -- rather than
 * rendering at a fixed case-relative spot -- is what makes them travel to the tray with the board
 * when it's removed, instead of floating in the case with nothing installed under them. */
const MOTHERBOARD_RIDERS: { url: string; display: PartDisplay; offset: [number, number, number] }[] = [
  { url: CPU_URL, display: { fixedScale: CASE_FAMILY_SCALE }, offset: CPU_OFFSET_ON_MOTHERBOARD },
  { url: GPU_URL, display: { fixedScale: CASE_FAMILY_SCALE }, offset: GPU_OFFSET_ON_MOTHERBOARD },
  { url: COOLER_URL, display: { fixedScale: CASE_FAMILY_SCALE }, offset: COOLER_OFFSET_ON_MOTHERBOARD },
];

/** Case fans mount to the chassis, not the motherboard -- they stay put regardless of whether the
 * board's been pulled, like a real case fan would, so they're fixed case-relative positions
 * rather than motherboard riders. */
const FAN_PARTS: { url: string; position: [number, number, number] }[] = [
  { url: FAN1_URL, position: FAN1_POSITION },
  { url: FAN2_URL, position: FAN2_POSITION },
];
const FAN_DISPLAY: PartDisplay = { fixedScale: CASE_FAMILY_SCALE };

function LoadingIndicator() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 select-none">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <span className="text-xs font-medium text-text-muted">
          Loading parts{progress > 0 ? ` -- ${Math.round(progress)}%` : "…"}
        </span>
      </div>
    </Html>
  );
}

/** A flat ring marking where the active part needs to go. */
function TargetMarker({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.32, 0.42, 32]} />
      <meshBasicMaterial color="#5b8cff" transparent opacity={0.8} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** How quickly a part glides to its new spot after being pressed -- a fixed "reach 95% of the
 * way there in ~0.35s" rate, independent of frame rate. */
const SETTLE_RATE = 8;

function AssemblyPart({
  url,
  targetPosition,
  active,
  phase,
  onPress,
  riders,
}: {
  url: string;
  /** Where this part belongs right now (tray or installed) -- the part glides here on its own
   * whenever this changes, so callers never set a live drag position. */
  targetPosition: [number, number, number];
  active: boolean;
  /** Only meaningful when `active` -- which action pressing this part performs next. */
  phase: "remove" | "install";
  onPress: () => void;
  /** Extra, non-interactive models rendered at a fixed local offset so they travel with this
   * part (e.g. the CPU riding along with the motherboard). */
  riders?: { url: string; display: PartDisplay; offset: [number, number, number] }[];
}) {
  const { gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  // Mount position only -- captured once so the JSX `position` prop never fights the per-frame
  // glide below (its reference stays stable across re-renders, so R3F never re-applies it).
  const mountPosition = useRef(targetPosition);
  const target = useRef(new THREE.Vector3(...targetPosition));
  const [hovered, setHovered] = useState(false);

  // Cheap to call every render; keeps the glide target current even though `targetPosition`'s
  // array reference changes on renders that don't actually move this part.
  target.current.set(...targetPosition);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    group.position.lerp(target.current, 1 - Math.exp(-SETTLE_RATE * delta));
  });

  function handleClick(e: ThreeEvent<MouseEvent>) {
    if (!active) return;
    e.stopPropagation();
    onPress();
  }

  function handlePointerOver(e: ThreeEvent<PointerEvent>) {
    if (!active) return;
    e.stopPropagation();
    setHovered(true);
    gl.domElement.style.cursor = "pointer";
  }

  function handlePointerOut() {
    setHovered(false);
    gl.domElement.style.cursor = "auto";
  }

  return (
    <group
      ref={groupRef}
      position={mountPosition.current}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <ModelShape url={url} {...(PART_DISPLAY[url] ?? { size: PART_SIZE })} />
      {riders?.map((rider) => (
        <group key={rider.url} position={rider.offset}>
          <ModelShape url={rider.url} {...rider.display} />
        </group>
      ))}
      {active && (
        <Html position={[0, 1.1, 0]} center distanceFactor={8}>
          <button
            type="button"
            onClick={onPress}
            className={`whitespace-nowrap rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg transition-transform ${
              hovered ? "scale-105" : ""
            }`}
          >
            {phase === "remove" ? "Tap to remove" : "Tap to install"}
          </button>
        </Html>
      )}
    </group>
  );
}

function partsFromSteps(steps: AssemblyStep[]) {
  const seen = new Map<string, AssemblyStep>();
  for (const step of steps) if (!seen.has(step.url)) seen.set(step.url, step);
  return Array.from(seen.values());
}

/** A part is "in the tray" once its remove-step is done but its install-step (if any, and if
 * earlier in the sequence than the current step) isn't done yet -- otherwise it's installed. */
function settledPosition(url: string, steps: AssemblyStep[], completedItemIds: Set<string>) {
  const removeStep = steps.find((s) => s.url === url && s.phase === "remove");
  const installStep = steps.find((s) => s.url === url && s.phase === "install");
  const removed = removeStep ? completedItemIds.has(removeStep.itemId) : false;
  const reinstalled = installStep ? completedItemIds.has(installStep.itemId) : false;
  const anchor = removeStep ?? installStep;
  if (!anchor) return [0, 0, 0] as [number, number, number];
  return removed && !reinstalled ? anchor.trayPosition : anchor.installedPosition;
}

export interface AssemblySceneProps {
  /** The full disassembly-then-reassembly sequence, in real task-sheet order. */
  steps: AssemblyStep[];
  /** itemIds already confirmed done (persists across visits via the module's activity progress). */
  completedItemIds: Set<string>;
  /** The one step the learner may act on right now, dictated by the parent's overall task
   * ordering (which also includes plain, non-3D checklist items interleaved with these steps) --
   * null when the true next item in the task isn't one of this scene's steps. */
  activeItemId: string | null;
  /** Fires once the active step's part is pressed. */
  onStepComplete: (itemId: string) => void;
}

/** A single persistent multi-part scene: press the highlighted part to remove or install it, one
 * step at a time, in order -- the interactive core of Module 1 Task 1 (disassembly + reassembly). */
export function AssemblyScene({ steps, completedItemIds, activeItemId, onStepComplete }: AssemblySceneProps) {
  const parts = useMemo(() => partsFromSteps(steps), [steps]);
  const currentStep = steps.find((s) => s.itemId === activeItemId) ?? null;

  // The canvas's parent sits in a CSS grid/flex chain whose own height resolves from
  // `calc(100vh - ...)` a couple of ancestors up (see AssemblyChecklistActivity's layout) --
  // that final height isn't settled yet at the instant R3F's ResizeObserver takes its first
  // measurement, so the canvas can mount at a stale/zero size and never repaint on its own.
  // A resize event forces R3F to re-measure against the by-then-settled layout.
  useEffect(() => {
    const timers = [50, 300].map((delay) =>
      setTimeout(() => window.dispatchEvent(new Event("resize")), delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const positions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    for (const part of parts) map.set(part.url, settledPosition(part.url, steps, completedItemIds));
    return map;
  }, [parts, steps, completedItemIds]);

  function handlePress() {
    if (!currentStep) return;
    onStepComplete(currentStep.itemId);
  }

  const targetMarkerPosition = currentStep
    ? currentStep.phase === "remove"
      ? currentStep.trayPosition
      : currentStep.installedPosition
    : null;

  return (
    <Canvas camera={{ position: [0, 2.4, 10.5], fov: 46 }} style={{ touchAction: "none" }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 5]} intensity={2.6} color="#eef4ff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.8} color="#6ea8ff" />
      <directionalLight position={[0, 3, 8]} intensity={1.2} color="#ffffff" />
      <StudioEnvironment />

      <Suspense fallback={<LoadingIndicator />}>
        {/* The case is never a checklist step itself -- it's the always-present, already-intact
         * PC every other part belongs to and gets removed from / reinstalled onto. */}
        <group position={CASE_POSITION}>
          <ModelShape url={CASE_URL} size={CASE_SIZE} />
        </group>

        {FAN_PARTS.map((fan) => (
          <group key={fan.url} position={fan.position}>
            <ModelShape url={fan.url} {...FAN_DISPLAY} />
          </group>
        ))}

        {targetMarkerPosition && <TargetMarker position={targetMarkerPosition} />}

        {parts.map((part) => {
          const isActive = currentStep?.url === part.url;
          const targetPosition = positions.get(part.url) ?? part.installedPosition;
          return (
            <AssemblyPart
              key={part.url}
              url={part.url}
              targetPosition={targetPosition}
              active={isActive}
              phase={currentStep?.phase ?? "remove"}
              onPress={handlePress}
              riders={part.url === MOTHERBOARD_URL ? MOTHERBOARD_RIDERS : undefined}
            />
          );
        })}

        <ContactShadows position={[0, -0.6, 0]} opacity={0.4} scale={16} blur={2.2} far={4} resolution={512} color="#000814" />
      </Suspense>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.12}
        minDistance={4}
        maxDistance={18}
        maxPolarAngle={Math.PI * 0.48}
        target={[0, 0.1, -1.6]}
        enablePan={false}
      />
    </Canvas>
  );
}
