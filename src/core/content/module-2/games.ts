import { miniGames } from "../miniGames";

// Quiz-gating mini-games for UC2 Task 2 "Setting-Up Network Configuration", sourced from Job Sheet
// 2.2-2 (see /modules/uc 2). The sequence follows the job sheet's own 10-step order exactly. Task 1
// (cabling) uses the 3D wire-order check in ./practicalCheck.ts instead. Every id is suffixed "-mg"
// so it never collides with the task checklist's own item ids.

export const module2Task2Games = miniGames([
  {
    kind: "sequence",
    id: "m2t2-configure-network",
    title: "Sequence Sprint: Network the PCs",
    instructions: "Tap the job sheet's network setup steps in order. Trap cards cost a heart!",
    steps: [
      {
        id: "net-nic-mg",
        label: "Configure the NIC settings per the network design",
        explanation: "Each PC's network card needs settings that match the planned design.",
      },
      {
        id: "net-firewall-mg",
        label: "Manage firewall / security / advanced settings",
        explanation: "Set them per the manufacturer's instructions and the end-user's preferences.",
      },
      {
        id: "net-static-mg",
        label: "Peer-to-peer with static IPs (e.g. 192.168.1.10 and .11)",
        explanation: "Two PCs, same network, each with its own manually typed address.",
      },
      {
        id: "net-router-mg",
        label: "Configure the router: DHCP, rename the SSID, set a Wi-Fi password",
        explanation: "Never leave the default SSID and an open network.",
      },
      {
        id: "net-share-mg",
        label: "Create a desktop folder on every PC and share it",
        explanation: "Folder sharing is how the PCs exchange files on the network.",
      },
      {
        id: "net-access-mg",
        label: "Make sure everyone can access the shared folders",
        explanation: "Check the share permissions actually let the other users in.",
      },
      {
        id: "net-visible-mg",
        label: "Check that every connected PC shows up under Network",
        explanation: "Proves network discovery is working, not just configured.",
      },
      {
        id: "net-pw-sharing-mg",
        label: "Turn off password-protected sharing",
        explanation: "Lets trusted PCs on this small network open shares without signing in.",
      },
      {
        id: "net-dynamic-mg",
        label: "Peer-to-peer again, this time with dynamic IPs (DHCP)",
        explanation: "Switch the NICs to \"Obtain an IP address automatically\" and let the router assign them.",
      },
      {
        id: "net-diagnose-mg",
        label: "Diagnose faults: ping each PC and fix any problem",
        explanation: "A finished network is verified end-to-end, e.g. with ping and ipconfig.",
      },
    ],
    traps: [
      {
        id: "trap-net-same-ip",
        label: "Give both PCs the same static IP address",
        why: "Two devices with one address cause an IP conflict -- neither works reliably.",
      },
      {
        id: "trap-net-default-ssid",
        label: "Keep the router's default SSID with no password",
        why: "The job sheet says to rename the SSID and set a password -- an open network lets anyone in.",
      },
      {
        id: "trap-net-diff-subnet",
        label: "Put one PC on 192.168.1.x and the other on 10.0.0.x",
        why: "Different networks with no router between them can't see each other.",
      },
    ],
  },
  {
    kind: "match",
    id: "m2t2-ip-lingo",
    title: "Match-Up: Network Settings",
    instructions: "Tap a clue, then tap the setting or tool it describes.",
    pairs: [
      {
        id: "net-lingo-ip-mg",
        prompt: "A device's unique address on the network, e.g. 192.168.1.10",
        answer: "IP address",
        explanation: "Every device on the network needs a different one.",
      },
      {
        id: "net-lingo-mask-mg",
        prompt: "255.255.255.0 -- says which part of the address is the network",
        answer: "Subnet mask",
        explanation: "PCs with matching network parts can talk directly.",
      },
      {
        id: "net-lingo-gateway-mg",
        prompt: "The router's address, used to reach other networks",
        answer: "Default gateway",
        explanation: "Usually the router's LAN IP, e.g. 192.168.1.1.",
      },
      {
        id: "net-lingo-dhcp-mg",
        prompt: "Hands out IP addresses automatically",
        answer: "DHCP",
        explanation: "That's what makes dynamic IP addressing work.",
      },
      {
        id: "net-lingo-ssid-mg",
        prompt: "The Wi-Fi network's name",
        answer: "SSID",
        explanation: "Rename it from the router's default.",
      },
      {
        id: "net-lingo-ping-mg",
        prompt: "Command that tests whether another PC replies",
        answer: "ping",
        explanation: "e.g. ping 192.168.1.11 -- replies mean the connection works.",
      },
      {
        id: "net-lingo-ipconfig-mg",
        prompt: "Command that shows this PC's own IP settings",
        answer: "ipconfig",
        explanation: "Handy for checking which address DHCP actually assigned.",
      },
    ],
  },
]);
