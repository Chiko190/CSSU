// Generates the quiz illustrations for questions that had no matching photo -- software dialogs,
// command output, procedure orders and network diagrams that no freely licensed photo shows.
// Each picture shows what the question is about WITHOUT giving its answer away (the part being
// asked about is drawn as a "?"). Run: node scripts/quiz-illustrations/generate.cjs
// Output: public/modules/module-N/quiz/<questionId>.webp, plus practice-step pictures at the paths
// keyed in scenes2.cjs. Pass ids/keys as arguments to re-render only those.
const path = require("node:path");
const sharp = require("sharp");
const L = require("./lib.cjs");
const { C, text, svg, win, radio, checkbox, field, button, qmark, tick, cross, warnIcon, cmd, checklist, heading, pc, server, printer, switchBox, router, cloud, folder, disk, user, usb, arrow, line, treeRow } = L;

const OUT = path.join(__dirname, "../../public/modules");

// ---- Reusable scenes ----

function ipv4Dialog(title, { values = ["", "", ""], dns = ["", ""], caption = "" } = {}) {
  const body = `
    ${text(24, 40, "You can get IP settings assigned automatically if your network supports", { size: 16, color: C.muted })}
    ${text(24, 62, "this capability. Otherwise, ask your network administrator for the settings.", { size: 16, color: C.muted })}
    ${radio(36, 108, "Obtain an IP address automatically")}
    ${radio(36, 148, "Use the following IP address:")}
    ${text(70, 196, "IP address:", { size: 18 })}${field(300, 174, 260, values[0])}
    ${text(70, 240, "Subnet mask:", { size: 18 })}${field(300, 218, 260, values[1])}
    ${text(70, 284, "Default gateway:", { size: 18 })}${field(300, 262, 260, values[2])}
    ${radio(36, 336, "Obtain DNS server address automatically")}
    ${radio(36, 376, "Use the following DNS server addresses:")}
    ${text(70, 418, "Preferred DNS server:", { size: 18 })}${field(300, 397, 260, dns[0])}
    ${button(470, 448, 100, "OK", { primary: true })}${button(584, 448, 100, "Cancel")}`;
  return svg(win(130, 30, 700, 540, title, body, { bodyFill: L.is2012() ? "#f0f0f0" : undefined }) + qmark(870, 150, 30) + (caption ? text(480, 592, caption, { size: 18, anchor: "middle", color: C.muted }) : ""));
}

function deviceManager(rows, { title = "Device Manager", extra = "" } = {}) {
  const body = rows.map((r, i) => treeRow(36, 44 + i * 38, r.label, r)).join("") + extra;
  return svg(win(150, 40, 660, 520, title, body));
}

// ---- Scenes, keyed by question id ----

