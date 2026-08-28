import type { QuizQuestion } from "../types";

export const module1Quiz: QuizQuestion[] = [
  // Disassembly
  {
    id: "q1-power-state",
    type: "multiple_choice",
    prompt: "What must you do before opening a computer's case to disassemble it?",
    options: [
      { id: "a", text: "Turn it off and unplug it" },
      { id: "b", text: "Leave it running so you can watch for errors" },
      { id: "c", text: "Just unplug the monitor" },
      { id: "d", text: "Nothing -- it's safe to open at any time" },
    ],
    correctOptionIds: ["a"],
    explanation: "A computer must be powered off and unplugged before you open it -- working on a live machine risks shock and component damage.",
  },
  {
    id: "q2-esd",
    type: "true_false",
    prompt: "It's fine to handle RAM and the motherboard without any ESD precautions as long as the computer is unplugged.",
    options: [
      { id: "true", text: "True" },
      { id: "false", text: "False" },
    ],
    correctOptionIds: ["false"],
    explanation: "Even with the computer unplugged, static electricity from your own body can damage sensitive components. Ground yourself first.",
  },
  {
    id: "q3-order",
    type: "multiple_choice",
    prompt: "In the standard disassembly order, which is removed last?",
    options: [
      { id: "a", text: "The motherboard" },
      { id: "b", text: "The power supply unit" },
      { id: "c", text: "The hard drive" },
      { id: "d", text: "The side cover" },
    ],
    correctOptionIds: ["a"],
    explanation: "The motherboard connects to nearly everything else, so it comes out last, after drives, RAM, and the power supply are already clear.",
  },
  // Assembly
  {
    id: "q4-first-component",
    type: "multiple_choice",
    prompt: "Which component is installed first when assembling a computer?",
    options: [
      { id: "a", text: "The motherboard" },
      { id: "b", text: "The side cover" },
      { id: "c", text: "The power supply" },
      { id: "d", text: "The RAM" },
    ],
    correctOptionIds: ["a"],
    explanation: "The motherboard goes in first, since nearly everything else attaches to it or is routed around it.",
  },
  {
    id: "q5-overtightening",
    type: "true_false",
    prompt: "You should tighten motherboard screws as hard as possible to make sure it's secure.",
    options: [
      { id: "true", text: "True" },
      { id: "false", text: "False" },
    ],
    correctOptionIds: ["false"],
    explanation: "Overtightening can crack the motherboard. Screws should be snug, not maximally tight.",
  },
  {
    id: "q6-final-test",
    type: "multiple_choice",
    prompt: "What's the real test that a computer was assembled correctly?",
    options: [
      { id: "a", text: "It boots successfully when turned on" },
      { id: "b", text: "It looks clean on the outside" },
      { id: "c", text: "All screws are the same size" },
      { id: "d", text: "The side cover closes" },
    ],
    correctOptionIds: ["a"],
    explanation: "A successful boot after reassembly confirms every connection was made correctly.",
  },
  // Bootable device, OS, drivers, applications
  {
    id: "q7-bootable-purpose",
    type: "multiple_choice",
    prompt: "What is a bootable USB drive used for?",
    options: [
      { id: "a", text: "Booting a computer and running an installer, such as for an OS" },
      { id: "b", text: "Only storing personal photos" },
      { id: "c", text: "Charging a phone" },
      { id: "d", text: "Replacing the need for a hard drive permanently" },
    ],
    correctOptionIds: ["a"],
    explanation: "A bootable USB drive lets a computer start from it and run an installer, most commonly to install an operating system.",
  },
  {
    id: "q8-partitioning",
    type: "multiple_choice",
    prompt: "Why create at least two partitions on a hard disk during OS installation?",
    options: [
      { id: "a", text: "To separate the operating system from personal files" },
      { id: "b", text: "It's required by every USB flash drive" },
      { id: "c", text: "It makes the disk physically larger" },
      { id: "d", text: "It has no real benefit" },
    ],
    correctOptionIds: ["a"],
    explanation: "Separating the OS partition from a data partition makes reinstalling or troubleshooting the OS less risky for personal files.",
  },
  {
    id: "q9-drivers",
    type: "multiple_choice",
    prompt: "What is a device driver?",
    options: [
      { id: "a", text: "Software that lets the OS communicate with a specific piece of hardware" },
      { id: "b", text: "A physical cable" },
      { id: "c", text: "An antivirus program" },
      { id: "d", text: "A type of partition" },
    ],
    correctOptionIds: ["a"],
    explanation: "Drivers translate between the operating system and hardware -- without the right one, a device may not work at all.",
  },
  {
    id: "q10-licensing",
    type: "true_false",
    prompt: "Software license agreements only matter for the operating system, not for individual applications you install afterward.",
    options: [
      { id: "true", text: "True" },
      { id: "false", text: "False" },
    ],
    correctOptionIds: ["false"],
    explanation: "Every piece of software -- OS, drivers, and applications alike -- comes with its own license agreement that should be followed.",
  },
];
