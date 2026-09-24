import type { WireOrderStep } from "../types";

// Sourced from Task Sheet 2.1-5 "Installing Network Cables" (see /modules/uc 2) -- the task's
// own tools/materials list (Cat5e/Cat6 UTP cable, 2x RJ45 connectors, crimping tool, cable
// stripper) terminates into exactly this: fanning out the cable's 8 color-coded wires and
// seating them into an RJ45 connector in the correct T568B pin order before crimping.
//
// Task 1 quiz's practical check -- gates the multiple-choice questions on the same quiz page,
// same pattern as module-1/practicalCheck.ts's PC teardown. Rendered by WireOrderScene (see
// 3d/WireOrderScene.tsx) instead of AssemblyScene: there's no real part geometry here, just 8
// colored wires that need to land in the right pin slots, in order.
//
// Tray positions are deliberately NOT in pin order left-to-right -- a learner who's actually
// memorized T568B (white-orange, orange, white-green, blue, white-blue, green, white-brown,
// brown) has to find each wire by color among the scrambled tray, not just work left to right.

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

// Which scrambled tray slot each wire (in T568B pin order below) starts in -- a derangement, so
// no wire ever starts sitting directly under its own correct pin.
const TRAY_SLOT_FOR_PIN = [3, 6, 0, 5, 1, 7, 2, 4];

const ORANGE = "#f97316";
const GREEN = "#16a34a";
const BLUE = "#2563eb";
const BROWN = "#78350f";
const WHITE = "#f8fafc";

function pin(index: number): [number, number, number] {
  return [PIN_X[index], PIN_Y, PIN_Z];
}

function tray(index: number): [number, number, number] {
  return TRAY_SLOTS[TRAY_SLOT_FOR_PIN[index]];
}

export const module2WireOrderCheck: WireOrderStep[] = [
  {
    id: "wire-pin-1",
    label: "Pin 1: White/Orange",
    explanation: "T568B's first pair starts with the white-orange wire in pin 1.",
    color: ORANGE,
    stripeColor: WHITE,
    trayPosition: tray(0),
    installedPosition: pin(0),
  },
  {
    id: "wire-pin-2",
    label: "Pin 2: Orange",
    explanation: "The solid orange wire follows its white-orange partner into pin 2.",
    color: ORANGE,
    trayPosition: tray(1),
    installedPosition: pin(1),
  },
  {
    id: "wire-pin-3",
    label: "Pin 3: White/Green",
    explanation: "The second pair's white-green wire seats into pin 3.",
    color: GREEN,
    stripeColor: WHITE,
    trayPosition: tray(2),
    installedPosition: pin(2),
  },
  {
    id: "wire-pin-4",
    label: "Pin 4: Blue",
    explanation: "The solid blue wire sits in the middle, at pin 4 -- not next to its white-blue partner.",
    color: BLUE,
    trayPosition: tray(3),
    installedPosition: pin(3),
  },
  {
    id: "wire-pin-5",
    label: "Pin 5: White/Blue",
    explanation: "White-blue lands at pin 5, right after solid blue -- T568B splits this pair across the middle two pins.",
    color: BLUE,
    stripeColor: WHITE,
    trayPosition: tray(4),
    installedPosition: pin(4),
  },
  {
    id: "wire-pin-6",
    label: "Pin 6: Green",
    explanation: "Solid green returns to close out its pair at pin 6, after being split by the blue pair.",
    color: GREEN,
    trayPosition: tray(5),
    installedPosition: pin(5),
  },
  {
    id: "wire-pin-7",
    label: "Pin 7: White/Brown",
    explanation: "The last pair's white-brown wire goes into pin 7.",
    color: BROWN,
    stripeColor: WHITE,
    trayPosition: tray(6),
    installedPosition: pin(6),
  },
  {
    id: "wire-pin-8",
    label: "Pin 8: Brown",
    explanation: "Solid brown finishes the run in pin 8, completing the T568B order.",
    color: BROWN,
    trayPosition: tray(7),
    installedPosition: pin(7),
  },
];
