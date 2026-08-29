/** Shared placement constants for Module 1 Task 1's 3D scene -- read by both AssemblyScene (to
 * render them) and module-1/activity.ts (to set each step's dragTarget) so the two stay in sync
 * instead of duplicating numbers by hand.
 *
 * case-main.glb is a genuinely empty case shell (frame, side panels, HDD/SSD cage, front-panel
 * wiring -- no motherboard/CPU/GPU mesh baked in, confirmed by dumping every node name in the
 * file). It, case-side-armour.glb, motherboard.glb, cpu.glb, and ssd.glb were all exported from
 * one shared source scene: their raw bounding boxes nest inside each other at real-world
 * (metre-scale) positions with no manual placement needed -- the motherboard's box sits inside
 * the case's, the CPU's and the SSD's both sit inside the motherboard's. So instead of
 * independently normalizing each to its own "legible token" box (which is what made every part
 * float in front of the case at the wrong size relative to everything else), each renders at the
 * SAME fixedScale (CASE_FAMILY_SCALE) and each INSTALLED position below is that part's own raw
 * bounding-box center minus the case's, times that scale -- computed from the GLBs' real
 * coordinates, not eyeballed.
 *
 * RAM and PSU are real-world-scale too (their own dimensions check out against actual DDR4/ATX
 * PSU sizes once converted through CASE_FAMILY_SCALE) but weren't exported into that same shared
 * space, so their positions are placed by eye at their real mounting spots -- relative to
 * MOTHERBOARD_INSTALLED for RAM (it plugs into the board), relative to the case for PSU (it
 * mounts to the chassis). The fans are the one exception: fan-1.glb's own bounding box is 4.79
 * world units wide and fan-2.glb's is 2.02 deep -- both exceed the case's own size (3.4 x 3.31 x
 * 1.77), so whatever case they were modeled against, it wasn't this one. They render at an
 * independent, eyeballed size instead of CASE_FAMILY_SCALE, same as before this file's real-scale
 * pass -- forcing "real" scale on an asset that's real for a *different* case just makes it
 * enormous, not accurate. */
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
 * motherboard, CPU, SSD, RAM, PSU) -- CASE_SIZE divided by the case's own longest raw dimension
 * (~0.3986m). */
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

/** RAM's real size is ~1.17 world units long (a DDR4 stick at CASE_FAMILY_SCALE) -- it rides just
 * to the right of the CPU socket, standing in its DIMM slot. PSU's real footprint is ~1.63 x 0.93
 * (its bounding box is much deeper than that because the model includes a trailing cable, not
 * because the housing itself is oversized) -- it sits in the case's rear-bottom bay. Both
 * eyeballed against the now-correctly-scaled motherboard/case rather than computed, since their
 * GLBs don't share the case-family coordinate space. */
export const RAM_INSTALLED: [number, number, number] = [0.35, 0.55, -2.05];
export const PSU_INSTALLED: [number, number, number] = [0.4, -0.95, -2.25];

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
 * mount directly to the motherboard/CPU (GPU into a PCIe slot, cooler onto the CPU socket), so
 * they ride along at a fixed offset from the motherboard's own position, same as CPU_OFFSET_ON_
 * MOTHERBOARD above -- the same way the real hardware travels with the board when it's pulled.
 * Both check out at real CASE_FAMILY_SCALE against the case (a ~24cm GPU, a ~15cm-tall cooler --
 * plausible fractions of this case's own size), unlike the fans below. */
export const GPU_URL = "/models/gpu.glb";
export const COOLER_URL = "/models/cooler.glb";
export const GPU_OFFSET_ON_MOTHERBOARD: [number, number, number] = [0.15, -0.85, 0.35];
export const COOLER_OFFSET_ON_MOTHERBOARD: [number, number, number] = [0.132, 0.75, -0.11];

/** Case fans mount to the chassis, not the motherboard, so -- unlike the GPU/cooler above -- they
 * stay put regardless of whether the motherboard has been pulled, just like a real case fan
 * would. Independently sized rather than CASE_FAMILY_SCALE (see the file header: both fan GLBs'
 * own bounding boxes are bigger than this case in some dimension, so they weren't modeled against
 * it) and positioned by eye near the top vent, spread across the case's width. */
export const FAN1_URL = "/models/fan-1.glb";
export const FAN2_URL = "/models/fan-2.glb";
export const FAN_SIZE = 0.85;
export const FAN1_POSITION: [number, number, number] = [-0.6, 1.5, -1.7];
export const FAN2_POSITION: [number, number, number] = [0.6, 1.5, -1.7];
