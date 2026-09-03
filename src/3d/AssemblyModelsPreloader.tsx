"use client";

import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import {
  CASE_URL,
  COOLER_URL,
  CPU_URL,
  FAN1_URL,
  FAN2_URL,
  FRONT_COVER_URL,
  GPU_URL,
  MOTHERBOARD_URL,
  SIDE_COVER_URL,
} from "./caseGeometry";

const PRELOAD_URLS = [
  CASE_URL,
  SIDE_COVER_URL,
  FRONT_COVER_URL,
  MOTHERBOARD_URL,
  CPU_URL,
  GPU_URL,
  COOLER_URL,
  FAN1_URL,
  FAN2_URL,
  "/models/psu.glb",
  "/models/ram.glb",
  "/models/ram.glb#2",
  "/models/ssd.glb",
  "/models/ssd.glb#rom",
];

/** Kicks off background downloads for Task 1's 3D scene as soon as the learner reaches Module 1's
 * task list -- by the time they tap into the task itself, the GLTFLoader cache already has every
 * model, so AssemblyScene's Suspense boundary resolves instantly instead of showing "Loading
 * parts...". Renders nothing; mount it anywhere upstream of the task page.
 *
 * Staggered rather than fired in one synchronous burst -- most of these are multi-megabyte
 * Draco-compressed downloads that spin up their own decode work, and starting them all at once
 * competes hard with whatever else the page is doing (and, on a low-end device, with itself).
 * The "#2"/"#rom" suffixed entries don't trigger a second network fetch (see FRONT_COVER_URL's
 * doc comment in caseGeometry.ts) -- they're only listed here so useGLTF's per-key cache is
 * warmed under those exact keys too, matching what AssemblyScene actually requests. */
export function AssemblyModelsPreloader() {
  useEffect(() => {
    const timers = PRELOAD_URLS.map((url, i) => setTimeout(() => useGLTF.preload(url), i * 200));
    return () => timers.forEach(clearTimeout);
  }, []);
  return null;
}
