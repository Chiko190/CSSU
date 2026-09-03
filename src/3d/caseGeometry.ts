/** Shared placement constants for Module 1 Task 1's 3D scene -- read by both AssemblyScene (to
 * render them) and module-1/activity.ts (to set each step's dragTarget) so the two stay in sync
 * instead of duplicating numbers by hand.
 *
 * case-main.glb is a genuinely empty case shell (frame, side panels, HDD/SSD cage, front-panel
 * wiring -- no motherboard/CPU/GPU mesh baked in, confirmed by dumping every node name in the
 * file). Every part in this file -- case, side panel, motherboard, CPU, SSD, RAM, PSU, GPU, and
 * the cooler -- comes from the reference project's `_sample` GLB line (case_sample,
 * atx_motherboard_sample, cpu_sample, nvme_ssd_sample, ddr4_ram_sample, atx_power_sample,
 * gpu_sample, cooler_sample), which really is all one shared source scene: every one of their raw
 * bounding boxes nests inside the case's at real-world (metre-scale) positions, with no manual
 * placement needed -- the motherboard's box sits inside the case's, the CPU/SSD/RAM/GPU/cooler
 * all sit inside the motherboard's. So instead of independently normalizing each to its own
 * "legible token" box (which is what made every part float in front of the case at the wrong size
 * relative to everything else), each renders at the SAME fixedScale (CASE_FAMILY_SCALE) and each
 * INSTALLED position below is that part's own raw bounding-box center minus the case's, times
 * that scale -- computed from the GLBs' real coordinates, not eyeballed.
 *
 * The 120mm case fan is the one part NOT from that shared scene (120mm_fan_sample.glb) -- its own
 * bounding box (a real 120mm-diameter fan, ~0.25m deep) doesn't land inside the case's the way the
 * others do, so its position is placed by eye instead of computed. */
export const CASE_URL = "/models/case-main.glb";
export const MOTHERBOARD_URL = "/models/motherboard.glb";
export const CPU_URL = "/models/cpu.glb";
export const SIDE_COVER_URL = "/models/case-side-armour.glb";

/** The case sits centered at the scene origin, pushed back so removed tokens pulled out to their
 * tray positions don't clip into its shell. Every CASE_FAMILY_SCALE position below is relative
 * to this anchor. */
export const CASE_POSITION: [number, number, number] = [0, 0, -1.6];
export const CASE_SIZE = 3.4;

/** Shared real-world-proportional scale for every case-family part -- CASE_SIZE divided by the
 * case's own longest raw dimension (~0.3986m). */
export const CASE_FAMILY_SCALE = 8.531;

/** Motherboard's real mounting position on the case's rear tray -- computed from the two GLBs'
 * raw bounding-box centers (see file header), not eyeballed. */
export const MOTHERBOARD_INSTALLED: [number, number, number] = [-0.704, 0.404, -2.08];
/** CPU's offset from the motherboard's own position, at its true socket location (also computed
 * from raw coordinates -- lands inside the motherboard's own bounding box). */
export const CPU_OFFSET_ON_MOTHERBOARD: [number, number, number] = [0.132, 0.3, -0.11];
/** CPU's own "installed" checkpoint: the socket location on the motherboard while the board
 * itself is mounted in the case (MOTHERBOARD_INSTALLED + the socket offset above). The CPU is
 * its own checklist step -- learners need to actually practice opening the socket lever and
 * lifting the CPU straight out, not have it silently disappear along with the whole board -- and
 * it's sequenced to come out before the motherboard and go back in after, so this fixed,
 * case-relative point is valid at both of the CPU's own checkpoints (see module-1/activity.ts). */
export const CPU_INSTALLED: [number, number, number] = [
  MOTHERBOARD_INSTALLED[0] + CPU_OFFSET_ON_MOTHERBOARD[0],
  MOTHERBOARD_INSTALLED[1] + CPU_OFFSET_ON_MOTHERBOARD[1],
  MOTHERBOARD_INSTALLED[2] + CPU_OFFSET_ON_MOTHERBOARD[2],
];
/** The armor panel's real mounting position (the case's rear face -- this is the panel removed
 * first in the task sheet, exposing the motherboard/PSU behind it). */