const scenes = {
  // ===== Module 1 =====
  "m1t1-q5": () =>
    svg(
      heading("Disassembly order", "Task Sheet 1.1-4 -- after the covers come off...") +
        checklist(250, 150, 460, [
          { label: "1. Remove the front cover", state: "done" },
          { label: "2. Remove the side cover", state: "done" },
          { label: "3. Remove the  ? ? ?", state: "q" },
          { label: "4. ...", state: "todo" },
          { label: "5. ...", state: "todo" },
        ], { rowH: 76 }),
    ),

  "m1t2-q4": () =>
    svg(
      heading("Assembly order", "Rebuilding the PC, step by step") +
        checklist(230, 150, 500, [
          { label: "1. Attach the motherboard", state: "done" },
          { label: "2. Attach the CPU", state: "done" },
          { label: "3.  ? ? ?", state: "q" },
          { label: "4. Attach the graphics card", state: "todo" },
          { label: "5. ...", state: "todo" },
        ], { rowH: 76 }),
    ),

  "m1t3-q1": () => {
    const screen = `${text(0, -24, "Loading files...", { size: 13, color: "#1e3a8a", anchor: "middle", weight: 600 })}<rect x="-44" y="-10" width="88" height="10" rx="5" fill="#fff"/><rect x="-44" y="-10" width="52" height="10" rx="5" fill="${C.accent}"/>`;
    return svg(
      heading("A bootable USB drive in use") +
        `<rect x="120" y="170" width="150" height="300" rx="12" fill="#374151"/><circle cx="195" cy="210" r="10" fill="#4ade80"/><rect x="150" y="260" width="90" height="10" rx="4" fill="#1f2937"/><rect x="176" y="330" width="38" height="18" fill="#111"/>` +
        `<g transform="rotate(-90 195 395)">${usb(195, 395, { scale: 0.75, color: "#0f766e" })}</g>` +
        pc(560, 330, { scale: 2.1, screenInner: screen }) +
        line(270, 400, 400, 400, "#94a3b8", 3) +
        qmark(820, 170, 32),
    );
  },

  "m1t3-q5": () =>
    svg(
      heading("Task Sheet 1.2-2: Create a bootable device") +
        checklist(240, 160, 480, [
          { label: "Turn on the computer", state: "done" },
          { label: "Open Rufus", state: "done" },
          { label: "Follow the on-screen instructions", state: "done" },
          { label: "Final step:  ? ? ?", state: "q" },
        ], { rowH: 86 }),
    ),

  "m1t3-q6": () => {
    const body = `
      ${text(24, 44, "Drive Properties", { size: 22, weight: 700 })}
      ${text(24, 90, "Device", { size: 17, color: C.muted })}${field(24, 100, 552, "USB Flash Drive (E:) [16 GB]")}
      ${text(24, 172, "Partition scheme", { size: 17, color: C.muted })}${field(24, 182, 260, "GPT")}
      ${text(316, 172, "Target system", { size: 17, color: C.muted })}${field(316, 182, 260, "UEFI (non CSM)")}
      ${text(24, 262, "Format Options", { size: 22, weight: 700 })}
      ${text(24, 306, "File system", { size: 17, color: C.muted })}
      <rect x="24" y="316" width="260" height="34" rx="3" fill="#fff7e6" stroke="${C.warn}" stroke-width="2"/>${text(36, 339, "?", { size: 20, weight: 700, color: "#92400e" })}${text(266, 339, "▾", { size: 18, anchor: "end" })}
      <rect x="24" y="352" width="260" height="76" fill="#fff" stroke="#8a94a3"/>${text(36, 380, "FAT32", { size: 18 })}${text(36, 414, "NTFS", { size: 18 })}
      ${button(360, 400, 100, "START", { primary: true })}${button(476, 400, 100, "CLOSE")}`;
    return svg(win(170, 40, 620, 520, "Bootable USB tool", body) + qmark(560, 368, 26));
  },

  "m1t3-q7": () => {
    const blue = "#0000aa";
    const rows = [
      ["Boot Option #1", "[Hard Drive: ST500DM002]"],
      ["Boot Option #2", "[CD/DVD: ASUS DRW]"],
      ["Boot Option #3", "[USB: Bootable Flash Drive]"],
    ];
    const body = rows
      .map(([k, v], i) => text(80, 230 + i * 50, k, { size: 24, color: "#fff", font: L.MONO }) + text(380, 230 + i * 50, v, { size: 24, color: i === 2 ? "#ffff55" : "#fff", font: L.MONO }))
      .join("");
    return svg(
      `<rect x="40" y="40" width="880" height="520" fill="${blue}"/><rect x="40" y="40" width="880" height="54" fill="#aaaaaa"/>` +
        text(480, 76, "BIOS SETUP UTILITY  -  Boot", { size: 24, color: blue, anchor: "middle", font: L.MONO, weight: 700 }) +
        text(80, 150, "Boot Device Priority", { size: 26, color: "#55ffff", font: L.MONO }) +
        body +
        text(80, 420, "+/- : Change order    F10 : Save and Exit", { size: 20, color: "#aaaaaa", font: L.MONO }) +
        qmark(860, 330, 30),
      { bg: "#000" },
    );
  },

  "m1t3-q8": () => {
    const body = `
      ${text(24, 44, "Drive Properties", { size: 22, weight: 700 })}
      ${text(24, 90, "Device", { size: 17, color: C.muted })}${field(24, 100, 552, "USB Flash Drive (E:) [16 GB]")}
      ${text(24, 172, "Boot selection", { size: 17, color: C.muted })}
      <rect x="24" y="182" width="420" height="34" rx="3" fill="#fff7e6" stroke="${C.warn}" stroke-width="2"/>${text(36, 205, "(nothing selected yet)", { size: 18, color: "#92400e", italic: true })}
      ${button(460, 181, 116, "SELECT")}
      ${text(24, 278, "Status", { size: 22, weight: 700 })}
      <rect x="24" y="294" width="552" height="34" fill="#f3f4f6" stroke="#cbd5e1"/>${text(300, 317, "Waiting for input...", { size: 17, anchor: "middle", color: C.muted })}
      ${button(360, 400, 100, "START", { disabled: true })}${button(476, 400, 100, "CLOSE")}`;
    return svg(win(170, 40, 620, 520, "Rufus", body) + qmark(830, 240, 28));
  },

  "m1t4-q2": () =>
    svg(
      heading("Windows Setup: Where do you want to install Windows?") +
        `<rect x="80" y="170" width="800" height="250" rx="10" fill="#fff" stroke="${C.line}"/>` +
        text(110, 215, "Disk 0", { size: 22, weight: 700 }) + text(110, 245, "465.8 GB", { size: 18, color: C.muted }) +
        `<rect x="240" y="196" width="610" height="110" rx="6" fill="#e5e7eb" stroke="#9ca3af" stroke-dasharray="8 6"/>` +
        text(545, 245, "Unallocated Space", { size: 24, anchor: "middle", weight: 600 }) +
        text(545, 276, "465.8 GB", { size: 18, anchor: "middle", color: C.muted }) +
        text(480, 370, "How many partitions should you create?", { size: 24, anchor: "middle", weight: 600, color: "#92400e" }) +
        qmark(480, 480, 34),
    ),

  "m1t4-q4": () => {
    const layer = (y, label, fill, color = C.ink) => `<rect x="250" y="${y}" width="460" height="74" rx="10" fill="${fill}" stroke="${C.line}"/>${text(480, y + 46, label, { size: 24, weight: 600, anchor: "middle", color })}`;
    return svg(
      heading("How software talks to hardware") +
        layer(120, "Applications", "#dbeafe") +
        layer(214, "Operating System", "#e0e7ff") +
        `<rect x="250" y="308" width="460" height="74" rx="10" fill="#fff7e6" stroke="${C.warn}" stroke-width="3" stroke-dasharray="10 6"/>` +
        qmark(480, 345, 28) +
        layer(402, "Hardware: graphics card, printer, NIC...", "#e5e7eb") +
        arrow(730, 160, 730, 430, { color: "#94a3b8" }) + arrow(760, 430, 760, 160, { color: "#94a3b8" }),
    );
  },

  "m1t4-q5": () =>
    deviceManager(
      [
        { label: "DESKTOP-NEWINSTALL", expanded: true },
        { label: "Computer", expanded: false, indent: 1 },
        { label: "Disk drives", expanded: false, indent: 1 },
        { label: "Display adapters", expanded: true, indent: 1 },
        { label: "Microsoft Basic Display Adapter", indent: 2 },
        { label: "Other devices", expanded: true, indent: 1 },
        { label: "Ethernet Controller", warn: true, indent: 2 },
        { label: "Multimedia Audio Controller", warn: true, indent: 2 },
        { label: "PCI Device", warn: true, indent: 2 },
        { label: "Unknown device", warn: true, indent: 2 },
      ],
      { title: "Device Manager -- right after a fresh OS install" },
    ),

  "m1t4-q7": () => {
    const body = `
      ${text(24, 44, "License Agreement", { size: 24, weight: 700 })}
      ${text(24, 74, "Please read the following license agreement carefully.", { size: 17, color: C.muted })}
      <rect x="24" y="92" width="552" height="230" fill="#f9fafb" stroke="#cbd5e1"/>
      ${["SOFTWARE LICENSE AGREEMENT", "", "This driver software is licensed, not sold.", "You may install and use it only with the", "hardware it was supplied for. You may not", "copy, modify or redistribute it except as", "permitted by this agreement..."].map((s, i) => text(40, 122 + i * 28, s, { size: 16, color: "#374151", weight: i === 0 ? 700 : 400 })).join("")}
      ${radio(40, 356, "I accept the terms in the license agreement")}
      ${radio(40, 392, "I do not accept the terms in the license agreement")}
      ${button(360, 430, 100, "Next >", { primary: true })}${button(476, 430, 100, "Cancel")}`;
    return svg(win(170, 30, 620, 540, "Graphics Driver Setup", body) + qmark(830, 110, 30));
  },

  "m1t5-q2": () => {
    const body = `
      <rect width="760" height="56" fill="#f1f5f9"/>
      <circle cx="30" cy="28" r="10" fill="#cbd5e1"/><circle cx="62" cy="28" r="10" fill="#cbd5e1"/>
      <rect x="92" y="10" width="640" height="36" rx="18" fill="#fff" stroke="#cbd5e1"/>${text(116, 35, "Search or type a web address", { size: 17, color: "#9ca3af" })}
      ${text(380, 250, "Which web browser?", { size: 30, weight: 700, anchor: "middle", color: "#92400e" })}
      ${text(380, 290, "(the one Task Sheet 1.3-3 names)", { size: 19, anchor: "middle", color: C.muted })}`;
    return svg(win(100, 60, 760, 460, "New Tab", body) + qmark(480, 450, 34));
  },

  "m1t5-q3": () => {
    const doc = (x, color, label, inner) => `<g transform="translate(${x},250)"><rect x="-70" y="-90" width="140" height="180" rx="10" fill="#fff" stroke="${C.line}" stroke-width="2"/><rect x="-70" y="-90" width="140" height="40" rx="10" fill="${color}"/>${inner}</g>${text(x, 380, label, { size: 21, weight: 600, anchor: "middle" })}`;
    const lines = [0, 1, 2, 3, 4].map((i) => `<rect x="-50" y="${-30 + i * 22}" width="${i === 4 ? 60 : 100}" height="8" rx="4" fill="#cbd5e1"/>`).join("");
    const grid = [0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<rect x="${-50 + c * 34}" y="${-34 + r * 26}" width="30" height="22" fill="${r === 0 ? "#bbf7d0" : "#f1f5f9"}" stroke="#cbd5e1"/>`).join("")).join("");
    const slide = `<rect x="-52" y="-34" width="104" height="70" fill="#ffedd5" stroke="#fdba74"/><rect x="-36" y="-18" width="72" height="10" rx="5" fill="#fb923c"/><rect x="-36" y="2" width="50" height="8" rx="4" fill="#fdba74"/>`;
    return svg(
      heading("An office application suite", "Documents, spreadsheets and presentations in one package") +
        doc(250, "#2563eb", "Word processor", lines) + doc(480, "#16a34a", "Spreadsheet", grid) + doc(710, "#ea580c", "Presentations", slide) +
        text(480, 470, "Which suite does the task sheet name?", { size: 24, weight: 600, anchor: "middle", color: "#92400e" }) + qmark(480, 530, 26),
    );
  },

  "m1t5-q4": () =>
    svg(
      heading("Antivirus software") +
        `<path d="M480 120 l140 50 v110 c0 90 -70 150 -140 180 c-70 -30 -140 -90 -140 -180 v-110 z" fill="#dcfce7" stroke="${C.good}" stroke-width="5"/>` +
        `<path d="M425 300 l40 40 l85 -95" stroke="${C.good}" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
        text(480, 520, "Scanning C:\\Windows\\System32...", { size: 20, anchor: "middle", color: C.muted }) +
        `<rect x="300" y="540" width="360" height="16" rx="8" fill="#e5e7eb"/><rect x="300" y="540" width="230" height="16" rx="8" fill="${C.good}"/>`,
    ),

  "m1t5-q7": () =>
    svg(
      heading("Client request form", "What does this user actually need?") +
        `<rect x="250" y="120" width="460" height="420" rx="12" fill="#fff" stroke="${C.line}"/>` +
        text(280, 170, "Name: Maria (accounting)", { size: 20 }) +
        text(280, 210, "Needs installed:", { size: 20, weight: 700 }) +
        checkbox(300, 260, "Web browser", true, 21) + checkbox(300, 310, "Office suite", true, 21) + checkbox(300, 360, "Antivirus", true, 21) +
        checkbox(300, 410, "Video editing software", false, 21) + checkbox(300, 460, "Games", false, 21) +
        qmark(760, 330, 32),
    ),

  "m1t5-q8": () => {
    const body = `
      ${warnIcon(60, 70, 3)}
      ${text(120, 64, "Activation required", { size: 26, weight: 700 })}
      ${text(120, 98, "This copy of the software could not be verified", { size: 18, color: C.muted })}
      ${text(120, 124, "as genuine. No valid license was found.", { size: 18, color: C.muted })}
      ${text(32, 196, "Product key:", { size: 19 })}${field(32, 210, 556, "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX", { placeholder: true })}
      ${button(372, 290, 100, "Activate", { primary: true })}${button(488, 290, 100, "Close")}`;
    return svg(win(170, 120, 620, 380, "Software Activation", body) + qmark(830, 160, 30));
  },

  "m1t5-q9": () => {
    const icon = (x, y, color, label) => `<rect x="${x - 30}" y="${y - 30}" width="60" height="60" rx="12" fill="${color}"/>${text(x, y + 56, label, { size: 15, color: "#fff", anchor: "middle" })}`;
    return svg(
      `<rect x="0" y="0" width="960" height="600" fill="#1e3a8a"/><rect x="0" y="550" width="960" height="50" fill="#0f172a" opacity="0.9"/>` +
        icon(80, 80, "#64748b", "Recycle Bin") + icon(80, 210, "#2563eb", "Browser") +
        `<rect x="40" y="300" width="80" height="110" rx="8" fill="#fff" opacity="0.18"/>` + icon(80, 340, "#16a34a", "New App") +
        `<path d="M110 360 l0 34 l9 -8 l7 16 l6 -3 l-7 -15 l12 0 z" fill="#fff" stroke="#000" stroke-width="1.5"/>` +
        text(170, 330, "just installed", { size: 18, color: "#fde68a", italic: true }) +
        arrow(260, 340, 380, 300, { color: "#fde68a" }) +
        `<rect x="400" y="140" width="460" height="300" rx="10" fill="#fff" opacity="0.95"/>` +
        text(630, 270, "Did it really install", { size: 26, weight: 700, anchor: "middle" }) + text(630, 306, "correctly?", { size: 26, weight: 700, anchor: "middle" }) +
        qmark(630, 380, 30),
      { bg: "#1e3a8a" },
    );
  },

  "m1t5-q10": () =>
    svg(
      heading("Job card: Install an office suite") +
        checklist(220, 150, 520, [
          { label: "Downloaded the office suite installer", state: "done" },
          { label: "Clicked Install Now", state: "done" },
          { label: "Installation finished", state: "done" },
          { label: "Anything skipped before installing?", state: "q" },
        ], { rowH: 90 }),
    ),

  // ===== Module 2 =====
  "m2t2-q2": () => ipv4Dialog("Internet Protocol Version 4 (TCP/IPv4) Properties"),

  "m2t2-q4": () =>
    svg(
      heading("A small office network") +
        pc(120, 230, { label: "PC 1", sub: "192.168.1.11", scale: 0.8 }) + pc(120, 450, { label: "PC 2", sub: "192.168.1.12", scale: 0.8 }) +
        switchBox(360, 340) + line(180, 260, 290, 330) + line(180, 470, 290, 350) +
        router(590, 340, { label: "", sub: "" }) + text(590, 400, "192.168.1.1", { size: 17, color: C.muted, anchor: "middle" }) +
        line(430, 340, 524, 340) + line(656, 340, 730, 340) + cloud(820, 340) +
        `<rect x="500" y="200" width="180" height="60" rx="10" fill="#fff7e6" stroke="${C.warn}" stroke-width="2"/>` +
        text(590, 238, "Role: ?", { size: 22, weight: 700, anchor: "middle", color: "#92400e" }) + arrow(590, 262, 590, 300, { color: C.warn }),
    ),

  "m2t2-q5": () =>
    cmd([
      "Microsoft Windows [Version 10.0.19045]",
      "(c) Microsoft Corporation. All rights reserved.",
      "",
      { t: "C:\\Users\\Tech> ???", color: "#fbbf24", bold: true },
      "",
      "Windows IP Configuration",
      "",
      "Ethernet adapter Ethernet:",
      "",
      "   IPv4 Address. . . . . . . . . : 192.168.1.25",
      "   Subnet Mask . . . . . . . . . : 255.255.255.0",
      "   Default Gateway . . . . . . . : 192.168.1.1",
    ]),

  // ===== Module 3 =====
  // UC3's server-side screens use the Windows Server 2012 R2 look of the UC3 guide's screenshots.
  "m3t1-q1": L.server2012(() => ipv4Dialog("Internet Protocol Version 4 (TCP/IPv4) Properties", { caption: "on the SERVER (Windows Server 2012 R2)" })),

  "m3t1-q2": () => {
    const node = (x, y, label, color) => `<rect x="${x - 95}" y="${y - 30}" width="190" height="60" rx="10" fill="${color}" stroke="${C.line}"/>${text(x, y + 8, label, { size: 21, weight: 600, anchor: "middle" })}`;
    return svg(
      heading("Active Directory Domain Services (AD DS)") +
        server(480, 200, { scale: 0.8 }) + text(480, 278, "Windows Server 2012 R2", { size: 16, anchor: "middle", color: C.muted }) + text(480, 302, "Domain controller: css.org", { size: 20, weight: 600, anchor: "middle" }) +
        line(480, 320, 480, 350) + line(170, 350, 790, 350) +
        [170, 377, 583, 790].map((x) => line(x, 350, x, 380)).join("") +
        node(170, 410, "Users", "#dbeafe") + node(377, 410, "Computers", "#e0e7ff") + node(583, 410, "Groups", "#dcfce7") + node(790, 410, "Policies", "#fef3c7") +
        user(140, 510, { scale: 0.7 }) + user(200, 510, { scale: 0.7 }) + pc(377, 510, { scale: 0.45 }) +
        text(480, 580, "What does this role provide for the network?", { size: 20, color: "#92400e", anchor: "middle", weight: 600 }),
    );
  },

  "m3t1-q5": L.server2012(() => {
    const steps = ["Deployment Configuration", "Domain Controller Options", "Additional Options", "Paths", "Review Options", "Prerequisites Check", "Installation", "Results"];
    const nav = steps
      .map((s, i) => (i === 0 ? `<rect x="16" y="${96 + i * 32}" width="200" height="30" fill="#2c7fc0"/>` : "") + text(28, 117 + i * 32, s, { size: 15, color: i === 0 ? "#fff" : i < 6 ? "#222" : "#a0a0a0" }))
      .join("");
    const body = `
      ${text(20, 58, "Deployment Configuration", { size: 32, color: "#2b8fd0" })}
      ${text(728, 34, "TARGET SERVER", { size: 13, anchor: "end" })}${text(728, 54, "SERVER", { size: 13, anchor: "end" })}
      ${nav}
      ${text(240, 116, "Select the deployment operation", { size: 17 })}
      ${radio(256, 150, "Add a domain controller to an existing domain", false, 17)}
      ${radio(256, 182, "Add a new domain to an existing forest", false, 17)}
      ${radio(256, 214, "Add a new forest", true, 17)}
      ${text(240, 270, "Specify the domain information for this operation", { size: 17 })}
      ${text(256, 314, "Root domain name:", { size: 17 })}
      <rect x="420" y="294" width="290" height="30" fill="#fff7e6" stroke="${C.warn}" stroke-width="2"/>
      ${line(16, 420, 732, 420, "#d6d6d6", 1)}
      ${button(300, 436, 100, "< Previous")}${button(410, 436, 100, "Next >", { primary: true })}${button(520, 436, 100, "Install", { disabled: true })}${button(630, 436, 100, "Cancel")}`;
    return svg(win(100, 30, 760, 540, "Active Directory Domain Services Configuration Wizard", body) + qmark(895, 373, 26));
  }),

  "m3t1-q9": L.server2012(() => {
    const body = `
      ${treeRow(30, 40, "css.org", { expanded: true })}
      ${treeRow(30, 80, "Builtin", { expanded: false, indent: 1 })}
      ${treeRow(30, 120, "Computers", { expanded: false, indent: 1 })}
      ${treeRow(30, 160, "Users", { expanded: false, indent: 1 })}
      <rect x="40" y="182" width="250" height="36" rx="4" fill="#dbeafe"/>
      ${treeRow(30, 200, "Redirection  (OU)", { expanded: true, indent: 1 })}
      <line x1="300" y1="0" x2="300" y2="440" stroke="${C.line}"/>
      ${text(330, 40, "Name", { size: 18, weight: 700 })}${text(560, 40, "Type", { size: 18, weight: 700 })}
      ${user(350, 100, { scale: 0.55 })}${text(380, 106, "????", { size: 19 })}${text(560, 106, "User", { size: 19 })}
      ${user(350, 150, { scale: 0.55 })}${text(380, 156, "????", { size: 19 })}${text(560, 156, "User", { size: 19 })}
      ${text(330, 220, "...", { size: 22, color: C.muted })}`;
    return svg(win(110, 60, 740, 480, "Active Directory Users and Computers", body) + qmark(700, 420, 32));
  }),

  "m3t2-q1": () => {
    const body = `
      ${["Computer Name", "Hardware", "Advanced", "Remote"].map((t, i) => `<rect x="${16 + i * 140}" y="12" width="136" height="36" fill="${i === 3 ? "#fff" : "#f3f4f6"}" stroke="${C.line}"/>${text(84 + i * 140, 36, t, { size: 16, anchor: "middle", weight: i === 3 ? 700 : 400 })}`).join("")}
      ${text(32, 100, "Remote Assistance", { size: 20, weight: 700 })}
      ${checkbox(44, 136, "Allow Remote Assistance connections to this computer", true, 17)}
      ${text(32, 200, "Remote Desktop", { size: 20, weight: 700 })}
      ${text(32, 228, "Choose an option, and then specify who can connect.", { size: 16, color: C.muted })}
      <rect x="24" y="244" width="560" height="100" rx="6" fill="#fff7e6" stroke="${C.warn}" stroke-width="2"/>
      ${radio(48, 276, "Don't allow remote connections to this computer", false, 18)}
      ${radio(48, 316, "Allow remote connections to this computer", false, 18)}
      ${button(424, 370, 160, "Select Users...")}
      ${button(260, 430, 100, "OK", { primary: true })}${button(372, 430, 100, "Cancel")}${button(484, 430, 100, "Apply")}`;
    return svg(win(170, 30, 620, 540, "System Properties  (Client-PC)", body) + qmark(840, 300, 30));
  },

  "m3t2-q2": () => {
    const body = `
      ${text(24, 44, "The users listed below can connect to this computer, and any", { size: 17 })}
      ${text(24, 68, "members of the Administrators group can connect even if not listed.", { size: 17 })}
      <rect x="24" y="90" width="552" height="200" fill="#fff" stroke="#8a94a3"/>
      ${text(300, 196, "(no users added yet)", { size: 18, color: "#9ca3af", italic: true, anchor: "middle" })}
      ${button(24, 310, 110, "Add...", { primary: true })}${button(148, 310, 110, "Remove")}
      ${button(360, 400, 100, "OK")}${button(476, 400, 100, "Cancel")}`;
    return svg(win(170, 60, 620, 500, "Remote Desktop Users", body) + qmark(830, 190, 30));
  },

  "m3t2-q3": () =>
    svg(
      heading("Remote Desktop Connection", "Which machine starts the session -- and which one is controlled?") +
        server(220, 320, { label: "Server-PC", sub: "Windows Server 2012 R2" }) +
        pc(740, 320, { label: "Client-PC", sub: "10.10.0.101", scale: 1.1 }) +
        arrow(320, 270, 620, 270, { color: C.warn, dashed: true }) + arrow(620, 360, 320, 360, { color: C.warn, dashed: true }) +
        qmark(470, 315, 32),
    ),

  "m3t2-q7": () => {
    const paper = `<rect x="-40" y="22" width="80" height="44" fill="#fff"/>${text(0, 50, "Test page", { size: 13, anchor: "middle", weight: 700 })}`;
    return svg(
      heading("Deployed printer -- does it really work?") +
        pc(230, 320, { label: "Client-PC", sub: "logged in to css.org" }) +
        printer(700, 300, { label: "Network printer", scale: 1.2, paper }) +
        arrow(330, 300, 590, 300, { color: C.accent, dashed: true }) +
        text(460, 280, "Print job", { size: 18, anchor: "middle", color: C.accent }) +
        qmark(480, 470, 30),
    );
  },

  "m3t2-q8": () =>
    svg(
      heading("Printer deployed from the server") +
        server(480, 210, { label: "Print server", sub: "Windows Server 2012 R2" }) +
        [180, 480, 780].map((x) => pc(x, 470, { scale: 0.75 }) + arrow(480, 330, x, 400, { color: C.accent })).join("") +
        `<rect x="590" y="150" width="140" height="56" rx="8" fill="#e0e7ff" stroke="#818cf8"/>` + text(660, 184, "Driver", { size: 20, weight: 700, anchor: "middle", color: "#3730a3" }),
    ),

  // ===== Module 4 =====
  "m4t1-q4": () =>
    svg(
      heading("Where should the backup live?") +
        pc(230, 250, { label: "Client-PC" }) + disk(230, 430, { label: "Local disk", sub: "drive failed" }) + cross(290, 400, C.bad, 22) +
                server(730, 260, { label: "Server-PC" }) + folder(730, 450, { label: "Backup copy", scale: 0.8 }) + tick(790, 420, C.good, 22) +
        arrow(340, 260, 640, 260, { color: C.accent, dashed: true }) + text(490, 240, "backup over the network", { size: 18, anchor: "middle", color: C.accent }),
    ),

  "m4t1-q6": () => {
    const body = `
      ${text(24, 48, "Back up or restore your files", { size: 26, color: "#1e5aa8" })}
      ${text(24, 100, "Backup", { size: 20, weight: 700 })}
      ${text(48, 136, "Location:", { size: 18 })}${text(200, 136, "\\\\SERVER-PC\\Backup", { size: 18 })}
      ${text(48, 168, "Last backup:", { size: 18 })}${text(200, 168, "Today, 10:42 AM", { size: 18 })}
      ${button(500, 118, 150, "Back up now")}
      ${text(24, 240, "Restore", { size: 20, weight: 700 })}
      <rect x="24" y="256" width="640" height="110" rx="6" fill="#fff7e6" stroke="${C.warn}" stroke-width="2" stroke-dasharray="8 6"/>
      ${text(48, 300, "You can restore your files that were backed up", { size: 18 })}
      ${text(48, 326, "on the current location.", { size: 18 })}`;
    return svg(win(120, 50, 720, 500, "Backup and Restore (Windows 7)", body) + qmark(760, 360, 30));
  },

  "m4t1-q7": () => {
    const body = `
      ${text(24, 48, "Browse or search your backup for files and folders", { size: 22, color: "#1e5aa8" })}
      ${text(24, 90, "Backups available on \\\\SERVER-PC\\Backup:", { size: 18 })}
      <rect x="24" y="106" width="620" height="220" fill="#fff" stroke="#8a94a3"/>
      ${text(40, 134, "Backup period", { size: 17, weight: 700 })}${text(400, 134, "Computer", { size: 17, weight: 700 })}
      ${[["Earlier backup", "CLIENT-PC"], ["Another backup", "CLIENT-PC"], ["Older backup", "CLIENT-PC"]].map(([a, b], i) => `<rect x="26" y="${150 + i * 50}" width="616" height="44" fill="${i === 0 ? "#f1f5f9" : "#fff"}"/>${text(40, 178 + i * 50, a, { size: 18 })}${text(400, 178 + i * 50, b, { size: 18 })}`).join("")}
      ${button(424, 360, 100, "Next", { primary: true })}${button(540, 360, 100, "Cancel")}`;
    return svg(win(130, 60, 680, 470, "Restore Files", body) + qmark(840, 260, 30));
  },

  "m4t1-q8": () => {
    const body = `
      ${text(24, 52, "Where do you want to restore your files?", { size: 24, color: "#1e5aa8" })}
      <rect x="24" y="84" width="600" height="150" rx="6" fill="#fff7e6" stroke="${C.warn}" stroke-width="2"/>
      ${radio(52, 124, "In the original location", false, 20)}
      ${radio(52, 176, "In the following location:", false, 20)}
      ${field(82, 194, 380, "")}${button(476, 193, 120, "Browse...")}
      ${button(404, 330, 110, "Restore", { primary: true })}${button(528, 330, 100, "Cancel")}`;
    return svg(win(150, 90, 660, 430, "Restore Files", body) + qmark(860, 190, 30));
  },

  "m4t1-q9": () => {
    const body = `
      <rect width="760" height="44" fill="#f8fafc"/>${text(20, 29, "This PC  ›  Local Disk (D:)", { size: 18 })}
      <rect x="0" y="44" width="200" height="376" fill="#f8fafc"/>
      ${["Quick access", "This PC", "Local Disk (C:)", "Local Disk (D:)", "Network"].map((s, i) => text(20, 84 + i * 36, s, { size: 17, weight: i === 3 ? 700 : 400 })).join("")}
      ${text(224, 76, "Name", { size: 17, weight: 700 })}${text(520, 76, "Date modified", { size: 17, weight: 700 })}
      ${folder(244, 112, { scale: 0.28 })}${text(270, 120, "Downloads", { size: 18 })}${text(520, 120, "earlier", { size: 17, color: C.muted })}
      <rect x="214" y="138" width="530" height="40" fill="#fff7e6" stroke="${C.warn}" stroke-width="2" stroke-dasharray="6 5"/>
      ${text(270, 164, "MyFiles  ...is it back?", { size: 18, color: "#92400e", weight: 600 })}`;
    return svg(win(100, 60, 760, 460, "Local Disk (D:)", body) + qmark(700, 380, 34) +
      `<circle cx="560" cy="380" r="40" fill="none" stroke="#334155" stroke-width="10"/><line x1="588" y1="408" x2="630" y2="450" stroke="#334155" stroke-width="14" stroke-linecap="round"/>`);
  },

  "m4t1-q10": () => {
    const body = `
      ${tick(70, 90, C.good, 34)}
      ${text(130, 84, "Your files have been restored", { size: 26, weight: 700 })}
      ${text(130, 116, "Restore completed.", { size: 19, color: C.muted })}
      ${button(476, 220, 110, "Finish", { primary: true })}`;
    return svg(win(170, 150, 620, 320, "Restore Files", body) +
      text(480, 540, "Done -- or is there one more thing to check?", { size: 22, weight: 600, anchor: "middle", color: "#92400e" }) + qmark(870, 140, 28));
  },

  // A vague complaint at the help desk -- the question asks where troubleshooting starts, so the
  // picture shows the vague report and the technician's "?" but not what the technician does next.
  "m4t2-q1": () => {
    const bubble = (x, y, w, h, tailX, s) =>
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#ffffff" stroke="${C.line}" stroke-width="3"/>` +
      `<path d="M${tailX - 14} ${y + h - 2} L${tailX} ${y + h + 26} L${tailX + 16} ${y + h - 2} z" fill="#ffffff" stroke="${C.line}" stroke-width="3" stroke-linejoin="round"/>` +
      `<rect x="${tailX - 12}" y="${y + h - 6}" width="26" height="8" fill="#ffffff"/>` +
      text(x + w / 2, y + h / 2 + 10, s, { size: 26, weight: 700, anchor: "middle" });
    return svg(
      heading("New help-desk call", "The user's only description of the problem") +
        bubble(70, 140, 330, 76, 180, "\"My PC isn't working!\"") +
        user(180, 330, { scale: 2.6, color: "#60a5fa" }) + text(180, 440, "User", { size: 20, weight: 600, anchor: "middle" }) +
        pc(480, 330, { label: "User's PC", scale: 1.1, screen: "#1f2937", screenInner: text(0, -8, "?", { size: 46, weight: 800, color: "#9ca3af", anchor: "middle" }) }) +
        user(780, 330, { scale: 2.6, color: "#0067c0" }) + text(780, 440, "Technician (you)", { size: 20, weight: 600, anchor: "middle" }) +
        qmark(780, 190, 34) +
        text(480, 530, "What do you do FIRST?", { size: 24, weight: 600, anchor: "middle", color: "#92400e" }),
    );
  },

  "m4t2-q2": () => {
    const box = (x, y, n) => `<rect x="${x - 110}" y="${y - 40}" width="220" height="80" rx="12" fill="#fff7e6" stroke="${C.warn}" stroke-width="2"/>${text(x - 80, y + 8, `${n}.`, { size: 24, weight: 700, color: "#92400e" })}${qmark(x + 20, y, 22)}`;
    const xs = [200, 480, 760];
    return svg(
      heading("The troubleshooting process", "Put the six steps in the right order") +
        xs.map((x, i) => box(x, 220, i + 1)).join("") + xs.map((x, i) => box(x, 420, i + 4)).join("") +
        arrow(310, 220, 368, 220) + arrow(590, 220, 648, 220) + arrow(760, 262, 760, 376) + arrow(650, 420, 592, 420) + arrow(370, 420, 312, 420),
    );
  },

  "m4t2-q3": null,

  "m4t2-q4": () =>
    svg(
      heading("No network connection") +
        // taskbar tray
        `<rect x="80" y="150" width="380" height="70" rx="8" fill="#0f172a"/>` +
        `<rect x="110" y="168" width="40" height="30" rx="3" fill="none" stroke="#e5e7eb" stroke-width="3"/><rect x="122" y="198" width="16" height="6" fill="#e5e7eb"/>` + cross(152, 168, C.bad, 12) +
        text(190, 192, "Not connected", { size: 19, color: "#e5e7eb" }) + text(440, 192, "10:42", { size: 17, color: "#9ca3af", anchor: "end" }) +
        // NIC port, link light off
        `<rect x="560" y="130" width="320" height="200" rx="10" fill="#374151"/>` +
        `<rect x="650" y="180" width="140" height="110" rx="6" fill="#111827"/><rect x="680" y="190" width="80" height="26" fill="#1f2937"/>` +
        `<rect x="664" y="300" width="22" height="12" fill="#1f2937" stroke="#6b7280"/><rect x="754" y="300" width="22" height="12" fill="#1f2937" stroke="#6b7280"/>` +
        text(720, 360, "NIC port: link light OFF", { size: 18, anchor: "middle", weight: 600 }) +
        text(480, 470, "What should you check first?", { size: 24, weight: 600, anchor: "middle", color: "#92400e" }) + qmark(480, 530, 26),
    ),

  "m4t2-q5": () =>
    cmd([
      "C:\\Users\\Tech> ipconfig",
      "",
      "Windows IP Configuration",
      "",
      "Ethernet adapter Ethernet:",
      "",
      "   Connection-specific DNS Suffix  . :",
      { t: "   IPv4 Address. . . . . . . . . . . : 169.254.12.7", color: "#fbbf24", bold: true },
      "   Subnet Mask . . . . . . . . . . . : 255.255.0.0",
      "   Default Gateway . . . . . . . . . :",
      "",
      "C:\\Users\\Tech> _",
    ]),

  "m4t2-q6": () =>
    cmd([
      { t: "C:\\Users\\Tech> ????????????", color: "#fbbf24", bold: true },
      "   (the PC gives up its current IP address)",
      "",
      { t: "C:\\Users\\Tech> ????????????", color: "#fbbf24", bold: true },
      "   (the PC asks the DHCP server for a new one)",
      "",
      "Ethernet adapter Ethernet:",
      "",
      "   IPv4 Address. . . . . . . . . . . : 10.10.0.105",
      "   Subnet Mask . . . . . . . . . . . : 255.255.255.0",
      "   Default Gateway . . . . . . . . . : 10.10.0.1",
    ]),

  "m4t2-q7": () =>
    cmd([
      "C:\\Users\\Tech> ping 127.0.0.1",
      "",
      "Pinging 127.0.0.1 with 32 bytes of data:",
      "Reply from 127.0.0.1: bytes=32 time<1ms TTL=128",
      "Reply from 127.0.0.1: bytes=32 time<1ms TTL=128",
      "Reply from 127.0.0.1: bytes=32 time<1ms TTL=128",
      "Reply from 127.0.0.1: bytes=32 time<1ms TTL=128",
      "",
      "Ping statistics for 127.0.0.1:",
      "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)",
      "",
      "C:\\Users\\Tech> _",
    ]),

  "m4t2-q8": () => {
    const ram = `<rect x="80" y="380" width="330" height="70" rx="4" fill="#15803d"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${96 + i * 39}" y="392" width="28" height="34" fill="#111827"/>`).join("")}${[...Array(30)].map((_, i) => `<rect x="${86 + i * 10.6}" y="444" width="6" height="12" fill="#eab308"/>`).join("")}<rect x="236" y="444" width="10" height="12" fill="#15803d"/>`;
    return svg(
      heading("Right after a RAM upgrade...") +
        `<rect x="520" y="130" width="360" height="240" rx="12" fill="#1f2937"/><rect x="536" y="146" width="328" height="196" fill="#000"/>` +
        text(700, 250, "No Signal", { size: 30, color: "#9ca3af", anchor: "middle", weight: 600 }) +
        `<rect x="680" y="370" width="40" height="40" fill="#374151"/><rect x="620" y="408" width="160" height="14" rx="7" fill="#1f2937"/>` +
        `<path d="M110 200 h40 l50 -40 v140 l-50 -40 h-40 z" fill="#475569"/>` +
        `<path d="M230 190 q25 40 0 80 M260 170 q40 60 0 120" stroke="#475569" stroke-width="7" fill="none" stroke-linecap="round"/>` +
        text(330, 220, "BEEP", { size: 30, weight: 800, color: C.bad }) + text(330, 262, "BEEP BEEP", { size: 30, weight: 800, color: C.bad }) +
        ram + text(245, 490, "the newly added RAM stick", { size: 18, anchor: "middle", color: C.muted }) +
        qmark(700, 520, 30),
    );
  },

  "m4t2-q9": () =>
    deviceManager(
      [
        { label: "DESKTOP-OFFICE01", expanded: true },
        { label: "Audio inputs and outputs", expanded: false, indent: 1 },
        { label: "Display adapters", expanded: false, indent: 1 },
        { label: "Keyboards", expanded: false, indent: 1 },
        { label: "Network adapters", expanded: true, indent: 1 },
        { label: "Realtek PCIe GbE Family Controller", warn: true, indent: 2 },
        { label: "Ports (COM & LPT)", expanded: false, indent: 1 },
        { label: "Processors", expanded: false, indent: 1 },
        { label: "Storage controllers", expanded: false, indent: 1 },
      ],
      { extra: `<rect x="70" y="218" width="380" height="40" rx="4" fill="none" stroke="${C.warn}" stroke-width="3"/>${qmark(560, 238, 26)}` },
    ),

  "m4t2-q10": () =>
    svg(
      heading("Service ticket #1042: \"PC can't reach the server\"") +
        checklist(230, 160, 500, [
          { label: "Identified the problem", state: "done" },
          { label: "Found the cause: bad patch cable", state: "done" },
          { label: "Replaced the cable", state: "done" },
          { label: "Close the ticket now?", state: "q" },
        ], { rowH: 90 }),
    ),
};

// Questions 11-15 of each task, and the UC4 practice-step pictures, live in scenes2.cjs.
Object.assign(scenes, require("./scenes2.cjs"));
// UC1 practice-step pictures live in scenes3.cjs.
Object.assign(scenes, require("./scenes3.cjs"));

(async () => {
  const only = process.argv.slice(2);
  const ids = Object.keys(scenes).filter((id) => scenes[id] && (only.length === 0 || only.includes(id)));
  for (const id of ids) {
    // A key with a slash is a path under public/modules (practice-step pictures); anything else
    // is a quiz question id, written to that module's quiz folder.
    const file = id.includes("/")
      ? path.join(OUT, `${id}.webp`)
      : path.join(OUT, `module-${id.match(/^m(\d)t/)[1]}`, "quiz", `${id}.webp`);
    await sharp(Buffer.from(scenes[id]())).webp({ quality: 88 }).toFile(file);
  }
  console.log(`Generated ${ids.length} illustrations`);
  console.log(ids.join(","));
})();
