import type { ProcedureChecklistActivityContent } from "../types";

// Sourced from UC4 (Maintain and Repair Computer Systems and Networks) Task
// Sheet 4.2-2 "Performing Back Up and Restore".
export const module4Activity: ProcedureChecklistActivityContent = {
  kind: "procedure-checklist",
  moduleId: "module-4",
  instructions: "Back up a folder over the network, then prove the restore actually works.",
  items: [
    {
      id: "create-test-folder",
      label: "Create a folder on the local disk",
      explanation: "This is the data you'll back up and, later, delete and restore.",
      image: {
        url: "/modules/module-4/images/create-test-folder.webp",
        alt: "File Explorer showing a newly created folder on Local Disk (D:)",
      },
    },
    {
      id: "run-backup-tool",
      label: "Run Backup and Restore",
      explanation: "Windows' built-in tool for creating and restoring backups.",
      image: {
        url: "/modules/module-4/images/run-backup-tool.webp",
        alt: "The Backup and Restore (Windows 7) control panel, with Backup and Restore sections showing location and schedule",
      },
    },
    {
      id: "backup-to-network",
      label: "Perform a backup to a network location (the server PC)",
      explanation: "Backing up to a separate machine means a local hardware failure doesn't destroy the backup too.",
      image: {
        url: "/modules/module-4/images/backup-to-network.webp",
        alt: "Set up backup wizard's \"Select where you want to save your backup\" screen, with a network location on the server PC selected",
      },
    },
    {
      id: "delete-original",
      label: "Delete the folder you created",
      explanation: "Simulates the exact kind of data loss a backup exists to protect against.",
    },
    {
      id: "start-restore",
      label: "Open Restore Files from Backup and Restore",
      explanation: "Begins the recovery process from the backup you created earlier.",
    },
    {
      id: "select-backup",
      label: "Select the backup file you created",
      explanation: "Points the restore process at the correct backup to recover from.",
    },
    {
      id: "restore-to-original-location",
      label: "Restore the files to their original location",
      explanation: "Puts the recovered data back exactly where it was before deletion.",
    },
    {
      id: "verify-restored-files",
      label: "Check that the files are back in their original location",
      explanation: "A restore isn't confirmed working until you've actually verified the files reappeared.",
    },
  ],
};