export const SIDE_COVER_INSTALLED: [number, number, number] = [-0.125, 0.073, -2.434];
/** The case's second side panel -- tempered glass rather than solid armor, mounted on the case's
 * near/viewer-facing side (its raw bounding box sits at the opposite end of the case's own Z
 * extent from the armor panel above). "Front Cover" in the task flow: removed before the armor
 * panel ("Back Cover") during disassembly, and reattached after it during reassembly, so the
 * outer glass panel is the one that seals the case shut last -- same LIFO pairing every other
 * part in this file follows. Computed the same way as every other case-family constant here (its
 * raw bounding box center minus the case's, times CASE_FAMILY_SCALE), not eyeballed. */
export const SIDE_GLASS_URL = "/models/case-side-glass.glb";
export const SIDE_GLASS_INSTALLED: [number, number, number] = [-0.092, 0.073, -0.751];
/** SSD's real mounting position -- an M.2 slot on the motherboard, computed the same way as
 * MOTHERBOARD_INSTALLED (its raw bounding box sits inside the motherboard's). */
export const SSD_INSTALLED: [number, number, number] = [-0.922, -0.336, -2.167];
/** RAM's real mounting position -- its DIMM slot on the motherboard, computed the same way (its
 * raw bounding box sits inside the motherboard's, standing upright in the slot). */
export const RAM_INSTALLED: [number, number, number] = [-0.047, 0.709, -2.049];
/** PSU's real mounting position in the case's own bay -- computed the same way (its raw bounding
 * box sits inside the case's). */
export const PSU_INSTALLED: [number, number, number] = [-0.985, -1.09, -1.612];

/** Removed parts pull out to one legible row in front of the case, spaced to fit their real
 * (CASE_FAMILY_SCALE) footprints -- motherboard and the armor panel are as large as the case
 * itself, so they need much more room than a row of independently-shrunk "tokens" did. */
export const SIDE_COVER_TRAY: [number, number, number] = [3.6, 1, 3.6];
/** Own slot beside the armor panel's tray spot so both covers can sit out at once without
 * overlapping. */
export const SIDE_GLASS_TRAY: [number, number, number] = [4.9, 1, 3.6];
export const PSU_TRAY: [number, number, number] = [1.6, -1, 3.6];
export const RAM_TRAY: [number, number, number] = [0.3, 0.3, 3.6];
export const SSD_TRAY: [number, number, number] = [-1, -0.5, 3.6];
export const MOTHERBOARD_TRAY: [number, number, number] = [-2.8, 0.4, 3.6];
export const CPU_TRAY: [number, number, number] = [-1.9, 0.6, 3.9];

/** GPU and the CPU cooler aren't Task 1 checklist steps (the real task sheet never has the
 * learner remove them) -- they're always-mounted decoration so the case reads as a complete build
 * instead of a bare motherboard, matching the reference project's fully-populated look. Unlike the
 * CPU, they stay riders: mounted directly to the motherboard (GPU into the PCIe slot, cooler onto
 * the CPU socket), they ride along at a fixed offset from the motherboard's own position, the same
 * way the real hardware travels with the board when it's pulled. Offsets computed the same way as
 * every other case-family part (their raw bounding boxes sit inside the motherboard's), not
 * eyeballed. */
export const GPU_URL = "/models/gpu.glb";
export const COOLER_URL = "/models/cooler.glb";
export const GPU_OFFSET_ON_MOTHERBOARD: [number, number, number] = [0.04, -0.497, 0.329];
export const COOLER_OFFSET_ON_MOTHERBOARD: [number, number, number] = [0.134, 0.303, 0.475];

/** Case fans mount to the chassis, not the motherboard, so -- unlike the GPU/cooler above -- they
 * stay put regardless of whether the motherboard has been pulled, just like a real case fan
 * would. 120mm_fan_sample.glb is a real, correctly-scaled single 120mm fan (~1.02 world units
 * across at CASE_FAMILY_SCALE, comfortably inside the case), unlike the two mismatched fan GLBs
 * this scene used before -- so it renders at real scale too, just not case-family *positioned*
 * (its own bounding box doesn't land inside the case's the way the shared-scene parts do). One
 * fan's position is computed from its raw coordinates against the case; the second mirrors it
 * across X for a symmetric second mounting point. */
export const FAN1_URL = "/models/fan-1.glb";
export const FAN2_URL = "/models/fan-2.glb";
export const FAN1_POSITION: [number, number, number] = [1.281, -0.45, -1.61];
export const FAN2_POSITION: [number, number, number] = [-1.281, -0.45, -1.61];

