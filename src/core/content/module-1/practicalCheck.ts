import type { ProcedureChecklistItem } from "../types";
import {
  COOLER_INSTALLED,
  COOLER_TRAY,
  COOLER_URL,
  CPU_INSTALLED,
  CPU_TRAY,
  CPU_URL,
  FRONT_COVER_INSTALLED,
  FRONT_COVER_TRAY,
  FRONT_COVER_URL,
  GPU_INSTALLED,
  GPU_TRAY,
  GPU_URL,
  MOTHERBOARD_INSTALLED,
  MOTHERBOARD_TRAY,
  MOTHERBOARD_URL,
  PSU_INSTALLED,
  PSU_TRAY,
  RAM_INSTALLED,
  RAM_TRAY,
  RAM2_INSTALLED,
  RAM2_TRAY,
  ROM_INSTALLED,
  ROM_TRAY,
  SIDE_COVER_INSTALLED,
  SIDE_COVER_TRAY,
  SIDE_COVER_URL,
  SSD_INSTALLED,
  SSD_TRAY,
} from "@/3d/caseGeometry";

/** Task 1 (Disassembly) quiz's practical check -- a second, unguided disassembly sequence that
 * gates the multiple-choice questions (see the quiz task page). Task 2 (Assembly) has its own
 * mirror-image check further below, module1AssemblyPracticalCheck. Unlike the checklist activity,
 * neither is from the task sheet: they're knowledge/recall tests, so there's no "Tap to remove"/
 * "Tap to install" label and no hover hint telling the learner which part is next (see
 * AssemblyScene's showTapLabel/hintCorrectOnHover) -- they have to recognize each part on sight
 * and click it directly, and a wrong click costs a heart exactly like a wrong press in the
 * checklist activity's scene.
 *
 * The order matches module-1/tasks.ts's task-1 itemIds disassembly order exactly (the order the
 * checklist activity actually renders in, not necessarily activity.ts's own object order -- see
 * that file's header comment), so the quiz tests the same sequence the checklist just taught:
 * Front Cover -> Back Cover -> RAM 1 -> RAM 2 -> PSU -> CPU Cooler (Heatsink) -> Graphics Card ->
 * Hard Drive -> ROM -> CPU -> Motherboard -> Final Check. Everything mounted to the board (RAM,
 * ROM/HDD are case-mounted not board-mounted, but GPU/cooler/CPU are) comes off before the board
 * itself, so every part below uses its real
 * case-relative INSTALLED position (GPU_INSTALLED, COOLER_INSTALLED, etc.) the same way the
 * checklist activity does -- no hiddenUntilItemId needed, since the motherboard doesn't move
 * until it's the very last thing pulled. Every id starts with "remove-" so
 * AssemblyChecklistActivity's toStep() infers phase "remove" for all of them -- this sequence
 * only ever strips the machine down, it doesn't reassemble it. */
