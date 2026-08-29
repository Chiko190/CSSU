/** Shared placement constants for Module 1 Task 1's 3D scene -- read by both AssemblyScene (to
 * render them) and module-1/activity.ts (to set each step's dragTarget) so the two stay in sync
 * instead of duplicating numbers by hand.
 *
 * case-main.glb turns out to be a complete, pre-modeled gaming PC (motherboard, CPU, cabling, all
 * baked into one mesh behind its glass panel), not an empty shell -- confirmed by rendering it
 * alone and looking. So instead of trying to nest the separate motherboard/CPU/RAM/etc. GLBs
 * *inside* that single opaque mesh (they'd just be hidden behind its own walls), the case renders
 * large and centered as the "this is an intact PC" anchor, and each real part is a separate token
 * that sits just in front of it -- close enough to read as "this part belongs to that machine,"
 * dragged out to the tray to disassemble and back to reassemble. */
export const CASE_URL = "/models/case-main.glb";
export const MOTHERBOARD_URL = "/models/motherboard.glb";
export const CPU_URL = "/models/cpu.glb";
export const SIDE_COVER_URL = "/models/case-side-armour.glb";

/** The case sits centered at the scene origin, pushed back so the token parts in front of it
 * don't clip into its shell. */
export const CASE_POSITION: [number, number, number] = [0, 0, -1.6];
export const CASE_SIZE = 3.4;

/** All five tokens sit in one legible row in front of the case, evenly spread on X. */
export const SIDE_COVER_INSTALLED: [number, number, number] = [-2.2, 1, 0.8];
export const PSU_INSTALLED: [number, number, number] = [-1.1, 0.6, 0.8];
export const RAM_INSTALLED: [number, number, number] = [0, 0.35, 0.8];
export const SSD_INSTALLED: [number, number, number] = [1.1, 0.35, 0.8];
export const MOTHERBOARD_INSTALLED: [number, number, number] = [2.2, 0.85, 0.8];

/** CPU rides along on the motherboard token, roughly centered on its face. */
export const CPU_OFFSET_ON_MOTHERBOARD: [number, number, number] = [0, 0.32, 0];
