import type { TaskContent } from "../types";

// Sourced from the 4 real UC1 task sheets (see /modules/uc1). Each task's
// itemIds are an ordered slice of module1Activity.items -- the checklist
// data itself lives in one place (activity.ts); this just names each real
// task and says which slice of steps belongs to it.
export const module1Tasks: TaskContent[] = [
  {
    id: "task-1",
    title: "Computer Disassembly and Assembly",
    objective: "Perform computer disassembly and assembly, given the necessary equipment.",
    materials: ["A working computer", "Protective eyewear / PPE", "Flashlight", "Flash drive"],
    tools: ["Assorted screwdrivers"],
    itemIds: [
      "follow-ohs",
      "verify-working",
      "power-off",
      "remove-front-cover",
      "remove-side-cover",
      "remove-psu",
      "remove-hdd",
      "remove-optical-drive",
      "remove-ram",
      "remove-cpu",
      "remove-motherboard",
      "attach-motherboard",
      "attach-cpu",
      "attach-ram",
      "screw-in-drives",
      "attach-psu",
      "attach-side-cover",
      "attach-front-cover",
      "power-on",
    ],
  },
  {
    id: "task-2",
    title: "Create Portable Bootable Device",
    objective: "Create a bootable flash drive per the software's user guide and end-user license agreement.",
    materials: ["USB flash drive", "OS installer image", "Device driver / application installers"],
    tools: ["Rufus (or similar bootable-media tool)"],
    itemIds: ["open-rufus", "follow-bootable-instructions", "test-bootable-device"],
  },
  {
    id: "task-3",
    title: "Install Operating System and Device Drivers",
    objective: "Install an operating system and peripheral/component drivers per manufacturer instructions.",
    materials: ["OS installer", "Device driver installers", "Hardware manuals", "Software licenses"],
    itemIds: ["install-os", "create-partitions", "install-drivers"],
  },
  {
    id: "task-4",
    title: "Install Application Software",
    objective: "Install application software per installation guides, end-user license agreements, and end-user requirements.",
    materials: ["Application installers", "Software licenses"],
    itemIds: ["install-browser", "install-office", "install-antivirus"],
  },
];
