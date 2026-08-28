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
  },
  {
    id: "verify-before-you-open",
    title: "Verify It Works First",
    body: "Turn the computer on and confirm it boots normally before you touch anything inside. If you disassemble a machine that was already broken, you won't know whether your work caused a new problem or just exposed an old one.",
  },
  {
    id: "power-off-and-unplug",
    title: "Always Power Off First",
    body: "Never open a case or disconnect components while the machine is running or still plugged in. Turn it off, then unplug it, before removing the side cover.",
  },
  {
    id: "esd-precautions",
    title: "Electrostatic Discharge (ESD)",
    body: "Static electricity from your body can silently damage sensitive components like RAM and the motherboard. Touch a grounded metal surface (or wear an anti-static wrist strap) before handling internal parts.",
  },
  {
    id: "why-order-matters",
    title: "Why Disassembly Order Matters",
    body: "Components are removed in an order that avoids strain on connectors and cables: power supply first, then drives, then RAM, then the motherboard last -- since everything else is attached to or routed around it.",
  },
  {
    id: "removing-psu-and-drives",
    title: "Removing the Power Supply and Drives",
    body: "Disconnect and unscrew the power supply unit, then remove the hard drive and optical drive (if present). Keep track of which cables connected to which device.",
  },
  {
    id: "removing-ram-and-motherboard",
    title: "Removing RAM and the Motherboard",
    body: "RAM sticks unclip from their DIMM slots. Once all drives, cables, and RAM are clear, the motherboard itself can be unscrewed and lifted out of the case.",
  },
  // -- Assembly --
  {
    id: "assembly-is-disassembly-reversed",
    title: "Assembly Is Disassembly in Reverse",
    body: "Building a computer back up follows roughly the opposite order of taking it apart: motherboard first, then RAM, then drives, then the power supply, then the cover -- because each step needs the one before it in place to attach to.",
  },
  {
    id: "mounting-the-motherboard",
    title: "Mounting the Motherboard",
    body: "The motherboard is screwed into the case first, since every other component either plugs into it or is routed around it. Don't overtighten the screws -- too much force can crack the board.",
  },
  {
    id: "seating-ram",
    title: "Seating RAM Correctly",
    body: "RAM only fits one way in its DIMM slot -- a notch lines it up. Press down evenly on both ends until the retaining clips snap into place on their own.",
  },
  {
    id: "mounting-drives",
    title: "Mounting Drives",
    body: "The hard drive and optical drive are screwed into their bays, then connected with both a data cable and a power cable. Double-check every connector is fully seated.",
  },
  {
    id: "connecting-the-psu",
    title: "Connecting the Power Supply",
    body: "The power supply is attached to the case, then its cables are routed to the motherboard, drives, and any other powered components. Correct cable routing keeps airflow clear.",
  },
  {
    id: "closing-up-and-testing",
    title: "Closing Up and First Boot",
    body: "Once everything is connected, attach the side cover and screw it back on. Turning the computer on afterward is the real test that assembly was done correctly.",
  },
  // -- OS, drivers, and applications --
  {
    id: "what-is-a-bootable-device",
    title: "What Is a Bootable Device?",
    body: "A bootable USB flash drive contains everything a computer needs to start up and run an installer directly from it -- most commonly used to install or reinstall an operating system.",
  },
  {
    id: "creating-bootable-media",
    title: "Creating Bootable Media",
    body: "Tools like Rufus write an operating system image onto a USB drive in a way the computer's firmware can boot from. Always follow the tool's on-screen instructions and respect the OS's end-user license agreement.",
  },
  {
    id: "installing-an-os",
    title: "Installing an Operating System",
    body: "OS installation follows the manufacturer's established procedure: boot from the installer, select a destination drive, and let it copy and configure the system files.",
  },
  {
    id: "disk-partitioning",
    title: "Disk Partitioning",
    body: "A hard disk can be divided into multiple partitions -- separate logical sections that behave like independent drives. Creating at least two (for example, one for the OS and one for personal files) keeps data safer during reinstalls.",
  },
  {
    id: "device-drivers",
    title: "Device Drivers",
    body: "A driver is software that lets the operating system communicate with a specific piece of hardware. After installing an OS, missing drivers (for graphics, network, or audio devices) need to be installed separately.",
  },
  {
    id: "installing-applications",
    title: "Installing Application Software",
    body: "Once the OS and drivers are ready, essential applications are installed based on end-user requirements: a web browser, an office suite, and antivirus software are common first installs -- always in accordance with each program's license agreement.",
  },
  {
    id: "software-licensing",
    title: "Software Licensing Awareness",
    body: "Every piece of software you install (OS, drivers, or applications) comes with a license agreement. Following it isn't just a formality -- it determines what you're legally allowed to do with that software.",
  },
];
