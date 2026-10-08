import type { LessonCard } from "../types";

// UC1: Install and Configure Computer Systems. Merges what were previously
// three separate modules (disassembly, assembly, OS/drivers) into the single
// unit of competency they actually belong to, per the source TESDA guide.
export const module1Lessons: LessonCard[] = [
  // -- Disassembly --
  {
    id: "oh-s-and-ppe",
    title: "OH&S and Personal Protective Equipment",
    body: "Before opening any computer, follow occupational health and safety (OH&S) policies: wear protective eyewear, use the right screwdrivers, and keep your workspace clear. This isn't optional -- it protects you and the equipment.",
    media: {
      kind: "image",
      url: "/modules/module-1/lessons/safety-eyewear.webp",
      alt: "Clear protective safety eyewear, the PPE worn before opening a computer",
      credit: "\"2023 Okulary ochronne (1)\" by Jacek Halicki (Wikimedia Commons), CC BY-SA 4.0",
    },
  },
  {
    id: "verify-before-you-open",
    title: "Verify It Works First",
    body: "Turn the computer on and confirm it boots normally before you touch anything inside. If you disassemble a machine that was already broken, you won't know whether your work caused a new problem or just exposed an old one.",
    media: {
      kind: "image",
      url: "/modules/module-1/lessons/post-boot-screen.webp",
      alt: "A monitor showing the BIOS power-on self-test (POST) screen as the computer starts normally",
      credit: "\"POST of ASUS P5KPL on SyncMaster 740N\" by Macic7 (Wikimedia Commons), public domain",
    },
  },
  {
    id: "power-off-and-unplug",
    title: "Always Power Off First",
    body: "Never open a case or disconnect components while the machine is running or still plugged in. Turn it off, then unplug it, before removing the covers -- the front cover comes off first, then the back cover.",
    media: {
      kind: "image",
      url: "/modules/module-1/lessons/power-cord.webp",
      alt: "A desktop computer power cord -- the cable to unplug before opening the case",
      credit: "\"Cabo de forca computador 01\" by Luis Dantas (Wikimedia Commons), public domain",
    },
  },
  {
    id: "esd-precautions",
    title: "Electrostatic Discharge (ESD)",
    body: "Static electricity from your body can silently damage sensitive components like RAM and the motherboard. Touch a grounded metal surface (or wear an anti-static wrist strap) before handling internal parts.",
    media: {
      kind: "image",
      url: "/modules/module-1/lessons/antistatic-wrist-strap.webp",
      alt: "An anti-static wrist strap with its coiled ground cord and alligator clip",
      credit: "\"Antistatic wrist strap\" by Kms (Wikimedia Commons), CC BY 3.0",
    },
  },
  {
    id: "why-order-matters",
    title: "Why Disassembly Order Matters",
    body: "Components are removed in an order that avoids strain on connectors and cables: power supply first, then drives, then RAM, then the motherboard last -- since everything else is attached to or routed around it.",
    media: {
      kind: "image",
      url: "/modules/module-1/lessons/open-atx-case.webp",
      alt: "An open ATX computer case showing the motherboard, CPU cooler, RAM, graphics card, power supply and drive bays in place",
      credit: "\"ATX computer case - left - 2018-05-18\" by Bretwa (Wikimedia Commons), CC BY-SA 4.0",
    },
  },
  {
    id: "removing-psu-and-drives",
    title: "Removing the Power Supply and Drives",
    body: "Disconnect and unscrew the power supply unit, then remove the hard drive and optical drive (if present). Keep track of which cables connected to which device.",
    media: {
      kind: "model",
      url: "/models/psu.glb",
      alt: "3D model of a computer power supply unit",
    },
  },
  {
    id: "removing-ram-and-motherboard",
    title: "Removing RAM and the Motherboard",
    body: "RAM sticks unclip from their DIMM slots. Once all drives, cables, and RAM are clear, the motherboard itself can be unscrewed and lifted out of the case.",
    media: {
      kind: "model",
      url: "/models/ram.glb",
      alt: "3D model of a RAM module",
    },
  },
  // -- Assembly --
  {
    id: "assembly-is-disassembly-reversed",
    title: "Assembly Is Disassembly in Reverse",
    body: "Building a computer back up follows roughly the opposite order of taking it apart: motherboard first, then RAM, then drives, then the power supply, then the cover -- because each step needs the one before it in place to attach to.",
    media: {
      kind: "model",
      url: "/models/case-main.glb",
      alt: "3D model of an open computer case",
    },
  },
  {
    id: "mounting-the-motherboard",
    title: "Mounting the Motherboard",
    body: "The motherboard is screwed into the case first, since every other component either plugs into it or is routed around it. Don't overtighten the screws -- too much force can crack the board.",
    media: {
      kind: "model",
      url: "/models/motherboard.glb",
      alt: "3D model of a motherboard",
    },
  },
  {
    id: "seating-ram",
    title: "Seating RAM Correctly",
    body: "RAM only fits one way in its DIMM slot -- a notch lines it up. Press down evenly on both ends until the retaining clips snap into place on their own.",
    media: {
      kind: "model",
      url: "/models/ram.glb",
      alt: "3D model of a RAM module, showing its alignment notch",
    },
  },
  {
    id: "mounting-drives",
    title: "Mounting Drives",
    body: "The hard drive and optical drive are screwed into their bays, then connected with both a data cable and a power cable. Double-check every connector is fully seated.",
    media: {
      kind: "model",
      url: "/models/ssd.glb",
      alt: "3D model of a storage drive",
    },
  },
  {
    id: "connecting-the-psu",
    title: "Connecting the Power Supply",
    body: "The power supply is attached to the case, then its cables are routed to the motherboard, drives, and any other powered components. Correct cable routing keeps airflow clear.",
    media: {
      kind: "model",
      url: "/models/psu.glb",
      alt: "3D model of a computer power supply unit",
    },
  },
  {
    id: "closing-up-and-testing",
    title: "Closing Up and First Boot",
    body: "Once everything is connected, attach the back cover, then the front cover, screwing each back on. Turning the computer on afterward is the real test that assembly was done correctly.",
    media: {
      kind: "model",
      url: "/models/case-side-glass.glb",
      alt: "3D model of a computer case side cover",
    },
  },
  // -- OS, drivers, and applications --
  {
    id: "what-is-a-bootable-device",
    title: "What Is a Bootable Device?",
    body: "A bootable USB flash drive contains everything a computer needs to start up and run an installer directly from it -- most commonly used to install or reinstall an operating system.",
    media: {
      kind: "image",
      url: "/modules/module-1/lessons/bootable-usb.webp",
      alt: "A USB flash drive labeled \"DP, EPSON, MS OFFICE\" used as portable installer media",
    },
  },
  {
    id: "creating-bootable-media",
    title: "Creating Bootable Media",
    body: "Tools like Rufus write an operating system image onto a USB drive in a way the computer's firmware can boot from. Always follow the tool's on-screen instructions and respect the OS's end-user license agreement.",
    media: {
      kind: "image",
      url: "/modules/module-1/lessons/rufus-ready.webp",
      alt: "Rufus ready to write a Windows Server 2012 R2 ISO to a USB drive, using FAT32",
    },
  },
  {
    id: "installing-an-os",
    title: "Installing an Operating System",
    body: "OS installation follows the manufacturer's established procedure: boot from the installer, select a destination drive, and let it copy and configure the system files.",
    media: {
      kind: "image",
      url: "/modules/module-1/lessons/windows-setup-install.webp",
      alt: "Windows Server 2012 R2 Setup booted from the USB drive, showing the Install now button",
    },
  },
  {
    id: "disk-partitioning",
    title: "Disk Partitioning",
    body: "A hard disk can be divided into multiple partitions -- separate logical sections that behave like independent drives. Creating at least two (for example, one for the OS and one for personal files) keeps data safer during reinstalls.",
    media: {
      kind: "image",
      url: "/modules/module-1/lessons/disk-partitions.webp",
      alt: "Windows Setup's \"Where do you want to install Windows?\" screen listing the drive's partitions",
    },
  },
  {
    id: "device-drivers",
    title: "Device Drivers",
    body: "A driver is software that lets the operating system communicate with a specific piece of hardware. After installing an OS, missing drivers (for graphics, network, or audio devices) need to be installed separately.",
    media: {
      kind: "image",
      url: "/modules/module-1/lessons/driverpack-drivers.webp",
      alt: "DriverPack's \"Drivers for this computer\" screen listing the recommended chipset drivers",
    },
  },
  {
    id: "installing-applications",
    title: "Installing Application Software",
    body: "Once the OS and drivers are ready, essential applications are installed based on end-user requirements: a web browser, an office suite, and antivirus software are common first installs -- always in accordance with each program's license agreement.",
    media: {
      kind: "image",
      url: "/modules/module-1/lessons/office-install.webp",
      alt: "Microsoft Office Professional Plus 2013 setup asking you to choose Install Now or Customize",
    },
  },
  {
    id: "software-licensing",
    title: "Software Licensing Awareness",
    body: "Every piece of software you install (OS, drivers, or applications) comes with a license agreement. Following it isn't just a formality -- it determines what you're legally allowed to do with that software.",
    media: {
      kind: "image",
      url: "/modules/module-1/lessons/license-terms.webp",
      alt: "Microsoft Office setup's \"Read the Microsoft Software License Terms\" screen with the accept checkbox",
    },
  },
];
