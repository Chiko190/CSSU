/** Shared placement constants for Module 1 Task 1's 3D scene -- read by both AssemblyScene (to
 * render them) and module-1/activity.ts (to set each step's dragTarget) so the two stay in sync
 * instead of duplicating numbers by hand.
 *
 * case-main.glb is a genuinely empty case shell (frame, side panels, HDD/SSD cage, front-panel
 * wiring -- no motherboard/CPU/GPU mesh baked in, confirmed by dumping every node name in the
 * file). It, case-side-armour.glb, motherboard.glb, and cpu.glb were all exported from one
 * shared source scene: their raw bounding boxes nest inside each other at
 * plausible real-world (metre-scale) positions -- the motherboard's box sits inside the case's,
 * the CPU's sits inside the motherboard's, with no manual placement needed. So instead of
 * independently normalizing each to its own "legible token" box (which is what made every part
 * float in front of the case, disconnected from it), each renders at the SAME fixedScale
 * (CASE_FAMILY_SCALE) and each INSTALLED position below is that part's own raw bounding-box
 * center minus the case's, times that scale -- i.e. computed from the GLBs' real coordinates,
 * not eyeballed. See scripts/print-case-family-offsets.js for how these numbers were derived. */
export const CASE_URL = "/models/case-main.glb";
export const MOTHERBOARD_URL = "/models/motherboard.glb";
export const CPU_URL = "/models/cpu.glb";
export const SIDE_COVER_URL = "/models/case-side-armour.glb";

/** The case sits centered at the scene origin, pushed back so removed tokens pulled out to their
 * tray positions don't clip into its shell. Every CASE_FAMILY_SCALE position below is relative
 * to this anchor. */
export const CASE_POSITION: [number, number, number] = [0, 0, -1.6];
export const CASE_SIZE = 3.4;

/** Shared real-world-proportional scale for every case-family part (case, side panels,
 * motherboard, CPU) -- CASE_SIZE divided by the case's own longest raw dimension (~0.3986m). */
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

/** RAM, PSU, and the drive don't share the case-family GLBs' coordinate space (their raw boxes
 * land outside the case's, or at implausible scale -- they weren't exported from that same source
 * scene), so these are independently normalized tokens (see PART_DISPLAY in AssemblyScene) placed
 * by eye at their real mounting spots instead of computed from raw coordinates. */
export const PSU_INSTALLED: [number, number, number] = [0.55, -1.05, -2.2];
export const RAM_INSTALLED: [number, number, number] = [-0.32, 0.55, -2.0];
export const SSD_INSTALLED: [number, number, number] = [-0.35, -1.05, -1.05];

/** Removed parts pull out to one legible row in front of the case. */
export const SIDE_COVER_TRAY: [number, number, number] = [2.6, 1, 3.6];
export const PSU_TRAY: [number, number, number] = [1.3, 0.6, 3.6];
export const RAM_TRAY: [number, number, number] = [0.2, 0.35, 3.6];
export const SSD_TRAY: [number, number, number] = [-0.9, 0.35, 3.6];
export const MOTHERBOARD_TRAY: [number, number, number] = [-2.2, 0.85, 3.6];

/** GPU, cooler, and fans aren't Task 1 checklist steps (the real task sheet never has the learner
 * remove them) -- they're always-mounted decoration so the case reads as a complete build instead
 * of a bare motherboard, matching the reference project's fully-populated look. They mount to the
 * motherboard (or, for the cooler/fans, to the CPU cooler stack on it), not to the case itself --
 * so they ride along at a fixed offset from the motherboard's own position (like CPU_OFFSET_ON_
 * MOTHERBOARD above), the same way the real hardware travels with the board when it's pulled.
 * Rendering them as fixed case-relative positions instead (an earlier version of this file) left
 * them floating in the case even after the motherboard was removed, since nothing then tied their
 * visibility to whether the board was still there. Offsets positioned by eye, not the case-family
 * shared coordinate space. */
export const GPU_URL = "/models/gpu.glb";
export const COOLER_URL = "/models/cooler.glb";
export const FAN1_URL = "/models/fan-1.glb";
export const FAN2_URL = "/models/fan-2.glb";

export const GPU_OFFSET_ON_MOTHERBOARD: [number, number, number] = [0.204, -0.754, 0.33];
export const COOLER_OFFSET_ON_MOTHERBOARD: [number, number, number] = [0.154, 0.746, -0.02];
export const FAN1_OFFSET_ON_MOTHERBOARD: [number, number, number] = [0.204, 1.096, 0.78];
export const FAN2_OFFSET_ON_MOTHERBOARD: [number, number, number] = [1.204, 1.096, 0.78];
