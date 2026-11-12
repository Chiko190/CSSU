import type { LessonCard } from "../types";

export const module2Lessons: LessonCard[] = [
  {
    id: "video-what-is-uc2",
    title: "Watch: What This Unit Is About",
    body: "UC2 connects computers so they can share files, printers and the internet. Watch the whole unit in about a minute and a half: plan the network, make and test T568B cables, give each PC a static IP and ping, set up the router (SSID, password, DHCP), switch to dynamic addresses, share a folder, and diagnose faults.",
    media: {
      kind: "video",
      url: "/modules/module-2/videos/uc2-explainer.webm",
      alt: "Animated overview of UC2: cabling, static and dynamic IP addressing, router setup, file sharing and diagnosing faults",
      caption: "About 1.5 min, animated with on-screen captions. Each step is part of this unit's tasks.",
      credit: "Animated explainer made for this training app",
    },
  },
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
    id: "rj45-color-coding",
    title: "RJ45 Colour Coding: T568A and T568B",
    body: "Every network cable uses one of two colour orders. T568A: White/Green, Green, White/Orange, Blue, White/Blue, Orange, White/Brown, Brown. T568B (the most common): White/Orange, Orange, White/Green, Blue, White/Blue, Green, White/Brown, Brown. The only difference is that the orange and green pairs swap places. Use the same standard on both ends for a straight-through cable, or A on one end and B on the other for a crossover cable.",
    media: {
      kind: "image",
      url: "/modules/module-2/lessons/t568a-vs-t568b.webp",
      alt: "Chart comparing T568A and T568B RJ45 wiring: the colour of the wire in each of pins 1 to 8 for both standards",
      wide: true,
    },
  },
  {
    id: "video-rj45-connector",
    title: "Watch: A Close Look at the RJ45 Connector",
    body: "Before you wire one, get to know the plug. An RJ45 connector has 8 gold contacts across the top, one for each of the cable's 8 wires, and a clip that locks it into the port. Its clear body lets you check that every wire has reached the end before you crimp.",
    media: {
      kind: "video",
      url: "/modules/module-2/videos/rj45-connector-closeup.webm",
      alt: "Close-up video of an RJ45 network connector",
      caption: "About 25 seconds, no narration.",
      credit: "\"RJ-45 Connector\" by Maximilian Schönherr (Wikimedia Commons), CC BY-SA 4.0",
    },
  },
  {
    id: "video-making-a-lan-cable",
    title: "Watch: Making a LAN Cable",
    body: "Watch a network cable being made from start to finish: slide the plug boot onto the cable, strip the outer jacket, untwist the pairs and line up the eight wires in the standard's order, trim them evenly, push them fully into the RJ45 plug, crimp it, and check the crimp. This is the hands-on job in Task 1. After that, a LAN tester confirms every wire works.",
    media: {
      kind: "video",
      url: "/modules/module-2/videos/make-lan-cable.webm",
      alt: "Video demonstration of stripping, arranging, crimping, and testing a UTP network cable with an RJ45 connector",
      caption: "2.5 min, Cat6A cable. The on-screen captions are in Japanese, so follow the hands: boot on, strip, arrange, trim, insert, crimp, check.",
      credit: "\"LANケーブル自作工具キットを使ったLANケーブル加工方法 LAN-TLKIT3\" by Sanwa Supply Inc. (Wikimedia Commons), CC BY 3.0",
    },
  },
  {
    id: "video-insert-and-crimp",
    title: "Watch: Inserting the Wires and Crimping",
    body: "This is a closer look at the step that matters most. With the eight wires lined up in T568B order and trimmed evenly, push them into the plug until every wire touches the front. Then squeeze the crimping tool firmly so the gold contacts press down through the wires. If any wire is in the wrong slot or stops short, the cable fails the LAN tester.",
    media: {
      kind: "video",
      url: "/modules/module-2/videos/insert-and-crimp-rj45.webm",
      alt: "Video demonstration of inserting a CAT5e cable's arranged wires into an RJ45 plug and crimping it",
      caption: "About 2 min, CAT5e solid-core cable. The captions are in Japanese, so watch the hands: wires in order, push fully in, crimp.",
      credit: "\"CAT5e LANケーブル（単線）の自作紹介 パート4 プラグに差し込みかしめる\" by Sanwa Supply Inc. (Wikimedia Commons), CC BY 3.0",
    },
  },
  {
    id: "video-connect-router-to-pc",
    title: "Watch: Connecting the Router to a PC",
    body: "Once a cable passes the LAN tester, use it to connect a computer to the router. Plug one end into one of the router's LAN ports (not the WAN/Internet port, which goes to the modem), and the other end into the PC's Ethernet port. The port lights should come on at both ends. Then check the connection in Windows' network settings, or run ipconfig, before moving on to IP addressing.",
    media: {
      kind: "youtube",
      videoId: "Mximhi1H8u8",
      alt: "YouTube tutorial: connecting a PC to a router with an Ethernet cable",
      caption: "Watch for which router port the cable goes into, and the link lights coming on.",
      credit: "\"How to Connect Ethernet Cable to PC from Router - Easy Guide\" by Techie Leopard (YouTube)",
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
