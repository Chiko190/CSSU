"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { ModelShape, ModelsReadySignal, StudioEnvironment } from "./modelUtils";
import {
  CASE_FAMILY_SCALE,
  CASE_POSITION,
  CASE_SIZE,
  CASE_URL,
  COOLER_OFFSET_ON_MOTHERBOARD,
  COOLER_URL,
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
  /** Don't mount this part at all until this OTHER itemId is in completedItemIds -- for a part
   * mounted on another part in the scene (e.g. the CPU on the motherboard) whose installedPosition
   * is only valid once that other part has already reached its own resting spot for this scene's
   * particular step order (see module-1/practicalCheck.ts, whose motherboard-mounted steps all
   * come after the motherboard's own removal). Omitted for every step in the checklist activity,
   * which never needs this -- its own motherboard-mounted parts (GPU, cooler) stay permanent
   * riders instead of independent steps. */
  hiddenUntilItemId?: string;
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
  [CPU_URL]: { fixedScale: CASE_FAMILY_SCALE },
  // GPU/cooler/fans are riders or fixed decoration in the checklist activity (never their own
  // `parts` entry there), but the quiz's practical check below gives them real steps -- listed
  // here too so they render at real scale instead of falling back to the generic PART_SIZE token
  // whenever that happens.
  [GPU_URL]: { fixedScale: CASE_FAMILY_SCALE },
  [COOLER_URL]: { fixedScale: CASE_FAMILY_SCALE },
  [FAN1_URL]: { fixedScale: CASE_FAMILY_SCALE },
  [FAN2_URL]: { fixedScale: CASE_FAMILY_SCALE },
  "/models/psu.glb": { fixedScale: CASE_FAMILY_SCALE },
  "/models/ssd.glb": { fixedScale: CASE_FAMILY_SCALE },
  // The quiz's practical check reuses the SSD model as a stand-in for the optical drive (ROM) --
  // see module-1/practicalCheck.ts for why it's suffixed instead of the bare url.
  "/models/ssd.glb#rom": { fixedScale: CASE_FAMILY_SCALE },
  "/models/ram.glb": { fixedScale: CASE_FAMILY_SCALE },
  // The quiz's practical check has two RAM steps sharing the one real RAM model -- see the ssd.glb
  // #rom comment above for why the second one needs a suffixed url.
  "/models/ram.glb#2": { fixedScale: CASE_FAMILY_SCALE },
};

/** The motherboard is never desocketed as its own checklist step -- a real tech pulls it with the
 * GPU and cooler still attached (the fans mount to the case, not the board -- see FAN_PARTS
 * below). They ride along at the motherboard's own position (tray or installed) purely for
 * visual accuracy; neither is separately interactive. Riding along -- rather than rendering at a
 * fixed case-relative spot -- is what makes them travel to the tray with the board when it's
 * removed, instead of floating in the case with nothing installed under them.
 *
 * The CPU is deliberately NOT a rider here -- it's its own checklist step (remove-cpu/install-cpu
 * in module-1/activity.ts) with its own "Tap to remove"/"Tap to install" prompt, so learners
 * actually practice popping the CPU out of its socket instead of it silently vanishing along
 * with the whole board. */
