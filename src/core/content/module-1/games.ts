import { miniGames } from "../miniGames";

// Quiz-gating mini-games for UC1's software tasks (3-5). Sourced from Task Sheets 1.2-2 "Create
// Portable Bootable Device", 1.3-2 "Install Operating System and Device Drivers" and 1.3-3
// "Install Application Software" (see /modules/uc1). Those sheets are only a few lines each, so
// the steps are filled out with the standard Rufus / Windows Setup / Device Manager flow they
// refer to. Tasks 1-2 (hardware) use the 3D assembly check in ./practicalCheck.ts instead.
// Every id is suffixed "-mg" so it never collides with the task checklist's own item ids.

/** Task 3: make a bootable USB with Rufus. */
export const module1Task3Games = miniGames([
  {
    kind: "sequence",
    id: "m1t3-make-usb",
    title: "Sequence Sprint: Make a Bootable USB",
    instructions: "Tap the steps to make a bootable flash drive with Rufus, in order. Watch out for trap cards!",
    steps: [
      {
        id: "usb-power-on-mg",
        label: "Turn the computer on",
        explanation: "The task sheet's first step -- you need a running PC to run Rufus.",
      },
      {
        id: "usb-backup-mg",
        label: "Back up anything on the flash drive, then plug it in",
        explanation: "Rufus erases the whole drive, so copy off anything you want to keep first.",
      },
      {
        id: "usb-open-rufus-mg",
        label: "Open Rufus",
        explanation: "Rufus is a free tool that writes an OS installer onto a USB drive so it can boot.",
      },
      {
        id: "usb-select-device-mg",
        label: "Pick the flash drive under \"Device\"",
        explanation: "Double-check it's the USB and not another drive -- it will be wiped.",
      },
      {
        id: "usb-select-iso-mg",
        label: "Click SELECT and choose the OS ISO file",
        explanation: "The ISO is the OS installer image Rufus will write to the drive.",
      },
      {
        id: "usb-partition-scheme-mg",
        label: "Set the partition scheme (GPT for UEFI, MBR for legacy BIOS)",
        explanation: "It has to match how the target PC's firmware boots, or the USB won't show up.",
      },
      {
        id: "usb-start-mg",
        label: "Click START and accept the license and data-erase warnings",
        explanation: "Following the on-screen prompts and the end-user agreement is part of the task sheet's criteria.",
      },
      {
        id: "usb-wait-ready-mg",
        label: "Wait for the status bar to say READY",
        explanation: "Removing the drive before it's done leaves it half-written and unbootable.",
      },
      {
        id: "usb-test-mg",
        label: "Test it: boot a PC from the USB using the boot menu",
        explanation: "The task sheet's last check -- a bootable device isn't done until you've seen it boot.",
      },
    ],
    traps: [
      {
        id: "trap-usb-drag-iso",
        label: "Just drag the ISO file onto the flash drive",
        why: "Copying the file doesn't make the drive bootable -- that's why you use Rufus.",
      },
      {
        id: "trap-usb-2gb",
        label: "Use a 2 GB flash drive for Windows 10",
        why: "A Windows installer needs at least an 8 GB drive.",
      },
      {
        id: "trap-usb-unplug",
        label: "Unplug the USB while Rufus is still writing",
        why: "That interrupts the write and can corrupt the drive.",
      },
    ],
  },
  {
    kind: "match",
    id: "m1t3-usb-lingo",
    title: "Match-Up: Bootable USB Lingo",
    instructions: "Tap a clue, then tap the term it describes.",
    pairs: [
      {
        id: "lingo-rufus-mg",
        prompt: "Free tool that turns an ISO into a bootable flash drive",
        answer: "Rufus",
        explanation: "The tool named in Task Sheet 1.2-2.",
      },
      {
        id: "lingo-iso-mg",
        prompt: "A single file holding a full copy of the OS installer disc",
        answer: "ISO image",
        explanation: "Rufus reads the ISO and writes it to the USB in bootable form.",
      },
      {
        id: "lingo-gpt-mg",
        prompt: "Partition scheme for modern PCs that boot with UEFI",
        answer: "GPT",
        explanation: "GUID Partition Table -- pair it with UEFI firmware.",
      },
      {
        id: "lingo-mbr-mg",
        prompt: "Partition scheme for older PCs that boot with legacy BIOS",
        answer: "MBR",
        explanation: "Master Boot Record -- the older scheme, for legacy BIOS boot.",
      },
      {
        id: "lingo-boot-menu-mg",
        prompt: "Key-press menu at startup for picking which drive to boot from",
        answer: "Boot menu",
        explanation: "Usually F12, F11, F8 or Esc depending on the manufacturer.",
      },
      {
        id: "lingo-eula-mg",
        prompt: "The license terms you must accept to use the software",
        answer: "EULA",
        explanation: "End-User License Agreement -- the task sheet requires following it.",
      },
    ],
  },
]);

