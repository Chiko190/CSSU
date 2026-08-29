import type { TaskContent } from "../types";

// Sourced from the 2 real UC2 task/job sheets (see /modules/uc 2).
export const module2Tasks: TaskContent[] = [
  {
    id: "task-1",
    title: "Installing Network Cables",
    objective: "Set up network cabling given the required equipment, supplies, and tools.",
    materials: ["RJ45 connectors", "Cat5e / Cat6 / Cat5 UTP cable"],
    tools: ["Crimping tool", "LAN cable tester", "Punch-down tool", "Wire stripper"],
    itemIds: ["plan-cable-routes", "terminate-cable", "test-cable"],
  },
  {
    id: "task-2",
    title: "Setting-Up Network Configuration",
    objective: "Configure a network per the network design, from NIC settings through router and sharing setup.",
    materials: ["Desktop/laptop + server computer", "Network switch", "RJ45 / UTP cable"],
    tools: ["Screwdrivers", "Pliers", "Soldering iron", "Wrenches", "Crimping tool", "LAN cable tester"],
    itemIds: [
      "configure-nic",
      "configure-firewall",
      "static-peer-to-peer",
      "configure-router",
      "share-folder",
      "verify-network-visibility",
      "disable-password-sharing",
      "dynamic-peer-to-peer",
      "diagnose-faults",
    ],
  },
];
