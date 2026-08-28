import type { QuizQuestion } from "../types";

export const module2Quiz: QuizQuestion[] = [
  {
    id: "q1-static-vs-dynamic",
    type: "multiple_choice",
    prompt: "What's the difference between a static and a dynamic IP address?",
    options: [
      { id: "a", text: "A static IP is set manually and stays the same; a dynamic IP is assigned automatically and can change" },
      { id: "b", text: "A static IP only works on wireless networks" },
      { id: "c", text: "They are exactly the same thing" },
      { id: "d", text: "A dynamic IP never changes once assigned" },
    ],
    correctOptionIds: ["a"],
    explanation: "Static IPs are configured by hand and remain fixed; dynamic IPs are handed out automatically by a DHCP server and can change over time.",
  },
  {
    id: "q2-cabling-standard",
    type: "multiple_choice",
    prompt: "Network cables should be terminated according to which kind of standard?",
    options: [
      { id: "a", text: "ANSI/TIA/EIA structured cabling standards" },
      { id: "b", text: "Whatever wiring order looks neatest" },
      { id: "c", text: "The manufacturer of the wall paint" },
      { id: "d", text: "There is no standard for network cabling" },
    ],
    correctOptionIds: ["a"],
    explanation: "Structured cabling standards (ANSI/TIA/EIA) ensure cables are wired consistently and will actually work when tested.",
  },
  {
    id: "q3-cable-test",
    type: "true_false",
    prompt: "Once a network cable is terminated, it should be tested with a LAN cable tester before relying on it.",
    options: [
      { id: "true", text: "True" },
      { id: "false", text: "False" },
    ],
    correctOptionIds: ["true"],
    explanation: "Testing catches wiring mistakes before they cause a confusing connectivity problem later.",
  },
  {
    id: "q4-dhcp",
    type: "multiple_choice",
    prompt: "What does a DHCP server do?",
    options: [
      { id: "a", text: "Automatically assigns IP addresses to devices on the network" },
      { id: "b", text: "Physically terminates network cables" },
      { id: "c", text: "Only manages wireless passwords" },
      { id: "d", text: "Blocks all incoming network traffic" },
    ],
    correctOptionIds: ["a"],
    explanation: "DHCP automatically hands out IP addresses (and related settings) to devices as they join the network.",
  },
  {
    id: "q5-diagnosis-order",
    type: "multiple_choice",
    prompt: "If a computer isn't visible on the network, what should you generally check first?",
    options: [
      { id: "a", text: "The physical cable connection, using a cable tester" },
      { id: "b", text: "The antivirus software's version number" },
      { id: "c", text: "The monitor's brightness setting" },
      { id: "d", text: "The desktop wallpaper" },
    ],
    correctOptionIds: ["a"],
    explanation: "Diagnosing network faults starts from the physical layer -- the cable -- before moving up to IP configuration and sharing settings.",
  },
];
