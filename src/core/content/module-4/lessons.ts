import type { LessonCard } from "../types";

export const module4Lessons: LessonCard[] = [
  {
    id: "why-backups-matter",
    title: "Why Backups Matter",
    body: "Hardware fails, files get deleted by accident, and mistakes happen. A backup is a separate copy of data kept somewhere else specifically so that a problem with the original doesn't mean the data is gone for good.",
    media: {
      kind: "image",
      url: "/modules/module-4/images/start-restore.webp",
      alt: "Several external hard drives, a common place to keep a separate copy of data",
      credit: "\"External hard drives\" by TonyTheTiger (Wikimedia Commons), CC BY-SA 3.0",
    },
  },
  {
    id: "network-backups",
    title: "Backing Up Over a Network",
    body: "Rather than backing up to another drive on the same machine, files can be backed up to a separate server over the network -- so even a total failure of the client PC doesn't take the backup down with it.",
    media: {
      kind: "image",
      url: "/modules/module-4/images/backup-to-network.webp",
      alt: "Set up backup wizard's \"Select where you want to save your backup\" screen, with a network location on the server PC selected",
    },
  },
  {
    id: "windows-backup-and-restore",
    title: "Using Backup and Restore",
    body: "Windows' built-in Backup and Restore tool can save a folder's contents to a chosen destination -- including a network location -- and later restore those exact files back to their original spot.",
    media: {
      kind: "image",
      url: "/modules/module-4/images/run-backup-tool.webp",
      alt: "The Backup and Restore (Windows 7) control panel, with Backup and Restore sections showing location and schedule",
    },
  },
  {
    id: "verifying-a-restore",
    title: "Verifying a Restore",
    body: "Restoring a backup isn't finished until you've checked that the files actually reappeared in their original location. A backup you've never test-restored is one you can't be sure actually works.",
    media: {
      kind: "image",
      url: "/modules/module-4/images/create-test-folder.webp",
      alt: "File Explorer showing the restored folder back in its original spot on Local Disk (D:)",
    },
  },
];
