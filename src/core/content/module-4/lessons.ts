import type { LessonCard } from "../types";

export const module4Lessons: LessonCard[] = [
  {
    id: "video-backup-and-troubleshooting",
    title: "Watch: Back Up, Restore, Troubleshoot",
    body: "This unit keeps computers and their data healthy. Watch the backup drill (create a folder, back it up to the server, delete it, restore it, verify it), then the troubleshooting cycle used to fix a PC that lost its network connection.",
    media: {
      kind: "video",
      url: "/modules/module-4/videos/uc4-explainer.webm",
      alt: "Animated network map showing a folder backed up to a server, deleted, restored, and a network fault being diagnosed and fixed",
      caption: "About 1.5 min, animated with on-screen captions. It walks through Task 1 and Task 2.",
      credit: "Animated explainer made for this training app",
    },
  },
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
  // -- Troubleshooting (Task 2) --
  {
    id: "troubleshooting-process",
    title: "The Troubleshooting Process",
    body: "Good technicians don't guess. They follow the same steps every time: identify the problem (ask the user, note what changed), form a theory of the likely cause, test that theory, plan and apply the fix, verify the whole system works, and document what was done.",
  },
  {
    id: "start-physical",
    title: "Start With the Simple, Physical Things",
    body: "Most faults are simple: a loose cable, a switch turned off, a link light that's dark. Check power and connections before blaming software. The cheapest, quickest checks come first.",
    media: {
      kind: "model",
      url: "/models/cat-cable.glb",
      alt: "3D model of a network cable",
    },
  },
  {
    id: "post-and-beep-codes",
    title: "POST, Beep Codes, and Device Manager",
    body: "At power-on the POST (power-on self-test) checks the hardware. Beeps or an error with no display usually point to RAM, the graphics card, or the CPU, and the motherboard manual explains each code. Once Windows is up, Device Manager shows driver problems with a yellow warning icon.",
    media: {
      kind: "image",
      url: "/modules/module-1/lessons/post-boot-screen.webp",
      alt: "A monitor showing the BIOS power-on self-test (POST) screen as the computer starts",
      credit: "\"POST of ASUS P5KPL on SyncMaster 740N\" by Macic7 (Wikimedia Commons), public domain",
    },
  },
  {
    id: "network-commands",
    title: "ipconfig and ping",
    body: "ipconfig /all shows a PC's IP settings. An address starting with 169.254 means DHCP never answered, and ipconfig /release then /renew asks for a new one. Ping outward step by step: 127.0.0.1 (the PC's own network software), the PC's own IP, then the server. The first ping that fails shows where the fault is.",
    media: {
      kind: "image",
      url: "/modules/module-2/images/diagnose-faults.webp",
      alt: "Command Prompt output of ipconfig /all listing each adapter's IPv4 address, subnet mask, and default gateway",
    },
  },
  {
    id: "isolate-and-document",
    title: "Isolate, Fix, Test, Document",
    body: "Swap in a known-good part (a tested cable, a working RAM stick) to confirm which part is faulty, then fix only that part. Test with the user before closing the job, and write a service report: the problem, the cause, the fix, and the result.",
    media: {
      kind: "image",
      url: "/modules/module-2/images/test-cable.webp",
      alt: "An RJ45/RJ11 LAN cable tester kit with master and remote units, plus a cable stripper",
      credit: "\"Cable stripper and cable tester (RJ45, RJ11)\" by heimnetzwerke.net (Wikimedia Commons), CC BY 4.0",
    },
  },
];
