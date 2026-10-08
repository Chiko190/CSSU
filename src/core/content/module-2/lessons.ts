import type { LessonCard } from "../types";

export const module2Lessons: LessonCard[] = [
  {
    id: "what-is-a-network",
    title: "What Is a Computer Network?",
    body: "A network connects multiple computers so they can share files, printers, and an internet connection. Setting one up means both physical cabling and logical configuration -- addresses, sharing rules, and security settings.",
    media: {
      kind: "image",
      url: "/modules/module-2/images/verify-network-visibility.webp",
      alt: "File Explorer's Network view listing the other computers visible on the local network",
    },
  },
  {
    id: "structured-cabling",
    title: "Structured Cabling Standards",
    body: "Network cables are terminated to standards set by ANSI/TIA/EIA, not wired arbitrarily. Following the standard, then testing each cable with a LAN cable tester, ensures a connection that actually works before it's relied on.",
    media: {
      kind: "image",
      url: "/modules/module-2/images/terminate-cable.webp",
      alt: "The eight color-coded twisted-pair wires of a UTP cable fanned out and ready to be terminated into an RJ45 connector",
      credit: "\"Assemblaggio cavo RJ45 passo 9\" by Giacomo Alessandroni (Wikimedia Commons), CC BY-SA 4.0",
    },
  },
  {
    id: "ip-addressing",
    title: "IP Addressing: Static vs. Dynamic",
    body: "A static IP address is set manually and never changes; a dynamic one is assigned automatically by a DHCP server and can change over time. Servers and printers are usually static, while everyday client devices are often dynamic.",
    media: {
      kind: "image",
      url: "/modules/module-2/images/static-peer-to-peer.webp",
      alt: "Internet Protocol Version 4 (TCP/IPv4) Properties dialog with \"Use the following IP address\" set to a manual 192.168.0.x address",
    },
  },
  {
    id: "nic-configuration",
    title: "Configuring the Network Interface Card",
    body: "A computer's network interface card (NIC) settings -- its IP address, subnet, and gateway -- are configured to match the network's design, not guessed at.",
    media: {
      kind: "image",
      url: "/modules/module-2/images/configure-nic.webp",
      alt: "Windows Wi-Fi Properties dialog showing Internet Protocol Version 4 (TCP/IPv4) settings, reached via Network Connections",
    },
  },
  {
    id: "routers-dhcp-wireless",
    title: "Routers, DHCP, and Wireless Settings",
    body: "A router manages DHCP (automatic IP assignment) and wireless settings for a network. Renaming the default SSID and setting a real password are basic steps to secure it before anyone connects.",
    media: {
      kind: "image",
      url: "/modules/module-2/lessons/router-wireless-settings.webp",
      alt: "A D-Link router's web setup page showing the wireless network name (SSID) and security settings",
    },
  },
  {
    id: "firewalls-and-sharing",
    title: "Firewalls and File Sharing",
    body: "A firewall controls what network traffic is allowed in and out. Turning on network sharing (and, later, disabling password-protected sharing where appropriate) is what lets multiple computers access shared folders.",
    media: {
      kind: "image",
      url: "/modules/module-2/images/configure-firewall.webp",
      alt: "Windows Defender Firewall control panel showing private and public network protection status",
    },
  },
  {
    id: "diagnosing-network-faults",
    title: "Diagnosing Network Faults",
    body: "When a device can't be seen on the network, check the physical cable first (with a tester), then the IP configuration, then sharing and firewall settings -- in that order, from the ground up.",
    media: {
      kind: "image",
      url: "/modules/module-2/images/test-cable.webp",
      alt: "An RJ45/RJ11 LAN cable tester kit with master and remote units, plus a cable stripper",
      credit: "\"Cable stripper and cable tester (RJ45, RJ11)\" by heimnetzwerke.net (Wikimedia Commons), CC BY 4.0",
    },
  },
];
