import type { TaskContent } from "../types";

// Sourced from the 4 real UC1 task sheets (see /modules/uc1) -- Task Sheet 1.1-4 "Computer
// Disassembly and Assembly" gets two tasks here, each with its own practical check and
// 15-question quiz (task-1 disassembly, task-2 assembly). Task 1's hands-on checklist still runs
// the whole take-apart-then-rebuild sequence in one 3D scene, so the learner puts the PC back
// together right after stripping it; by the time they reach task-2 its checklist is already done
// and it goes straight to the assembly quiz. Each task's itemIds names which of module1Activity.items belongs to it --
// the checklist data itself (label/explanation/model/dragTarget) lives in one place (activity.ts).
// getTaskChecklistItems() renders items in THIS array's own order, not activity.items' own array
// order -- reordering a task's steps means reordering the ids here, not just the objects in
// activity.ts.
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
      "remove-ram",
      "remove-ram2",
      "remove-psu",
      "remove-cooler",
      "remove-gpu",
      "remove-hdd",
      "remove-optical-drive",
      "remove-cpu",
      "remove-motherboard",
      "attach-motherboard",
      "attach-cpu",
      "attach-optical-drive",
      "attach-hdd",
      "attach-gpu",
      "attach-cooler",
      "attach-psu",
      "attach-ram2",
      "attach-ram",
      "attach-side-cover",
      "attach-front-cover",
      "power-on",
    ],
  },
  {
    id: "task-2",
    title: "Computer Assembly",
    objective: "Perform computer assembly, given the necessary equipment.",
    materials: ["A working computer", "Protective eyewear / PPE", "Flashlight", "Flash drive"],
    tools: ["Assorted screwdrivers"],
    itemIds: [
      "attach-motherboard",
      "attach-cpu",
      "attach-optical-drive",
      "attach-hdd",
      "attach-gpu",
      "attach-cooler",
      "attach-psu",
      "attach-ram2",
      "attach-ram",
      "attach-side-cover",
      "attach-front-cover",
      "power-on",
    ],
  },
  {
    id: "task-3",
    title: "Create Portable Bootable Device",
    objective: "Create a bootable flash drive per the software's user guide and end-user license agreement.",
    materials: ["USB flash drive", "OS installer image", "Device driver / application installers"],
    tools: ["Rufus (or similar bootable-media tool)"],
    itemIds: ["open-rufus", "follow-bootable-instructions", "test-bootable-device"],
  },
  {
    id: "task-4",
    title: "Install Operating System and Device Drivers",
    objective: "Install an operating system and peripheral/component drivers per manufacturer instructions.",
    materials: ["OS installer", "Device driver installers", "Hardware manuals", "Software licenses"],
    itemIds: ["install-os", "create-partitions", "install-drivers"],
  },
  {
    id: "task-5",
    title: "Install Application Software",
    objective: "Install application software per installation guides, end-user license agreements, and end-user requirements.",
    materials: ["Application installers", "Software licenses"],
    itemIds: ["install-browser", "install-office", "install-antivirus"],
  },
];