const MOTHERBOARD_RIDERS: { url: string; display: PartDisplay; offset: [number, number, number] }[] = [
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

// Rendered outside the Canvas entirely (see ModelsReadySignal / the loading state below) rather
// than as the Suspense fallback -- drei's Html-based fallback depends on the R3F render loop
// actually ticking to portal content in, which on a real (non-localhost) connection loading many
// megabytes of parts left this blank for the whole fetch with nothing on screen to say it was
// working, easily read as the 3D content being gone entirely.
function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-2 select-none">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <span className="text-xs font-medium text-text-muted">Loading parts…</span>
      </div>
    </div>
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

/** How long the "not yet" flash stays up after a wrong-part press. */
const MISS_FLASH_MS = 900;

function AssemblyPart({
  url,
  targetPosition,
  active,
  phase,
  onPress,
  onWrongPress,
  riders,
  showTapLabel = true,
  hintCorrectOnHover = true,
}: {
  url: string;
  /** Where this part belongs right now (tray or installed) -- the part glides here on its own
   * whenever this changes, so callers never set a live drag position. */
  targetPosition: [number, number, number];
  active: boolean;
  /** Only meaningful when `active` -- which action pressing this part performs next. */
  phase: "remove" | "install";
  onPress: () => void;
  /** Fires when this part is pressed while it's NOT the active one -- e.g. trying to pull the
   * motherboard before the RAM is out yet. The parent owns the actual heart-loss side effect. */
  onWrongPress: () => void;
  /** Extra, non-interactive models rendered at a fixed local offset so they travel with this
   * part (e.g. the CPU riding along with the motherboard). */
  riders?: { url: string; display: PartDisplay; offset: [number, number, number] }[];
  /** Floating "Tap to remove/install" button over the active part. Off for the quiz's practical
   * check, which is testing whether the learner can recognize the right part on sight -- a
   * labeled button naming it away would defeat that. */
  showTapLabel?: boolean;
  /** Whether hovering changes the cursor to "pointer" for the correct part and "not-allowed" for
   * every other one. Also off for the practical check -- that cursor tell would let a learner
   * find the right part by sweeping the mouse around instead of actually recognizing it. */
  hintCorrectOnHover?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  // Mount position only -- captured once via lazy state init so the JSX `position` prop never
  // fights the per-frame glide below (it stays stable across re-renders, so R3F never re-applies
  // it as a discontinuous jump).
  const [mountPosition] = useState(() => targetPosition);
  const target = useRef(new THREE.Vector3(...targetPosition));
  const [hovered, setHovered] = useState(false);
  const [missFlash, setMissFlash] = useState(false);

  // Keeps the glide target current even though `targetPosition`'s array reference changes on
  // renders that don't actually move this part. Runs post-render (not during render) so it never
  // reads/writes the ref while React is rendering.
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
    // A part that isn't the current step still reacts to a press (and costs a heart for it) --
    // the cursor tells the player that before they click, not just after (when hintCorrectOnHover
    // is on; see its doc comment for why the practical check turns this off).
    document.body.style.cursor = !hintCorrectOnHover ? "pointer" : active ? "pointer" : "not-allowed";
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
      <ModelShape url={url} {...(PART_DISPLAY[url] ?? { size: PART_SIZE })} />
      {riders?.map((rider) => (
        <group key={rider.url} position={rider.offset}>
          <ModelShape url={rider.url} {...rider.display} />
        </group>
      ))}
      {active && showTapLabel && (
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
      {missFlash && (
        <Html position={[0, 1.1, 0]} center distanceFactor={8}>
          <div className="whitespace-nowrap rounded-full bg-danger px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
            Not yet -- lost a heart
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
  /** Fires once the active step's part is pressed. */
  onStepComplete: (itemId: string) => void;
  /** Fires when the learner presses a part that isn't the current step's target -- the parent
   * handles the actual heart-loss side effect (see AssemblyChecklistActivity). */
  onWrongPress: () => void;
  /** Off for the quiz's practical check -- see AssemblyPart's doc comment on the same prop. Also
   * disables the Enter/Space keyboard shortcut in "guided" (true) mode, since that's just the
   * tap button's keyboard equivalent: without the button telling you what's active, blindly
   * pressing Enter would let a learner clear every step without ever identifying a single part. */
  showTapLabel?: boolean;
  /** Off for the quiz's practical check -- see AssemblyPart's doc comment on the same prop. */
  hintCorrectOnHover?: boolean;
}

/** A single persistent multi-part scene: press the highlighted part to remove or install it, one
 * step at a time, in order -- the interactive core of Module 1 Task 1 (disassembly + reassembly). */
export function AssemblyScene({
  steps,
  completedItemIds,
  activeItemId,
  onStepComplete,
  onWrongPress,
  showTapLabel = true,
  hintCorrectOnHover = true,
}: AssemblySceneProps) {
  const parts = useMemo(() => partsFromSteps(steps), [steps]);
  const currentStep = steps.find((s) => s.itemId === activeItemId) ?? null;

  // GPU/cooler ride along with the motherboard, and case fans stay fixed to the chassis, in every
  // scene EXCEPT where the caller's own steps give one of them a real, independent step (the
  // quiz's practical check) -- filtered out here rather than always rendering both, which would
  // draw two copies of the same model on top of each other.
  const motherboardRiders = useMemo(
    () => MOTHERBOARD_RIDERS.filter((rider) => !parts.some((part) => part.url === rider.url)),
    [parts],
  );
  const fanParts = useMemo(() => FAN_PARTS.filter((fan) => !parts.some((part) => part.url === fan.url)), [parts]);

  // Every part in this scene loads once, up front -- unlike PartViewer (which swaps to a
  // different single part over its lifetime), there's no case here where this needs to reset
  // back to true after the initial load.
  const [loading, setLoading] = useState(true);
  const handleReady = useCallback(() => setLoading(false), []);

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

  // Keyboard equivalent of pressing the highlighted part -- there's only ever one actionable
  // part at a time, so Enter/Space unambiguously means "do that step" without needing to select
  // anything first. Skipped while focus sits on a real interactive element (e.g. the on-canvas
  // "Tap to remove" button) so its own native activation doesn't double-fire this.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!showTapLabel) return;
      if (!currentStep) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      const activeTag = (document.activeElement as HTMLElement | null)?.tagName;
      if (activeTag === "BUTTON" || activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "A") return;
      e.preventDefault();
      onStepComplete(currentStep.itemId);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, onStepComplete, showTapLabel]);

  const targetMarkerPosition = currentStep
    ? currentStep.phase === "remove"
      ? currentStep.trayPosition
      : currentStep.installedPosition
    : null;

  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [0, 2.4, 10.5], fov: 46 }} style={{ touchAction: "none" }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 8, 5]} intensity={2.6} color="#eef4ff" />
        <directionalLight position={[-4, -2, -3]} intensity={0.8} color="#6ea8ff" />
        <directionalLight position={[0, 3, 8]} intensity={1.2} color="#ffffff" />
        <StudioEnvironment />

        <Suspense fallback={null}>
          <ModelsReadySignal onReady={handleReady} />
          {/* The case is never a checklist step itself -- it's the always-present, already-intact
           * PC every other part belongs to and gets removed from / reinstalled onto. */}
          <group position={CASE_POSITION}>
            <ModelShape url={CASE_URL} size={CASE_SIZE} />
          </group>

          {fanParts.map((fan) => (
            <group key={fan.url} position={fan.position}>
              <ModelShape url={fan.url} {...FAN_DISPLAY} />
            </group>
          ))}

          {targetMarkerPosition && <TargetMarker position={targetMarkerPosition} />}

          {parts.map((part) => {
            if (part.hiddenUntilItemId && !completedItemIds.has(part.hiddenUntilItemId)) {
              return null;
            }
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
                onWrongPress={onWrongPress}
                riders={part.url === MOTHERBOARD_URL ? motherboardRiders : undefined}
                showTapLabel={showTapLabel}
                hintCorrectOnHover={hintCorrectOnHover}
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
      {loading && <LoadingOverlay />}
    </div>
  );
}
