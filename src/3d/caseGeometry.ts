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
/** CPU's offset from the motherboard's own position, riding along at its true socket location
 * (also computed from raw coordinates -- lands inside the motherboard's own bounding box). */
export const CPU_OFFSET_ON_MOTHERBOARD: [number, number, number] = [0.132, 0.3, -0.11];
/** The armor panel's real mounting position (the case's rear face -- this is the panel removed
 * first in the task sheet, exposing the motherboard/PSU behind it). */
export const SIDE_COVER_INSTALLED: [number, number, number] = [-0.125, 0.073, -2.434];
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
export const PSU_TRAY: [number, number, number] = [1.6, -1, 3.6];
export const RAM_TRAY: [number, number, number] = [0.3, 0.3, 3.6];
export const SSD_TRAY: [number, number, number] = [-1, -0.5, 3.6];
export const MOTHERBOARD_TRAY: [number, number, number] = [-2.8, 0.4, 3.6];

/** GPU and the CPU cooler aren't Task 1 checklist steps (the real task sheet never has the
 * learner remove them) -- they're always-mounted decoration so the case reads as a complete build
 * instead of a bare motherboard, matching the reference project's fully-populated look. Both
 * mount directly to the motherboard/CPU (GPU into the PCIe slot, cooler onto the CPU socket), so
 * they ride along at a fixed offset from the motherboard's own position, same as CPU_OFFSET_ON_
 * MOTHERBOARD above -- the same way the real hardware travels with the board when it's pulled.
 * Offsets computed the same way as every other case-family part (their raw bounding boxes sit
 * inside the motherboard's), not eyeballed. */
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