export const module1PracticalCheck: ProcedureChecklistItem[] = [
  {
    id: "remove-front-cover-pc",
    label: "Remove the front cover (side panel)",
    explanation: "The case starts fully closed -- the front cover comes off first, before the back cover.",
    model: { url: FRONT_COVER_URL },
    dragTarget: { installedPosition: FRONT_COVER_INSTALLED, trayPosition: FRONT_COVER_TRAY },
  },
  {
    id: "remove-panel-pc",
    label: "Remove the back cover (side panel)",
    explanation: "With the front cover off, take the back cover off next to reach anything inside.",
    model: { url: SIDE_COVER_URL },
    dragTarget: { installedPosition: SIDE_COVER_INSTALLED, trayPosition: SIDE_COVER_TRAY },
  },
  {
    id: "remove-ram1-pc",
    label: "Remove RAM 1",
    explanation: "Unclip the first DIMM slot's levers and lift the stick straight out.",
    model: { url: "/models/ram.glb" },
    dragTarget: { installedPosition: RAM_INSTALLED, trayPosition: RAM_TRAY },
  },
  {
    id: "remove-ram2-pc",
    label: "Remove RAM 2",
    explanation: "Same as the first stick -- unclip the second slot's levers and lift it out.",
    // Suffixed for the same reason as ROM below -- RAM 1 and RAM 2 are two physically distinct
    // sticks (this scene has no second real DIMM slot GLB, so it reuses the one RAM model twice),
    // and AssemblyScene's url-keyed part tracking needs two distinct urls to treat them as
    // separate parts rather than collapsing them into one.
    model: { url: "/models/ram.glb#2" },
    dragTarget: { installedPosition: RAM2_INSTALLED, trayPosition: RAM2_TRAY },
  },
  {
    id: "remove-psu-pc",
    label: "Remove the power supply unit",
    explanation: "Disconnect its cables from every component before unscrewing it from the case.",
    model: { url: "/models/psu.glb" },
    dragTarget: { installedPosition: PSU_INSTALLED, trayPosition: PSU_TRAY },
  },
  {
    id: "remove-cooler-pc",
    label: "Remove the CPU cooler (heatsink)",
    explanation: "Unclip it from the socket bracket and lift it off -- it has to come off before the CPU, since its bracket clamps down over the socket.",
    model: { url: COOLER_URL },
    dragTarget: { installedPosition: COOLER_INSTALLED, trayPosition: COOLER_TRAY },
  },
  {
    id: "remove-gpu-pc",
    label: "Remove the graphics card",
    explanation: "Unclip the PCIe slot's retention latch and pull the card straight out -- it has to come off before the motherboard, since it's still plugged into it.",
    model: { url: GPU_URL },
    dragTarget: { installedPosition: GPU_INSTALLED, trayPosition: GPU_TRAY },
  },
  {
    id: "remove-hdd-pc",
    label: "Remove the hard drive",
    explanation: "Disconnect its data and power cables, then unscrew it from its bay.",
    model: { url: "/models/ssd.glb" },
    dragTarget: { installedPosition: SSD_INSTALLED, trayPosition: SSD_TRAY },
  },
  {
    id: "remove-rom-pc",
    label: "Remove the optical drive (ROM)",
    explanation: "Disconnect its cables, then unscrew it from its bay -- same idea as any other drive.",
    // No dedicated optical-drive GLB exists in this project's assets -- reuses the SSD model as a
    // visual stand-in. The "#rom" suffix is never sent over the network (URL fragments are
    // client-side only, so this still fetches plain ssd.glb) -- it exists purely so the scene
    // treats this as a physically distinct part from the Hard Drive step above, which reuses the
    // same bare url. Without it, AssemblyScene's url-keyed part tracking would collapse ROM and
    // Hard Drive into a single mesh/step, since it assumes one url = one physical part.
    model: { url: "/models/ssd.glb#rom" },
    dragTarget: { installedPosition: ROM_INSTALLED, trayPosition: ROM_TRAY },
  },
  {
    id: "remove-cpu-pc",
    label: "Remove the CPU",
    explanation: "Lift the socket's retention lever to release it, then lift the CPU straight up and out -- the last thing off the board before the board itself.",
    model: { url: CPU_URL },
    dragTarget: { installedPosition: CPU_INSTALLED, trayPosition: CPU_TRAY },
  },
  {
    id: "remove-mobo-pc",
    label: "Remove the motherboard",
    explanation: "With everything else clear, unscrew and lift out the motherboard last.",
    model: { url: MOTHERBOARD_URL },
    dragTarget: { installedPosition: MOTHERBOARD_INSTALLED, trayPosition: MOTHERBOARD_TRAY },
  },
  {
    id: "final-check-pc",
    label: "Final Check",
    explanation: "Confirm every component has been removed and the case is completely stripped down before moving on to the quiz.",
  },
];

/** Task 2 quiz's practical check -- the reverse of module1PracticalCheck: a second, unguided
 * ASSEMBLY sequence starting from a fully stripped case. Every id below does NOT start with
 * "remove-", so AssemblyChecklistActivity's toStep() infers phase "install" for all of them --
 * see settledPosition()'s install-only branch in 3d/AssemblyScene.tsx, added specifically so an
 * install-only scene (no matching "remove-" counterpart in the same steps array) toggles each
 * part between its tray and installed position off that one step's own completion, the same way
 * a "remove-"-only scene already did.
 *
 * Order matches module-1/tasks.ts's task-2 itemIds assembly order exactly: Motherboard -> CPU ->
 * ROM -> Hard Drive -> Graphics Card -> CPU Cooler (Heatsink) -> PSU -> RAM 2 -> RAM 1 -> Back
 * Cover -> Front Cover -> Final Check. */
