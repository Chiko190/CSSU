import type { ProcedureChecklistActivityContent } from "../types";
import {
  CPU_INSTALLED,
  CPU_TRAY,
  FRONT_COVER_INSTALLED,
  FRONT_COVER_TRAY,
  FRONT_COVER_URL,
  MOTHERBOARD_INSTALLED,
  MOTHERBOARD_TRAY,
  PSU_INSTALLED,
  PSU_TRAY,
  RAM_INSTALLED,
  RAM_TRAY,
  SIDE_COVER_INSTALLED,
  SIDE_COVER_TRAY,
  SSD_INSTALLED,
  SSD_TRAY,
} from "@/3d/caseGeometry";

// Sourced from all four UC1 task sheets: 1.1-4 "Computer Disassembly and
// Assembly", 1.2-2 "Create Portable Bootable Device", 1.3-2 "Install
// Operating System and Device Drivers", and 1.3-3 "Install Application
// Software" -- combined into one start-to-finish flow, matching the source
// task sheets' own step order. remove-cpu/attach-cpu are the one addition
// beyond the literal sheet: the CPU used to just ride along invisibly with
// the motherboard, so learners never actually practiced pulling one out of
// its socket -- it's now its own interactive step, sequenced around the
// motherboard's own removal/reattachment since it has to be socketed while
// the board is still mounted in the case (see CPU_INSTALLED's doc comment
// in caseGeometry.ts for why that ordering matters). The front/back cover
// split is the other addition beyond the literal sheet, which only ever
// mentions one "side cover" -- see FRONT_COVER_INSTALLED's doc comment in
// caseGeometry.ts for why the front cover comes off first and goes back on
// last.
export const module1Activity: ProcedureChecklistActivityContent = {
  kind: "procedure-checklist",
  moduleId: "module-1",
  instructions: "Take a computer apart, rebuild it, and set it up from a blank drive -- in order, exactly like a technician would.",
  items: [
    // Disassembly
    {
      id: "follow-ohs",
      label: "Follow OH&S policies and wear PPE",
      explanation: "Protective eyewear and proper tools come before anything else -- safety isn't a step you skip.",
    },
    {
      id: "verify-working",
      label: "Turn the computer on and confirm it's working",
      explanation: "Check it boots properly, then turn it back off. Now you know any later issue wasn't already there.",
    },
    {
      id: "power-off",
      label: "Turn the computer off before opening it",
      explanation: "Never disassemble a powered or plugged-in machine.",
    },
    {
      id: "remove-front-cover",
      label: "Remove the front cover (side panel)",
      explanation: "The viewer-facing front cover comes off first, before the back cover.",
      model: { url: FRONT_COVER_URL },
      dragTarget: { installedPosition: FRONT_COVER_INSTALLED, trayPosition: FRONT_COVER_TRAY },
    },
    {
      id: "remove-side-cover",
      label: "Remove the back cover (side panel)",
      explanation: "This exposes the internal components you'll be removing.",
      model: { url: "/models/case-side-armour.glb" },
      dragTarget: { installedPosition: SIDE_COVER_INSTALLED, trayPosition: SIDE_COVER_TRAY },
    },
    {
      id: "remove-psu",
      label: "Remove the power supply unit",
      explanation: "Disconnect its cables from every component before unscrewing it from the case.",
      model: { url: "/models/psu.glb" },
      dragTarget: { installedPosition: PSU_INSTALLED, trayPosition: PSU_TRAY },
    },
    {
      id: "remove-hdd",
      label: "Remove the hard drive",
      explanation: "Disconnect its data and power cables, then unscrew it from its bay.",
      model: { url: "/models/ssd.glb" },
      dragTarget: { installedPosition: SSD_INSTALLED, trayPosition: SSD_TRAY },
    },
    {
      id: "remove-optical-drive",
      label: "Remove the optical drive (if any)",
      explanation: "Same idea as the hard drive -- disconnect cables, then unscrew.",
    },
    {
      id: "remove-ram",
      label: "Remove the RAM card from the motherboard",
      explanation: "Unclip the DIMM slot levers and lift the stick straight out.",
      model: { url: "/models/ram.glb" },
      dragTarget: { installedPosition: RAM_INSTALLED, trayPosition: RAM_TRAY },
    },
    {
      id: "remove-cpu",
      label: "Remove the CPU from the motherboard",
      explanation: "Lift the socket's retention lever to release it, then lift the CPU straight up and out -- never slide it, and never touch the pins.",
      model: { url: "/models/cpu.glb" },
      dragTarget: { installedPosition: CPU_INSTALLED, trayPosition: CPU_TRAY },
    },
    {
      id: "remove-motherboard",
      label: "Remove the motherboard from the system unit",
      explanation: "With everything else clear, unscrew and lift out the motherboard last.",
      model: { url: "/models/motherboard.glb" },
      dragTarget: { installedPosition: MOTHERBOARD_INSTALLED, trayPosition: MOTHERBOARD_TRAY },
    },
    // Assembly -- same slots as their removal counterparts above, in reverse order.
    {
      id: "attach-motherboard",
      label: "Attach the motherboard to the system unit",
      explanation: "Screw it in, but not too tight -- overtightening can crack the board.",
      model: { url: "/models/motherboard.glb" },
      dragTarget: { installedPosition: MOTHERBOARD_INSTALLED, trayPosition: MOTHERBOARD_TRAY },
    },
    {
      id: "attach-cpu",
      label: "Attach the CPU to the motherboard",
      explanation: "Align the socket's corner notch, lower the CPU straight down with no force, then close the retention lever to lock it in.",
      model: { url: "/models/cpu.glb" },
      dragTarget: { installedPosition: CPU_INSTALLED, trayPosition: CPU_TRAY },
    },
    {
      id: "attach-ram",
      label: "Attach the RAM card to the motherboard's RAM slot",
      explanation: "Line up the notch and press evenly until the clips snap closed on their own.",
      model: { url: "/models/ram.glb" },
      dragTarget: { installedPosition: RAM_INSTALLED, trayPosition: RAM_TRAY },
    },
    {
      id: "screw-in-drives",
      label: "Screw the hard disk drive and optical drive into the case",
      explanation: "Make sure every connector -- data and power -- is fully and correctly connected.",
      model: { url: "/models/ssd.glb" },
      dragTarget: { installedPosition: SSD_INSTALLED, trayPosition: SSD_TRAY },
    },
    {
      id: "attach-psu",
      label: "Attach the power supply to the system case",
      explanation: "Connect its power cables to the motherboard and drives, making sure each one is seated correctly.",
      model: { url: "/models/psu.glb" },
      dragTarget: { installedPosition: PSU_INSTALLED, trayPosition: PSU_TRAY },
    },
    {
      id: "attach-side-cover",
      label: "Attach the back cover (side panel) and screw it back on",
      explanation: "The solid back cover goes on before the outer glass panel.",
      model: { url: "/models/case-side-armour.glb" },
      dragTarget: { installedPosition: SIDE_COVER_INSTALLED, trayPosition: SIDE_COVER_TRAY },
    },
    {
      id: "attach-front-cover",
      label: "Attach the front cover (side panel) and screw it back on",
      explanation: "This is the last physical step before the machine is closed up.",
      model: { url: FRONT_COVER_URL },
      dragTarget: { installedPosition: FRONT_COVER_INSTALLED, trayPosition: FRONT_COVER_TRAY },
    },
    {
      id: "power-on",
      label: "Turn the computer back on",
      explanation: "A successful boot is the real confirmation that assembly was done correctly.",
    },
    // Bootable device, OS, drivers, applications
    {
      id: "open-rufus",
      label: "Open Rufus to create a bootable flash drive",
      explanation: "Rufus writes an OS installer image onto a USB drive so the target machine can boot from it.",
    },
    {
      id: "follow-bootable-instructions",
      label: "Follow the on-screen instructions and the OS's end-user agreement",
      explanation: "Bootable media creation must respect the software's license terms, not just the technical steps.",
    },
    {
      id: "test-bootable-device",
      label: "Test the created bootable device",
      explanation: "Confirm the USB drive actually boots and launches the installer before relying on it.",
    },
    {
      id: "install-os",
      label: "Install the operating system per the established procedure",
      explanation: "Boot from the USB and follow the OS's own installation steps.",
    },
    {
      id: "create-partitions",
      label: "Create at least two partitions on the hard disk drive",
      explanation: "Separating the OS from personal files makes future reinstalls and backups safer.",
    },
    {
      id: "install-drivers",
      label: "Install missing device drivers",
      explanation: "A fresh OS install rarely includes every driver a specific machine needs.",
    },
    {
      id: "install-browser",
      label: "Install a web browser (e.g. Google Chrome)",
      explanation: "A browser is one of the first applications most end users expect.",
    },
    {
      id: "install-office",
      label: "Install an office application suite (e.g. MS Office)",
      explanation: "Installed based on the end user's requirements and the software's license agreement.",
    },
    {
      id: "install-antivirus",
      label: "Install antivirus software (if required)",
      explanation: "Protects the freshly installed system before it's exposed to untrusted files or networks.",
    },
  ],
};
