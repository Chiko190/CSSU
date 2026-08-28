import type { LessonCard } from "../types";

export const module2Lessons: LessonCard[] = [
  {
    id: "what-is-a-network",
    title: "What Is a Computer Network?",
    body: "A network connects multiple computers so they can share files, printers, and an internet connection. Setting one up means both physical cabling and logical configuration -- addresses, sharing rules, and security settings.",
  },
  {
    id: "structured-cabling",
    title: "Structured Cabling Standards",
    body: "Network cables are terminated to standards set by ANSI/TIA/EIA, not wired arbitrarily. Following the standard, then testing each cable with a LAN cable tester, ensures a connection that actually works before it's relied on.",
  },
  {
    id: "ip-addressing",
    title: "IP Addressing: Static vs. Dynamic",
    body: "A static IP address is set manually and never changes; a dynamic one is assigned automatically by a DHCP server and can change over time. Servers and printers are usually static, while everyday client devices are often dynamic.",
  },
  {
    id: "nic-configuration",
    title: "Configuring the Network Interface Card",
    body: "A computer's network interface card (NIC) settings -- its IP address, subnet, and gateway -- are configured to match the network's design, not guessed at.",
  },
  {
    id: "routers-dhcp-wireless",
    title: "Routers, DHCP, and Wireless Settings",
    body: "A router manages DHCP (automatic IP assignment) and wireless settings for a network. Renaming the default SSID and setting a real password are basic steps to secure it before anyone connects.",
  },
  {
    id: "firewalls-and-sharing",
    title: "Firewalls and File Sharing",
    body: "A firewall controls what network traffic is allowed in and out. Turning on network sharing (and, later, disabling password-protected sharing where appropriate) is what lets multiple computers access shared folders.",
  },
  {
    id: "diagnosing-network-faults",
    title: "Diagnosing Network Faults",
    body: "When a device can't be seen on the network, check the physical cable first (with a tester), then the IP configuration, then sharing and firewall settings -- in that order, from the ground up.",
  },
];
