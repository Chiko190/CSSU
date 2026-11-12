import type { WireOrderStep, WiringStandard } from "../types";

// Sourced from Task Sheet 2.1-5 "Installing Network Cables" (see /modules/uc 2) -- the task's
// own tools/materials list (Cat5e/Cat6 UTP cable, 2x RJ45 connectors, crimping tool, cable
// stripper) terminates into exactly this: fanning out the cable's 8 color-coded wires and
// seating them into an RJ45 connector in the correct pin order before crimping.
//
// Task 1 quiz's practical check -- gates the multiple-choice questions on the same quiz page,
// same pattern as module-1/practicalCheck.ts's PC teardown. Rendered by WireOrderScene (see
// 3d/WireOrderScene.tsx): the learner drags each of the 8 colored wires from the tray and drops
// it into its pin slot. It's played twice -- one connector wired T568A, then one wired T568B --
// so the learner has to know both color codes, not just one.
//
// Tray positions are deliberately NOT in pin order left-to-right -- a learner who's actually
// memorized the standard has to find each wire by color among the scrambled tray, not just work
// left to right.

const PIN_X = [-0.7, -0.5, -0.3, -0.1, 0.1, 0.3, 0.5, 0.7];
const PIN_Y = 0.34;
const PIN_Z = -1.1;

const TRAY_SLOTS: [number, number, number][] = [
  [-1.05, 0.3, 0.9],
  [-0.35, 0.3, 0.9],
  [0.35, 0.3, 0.9],
  [1.05, 0.3, 0.9],
  [-1.05, 0.3, 1.6],
  [-0.35, 0.3, 1.6],
  [0.35, 0.3, 1.6],
  [1.05, 0.3, 1.6],
];

// Which scrambled tray slot each wire (in pin order) starts in -- a derangement, so no wire ever
// starts sitting directly under its own correct pin. Each standard uses its own shuffle so the
// second round's tray doesn't look like the first's.
const TRAY_SLOT_FOR_PIN: Record<WiringStandard, number[]> = {
  T568A: [5, 2, 7, 0, 6, 3, 4, 1],
  T568B: [3, 6, 0, 5, 1, 7, 2, 4],
};

const ORANGE = "#f97316";
const GREEN = "#16a34a";
const BLUE = "#2563eb";
const BROWN = "#78350f";
const WHITE = "#f8fafc";

interface WireSpec {
  name: string;
  color: string;
  stripeColor?: string;
  explanation: string;
}

function buildStandard(standard: WiringStandard, wires: WireSpec[]): WireOrderStep[] {
  const prefix = standard.toLowerCase();
  return wires.map((wire, i) => ({
    id: `${prefix}-pin-${i + 1}`,
    standard,
    pinIndex: i,
    label: `Pin ${i + 1}: ${wire.name}`,
    explanation: wire.explanation,
    color: wire.color,
    stripeColor: wire.stripeColor,
    trayPosition: TRAY_SLOTS[TRAY_SLOT_FOR_PIN[standard][i]],
    installedPosition: [PIN_X[i], PIN_Y, PIN_Z],
  }));
}

// T568A: white-green, green, white-orange, blue, white-blue, orange, white-brown, brown.
const T568A = buildStandard("T568A", [
  { name: "White/Green", color: GREEN, stripeColor: WHITE, explanation: "T568A starts with the green pair -- white-green in pin 1." },
  { name: "Green", color: GREEN, explanation: "Solid green follows its white-green partner into pin 2." },
  { name: "White/Orange", color: ORANGE, stripeColor: WHITE, explanation: "White-orange goes into pin 3." },
  { name: "Blue", color: BLUE, explanation: "Solid blue sits in the middle at pin 4 -- the same in both standards." },
  { name: "White/Blue", color: BLUE, stripeColor: WHITE, explanation: "White-blue is pin 5, right after solid blue -- also the same in both standards." },
  { name: "Orange", color: ORANGE, explanation: "Solid orange closes its pair at pin 6, split around the blue pair." },
  { name: "White/Brown", color: BROWN, stripeColor: WHITE, explanation: "White-brown goes into pin 7 -- the brown pair never moves." },
  { name: "Brown", color: BROWN, explanation: "Solid brown finishes pin 8, completing T568A." },
]);

// T568B: white-orange, orange, white-green, blue, white-blue, green, white-brown, brown.
// (T568A with the orange and green pairs swapped.)
const T568B = buildStandard("T568B", [
  { name: "White/Orange", color: ORANGE, stripeColor: WHITE, explanation: "T568B starts with the orange pair -- white-orange in pin 1." },
  { name: "Orange", color: ORANGE, explanation: "Solid orange follows its white-orange partner into pin 2." },
  { name: "White/Green", color: GREEN, stripeColor: WHITE, explanation: "White-green goes into pin 3." },
  { name: "Blue", color: BLUE, explanation: "Solid blue sits in the middle at pin 4 -- the same as T568A." },
  { name: "White/Blue", color: BLUE, stripeColor: WHITE, explanation: "White-blue is pin 5, right after solid blue." },
  { name: "Green", color: GREEN, explanation: "Solid green closes its pair at pin 6, split around the blue pair." },
  { name: "White/Brown", color: BROWN, stripeColor: WHITE, explanation: "White-brown goes into pin 7." },
  { name: "Brown", color: BROWN, explanation: "Solid brown finishes pin 8, completing T568B." },
]);

/** Both rounds, in play order: the T568A connector first, then T568B. */
export const module2WireOrderCheck: WireOrderStep[] = [...T568A, ...T568B];
