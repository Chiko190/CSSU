"use client";

import { Suspense, useEffect, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { ModelsReadySignal, StudioEnvironment } from "./modelUtils";
import type { WireOrderStep } from "@/core/content/types";


/** How long the "wrong pin" flash stays up after a bad drop. */
const MISS_FLASH_MS = 900;

const WIRE_RADIUS = 0.08;

/** Height of the invisible horizontal plane a dragged wire slides along -- lifted above the tray
 * and connector so it never clips through them. */
const DRAG_PLANE_Y = 0.35;
/** How far a tapped ("picked up") wire lifts out of the tray. */
const LIFT_Y = 0.25;

/** All hit-testing is done in SCREEN space (pixels), not against the thin 3D wire meshes: pressing
 * anywhere within this radius of a wire grabs the closest one, and releasing within this radius of
 * a pin drops onto the closest pin. Far more forgiving than hitting a 0.06-unit cylinder. */
const GRAB_RADIUS_PX = 48;
const DROP_RADIUS_PX = 56;
/** Pointer travel below this counts as a tap (pick up / put down) rather than a drag. */
const TAP_SLOP_PX = 8;

/** The RJ45 connector's plastic body, the row of 8 gold pin slots on top of it, and the pin
 * numbers in front -- the always-present backdrop every wire gets dropped into. */
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
            <boxGeometry args={[0.12, 0.05, 0.3]} />
            <meshStandardMaterial
              color={hoverPin === i ? "#38bdf8" : "#d4af37"}
              emissive={hoverPin === i ? "#0284c7" : "#000000"}
              emissiveIntensity={hoverPin === i ? 0.7 : 0}
              metalness={0.85}
              roughness={0.3}
            />
          </mesh>
          <Html position={[x, 0.02, 0.5]} center distanceFactor={6} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
            <span
              className={`pointer-events-none select-none font-mono-tabular text-[12px] font-bold ${
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

/** A flat ring on the ground plane -- marks the pin a held wire would drop into, or the tray spot
 * of a picked-up wire. */
function Ring({ x, z, color = "#0284c7" }: { x: number; z: number; color?: string }) {
  return (
    <mesh position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.13, 0.19, 28]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** Where the cable jacket ends and the 8 conductors fan out from (front of the scene, toward the
 * camera). Each wire's root sits in a tight 2x4 bundle inside the jacket's cut end. */
const CABLE_END_Z = 2.6;
const CABLE_Y = 0.12;
const CABLE_RADIUS = 0.22;

function wireRoot(index: number): THREE.Vector3 {
  const col = index % 4;
  const row = index < 4 ? 1 : -1;
  return new THREE.Vector3((col - 1.5) * 0.09, CABLE_Y + row * 0.055, CABLE_END_Z);
}

/** Tip resting spot for a loose wire: the tray slot, laid flat on the table. */
function trayTip(step: WireOrderStep): THREE.Vector3 {
  return new THREE.Vector3(step.trayPosition[0], 0.085, step.trayPosition[2]);
}

/** Tip spot for a seated wire: pushed into its pin channel. */
function seatedTip(step: WireOrderStep): THREE.Vector3 {
  return new THREE.Vector3(step.installedPosition[0], 0.17, step.installedPosition[2] - 0.05);
}

/** The gray PVC cable jacket the wires come out of, running off toward the viewer. */
function CableJacket() {
  return (
    <group position={[0, CABLE_Y, CABLE_END_Z + 1]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[CABLE_RADIUS, CABLE_RADIUS, 2, 32, 1, true]} />
        <meshStandardMaterial color="#9aa6b6" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* the cut end of the jacket */}
      <mesh position={[0, 0, -1]}>
        <ringGeometry args={[CABLE_RADIUS * 0.82, CABLE_RADIUS, 32]} />
        <meshStandardMaterial color="#7d899a" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Insulation material for one conductor. Striped wires are white insulation with a colored
 * stripe spiralling along the length (like real Cat5e/Cat6 pairs), drawn into a small canvas
 * texture that repeats along the tube. */
function useInsulationMaterial(color: string, stripeColor?: string) {
  const [material] = useState(() => {
    if (!stripeColor) {
      return new THREE.MeshPhysicalMaterial({ color, roughness: 0.38, clearcoat: 0.4, clearcoatRoughness: 0.4 });
    }
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = stripeColor; // the white base
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = color; // the colored spiral stripe
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(16, 0);
    ctx.lineTo(64, 48);
    ctx.lineTo(64, 64);
    ctx.lineTo(48, 64);
    ctx.lineTo(0, 16);
    ctx.closePath();
    ctx.fill();
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(7, 1);
    tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.38, clearcoat: 0.4, clearcoatRoughness: 0.4 });
  });
  useEffect(
    () => () => {
      material.map?.dispose();
      material.dispose();
    },
    [material],
  );
  return material;
}

const UP = new THREE.Vector3(0, 1, 0);
const TUBE_SEGMENTS = 40;

interface WireSim {
  root: THREE.Vector3;
  c1: THREE.Vector3;
  tip: THREE.Vector3;
  tipVel: THREE.Vector3;
  elbow: THREE.Vector3;
  elbowVel: THREE.Vector3;
  target: THREE.Vector3;
  elbowTarget: THREE.Vector3;
  acc: THREE.Vector3;
  back: THREE.Vector3;
  curve: THREE.CubicBezierCurve3;
  tangent: THREE.Vector3;
}

function createSim(step: WireOrderStep, index: number, placed: boolean): WireSim {
  const root = wireRoot(index);
  const tip = placed ? seatedTip(step) : trayTip(step);
  const elbow = tip.clone().add(new THREE.Vector3(0, 0.2, 0.4));
  // Wires leave the jacket heading forward and spreading slightly outward.
  const c1 = root.clone().add(new THREE.Vector3(root.x * 2, 0.05, -0.45));
  return {
    root,
    c1,
    tip,
    tipVel: new THREE.Vector3(),
    elbow,
    elbowVel: new THREE.Vector3(),
    target: new THREE.Vector3(),
    elbowTarget: new THREE.Vector3(),
    acc: new THREE.Vector3(),
    back: new THREE.Vector3(),
    curve: new THREE.CubicBezierCurve3(root, c1, elbow, tip),
    tangent: new THREE.Vector3(),
  };
}

/** One conductor: a flexible insulated wire running from the cable bundle to a stripped copper
 * tip. The tip is spring-driven toward wherever it should be (tray, pin, lifted, or the pointer),
 * and the wire's "elbow" near the tip is a second, softer spring that lags behind -- together
 * they give the wire a rubbery, elastic feel when it's dragged and when it snaps back. The tube
 * geometry is rebuilt each frame along a cubic bezier through those points. */
function WirePart({
  step,
  index,
  state,
  placed,
  dragPoint,
  missFlash,
}: {
  step: WireOrderStep;
  index: number;
  state: "rest" | "picked" | "dragging";
  placed: boolean;
  dragPoint: MutableRefObject<THREE.Vector3>;
  missFlash: boolean;
}) {
  const material = useInsulationMaterial(step.color, step.stripeColor);
  const meshRef = useRef<THREE.Mesh>(null);
  const tipRef = useRef<THREE.Group>(null);
  const flashRef = useRef<THREE.Group>(null);
  // Mutable physics state, lives outside React (created on the first frame).
  const simRef = useRef<WireSim | null>(null);

  useFrame((_, rawDelta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    if (!simRef.current) simRef.current = createSim(step, index, placed);
    const s = simRef.current;

    // Where the tip wants to be right now.
    if (placed) s.target.copy(seatedTip(step));
    else if (state === "dragging") s.target.copy(dragPoint.current);
    else if (state === "picked") s.target.copy(trayTip(step)).setY(0.085 + LIFT_Y);
    else s.target.copy(trayTip(step));

    // Where the elbow (the bend just behind the tip) naturally sits: seated wires run straight
    // back out of the pin channel; loose ones curl up a bit on the way back toward the cable.
    s.back.copy(s.root).sub(s.target).setY(0).normalize();
    if (placed) s.elbowTarget.set(s.target.x, s.target.y + 0.04, s.target.z + 0.55);
    else s.elbowTarget.copy(s.target).addScaledVector(s.back, 0.45).setY(s.target.y + (state === "rest" ? 0.18 : 0.3));

    // Spring physics, sub-stepped for stability. The tip spring is a little under-damped (a small
    // overshoot/bounce); the elbow spring is softer so it trails and wobbles -- the elastic bit.
    const dt = Math.min(rawDelta, 1 / 30);
    const substeps = 4;
    const h = dt / substeps;
    const tipK = state === "dragging" ? 260 : 150;
    const tipC = state === "dragging" ? 22 : 13;
    const elbowK = 70;
    const elbowC = 7;
    for (let i = 0; i < substeps; i++) {
      s.acc.copy(s.target).sub(s.tip).multiplyScalar(tipK).addScaledVector(s.tipVel, -tipC);
      s.tipVel.addScaledVector(s.acc, h);
      s.tip.addScaledVector(s.tipVel, h);

      s.acc.copy(s.elbowTarget).sub(s.elbow).multiplyScalar(elbowK).addScaledVector(s.elbowVel, -elbowC);
      s.elbowVel.addScaledVector(s.acc, h);
      s.elbow.addScaledVector(s.elbowVel, h);
    }
    // Don't let the tip sink through the table; give it a tiny bounce instead.
    if (s.tip.y < WIRE_RADIUS) {
      s.tip.y = WIRE_RADIUS;
      if (s.tipVel.y < 0) s.tipVel.y *= -0.3;
    }

    // Rebuild the insulated tube along root -> c1 -> elbow -> tip.
    const old = mesh.geometry;
    mesh.geometry = new THREE.TubeGeometry(s.curve, TUBE_SEGMENTS, WIRE_RADIUS, 10, false);
    old.dispose();

    // Stripped copper end, pointing along the wire's direction at the tip.
    s.curve.getTangent(1, s.tangent);
    if (tipRef.current) {
      tipRef.current.position.copy(s.tip);
      tipRef.current.quaternion.setFromUnitVectors(UP, s.tangent);
    }
    if (flashRef.current) flashRef.current.position.copy(s.tip);
  });

  return (
    <>
      <mesh ref={meshRef} material={material}>
        <bufferGeometry />
      </mesh>
      <group ref={tipRef}>
        <mesh position={[0, 0.055, 0]}>
          <cylinderGeometry args={[WIRE_RADIUS * 0.45, WIRE_RADIUS * 0.45, 0.11, 10]} />
          <meshStandardMaterial color="#c87533" metalness={0.95} roughness={0.25} />
        </mesh>
      </group>
      <group ref={flashRef}>
        {missFlash && (
          <Html position={[0, 0.4, 0]} center distanceFactor={6} style={{ pointerEvents: "none" }}>
            <div className="whitespace-nowrap rounded-full bg-danger px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg">
              Wrong pin -- lost a heart
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

type Held = { id: string; mode: "dragging" | "picked" } | null;

/** Owns every pointer interaction on the canvas, using native listeners so it runs BEFORE
 * OrbitControls: a press near a wire grabs it (and the camera doesn't orbit); a press anywhere
 * else orbits the camera as usual.
 *  - press + drag + release over a pin  -> drop on that pin
 *  - tap a wire                         -> pick it up (lifted); then tap a pin to drop it
 *  - release / tap anywhere else        -> wire goes back, no penalty */
function PointerController({
  wires,
  pinWorld,
  enabled,
  held,
  setHeld,
  setHoverPin,
  dragPoint,
  onDrop,
}: {
  wires: { id: string; position: THREE.Vector3 }[];
  pinWorld: THREE.Vector3[];
  enabled: boolean;
  held: Held;
  setHeld: (h: Held) => void;
  setHoverPin: (p: number | null) => void;
  dragPoint: MutableRefObject<THREE.Vector3>;
  onDrop: (wireId: string, pin: number) => void;
}) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const getThree = useThree((s) => s.get);

  // Latest props for the long-lived native listeners.
  const live = useRef({ wires, pinWorld, enabled, held, setHeld, setHoverPin, onDrop });
  useEffect(() => {
    live.current = { wires, pinWorld, enabled, held, setHeld, setHoverPin, onDrop };
  });

  useEffect(() => {
    const canvas = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -DRAG_PLANE_Y);
    const ndc = new THREE.Vector2();
    const tmp = new THREE.Vector3();
    let press: { x: number; y: number; id: string; wasPicked: boolean; moved: boolean } | null = null;

    function setOrbit(on: boolean) {
      const orbit = getThree().controls as unknown as { enabled: boolean } | null;
      if (orbit) orbit.enabled = on;
    }

    function toScreen(v: THREE.Vector3) {
      const rect = canvas.getBoundingClientRect();
      tmp.copy(v).project(camera);
      return { x: rect.left + ((tmp.x + 1) / 2) * rect.width, y: rect.top + ((1 - tmp.y) / 2) * rect.height };
    }

    function nearest(points: THREE.Vector3[], clientX: number, clientY: number, radius: number): number | null {
      let best: number | null = null;
      let bestD = radius;
      points.forEach((p, i) => {
        const s = toScreen(p);
        const d = Math.hypot(s.x - clientX, s.y - clientY);
        if (d <= bestD) {
          best = i;
          bestD = d;
        }
      });
      return best;
    }

    function nearestWire(clientX: number, clientY: number): string | null {
      const { wires: ws } = live.current;
      const i = nearest(ws.map((w) => w.position), clientX, clientY, GRAB_RADIUS_PX);
      return i === null ? null : ws[i].id;
    }

    function nearestPin(clientX: number, clientY: number): number | null {
      return nearest(live.current.pinWorld, clientX, clientY, DROP_RADIUS_PX);
    }

    function updateDragPoint(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(plane, tmp)) dragPoint.current.copy(tmp);
    }

    function handleDown(e: PointerEvent) {
      const { enabled: on, held: h, setHeld: set, onDrop: drop } = live.current;
      if (!on || (e.pointerType === "mouse" && e.button !== 0)) return;

      // A wire is already picked up: tapping a pin drops it there.
      if (h?.mode === "picked") {
        const pin = nearestPin(e.clientX, e.clientY);
        if (pin !== null) {
          e.stopImmediatePropagation();
          set(null);
          live.current.setHoverPin(null);
          drop(h.id, pin);
          return;
        }
      }

      const id = nearestWire(e.clientX, e.clientY);
      if (id === null) {
        // Pressed empty space: put down any picked-up wire and let the camera orbit.
        if (h) set(null);
        return;
      }

      // Grabbed a wire -- keep this press away from OrbitControls.
      e.stopImmediatePropagation();
      setOrbit(false);
      canvas.setPointerCapture?.(e.pointerId);
      press = { x: e.clientX, y: e.clientY, id, wasPicked: h?.id === id, moved: false };
      updateDragPoint(e.clientX, e.clientY);
      set({ id, mode: "dragging" });
      document.body.style.cursor = "grabbing";
    }

    function handleMove(e: PointerEvent) {
      const { held: h, enabled: on } = live.current;
      if (press) {
        if (Math.hypot(e.clientX - press.x, e.clientY - press.y) > TAP_SLOP_PX) press.moved = true;
        updateDragPoint(e.clientX, e.clientY);
        live.current.setHoverPin(press.moved ? nearestPin(e.clientX, e.clientY) : null);
        return;
      }
      if (h?.mode === "picked") {
        live.current.setHoverPin(nearestPin(e.clientX, e.clientY));
      }
      if (e.pointerType === "mouse" && on && e.target === canvas) {
        const overWire = nearestWire(e.clientX, e.clientY) !== null;
        const overPin = h?.mode === "picked" && nearestPin(e.clientX, e.clientY) !== null;
        document.body.style.cursor = overWire || overPin ? "grab" : "auto";
      }
    }

    function handleUp(e: PointerEvent) {
      if (!press) return;
      const p = press;
      press = null;
      setOrbit(true);
      canvas.releasePointerCapture?.(e.pointerId);
      document.body.style.cursor = "auto";
      const { setHeld: set, setHoverPin: hover, onDrop: drop } = live.current;
      hover(null);

      if (!p.moved) {
        // A tap: pick the wire up (or put it back down if it was already picked up).
        set(p.wasPicked ? null : { id: p.id, mode: "picked" });
        return;
      }
      set(null);
      const pin = nearestPin(e.clientX, e.clientY);
      if (pin !== null) drop(p.id, pin);
    }

    // Capture phase so this runs before OrbitControls' own pointerdown on the same canvas.
    canvas.addEventListener("pointerdown", handleDown, { capture: true });
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      canvas.removeEventListener("pointerdown", handleDown, { capture: true });
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
      document.body.style.cursor = "auto";
    };
  }, [camera, gl, getThree, dragPoint]);

  return null;
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

/** Drag each wire from the tray onto its RJ45 pin slot (or tap a wire, then tap the pin). Dropping
 * on the wrong empty pin costs a heart and the wire springs back; dropping anywhere else (or on a
 * filled pin) just returns it to the tray for free. */
export function WireOrderScene({ steps, completedItemIds, interactive = true, onStepComplete, onWrongDrop }: WireOrderSceneProps) {
  const [loading, setLoading] = useState(true);
  const [hoverPin, setHoverPin] = useState<number | null>(null);
  const [held, setHeld] = useState<Held>(null);
  const [missId, setMissId] = useState<string | null>(null);
  const dragPoint = useRef(new THREE.Vector3());
  const missTimer = useRef<number | undefined>(undefined);

  const pinXs = steps.map((s) => s.installedPosition[0]);
  const pinZ = steps[0]?.installedPosition[2] ?? -1.1;
  // Screen-space hit points: the top of each gold pin slot, and the middle of each tray wire.
  const pinWorld = pinXs.map((x) => new THREE.Vector3(x, 0.2, pinZ - 0.15));
  const loose = steps.filter((s) => !completedItemIds.has(s.id));
  const wires = loose.map((s) => ({ id: s.id, position: new THREE.Vector3(s.trayPosition[0], 0.085, s.trayPosition[2]) }));

  // Same fix as AssemblyScene: the canvas's parent height settles from a CSS calc a couple of
  // ancestors up, after R3F's first ResizeObserver measurement -- force a re-measure once layout
  // has actually settled.
  useEffect(() => {
    const timers = [50, 300].map((delay) => setTimeout(() => window.dispatchEvent(new Event("resize")), delay));
    return () => {
      timers.forEach(clearTimeout);
      window.clearTimeout(missTimer.current);
    };
  }, []);

  function handleDrop(wireId: string, pin: number) {
    const step = steps.find((s) => s.id === wireId);
    if (!step || completedItemIds.has(wireId)) return;
    const filled = steps.some((s) => s.pinIndex === pin && completedItemIds.has(s.id));
    if (filled) return; // occupied: just goes back, no penalty
    if (pin === step.pinIndex) {
      onStepComplete(step.id);
      return;
    }
    onWrongDrop(step.id, pin);
    setMissId(step.id);
    window.clearTimeout(missTimer.current);
    missTimer.current = window.setTimeout(() => setMissId(null), MISS_FLASH_MS);
  }

  const pickedStep = held?.mode === "picked" ? steps.find((s) => s.id === held.id) : undefined;

  return (
    <div className="relative w-full h-full select-none">
      <Canvas camera={{ position: [0, 4.4, 4.3], fov: 40 }} style={{ touchAction: "none" }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 8, 5]} intensity={2.4} color="#eef4ff" />
        <directionalLight position={[-4, -2, -3]} intensity={0.7} color="#6ea8ff" />
        <directionalLight position={[0, 3, 8]} intensity={1.1} color="#ffffff" />
        <StudioEnvironment />

        <Suspense fallback={null}>
          <ModelsReadySignal onReady={() => setLoading(false)} />
          <ConnectorBody pinXs={pinXs} pinZ={pinZ} hoverPin={hoverPin} />

          {hoverPin !== null && <Ring x={pinXs[hoverPin]} z={pinZ} />}
          {pickedStep && <Ring x={pickedStep.trayPosition[0]} z={pickedStep.trayPosition[2]} color="#7c3aed" />}

          <CableJacket />

          {steps.map((step, index) => {
            const placed = completedItemIds.has(step.id);
            const state = held?.id === step.id ? held.mode : "rest";
            return (
              <WirePart
                key={step.id}
                step={step}
                index={index}
                placed={placed}
                state={placed ? "rest" : state}
                dragPoint={dragPoint}
                missFlash={missId === step.id}
              />
            );
          })}

          <ContactShadows position={[0, -0.4, 0]} opacity={0.35} scale={10} blur={2.2} far={3} resolution={512} color="#000814" />
        </Suspense>

        <PointerController
          wires={wires}
          pinWorld={pinWorld}
          enabled={interactive}
          held={held}
          setHeld={setHeld}
          setHoverPin={setHoverPin}
          dragPoint={dragPoint}
          onDrop={handleDrop}
        />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.12}
          minDistance={2.5}
          maxDistance={10}
          maxPolarAngle={Math.PI * 0.42}
          target={[0, 0.1, 0.8]}
          enablePan={false}
        />
      </Canvas>
      {loading && <LoadingOverlay />}
    </div>
  );
}