/** Task 4: install the OS, partition the disk, then fix missing drivers. */
export const module1Task4Games = miniGames([
  {
    kind: "sequence",
    id: "m1t4-install-os",
    title: "Sequence Sprint: Install the OS",
    instructions: "Install Windows from your bootable USB and finish the job sheet's steps, in order.",
    steps: [
      {
        id: "os-boot-usb-mg",
        label: "Plug in the bootable USB and boot from it (boot menu)",
        explanation: "The installer runs from the USB you made in Task 3.",
      },
      {
        id: "os-language-mg",
        label: "Choose language, time format and keyboard, then Next",
        explanation: "The first screen of Windows Setup.",
      },
      {
        id: "os-install-now-mg",
        label: "Click Install now and enter the product key",
        explanation: "The key activates a licensed copy -- you can also choose \"I don't have a product key\" and activate later.",
      },
      {
        id: "os-accept-license-mg",
        label: "Accept the license terms",
        explanation: "Installing per the software license is part of the established procedure.",
      },
      {
        id: "os-custom-mg",
        label: "Choose Custom: Install Windows only",
        explanation: "Custom is the clean-install option; Upgrade only applies over an existing Windows.",
      },
      {
        id: "os-partitions-mg",
        label: "Create at least two partitions (one for Windows, one for data)",
        explanation: "The task sheet requires at least two -- keeping data separate protects it if Windows is reinstalled.",
      },
      {
        id: "os-pick-partition-mg",
        label: "Select the Windows partition and click Next to install",
        explanation: "Setup copies files and restarts several times on its own.",
      },
      {
        id: "os-account-mg",
        label: "After restart, set up region, user account and password",
        explanation: "The out-of-box setup finishes the installation.",
      },
      {
        id: "os-device-manager-mg",
        label: "Open Device Manager and look for yellow ⚠ warnings",
        explanation: "A yellow warning marks a device whose driver is missing.",
      },
      {
        id: "os-install-drivers-mg",
        label: "Install the missing drivers from the manufacturer",
        explanation: "Use the motherboard/device maker's disc or website, per the manufacturer's instructions.",
      },
    ],
    traps: [
      {
        id: "trap-os-upgrade",
        label: "Choose Upgrade on a brand-new blank drive",
        why: "Upgrade needs an existing Windows to upgrade -- a clean install uses Custom.",
      },
      {
        id: "trap-os-delete-data",
        label: "Delete every partition without backing up first",
        why: "Deleting a partition erases everything on it -- back up before touching partitions.",
      },
      {
        id: "trap-os-random-drivers",
        label: "Install drivers from a pop-up \"driver updater\" site",
        why: "Unofficial driver sites often bundle malware -- get drivers from the manufacturer.",
      },
    ],
  },
  {
    kind: "match",
    id: "m1t4-os-lingo",
    title: "Match-Up: OS and Drivers",
    instructions: "Tap a clue, then tap the term it describes.",
    pairs: [
      {
        id: "lingo-driver-mg",
        prompt: "Software that lets the OS talk to a piece of hardware",
        answer: "Device driver",
        explanation: "Without the right driver, a device may not work at all.",
      },
      {
        id: "lingo-devmgr-mg",
        prompt: "Windows tool that lists every device and its driver status",
        answer: "Device Manager",
        explanation: "Open it from the Start menu or by right-clicking Start.",
      },
      {
        id: "lingo-yellow-mg",
        prompt: "Yellow ⚠ icon next to a device",
        answer: "Missing or faulty driver",
        explanation: "That's your to-do list for the \"install missing device drivers\" step.",
      },
      {
        id: "lingo-partition-mg",
        prompt: "A section of a hard disk that acts as its own drive",
        answer: "Partition",
        explanation: "One physical disk can be split into C:, D: and so on.",
      },
      {
        id: "lingo-c-drive-mg",
        prompt: "The partition where Windows itself is installed",
        answer: "C: drive",
        explanation: "By convention the system partition is C:.",
      },
      {
        id: "lingo-product-key-mg",
        prompt: "25-character code that activates a licensed copy of Windows",
        answer: "Product key",
        explanation: "Proof the OS is properly licensed.",
      },
    ],
  },
]);