export const module1AssemblyPracticalCheck: ProcedureChecklistItem[] = [
  {
    id: "attach-mobo-pc",
    label: "Attach the motherboard",
    explanation: "Screw it into the case first -- nearly everything else attaches to it or is routed around it.",
    model: { url: MOTHERBOARD_URL },
    dragTarget: { installedPosition: MOTHERBOARD_INSTALLED, trayPosition: MOTHERBOARD_TRAY },
  },
  {
    id: "attach-cpu-pc",
    label: "Attach the CPU",
    explanation: "Align the socket's corner notch, lower it straight down with no force, then close the retention lever to lock it in.",
    model: { url: CPU_URL },
    dragTarget: { installedPosition: CPU_INSTALLED, trayPosition: CPU_TRAY },
  },
  {
    id: "attach-rom-pc",
    label: "Screw the optical drive (ROM) into its bay",
    explanation: "Same as the hard drive -- both its data and power connectors fully seated.",
    model: { url: "/models/ssd.glb#rom" },
    dragTarget: { installedPosition: ROM_INSTALLED, trayPosition: ROM_TRAY },
  },
  {
    id: "attach-hdd-pc",
    label: "Screw the hard drive into its bay",
    explanation: "Make sure every connector -- data and power -- is fully and correctly connected.",
    model: { url: "/models/ssd.glb" },
    dragTarget: { installedPosition: SSD_INSTALLED, trayPosition: SSD_TRAY },
  },
  {
    id: "attach-gpu-pc",
    label: "Attach the graphics card",
    explanation: "Line it up with the PCIe slot and press down until the retention latch clicks -- it has to go in before the cooler, since the cooler goes on last of the board-mounted parts.",
    model: { url: GPU_URL },
    dragTarget: { installedPosition: GPU_INSTALLED, trayPosition: GPU_TRAY },
  },
  {
    id: "attach-cooler-pc",
    label: "Attach the CPU cooler (heatsink)",
    explanation: "Seat it onto the socket bracket now that the CPU underneath is already in place.",
    model: { url: COOLER_URL },
    dragTarget: { installedPosition: COOLER_INSTALLED, trayPosition: COOLER_TRAY },
  },
  {
    id: "attach-psu-pc",
    label: "Attach the power supply unit",
    explanation: "Connect its power cables to the motherboard and drives, making sure each one is seated correctly.",
    model: { url: "/models/psu.glb" },
    dragTarget: { installedPosition: PSU_INSTALLED, trayPosition: PSU_TRAY },
  },
  {
    id: "attach-ram2-pc",
    label: "Attach RAM 2",
    explanation: "Line up the notch and press evenly until the second slot's clips snap closed on their own.",
    model: { url: "/models/ram.glb#2" },
    dragTarget: { installedPosition: RAM2_INSTALLED, trayPosition: RAM2_TRAY },
  },
  {
    id: "attach-ram1-pc",
    label: "Attach RAM 1",
    explanation: "Same as the second stick -- line up the notch and press evenly until the first slot's clips snap closed.",
    model: { url: "/models/ram.glb" },
    dragTarget: { installedPosition: RAM_INSTALLED, trayPosition: RAM_TRAY },
  },
  {
    id: "attach-panel-pc",
    label: "Attach the back cover (side panel)",
    explanation: "The back cover goes on before the front cover.",
    model: { url: SIDE_COVER_URL },
    dragTarget: { installedPosition: SIDE_COVER_INSTALLED, trayPosition: SIDE_COVER_TRAY },
  },
  {
    id: "attach-front-cover-pc",
    label: "Attach the front cover (side panel)",
    explanation: "The last physical step before the machine is closed up and ready to power on.",
    model: { url: FRONT_COVER_URL },
    dragTarget: { installedPosition: FRONT_COVER_INSTALLED, trayPosition: FRONT_COVER_TRAY },
  },
  {
    id: "final-check-assembly-pc",
    label: "Final Check",
    explanation: "Confirm every component is back in place and the case is fully closed up before moving on to the quiz.",
  },
];
