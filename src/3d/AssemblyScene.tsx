"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, ContactShadows, useProgress } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ModelShape, StudioEnvironment } from "./modelUtils";
import { CASE_POSITION, CASE_SIZE, CASE_URL, CPU_OFFSET_ON_MOTHERBOARD, CPU_URL, MOTHERBOARD_URL } from "./caseGeometry";

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

/** How close a dropped part must land to its target to snap into place. */
const SNAP_DISTANCE = 1.3;

/** Fallback footprint for any part not listed in PART_DISPLAY below. */
const PART_SIZE = 0.9;

/** Each token's independent display size -- case-main.glb turns out to already be a complete,
 * fully-modeled PC (see caseGeometry.ts), so these render at their own small, legible size in
 * front of it rather than trying to match the case's real internal scale. */
const PART_DISPLAY: Record<string, { size: number }> = {
  [MOTHERBOARD_URL]: { size: 1.6 },
  "/models/case-side-armour.glb": { size: 1.9 },
  "/models/psu.glb": { size: 1.1 },
  "/models/ssd.glb": { size: 0.65 },
  "/models/ram.glb": { size: 0.65 },
};

/** The motherboard is never desocketed as its own checklist step -- a real tech pulls it with
 * the CPU still seated. It rides along in the same drag group as the motherboard itself (tray or
 * installed) purely for visual accuracy; it isn't separately interactive. */
const MOTHERBOARD_RIDERS: { url: string; size: number; offset: [number, number, number] }[] = [
  { url: CPU_URL, size: 0.35, offset: CPU_OFFSET_ON_MOTHERBOARD },
];

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

function DraggablePart({
  url,
  position,
  active,
  controlsRef,
  onDrag,
  onDrop,
  riders,
}: {
  url: string;
  position: [number, number, number];
  active: boolean;
  /** Toggled synchronously (not via React state) on pointerdown/up -- OrbitControls has its own
   * native listener on the same canvas element, so a React-state-driven `enabled` prop reacts one
   * render too late and the camera orbits mid-drag instead of the part moving. */
  controlsRef: RefObject<OrbitControlsImpl | null>;
  onDrag: (point: THREE.Vector3) => void;
  onDrop: () => void;
  /** Extra, non-interactive models rendered at a fixed local offset so they travel with this
   * part (e.g. the CPU riding along with the motherboard). */
  riders?: { url: string; size: number; offset: [number, number, number] }[];
}) {
  const { camera, gl } = useThree();
  // Mutable scratch objects that live across renders without being React state -- a ref, not
  // useMemo, since their fields intentionally change on every drag move.
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const raycaster = useRef(new THREE.Raycaster());
  const dragging = useRef(false);

  const pointToPlane = useCallback(
    (clientX: number, clientY: number, planeY: number) => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.current.setFromCamera(ndc, camera);
      dragPlane.current.constant = -planeY;
      const point = new THREE.Vector3();
      // intersectPlane returns null (leaving `point` untouched at its default
      // [0,0,0]) whenever the ray grazes or misses the plane -- easy to hit
      // here since maxPolarAngle lets the camera orbit down to a near-horizon
      // view. Returning the stale [0,0,0] in that case used to teleport the
      // dragged part to the scene origin for a frame; propagate null instead
      // so the caller just holds the part's last good position.
      const hit = raycaster.current.ray.intersectPlane(dragPlane.current, point);
      return hit ? point : null;
    },
    [camera, gl],
  );

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    if (!active) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragging.current = true;
    if (controlsRef.current) controlsRef.current.enabled = false;
  }

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (!dragging.current) return;
    e.stopPropagation();
    const point = pointToPlane(e.clientX, e.clientY, position[1]);
    if (point) onDrag(point);
  }

  function handlePointerUp(e: ThreeEvent<PointerEvent>) {
    if (!dragging.current) return;
    e.stopPropagation();
    dragging.current = false;
    if (controlsRef.current) controlsRef.current.enabled = true;
    onDrop();
  }

  return (
    <group
      position={position}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <ModelShape url={url} {...(PART_DISPLAY[url] ?? { size: PART_SIZE })} />
      {riders?.map((rider) => (
        <group key={rider.url} position={rider.offset}>
          <ModelShape url={rider.url} size={rider.size} />
        </group>
      ))}
      {active && (
        <Html position={[0, 1.1, 0]} center distanceFactor={8}>
          <div className="pointer-events-none whitespace-nowrap rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
            Drag me
          </div>
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
  /** Fires once the active step's part is dropped within snap distance of its target. */
  onStepComplete: (itemId: string) => void;
}

/** A single persistent multi-part scene: drag the highlighted part to the marked target, one
 * step at a time, in order -- the interactive core of Module 1 Task 1 (disassembly + reassembly). */
export function AssemblyScene({ steps, completedItemIds, activeItemId, onStepComplete }: AssemblySceneProps) {
  const parts = useMemo(() => partsFromSteps(steps), [steps]);
  const currentStep = steps.find((s) => s.itemId === activeItemId) ?? null;

  // Live position while the active part is being dragged; falls back to its settled position.
  const [dragPosition, setDragPosition] = useState<[number, number, number] | null>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

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

  function handleDrag(point: THREE.Vector3) {
    if (!currentStep) return;
    setDragPosition([point.x, positions.get(currentStep.url)?.[1] ?? 0, point.z]);
  }

  function handleDrop() {
    if (!currentStep || !dragPosition) return;
    const target = currentStep.phase === "remove" ? currentStep.trayPosition : currentStep.installedPosition;
    const dx = dragPosition[0] - target[0];
    const dz = dragPosition[2] - target[2];
    const withinRange = Math.sqrt(dx * dx + dz * dz) <= SNAP_DISTANCE;
    if (withinRange) {
      onStepComplete(currentStep.itemId);
    }
    setDragPosition(null);
  }

  const targetMarkerPosition = currentStep
    ? currentStep.phase === "remove"
      ? currentStep.trayPosition
      : currentStep.installedPosition
    : null;

  return (
    <Canvas camera={{ position: [0, 3.2, 9.5], fov: 46 }} style={{ touchAction: "none" }}>
      <ambientLight intensity={1.1} />
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

        {targetMarkerPosition && <TargetMarker position={targetMarkerPosition} />}

        {parts.map((part) => {
          const isActive = currentStep?.url === part.url;
          const position = isActive && dragPosition ? dragPosition : (positions.get(part.url) ?? part.installedPosition);
          return (
            <DraggablePart
              key={part.url}
              url={part.url}
              position={position}
              active={isActive}
              controlsRef={controlsRef}
              onDrag={handleDrag}
              onDrop={handleDrop}
              riders={part.url === MOTHERBOARD_URL ? MOTHERBOARD_RIDERS : undefined}
            />
          );
        })}

        <ContactShadows position={[0, -0.6, 0]} opacity={0.4} scale={16} blur={2.2} far={4} resolution={512} color="#000814" />
      </Suspense>

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.12}
        minDistance={4}
        maxDistance={18}
        maxPolarAngle={Math.PI * 0.48}
        target={[0, 0.7, -1.6]}
        enablePan={false}
      />
    </Canvas>
  );
}