/* --------------------------------------------------------------------------------------------
 * Task 1 quiz's "practical check" (see module-1/practicalCheck.ts) -- a second, unguided
 * disassembly sequence gating that quiz, entirely separate from the checklist activity above.
 * Its part order differs (the whole motherboard comes out FIRST, then everything mounted to it
 * -- CPU, RAM, cooler, GPU -- gets stripped off the board once it's already sitting in the
 * tray), so those parts need their own "still attached, but on the tray now" anchor points.
 * Reusing the activity's CPU_INSTALLED etc. here would be wrong -- those assume the motherboard
 * is still case-relative (MOTHERBOARD_INSTALLED), which by this point in this sequence it isn't.
 * -------------------------------------------------------------------------------------------- */

function offsetFromMotherboard(installed: [number, number, number]): [number, number, number] {
  return [
    installed[0] - MOTHERBOARD_INSTALLED[0],
    installed[1] - MOTHERBOARD_INSTALLED[1],
    installed[2] - MOTHERBOARD_INSTALLED[2],
  ];
}

function addOffset(base: [number, number, number], offset: [number, number, number]): [number, number, number] {
  return [base[0] + offset[0], base[1] + offset[1], base[2] + offset[2]];
}

/** RAM's real DIMM-slot offset, derived from two already-real (non-eyeballed) constants above
 * rather than raw GLB data -- a pure difference between two points in the same space, so it's
 * exact regardless of where the motherboard itself ends up. */
export const RAM_OFFSET_ON_MOTHERBOARD = offsetFromMotherboard(RAM_INSTALLED);
/** There's only one real DIMM slot in the source scene -- this is RAM_OFFSET_ON_MOTHERBOARD
 * nudged sideways to stand in for a second slot. Unlike every other offset on this page, this
 * one's eyeballed, not computed. */
export const RAM2_OFFSET_ON_MOTHERBOARD: [number, number, number] = [
  RAM_OFFSET_ON_MOTHERBOARD[0] + 0.19,
  RAM_OFFSET_ON_MOTHERBOARD[1],
  RAM_OFFSET_ON_MOTHERBOARD[2],
];

/** Where each motherboard-mounted part sits once the motherboard itself has already been pulled
 * to MOTHERBOARD_TRAY -- the practical check's own step order guarantees that's true by the time
 * any of these become the active step. */
export const QUIZ_CPU_ON_TRAY = addOffset(MOTHERBOARD_TRAY, CPU_OFFSET_ON_MOTHERBOARD);
export const QUIZ_RAM1_ON_TRAY = addOffset(MOTHERBOARD_TRAY, RAM_OFFSET_ON_MOTHERBOARD);
export const QUIZ_RAM2_ON_TRAY = addOffset(MOTHERBOARD_TRAY, RAM2_OFFSET_ON_MOTHERBOARD);
export const QUIZ_COOLER_ON_TRAY = addOffset(MOTHERBOARD_TRAY, COOLER_OFFSET_ON_MOTHERBOARD);
export const QUIZ_GPU_ON_TRAY = addOffset(MOTHERBOARD_TRAY, GPU_OFFSET_ON_MOTHERBOARD);

/** No optical-drive GLB exists in this project's asset set -- reuses the SSD/hard-drive model as
 * a stand-in (same generic "drive in a bay" shape) at a second, eyeballed bay above the real
 * (computed) SSD_INSTALLED bay, representing a 5.25" optical bay over the 3.5"/2.5" drive bay. */
export const ROM_INSTALLED: [number, number, number] = [SSD_INSTALLED[0], SSD_INSTALLED[1] + 0.55, SSD_INSTALLED[2]];

/** Tray row for parts that are only ever removable in the quiz's practical check, never in the
 * checklist activity above -- spaced out at their own z so they don't compete visually with that
 * scene's row. The two scenes never render at once, so there's no real risk of overlap either way. */
export const RAM2_TRAY: [number, number, number] = [0.3, -0.3, 3.9];
export const ROM_TRAY: [number, number, number] = [-0.6, -0.7, 3.9];
export const COOLER_TRAY: [number, number, number] = [1, 0.6, 3.9];
export const GPU_TRAY: [number, number, number] = [2.6, 0.6, 3.9];
export const FAN_TRAY: [number, number, number] = [1.8, -0.3, 3.9];
