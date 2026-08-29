import type { TaskContent } from "../types";

// Sourced from the 2 real UC3 job sheets (see /modules/uc3).
export const module3Tasks: TaskContent[] = [
  {
    id: "task-1",
    title: "Setting-Up User Access",
    objective: "Configure network access levels according to network operating system features and established policies.",
    materials: ["Desktop/laptop + server computer", "Network switch", "RJ45 / UTP cable"],
    tools: ["Crimping tool", "LAN cable tester"],
    itemIds: [
      "static-server-ip",
      "add-roles",
      "promote-domain-controller",
      "complete-dhcp",
      "reverse-lookup-zone",
      "create-ou-and-users",
      "share-userfiles-folder",
      "configure-folder-redirection",
      "join-client-to-domain",
      "verify-folder-redirection",
    ],
  },
  {
    id: "task-2",
    title: "Configuring Network Services",
    objective: "Install file and print/document services, then perform a remote desktop connection and deploy a printer.",
    materials: ["Desktop/laptop + server computer", "Network switch", "Printer", "RJ45 / UTP cable"],
    tools: ["Crimping tool", "LAN cable tester"],
    itemIds: ["remote-desktop", "deploy-printer"],
  },
];
