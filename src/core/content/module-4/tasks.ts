import type { TaskContent } from "../types";

// Sourced from the single real UC4 job sheet (see /modules/uc4).
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
];
