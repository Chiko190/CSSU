import type { LessonCard } from "../types";

export const module4Lessons: LessonCard[] = [
  {
    id: "why-backups-matter",
    title: "Why Backups Matter",
    body: "Hardware fails, files get deleted by accident, and mistakes happen. A backup is a separate copy of data kept somewhere else specifically so that a problem with the original doesn't mean the data is gone for good.",
  },
  {
    id: "network-backups",
    title: "Backing Up Over a Network",
    body: "Rather than backing up to another drive on the same machine, files can be backed up to a separate server over the network -- so even a total failure of the client PC doesn't take the backup down with it.",
  },
  {
    id: "windows-backup-and-restore",
    title: "Using Backup and Restore",
    body: "Windows' built-in Backup and Restore tool can save a folder's contents to a chosen destination -- including a network location -- and later restore those exact files back to their original spot.",
  },
  {
    id: "verifying-a-restore",
    title: "Verifying a Restore",
    body: "Restoring a backup isn't finished until you've checked that the files actually reappeared in their original location. A backup you've never test-restored is one you can't be sure actually works.",
  },
];
