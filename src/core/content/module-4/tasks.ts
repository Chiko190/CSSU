import type { TaskContent } from "../types";

// Task 1 is sourced from the single real UC4 job sheet (see /modules/uc4). Task 2
// (troubleshooting) has no job sheet in /modules/uc4 -- it's built from the UC4 competency itself
// ("Maintain and Repair Computer Systems and Networks": diagnose faults, rectify defects, inspect
// and test, document), using the same lab setup as Task 1.
export const module4Tasks: TaskContent[] = [
  {
    id: "task-1",
    title: "Performing Back-Up and Restore",
    objective: "Perform a file backup and restore, proving the recovered data actually lands back in place.",
    materials: ["Desktop/laptop + server computer", "Network switch", "RJ45 / UTP cable"],
    tools: ["Crimping tool", "LAN cable tester"],
    itemIds: [
      "create-test-folder",
      "run-backup-tool",
      "backup-to-network",
      "delete-original",
      "start-restore",
      "select-backup",
      "restore-to-original-location",
      "verify-restored-files",
    ],
  },
  {
    id: "task-2",
    title: "Troubleshooting Computer Systems and Networks",
    objective:
      "Diagnose faults in computer systems and networks, rectify them per manufacturer instructions, then test and document the repair.",
    materials: ["Desktop/laptop + server computer", "Network switch", "RJ45 / UTP cable", "Known-good spare parts (cable, RAM)"],
    tools: ["LAN cable tester", "Crimping tool", "Anti-static wrist strap", "Assorted screwdrivers", "Utility software"],
    itemIds: [
      "ts-gather-info",
      "ts-backup-first",
      "ts-check-physical",
      "ts-observe-post",
      "ts-device-manager",
      "ts-check-ip",
      "ts-ping-test",
      "ts-isolate-fault",
      "ts-apply-fix",
      "ts-test-verify",
      "ts-document",
    ],
  },
];
