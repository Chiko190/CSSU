import type { ProcedureChecklistActivityContent } from "../types";

// Sourced from UC4 (Maintain and Repair Computer Systems and Networks) Task
// Sheet 4.2-2 "Performing Back Up and Restore" (Task 1), plus a troubleshooting flow (Task 2).
export const module4Activity: ProcedureChecklistActivityContent = {
  kind: "procedure-checklist",
  moduleId: "module-4",
  instructions: "Back up a folder over the network and prove the restore works, then diagnose and fix a faulty PC.",
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
      image: {
        url: "/modules/module-4/images/delete-original.webp",
        alt: "Close-up of a keyboard's delete key",
        credit: "\"Delete key\" by Ervins Strauhmanis (Wikimedia Commons), CC BY 2.0",
      },
    },
    {
      id: "start-restore",
      label: "Open Restore Files from Backup and Restore",
      explanation: "Begins the recovery process from the backup you created earlier.",
      image: {
        url: "/modules/module-4/images/start-restore.webp",
        alt: "Several external hard drives, the kind of backup destination Restore Files reads from",
        credit: "\"External hard drives\" by TonyTheTiger (Wikimedia Commons), CC BY-SA 3.0",
      },
    },
    {
      id: "select-backup",
      label: "Select the backup file you created",
      explanation: "Points the restore process at the correct backup to recover from.",
      image: {
        url: "/modules/module-4/images/select-backup.webp",
        alt: "Sixteen different USB flash drives laid out side by side, representing picking the right backup among several",
        credit: "\"16 USB flash drives\" by Cjp24 (Wikimedia Commons), CC BY-SA 4.0",
      },
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
    // Task 2: Troubleshooting -- the standard diagnose -> fix -> test -> document cycle, from the
    // UC4 competency (no job sheet for it exists in /modules/uc4). Images reuse photos already in
    // the project that show exactly the tool or screen each step uses.
    {
      id: "ts-gather-info",
      label: "Interview the user and gather information about the problem",
      explanation:
        "Ask what happened, when it started, any error messages, and what changed recently -- most faults trace back to a recent change.",
    },
    {
      id: "ts-backup-first",
      label: "Back up the user's data before making any changes",
      explanation: "A repair can go wrong. Backing up first (just like Task 1) means the user's files are safe whatever happens next.",
      image: {
        url: "/modules/module-4/images/backup-to-network.webp",
        alt: "Set up backup wizard's \"Select where you want to save your backup\" screen, with a network location on the server PC selected",
      },
    },
    {
      id: "ts-check-physical",
      label: "Check the obvious first: power, cables, and connections",
      explanation:
        "Is it plugged in and switched on? Are the cables fully seated and the link lights on? Start at the physical layer before touching software.",
      model: { url: "/models/cat-cable.glb" },
    },
    {
      id: "ts-observe-post",
      label: "Power on and watch the POST screen and beep codes",
      explanation:
        "The power-on self-test reports hardware faults early -- note any error message or beep pattern and look it up in the motherboard manual.",
      image: {
        url: "/modules/module-1/lessons/post-boot-screen.webp",
        alt: "A monitor showing the BIOS power-on self-test (POST) screen as the computer starts",
        credit: "\"POST of ASUS P5KPL on SyncMaster 740N\" by Macic7 (Wikimedia Commons), public domain",
      },
    },
    {
      id: "ts-device-manager",
      label: "Check Device Manager for hardware and driver errors",
      explanation:
        "A yellow warning icon means a device has a driver or resource problem; a down arrow means it's disabled.",
    },
    {
      id: "ts-check-ip",
      label: "Run ipconfig /all to check the IP configuration",
      explanation:
        "Check the IP address, subnet mask, gateway, and DNS. An address starting with 169.254 means the PC never got one from DHCP.",
      image: {
        url: "/modules/module-2/images/diagnose-faults.webp",
        alt: "Command Prompt output of ipconfig /all listing each adapter's IPv4 address, subnet mask, and default gateway",
      },
    },
    {
      id: "ts-ping-test",
      label: "Ping outward step by step: 127.0.0.1, then the PC's own IP, then the server",
      explanation:
        "Each ping tests one more piece of the path. The first one that fails tells you where the fault is.",
    },
    {
      id: "ts-isolate-fault",
      label: "Isolate the fault by testing or swapping in a known-good part",
      explanation:
        "Test the cable with a LAN tester, or swap in a known-good cable or RAM stick. If the problem goes away, you've found the faulty part.",
      image: {
        url: "/modules/module-2/images/test-cable.webp",
        alt: "An RJ45/RJ11 LAN cable tester kit with master and remote units, plus a cable stripper",
        credit: "\"Cable stripper and cable tester (RJ45, RJ11)\" by heimnetzwerke.net (Wikimedia Commons), CC BY 4.0",
      },
    },
    {
      id: "ts-apply-fix",
      label: "Apply the fix per manufacturer instructions and OH&S procedures",
      explanation:
        "Repair, replace, or reconfigure only the faulty part -- powered off and wearing an anti-static strap for anything inside the case.",
    },
    {
      id: "ts-test-verify",
      label: "Test the whole system to verify the fix works",
      explanation:
        "Boot it, check the network, and have the user confirm the original problem is gone. A fix isn't done until it's been tested.",
    },
    {
      id: "ts-document",
      label: "Document the problem, cause, fix, and results in a service report",
      explanation: "Good records speed up the next repair and show the work that was done.",
    },
  ],
};
