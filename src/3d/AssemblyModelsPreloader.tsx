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
  "/models/ssd.glb",
];

/** Kicks off background downloads for Task 1's 3D scene as soon as the learner reaches Module 1's
 * task list -- by the time they tap into the task itself, the GLTFLoader cache already has every
 * model, so AssemblyScene's Suspense boundary resolves instantly instead of showing "Loading
 * parts...". Renders nothing; mount it anywhere upstream of the task page.
 *
 * Staggered rather than fired in one synchronous burst -- each of these is a multi-megabyte
 * Draco-compressed download that spins up its own decode work, and starting all eleven at once
 * competes hard with whatever else the page is doing (and, on a low-end device, with itself). */
export function AssemblyModelsPreloader() {
  useEffect(() => {
    const timers = PRELOAD_URLS.map((url, i) => setTimeout(() => useGLTF.preload(url), i * 200));
    return () => timers.forEach(clearTimeout);
  }, []);
  return null;
}