/** Task 5: install application software properly. */
export const module1Task5Games = miniGames([
  {
    kind: "sequence",
    id: "m1t5-install-apps",
    title: "Sequence Sprint: Install the Apps",
    instructions: "Install the applications the job sheet asks for -- the safe way, in order.",
    steps: [
      {
        id: "app-requirements-mg",
        label: "Check the end-user requirements: which apps are needed",
        explanation: "Install what the user actually needs -- the task sheet says to follow end-user requirements.",
      },
      {
        id: "app-system-req-mg",
        label: "Check each app's system requirements and license",
        explanation: "Make sure the PC can run it and you're allowed to install it.",
      },
      {
        id: "app-official-mg",
        label: "Get the installers from the official publisher",
        explanation: "Official sources are the safe source for installers.",
      },
      {
        id: "app-chrome-mg",
        label: "Install Google Chrome",
        explanation: "Run the installer, follow the prompts, and accept its terms.",
      },
      {
        id: "app-office-mg",
        label: "Install MS Office and activate it with its license",
        explanation: "An office suite gives the user Word, Excel and PowerPoint.",
      },
      {
        id: "app-antivirus-mg",
        label: "Install antivirus (if required) and update its definitions",
        explanation: "Antivirus is only as good as its latest virus definitions.",
      },
      {
        id: "app-verify-mg",
        label: "Open each app to confirm it runs",
        explanation: "An install isn't done until you've seen the app actually start.",
      },
    ],
    traps: [
      {
        id: "trap-app-crack",
        label: "Download a \"free cracked\" Office from a random site",
        why: "Cracked software breaks the license agreement and is a common way malware spreads.",
      },
      {
        id: "trap-app-bundles",
        label: "Click Next without reading -- keep every bundled toolbar",
        why: "Read each screen and untick extras the user didn't ask for.",
      },
      {
        id: "trap-app-two-av",
        label: "Install two antivirus programs at the same time",
        why: "Two real-time scanners conflict with each other and slow the PC down.",
      },
    ],
  },
  {
    kind: "match",
    id: "m1t5-app-sort",
    title: "Match-Up: What Kind of App?",
    instructions: "Tap a clue, then tap the term it describes.",
    pairs: [
      {
        id: "sort-chrome-mg",
        prompt: "Google Chrome",
        answer: "Web browser",
        explanation: "Used to open websites.",
      },
      {
        id: "sort-office-mg",
        prompt: "MS Office (Word, Excel, PowerPoint)",
        answer: "Office suite",
        explanation: "Documents, spreadsheets and presentations.",
      },
      {
        id: "sort-antivirus-mg",
        prompt: "Scans for and removes viruses and malware",
        answer: "Antivirus",
        explanation: "Security software -- install it if required.",
      },
      {
        id: "sort-eula-mg",
        prompt: "Terms you accept before an installer continues",
        answer: "License agreement",
        explanation: "Installing per the software license agreement is part of the task.",
      },
      {
        id: "sort-requirements-mg",
        prompt: "The list of what the user needs the PC to do",
        answer: "End-user requirements",
        explanation: "Decides which apps get installed in the first place.",
      },
      {
        id: "sort-definitions-mg",
        prompt: "Antivirus database that must be updated to catch new threats",
        answer: "Virus definitions",
        explanation: "Update them right after installing.",
      },
    ],
  },
]);
