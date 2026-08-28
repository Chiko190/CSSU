import type { ProcedureChecklistActivityContent } from "../types";

// Sourced from UC2 (Set Up Computer Networks): Task Sheet 2.1-5 "Installing
// Network Cables" and Job Sheet 2.2-2 "Setting-Up Network Configuration",
// combined into one cabling-through-configuration flow.
export const module2Activity: ProcedureChecklistActivityContent = {
  kind: "procedure-checklist",
  moduleId: "module-2",
  instructions: "Cable and configure a small network from scratch, in order.",
  items: [
    {
      id: "plan-cable-routes",
      label: "Create a network diagram and plan cable routes",
      explanation: "Plan the physical layout before cutting any cable.",
    },
    {
      id: "terminate-cable",
      label: "Create the network cable following ANSI/TIA/EIA standards",
      explanation: "Structured cabling standards keep the wiring consistent and reliable.",
      model: { url: "/models/cable.glb", rotation: [0, 0, Math.PI / 2.2] },
    },
    {
      id: "test-cable",
      label: "Test the cable with a LAN cable tester",
      explanation: "Confirms the cable works before it's relied on, catching wiring mistakes early.",
      model: { url: "/models/cable.glb", rotation: [0, 0, Math.PI / 2.2] },
    },
    {
      id: "configure-nic",
      label: "Configure the network interface card (NIC) settings",
      explanation: "Set the IP address and related settings to match the network design.",
    },
    {
      id: "configure-firewall",
      label: "Manage firewall / security / advanced settings",
      explanation: "Configured per manufacturer instructions and end-user preferences.",
    },
    {
      id: "static-peer-to-peer",
      label: "Perform peer-to-peer configuration using static IP addressing",
      explanation: "Connects two computers directly using manually assigned addresses.",
    },
    {
      id: "configure-router",
      label: "Configure the router: DHCP, SSID, and password",
      explanation: "Rename the default SSID and set a real password before anyone connects.",
      model: { url: "/models/router.glb" },
    },
    {
      id: "share-folder",
      label: "Create and share a folder on each connected PC",
      explanation: "Make sure everyone on the network can access the shared folder.",
    },
    {
      id: "verify-network-visibility",
      label: "Check that all connected computers are visible on the network",
      explanation: "Confirms sharing and discovery are actually working, not just configured.",
    },
    {
      id: "disable-password-sharing",
      label: "Disable password-protected sharing",
      explanation: "Simplifies access for trusted devices on the local network.",
    },
    {
      id: "dynamic-peer-to-peer",
      label: "Perform peer-to-peer configuration using dynamic IP addressing",
      explanation: "Repeats the connection using DHCP-assigned addresses instead of static ones.",
    },
    {
      id: "diagnose-faults",
      label: "Diagnose and check for any fault in the network",
      explanation: "A working network setup still needs to be verified end-to-end.",
    },
  ],
};
