import type { ProcedureChecklistItem } from "../types";
import {
  COOLER_TRAY,
  COOLER_URL,
  CPU_TRAY,
  CPU_URL,
  FAN1_POSITION,
  FAN1_URL,
  FAN_TRAY,
  GPU_TRAY,
  GPU_URL,
  MOTHERBOARD_INSTALLED,
  MOTHERBOARD_TRAY,
  MOTHERBOARD_URL,
  PSU_INSTALLED,
  PSU_TRAY,
  QUIZ_COOLER_ON_TRAY,
  QUIZ_CPU_ON_TRAY,
  QUIZ_GPU_ON_TRAY,
  QUIZ_RAM1_ON_TRAY,
  QUIZ_RAM2_ON_TRAY,
  RAM_TRAY,
  RAM2_TRAY,
  ROM_INSTALLED,
  ROM_TRAY,
  SIDE_COVER_INSTALLED,
  SIDE_COVER_TRAY,
  SIDE_COVER_URL,
  SSD_INSTALLED,
  SSD_TRAY,
} from "@/3d/caseGeometry";

/** Task 1 quiz's practical check -- a second, unguided disassembly sequence that gates the
 * multiple-choice questions (see the quiz task page). Unlike the checklist activity, this isn't
 * from the task sheet: it's a knowledge/recall test, so there's no "Tap to remove" label and no
 * hover hint telling the learner which part is next (see AssemblyScene's showTapLabel/
 * hintCorrectOnHover) -- they have to recognize each part on sight and click it directly, and a
 * wrong click costs a heart exactly like a wrong press in the checklist activity's scene.
 *
 * The order is fixed: Panel -> Motherboard -> CPU -> RAM 1 -> RAM 2 -> ROM -> CPU Cooler -> Fan
 * -> Graphics Card -> Hard Drive -> PSU -> Final Check. Every id starts with "remove-" so
 * AssemblyChecklistActivity's toStep() infers phase "remove" for all of them -- this sequence
 * only ever strips the machine down, it doesn't reassemble it. */
export const module1PracticalCheck: ProcedureChecklistItem[] = [
  {
    id: "remove-panel-pc",
    label: "Remove the side panel",
    explanation: "The case starts fully closed -- take the panel off first to reach anything inside.",
    model: { url: SIDE_COVER_URL },
    dragTarget: { installedPosition: SIDE_COVER_INSTALLED, trayPosition: SIDE_COVER_TRAY },
  },
  {
    id: "remove-mobo-pc",
    label: "Remove the motherboard",
    explanation: "Pull the whole board out next, with the CPU, RAM, cooler, and graphics card still attached to it.",
    model: { url: MOTHERBOARD_URL },
    dragTarget: { installedPosition: MOTHERBOARD_INSTALLED, trayPosition: MOTHERBOARD_TRAY },
  },
  {
    id: "remove-cpu-pc",
    label: "Remove the CPU",
    explanation: "With the board out on the bench, lift the socket lever and take the CPU off first.",
    model: { url: CPU_URL },
    // QUIZ_CPU_ON_TRAY assumes the motherboard is already sitting at MOTHERBOARD_TRAY -- true from
    // the moment remove-mobo-pc is done, but wrong (the CPU would render already sitting loose in
    // the tray, disconnected from a still-installed board) before that. hiddenUntilItemId keeps it
    // unmounted until then; see AssemblyStep's own doc comment for the general mechanism.
    dragTarget: { installedPosition: QUIZ_CPU_ON_TRAY, trayPosition: CPU_TRAY, hiddenUntilItemId: "remove-mobo-pc" },
  },
  {
    id: "remove-ram1-pc",
    label: "Remove RAM 1",
    explanation: "Unclip the first DIMM slot's levers and lift the stick straight out.",
    model: { url: "/models/ram.glb" },
    dragTarget: { installedPosition: QUIZ_RAM1_ON_TRAY, trayPosition: RAM_TRAY, hiddenUntilItemId: "remove-mobo-pc" },
  },
  {
    id: "remove-ram2-pc",
    label: "Remove RAM 2",
    explanation: "Same as the first stick -- unclip the second slot's levers and lift it out.",
    // Suffixed for the same reason as ROM above -- RAM 1 and RAM 2 are two physically distinct
    // sticks (this scene has no second real DIMM slot GLB, so it reuses the one RAM model twice),
    // and AssemblyScene's url-keyed part tracking needs two distinct urls to treat them as
    // separate parts rather than collapsing them into one.
    model: { url: "/models/ram.glb#2" },
    dragTarget: { installedPosition: QUIZ_RAM2_ON_TRAY, trayPosition: RAM2_TRAY, hiddenUntilItemId: "remove-mobo-pc" },
  },
  {
    id: "remove-rom-pc",
    label: "Remove the optical drive (ROM)",
    explanation: "Disconnect its cables, then unscrew it from its bay -- same idea as any other drive.",
    // No dedicated optical-drive GLB exists in this project's assets -- reuses the SSD model as a
    // visual stand-in. The "#rom" suffix is never sent over the network (URL fragments are
    // client-side only, so this still fetches plain ssd.glb) -- it exists purely so the scene
    // treats this as a physically distinct part from the Hard Drive step below, which reuses the
    // same bare url. Without it, AssemblyScene's url-keyed part tracking would collapse ROM and
    // Hard Drive into a single mesh/step, since it assumes one url = one physical part.
    model: { url: "/models/ssd.glb#rom" },
    dragTarget: { installedPosition: ROM_INSTALLED, trayPosition: ROM_TRAY },
  },
  {
    id: "remove-cooler-pc",
    label: "Remove the CPU cooler",
    explanation: "Unclip it from the socket bracket and lift it off -- the CPU underneath is already out, so nothing's still seated.",
    model: { url: COOLER_URL },
    dragTarget: { installedPosition: QUIZ_COOLER_ON_TRAY, trayPosition: COOLER_TRAY, hiddenUntilItemId: "remove-mobo-pc" },
  },
  {
    id: "remove-fan-pc",
    label: "Remove the case fan",
    explanation: "Unscrew it from the chassis -- case fans mount to the case itself, not the motherboard.",
    model: { url: FAN1_URL },
    dragTarget: { installedPosition: FAN1_POSITION, trayPosition: FAN_TRAY },
  },
  {
    id: "remove-gpu-pc",
    label: "Remove the graphics card",
    explanation: "Unclip the PCIe slot's retention latch and pull the card straight out.",
    model: { url: GPU_URL },
    dragTarget: { installedPosition: QUIZ_GPU_ON_TRAY, trayPosition: GPU_TRAY, hiddenUntilItemId: "remove-mobo-pc" },
  },
  {
    id: "remove-hdd-pc",
    label: "Remove the hard drive",
    explanation: "Disconnect its data and power cables, then unscrew it from its bay.",
    model: { url: "/models/ssd.glb" },
    dragTarget: { installedPosition: SSD_INSTALLED, trayPosition: SSD_TRAY },
  },
  {
    id: "remove-psu-pc",
    label: "Remove the power supply unit",
    explanation: "Disconnect its cables from every component before unscrewing it from the case.",
    model: { url: "/models/psu.glb" },
    dragTarget: { installedPosition: PSU_INSTALLED, trayPosition: PSU_TRAY },
  },
  {
    id: "final-check-pc",
    label: "Final Check",
    explanation: "Confirm every component has been removed and the case is completely stripped down before moving on to the quiz.",
  },
];
