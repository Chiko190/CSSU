// Second batch of generated pictures: quiz questions 11-15 of each task (the extra questions held in
// reserve -- see QUESTIONS_PER_TASK_QUIZ in src/core/content/loader.ts), and the UC4 practice-step
// pictures. Quiz pictures hide the answer behind a "?"; practice-step pictures SHOW the correct
// action, since those steps teach rather than test. Rendered by generate.cjs.
const L = require("./lib.cjs");
const { C, MONO, text, svg, win, radio, checkbox, field, button, qmark, tick, cross, warnIcon, cmd, checklist, heading, pc, server, printer, switchBox, folder, disk, user, usb, arrow, line, treeRow } = L;

const Q = "#92400e"; // "question" text colour

// ---- Shared scenes ----

function ipv4Dialog(title, { highlightDns = false, values = ["", "", ""] } = {}) {
  const body = `
    ${radio(36, 50, "Obtain an IP address automatically")}
    ${radio(36, 90, "Use the following IP address:", true)}
    ${text(70, 138, "IP address:", { size: 18 })}${field(300, 116, 260, values[0])}
    ${text(70, 182, "Subnet mask:", { size: 18 })}${field(300, 160, 260, values[1])}
    ${text(70, 226, "Default gateway:", { size: 18 })}${field(300, 204, 260, values[2])}
    ${radio(36, 282, "Obtain DNS server address automatically")}
    ${radio(36, 322, "Use the following DNS server addresses:", true)}
    ${highlightDns ? `<rect x="56" y="340" width="520" height="54" rx="6" fill="#fff7e6" stroke="${C.warn}" stroke-width="2"/>` : ""}
    ${text(70, 374, "Preferred DNS server:", { size: 18 })}${field(300, 352, 260, "")}
    ${button(470, 430, 100, "OK", { primary: true })}${button(584, 430, 100, "Cancel")}`;
  return win(130, 40, 700, 520, title, body);
}

function deviceManagerWin(rows, title = "Device Manager", extra = "") {
  const body = rows.map((r, i) => treeRow(36, 44 + i * 38, r.label, r)).join("") + extra;
  return win(150, 40, 660, 520, title, body);
}

/** Windows 7 "Backup and Restore" control panel page. */
function backupRestoreWin({ highlightRestore = false } = {}) {
  const body = `
    ${text(24, 48, "Back up or restore your files", { size: 26, color: "#1e5aa8" })}
    ${text(24, 100, "Backup", { size: 20, weight: 700 })}
    ${text(48, 136, "Location:", { size: 18 })}${text(200, 136, "\\\\SERVER-PC\\Backup", { size: 18 })}
    ${text(48, 168, "Last backup:", { size: 18 })}${text(200, 168, "Today, 10:42 AM", { size: 18 })}
    ${button(500, 118, 150, "Back up now")}
    ${text(24, 240, "Restore", { size: 20, weight: 700 })}
    ${text(48, 280, "You can restore your files that were backed up", { size: 18 })}
    ${text(48, 306, "on the current location.", { size: 18 })}
    ${highlightRestore ? `<rect x="484" y="268" width="182" height="52" rx="8" fill="none" stroke="${C.warn}" stroke-width="4"/>` : ""}
    ${button(492, 276, 166, "Restore my files", { primary: highlightRestore })}`;
  return win(120, 50, 720, 500, "Backup and Restore (Windows 7)", body);
}

function pingBlock(target, ok) {
  const out = [`C:\\Users\\Tech> ping ${target}`];
  if (ok) out.push({ t: `Reply from ${target}: bytes=32 time<1ms TTL=128`, color: "#86efac" });
  else out.push({ t: "Request timed out.", color: "#fca5a5" });
  return out;
}

const cardRow = (y, label, value, { highlight = false, size = 20 } = {}) =>
  `${text(250, y, label, { size, weight: 600 })}${field(470, y - 26, 250, value, { size: 17 })}${highlight ? qmark(760, y - 9, 18) : ""}`;

// ---- Quiz questions 11-15 ----

module.exports = {
  // ===== Module 1, Task 1 =====
  "m1t1-q12": () =>
    svg(
      heading("Disassembly order -- the final steps") +
        checklist(230, 160, 500, [
          { label: "... earlier parts removed ...", state: "done" },
          { label: "Remove the CPU cooler", state: "done" },
          { label: "Remove the  ? ? ?", state: "q" },
          { label: "Remove the motherboard (last)", state: "todo" },
        ], { rowH: 86 }),
    ),

  "m1t1-q14": () =>
    svg(
      heading("Task Sheet 1.1-4: Materials and tools") +
        checklist(250, 150, 460, [
          { label: "Assorted screwdrivers", state: "done" },
          { label: "Flashlight", state: "done" },
          { label: "Flash drive", state: "done" },
          { label: "Protective equipment:  ? ? ?", state: "q" },
        ], { rowH: 86 }),
    ),

  // ===== Module 1, Task 2 =====
  "m1t2-q14": () =>
    svg(
      heading("Reassembly finished -- covers back on") +
        `<rect x="170" y="150" width="200" height="380" rx="14" fill="#374151"/><circle cx="270" cy="210" r="22" fill="#1f2937" stroke="#9ca3af" stroke-width="4"/><path d="M270 196 v14 M259 202 a14 14 0 1 0 22 0" stroke="#e5e7eb" stroke-width="4" fill="none" stroke-linecap="round"/>` +
        `<rect x="200" y="270" width="140" height="10" rx="4" fill="#1f2937"/><rect x="200" y="300" width="140" height="10" rx="4" fill="#1f2937"/>` +
        pc(640, 330, { scale: 1.6, screen: "#111827" }) +
        text(640, 490, "What proves it was assembled correctly?", { size: 22, weight: 600, anchor: "middle", color: Q }) +
        qmark(640, 540, 26),
    ),

  "m1t2-q15": () =>
    svg(
      heading("Just reassembled -- but it won't boot") +
        pc(300, 320, { scale: 1.8, screen: "#000", screenInner: text(0, -10, "No display", { size: 14, color: "#9ca3af", anchor: "middle" }) }) +
        `<rect x="600" y="160" width="220" height="330" rx="14" fill="#374151"/><circle cx="710" cy="210" r="10" fill="#6b7280"/>` +
        text(710, 530, "Power LED: off", { size: 19, anchor: "middle", color: C.muted }) +
        text(480, 120, "Most likely cause?", { size: 22, weight: 600, anchor: "middle", color: Q }) + qmark(480, 520, 26),
    ),

  // ===== Module 1, Task 3 =====
  "m1t3-q11": () =>
    svg(
      heading("Bootable USB -- one step was skipped") +
        checklist(230, 160, 500, [
          { label: "Opened Rufus", state: "done" },
          { label: "Wrote the OS image to the USB drive", state: "done" },
          { label: "Tested the bootable device", state: "x" },
          { label: "Install day on the client's PC: risk?", state: "q" },
        ], { rowH: 86 }),
    ),

  "m1t3-q12": () => {
    const body = `
      ${text(24, 44, "Drive Properties", { size: 22, weight: 700 })}
      ${text(24, 90, "Device", { size: 17, color: C.muted })}${field(24, 100, 552, "USB Flash Drive (E:) [16 GB]")}
      ${text(24, 172, "Partition scheme", { size: 17, color: C.muted })}
      <rect x="24" y="182" width="260" height="34" rx="3" fill="#fff" stroke="${C.warn}" stroke-width="2"/>${text(36, 205, "GPT", { size: 18 })}${text(266, 205, "▾", { size: 18, anchor: "end" })}
      <rect x="24" y="218" width="260" height="76" fill="#fff" stroke="#8a94a3"/>${text(36, 246, "GPT", { size: 18 })}${text(36, 280, "MBR", { size: 18 })}
      ${text(316, 172, "Target system", { size: 17, color: C.muted })}${field(316, 182, 260, "UEFI (non CSM)")}
      ${text(24, 350, "What do GPT and MBR describe?", { size: 21, weight: 600, color: Q })}
      ${button(360, 400, 100, "START", { primary: true })}${button(476, 400, 100, "CLOSE")}`;
    return svg(win(170, 40, 620, 520, "Rufus", body) + qmark(830, 250, 28));
  },

  "m1t3-q13": () =>
    svg(
      heading("Task Sheet 1.2-2, step 1: Turn the computer on") +
        pc(340, 320, { scale: 1.9, screenInner: `<rect x="-44" y="-38" width="88" height="56" rx="3" fill="#fff"/>${text(0, -20, "Rufus", { size: 11, anchor: "middle", weight: 700 })}<rect x="-34" y="-10" width="68" height="6" fill="#cbd5e1"/><rect x="-34" y="2" width="68" height="6" fill="#cbd5e1"/>` }) +
        `<g transform="rotate(90 640 330)">${usb(640, 330, { color: "#0f766e" })}</g>` +
        arrow(600, 330, 480, 330, { color: C.accent }) +
        text(480, 545, "Why does the job start with a working computer?", { size: 21, weight: 600, anchor: "middle", color: Q }) +
        qmark(800, 200, 28),
    ),

  "m1t3-q15": () =>
    svg(
      heading("Graded demonstration: tomorrow") +
        `<rect x="190" y="140" width="250" height="160" rx="6" fill="#fef9c3" stroke="#eab308" transform="rotate(-4 315 220)"/>` +
        text(315, 205, "Windows 10 USB", { size: 22, weight: 700, anchor: "middle" }) + text(315, 240, "ISO written ✓", { size: 20, anchor: "middle" }) +
        usb(315, 400, { scale: 1.4, color: "#1d4ed8" }) +
        checklist(540, 200, 330, [
          { label: "Open Rufus", state: "done" },
          { label: "Write the ISO", state: "done" },
          { label: "? ? ?", state: "q" },
        ], { rowH: 86 }),
    ),

  // ===== Module 1, Task 4 =====
  "m1t4-q11": () =>
    svg(
      heading("After installing Windows -- Disk 0") +
        `<rect x="80" y="170" width="800" height="150" rx="10" fill="#fff" stroke="${C.line}"/>` +
        text(110, 215, "Disk 0", { size: 22, weight: 700 }) + text(110, 245, "465.8 GB", { size: 18, color: C.muted }) +
        `<rect x="240" y="196" width="610" height="100" rx="6" fill="#bfdbfe" stroke="#3b82f6"/>` +
        text(545, 240, "(C:)  Windows -- 465.8 GB NTFS", { size: 22, anchor: "middle", weight: 600 }) +
        text(545, 272, "Healthy (Boot, Primary Partition)", { size: 17, anchor: "middle", color: C.muted }) +
        text(480, 400, "Which task-sheet criterion did this learner miss?", { size: 23, anchor: "middle", weight: 600, color: Q }) +
        qmark(480, 480, 32),
    ),

  "m1t4-q12": () => {
    const card = (x, letter, label, sub) => `<rect x="${x - 150}" y="170" width="300" height="200" rx="14" fill="#fff" stroke="${C.line}" stroke-width="2"/>${text(x, 220, letter, { size: 30, weight: 800, anchor: "middle", color: C.accent })}${text(x, 285, label, { size: 26, weight: 700, anchor: "middle" })}${text(x, 320, sub, { size: 18, anchor: "middle", color: C.muted })}`;
    return svg(
      heading("Setting up a blank computer") +
        card(280, "A", "Operating system", "Windows") + card(680, "B", "Device drivers", "chipset, LAN, audio, video") +
        text(480, 450, "Which has to be installed first -- and why?", { size: 24, weight: 600, anchor: "middle", color: Q }) +
        qmark(480, 520, 28),
    );
  },

  "m1t4-q15": () => {
    const card = (x, y, label) => `<rect x="${x - 170}" y="${y - 40}" width="340" height="80" rx="12" fill="#fff" stroke="${C.line}" stroke-width="2"/>${qmark(x - 130, y, 20)}${text(x - 95, y + 8, label, { size: 21 })}`;
    return svg(
      heading("Task Sheet 1.3-2: three required steps", "Shuffled -- what's the right order?") +
        card(300, 200, "Install missing drivers") + card(660, 290, "Create partitions") + card(320, 400, "Install the OS"),
    );
  },

  // ===== Module 1, Task 5 =====
  "m1t5-q12": () => {
    const layer = (y, label, fill) => `<rect x="200" y="${y}" width="460" height="74" rx="10" fill="${fill}" stroke="${C.line}"/>${text(430, y + 46, label, { size: 23, weight: 600, anchor: "middle" })}${qmark(710, y + 37, 22)}`;
    return svg(
      heading("Three kinds of software -- what does each one do?") +
        layer(120, "Application  (e.g. a web browser)", "#dbeafe") + layer(214, "Operating system  (e.g. Windows)", "#e0e7ff") + layer(308, "Device driver  (e.g. LAN driver)", "#fef3c7") +
        `<rect x="200" y="402" width="460" height="74" rx="10" fill="#e5e7eb" stroke="${C.line}"/>` + text(430, 448, "Hardware", { size: 23, weight: 600, anchor: "middle" }),
    );
  },

  "m1t5-q15": () => {
    const icon = (x, y, color, label) => `<rect x="${x - 28}" y="${y - 28}" width="56" height="56" rx="12" fill="${color}"/>${text(x, y + 50, label, { size: 15, color: "#fff", anchor: "middle" })}`;
    return svg(
      `<rect x="80" y="70" width="800" height="430" rx="14" fill="#374151"/><rect x="96" y="86" width="768" height="398" fill="#1e3a8a"/>` +
        icon(160, 150, "#64748b", "Recycle Bin") + icon(160, 260, "#2563eb", "Web browser") + icon(160, 370, "#16a34a", "Office suite") + icon(280, 150, "#dc2626", "Antivirus") +
        `<rect x="460" y="160" width="360" height="220" rx="10" fill="#fff" opacity="0.95"/>` +
        text(640, 240, "Module 1 complete!", { size: 28, weight: 700, anchor: "middle" }) + text(640, 280, "What did the technician", { size: 20, anchor: "middle", color: C.muted }) + text(640, 306, "accomplish along the way?", { size: 20, anchor: "middle", color: C.muted }) +
        qmark(640, 345, 22) +
        `<rect x="440" y="500" width="80" height="20" fill="#4b5563"/><rect x="380" y="518" width="200" height="12" rx="6" fill="#374151"/>`,
    );
  },

  // ===== Module 2, Task 1 =====
  "m2t1-q9": () =>
    svg(
      heading("Task Sheet 2.1-5: Installing network cables") +
        checklist(250, 170, 460, [
          { label: "1.  ? ? ?", state: "q" },
          { label: "2. Terminate the cable (RJ45)", state: "todo" },
          { label: "3. Test the cable", state: "todo" },
        ], { rowH: 96 }),
    ),

  "m2t1-q11": () =>
    svg(
      heading("A new patch cable -- never tested") +
        pc(200, 300, { label: "PC", scale: 1.1 }) + switchBox(760, 300) +
        `<path d="M290 300 C 420 200, 560 400, 690 300" stroke="#60a5fa" stroke-width="10" fill="none"/>` +
        `<rect x="465" y="270" width="50" height="60" rx="6" fill="#e5e7eb" stroke="#9ca3af"/>` + text(490, 308, "?", { size: 30, weight: 800, anchor: "middle", color: Q }) +
        text(480, 470, "What could go wrong if it's never checked with a LAN tester?", { size: 22, weight: 600, anchor: "middle", color: Q }) + qmark(480, 530, 26),
    ),

  "m2t1-q13": () =>
    svg(
      heading("Planning a cable route across the ceiling") +
        `<rect x="80" y="130" width="800" height="380" rx="10" fill="#fff" stroke="${C.line}"/>` +
        [0, 1, 2].map((i) => `<rect x="${200 + i * 230}" y="190" width="150" height="34" rx="4" fill="#fef9c3" stroke="#eab308"/>${text(275 + i * 230, 213, "fluorescent light", { size: 14, anchor: "middle" })}`).join("") +
        `<line x1="100" y1="300" x2="860" y2="300" stroke="#f97316" stroke-width="10"/>` + text(480, 290, "electrical power line", { size: 16, anchor: "middle", color: "#c2410c" }) +
        `<path d="M110 250 H850" stroke="#3b82f6" stroke-width="6" stroke-dasharray="14 10" fill="none"/>` + text(130, 245, "Route A", { size: 17, weight: 700, color: "#1d4ed8" }) +
        `<path d="M110 460 H850" stroke="#16a34a" stroke-width="6" stroke-dasharray="14 10" fill="none"/>` + text(130, 452, "Route B", { size: 17, weight: 700, color: "#15803d" }) +
        text(480, 560, "Which route is better -- and what should cable stay away from?", { size: 21, weight: 600, anchor: "middle", color: Q }) + qmark(860, 400, 26),
    ),

  // ===== Module 2, Task 2 =====
  "m2t2-q11": () =>
    cmd([
      { t: "C:\\Users\\Tech> ???", color: "#fbbf24", bold: true },
      "",
      "Ethernet adapter Ethernet:",
      "   Description . . . . . . . . . . : Realtek PCIe GbE Family Controller",
      "   Physical Address. . . . . . . . : 3C-52-82-1A-7F-04",
      "   DHCP Enabled. . . . . . . . . . : Yes",
      "   IPv4 Address. . . . . . . . . . : 192.168.1.25(Preferred)",
      "   Subnet Mask . . . . . . . . . . : 255.255.255.0",
      "   Default Gateway . . . . . . . . : 192.168.1.1",
      "   DHCP Server . . . . . . . . . . : 192.168.1.1",
      "   DNS Servers . . . . . . . . . . : 192.168.1.1",
    ], { size: 19 }),

  "m2t2-q13": () => {
    const rows = [["DHCP Client", "Running", "Automatic"], ["DNS Client", "Running", "Automatic"], ["? ? ? ? ? ?", "Stopped", "Manual"], ["? ? ? ? ? ?", "Stopped", "Manual"], ["Print Spooler", "Running", "Automatic"]];
    const body = `
      ${text(24, 40, "Name", { size: 18, weight: 700 })}${text(360, 40, "Status", { size: 18, weight: 700 })}${text(500, 40, "Startup Type", { size: 18, weight: 700 })}
      ${rows.map(([n, s, t], i) => `${i === 2 || i === 3 ? `<rect x="12" y="${62 + i * 46}" width="676" height="40" fill="#fff7e6"/>` : ""}<circle cx="34" cy="${82 + i * 46}" r="9" fill="#94a3b8"/>${text(54, 88 + i * 46, n, { size: 18, color: i === 2 || i === 3 ? Q : C.ink, weight: i === 2 || i === 3 ? 700 : 400 })}${text(360, 88 + i * 46, s, { size: 18 })}${text(500, 88 + i * 46, t, { size: 18 })}`).join("")}
      ${text(24, 360, "Network discovery can't find the shared PCs.", { size: 19, color: Q, weight: 600 })}`;
    return svg(win(130, 70, 700, 460, "Services (Local)  -- services.msc", body) + qmark(830, 210, 28));
  },

  "m2t2-q14": () => {
    const octet = (x, v, color) => `<rect x="${x}" y="0" width="120" height="56" rx="8" fill="${color}" stroke="${C.line}"/>${text(x + 60, 37, v, { size: 26, weight: 700, anchor: "middle", font: MONO })}`;
    const row = (y, label, vals, colors) => `<g transform="translate(250,${y})">${vals.map((v, i) => octet(i * 140, v, colors[i])).join("")}</g>${text(230, y + 37, label, { size: 20, weight: 600, anchor: "end" })}`;
    return svg(
      heading("IP address and subnet mask") +
        row(160, "IP address", ["192", "168", "1", "25"], ["#fff", "#fff", "#fff", "#fff"]) +
        row(250, "Subnet mask", ["255", "255", "255", "0"], ["#e0e7ff", "#e0e7ff", "#e0e7ff", "#fef3c7"]) +
        `<path d="M250 340 v20 h400 v-20" stroke="${C.accent}" stroke-width="3" fill="none"/>` + qmark(450, 395, 24) +
        `<path d="M670 340 v20 h120 v-20" stroke="${C.warn}" stroke-width="3" fill="none"/>` + qmark(730, 395, 24) +
        text(480, 490, "What does the mask tell you about each part of the address?", { size: 21, weight: 600, anchor: "middle", color: Q }),
    );
  },

  "m2t2-q15": () =>
    svg(
      heading("Job Sheet 2.2-2 -- learner's progress") +
        checklist(230, 160, 500, [
          { label: "Configured the NIC settings", state: "done" },
          { label: "Configured the router (SSID, password)", state: "done" },
          { label: "Shared a folder", state: "done" },
          { label: "Never checked anything afterwards...", state: "q" },
        ], { rowH: 86 }),
    ),

  // ===== Module 3, Task 1 =====
  "m3t1-q11": L.server2012(() => {
    const body = `
      ${treeRow(30, 40, "Forest: css.org", { expanded: true })}
      ${treeRow(30, 80, "Domains", { expanded: true, indent: 1 })}
      ${treeRow(30, 120, "css.org", { expanded: true, indent: 2 })}
      ${treeRow(30, 160, "Default Domain Policy", { indent: 3 })}
      ${treeRow(30, 200, "Redirection  (OU)", { expanded: true, indent: 3 })}
      <rect x="130" y="222" width="280" height="36" rx="4" fill="#fff7e6" stroke="${C.warn}" stroke-width="2"/>
      ${treeRow(30, 240, "Redirection  (GPO, linked)", { indent: 4 })}
      ${user(520, 340, { label: "UserOne", scale: 0.8 })}${user(640, 340, { label: "UserTwo", scale: 0.8 })}
      ${arrow(420, 250, 500, 300, { color: C.warn })}`;
    return svg(win(110, 60, 740, 480, "Group Policy Management", body) + qmark(800, 200, 30));
  }),

  "m3t1-q12": () =>
    svg(
      heading("Folder redirection on the client") +
        [0, 1, 2].map((i) => folder(170 + i * 150, 280, { scale: 0.9 }) + qmark(170 + i * 150, 290, 20)).join("") +
        text(320, 370, "Which three folders?", { size: 21, weight: 600, anchor: "middle", color: Q }) +
        arrow(500, 280, 620, 280, { color: C.accent, dashed: true }) +
        server(760, 270, { label: "SERVER", sub: "\\\\SERVER\\UserFiles" }) + text(760, 400, "Windows Server 2012 R2", { size: 16, anchor: "middle", color: C.muted }),
    ),

  "m3t1-q14": () => svg(ipv4Dialog("Client-PC 1 -- Ethernet -- IPv4 Properties", { highlightDns: true, values: ["10.10.0.101", "255.255.255.0", "10.10.0.1"] }) + qmark(840, 405, 30) + text(480, 585, "Before joining css.org: what goes in the highlighted box?", { size: 19, weight: 600, anchor: "middle", color: Q })),

  // ===== Module 3, Task 2 =====
  "m3t2-q11": L.server2012(() => {
    const body = `
      ${warnIcon(60, 70, 3)}
      ${text(120, 60, "Remote Desktop can't connect to the", { size: 21, weight: 700 })}
      ${text(120, 88, "remote computer.", { size: 21, weight: 700 })}
      ${text(32, 150, "Computer: 10.10.0.101   (connecting from the Server-PC)", { size: 18, color: C.muted })}
      ${text(32, 186, "Make sure the remote computer is turned on and", { size: 17 })}
      ${text(32, 210, "connected to the network...", { size: 17 })}
      ${button(476, 250, 110, "OK", { primary: true })}`;
    return svg(win(170, 120, 620, 340, "Remote Desktop Connection", body) + text(480, 530, "What should you check first on the client?", { size: 22, weight: 600, anchor: "middle", color: Q }) + qmark(840, 160, 28));
  }),

  "m3t2-q12": () =>
    svg(
      heading("Job Sheet 3.2-2: two halves") +
        server(480, 250, { label: "Server-PC", sub: "Windows Server 2012 R2" }) +
        pc(180, 420, { label: "Client-PC", sub: "remote desktop", scale: 0.8 }) + printer(780, 420, { label: "Network printer", scale: 0.8 }) +
        arrow(420, 310, 260, 380, { color: C.accent, dashed: true }) + arrow(540, 310, 700, 380, { color: C.accent, dashed: true }) +
        text(480, 570, "What do both halves have in common?", { size: 21, weight: 600, anchor: "middle", color: Q }) + qmark(480, 420, 26),
    ),

  "m3t2-q13": () =>
    svg(
      heading("Deploying a printer to every client") +
        server(220, 300, { label: "Print server", sub: "Windows Server 2012 R2" }) + arrow(300, 300, 400, 300, { color: C.accent }) +
        printer(500, 300, { scale: 0.9 }) +
        `<rect x="640" y="170" width="220" height="280" rx="10" fill="#fff" stroke="${C.line}" stroke-width="2"/><rect x="700" y="155" width="100" height="30" rx="6" fill="#94a3b8"/>` +
        [0, 1, 2, 3, 4].map((i) => `<rect x="665" y="${220 + i * 36}" width="${i === 4 ? 100 : 170}" height="10" rx="5" fill="#cbd5e1"/>`).join("") +
        text(750, 490, "The checklist says deployment must follow...", { size: 17, anchor: "middle", color: Q, weight: 600 }) + qmark(750, 540, 24),
    ),

  "m3t2-q14": () => {
    const rows = ["Added the Print and Document Services role", "Installed the network printer", "Deployed it to the clients", "Printed a test page from the client", "Performed a remote desktop connection"];
    return svg(
      heading("Performance criteria checklist") +
        `<rect x="110" y="110" width="740" height="430" rx="10" fill="#fff" stroke="${C.line}"/>` +
        text(140, 150, "Did you...", { size: 20, weight: 700 }) + text(700, 150, "YES", { size: 18, weight: 700, anchor: "middle" }) + text(790, 150, "NO", { size: 18, weight: 700, anchor: "middle" }) +
        rows.map((r, i) => `${text(140, 210 + i * 62, r, { size: 19 })}<rect x="684" y="${190 + i * 62}" width="32" height="28" fill="#fff" stroke="#9ca3af"/><rect x="774" y="${190 + i * 62}" width="32" height="28" fill="#fff" stroke="#9ca3af"/>`).join("") +
        qmark(880, 110, 26),
    );
  },

  "m3t2-q15": () =>
    svg(
      heading("Module 3 complete -- the finished network") +
        server(200, 260, { label: "DC: css.org", sub: "Windows Server 2012 R2" }) + switchBox(480, 260) +
        pc(760, 180, { label: "Client-PC 1", scale: 0.65 }) + pc(760, 400, { label: "Client-PC 2", scale: 0.65 }) + printer(480, 450, { label: "Printer", scale: 0.65 }) +
        line(270, 260, 408, 260) + line(552, 250, 700, 190) + line(552, 270, 700, 400) + line(480, 314, 480, 390) +
        text(200, 470, "What has been built?", { size: 21, weight: 600, anchor: "middle", color: Q }) + qmark(200, 520, 24),
    ),

  // ===== Module 4, Task 1 =====
  "m4t1-q12": () => {
    const bar = (x, h, label, color) => `<rect x="${x}" y="${460 - h}" width="110" height="${h}" rx="6" fill="${color}"/>${text(x + 55, 495, label, { size: 19, anchor: "middle", weight: 600 })}`;
    return svg(
      heading("Two backup types over three days", "Bar height = how much data each backup copies") +
        bar(100, 250, "Mon", "#3b82f6") + bar(220, 250, "Tue", "#3b82f6") + bar(340, 250, "Wed", "#3b82f6") + text(275, 540, "Type A", { size: 22, weight: 700, anchor: "middle", color: "#1d4ed8" }) +
        bar(520, 250, "Mon", "#16a34a") + bar(640, 50, "Tue", "#16a34a") + bar(760, 70, "Wed", "#16a34a") + text(685, 540, "Type B", { size: 22, weight: 700, anchor: "middle", color: "#15803d" }) +
        `<line x1="480" y1="190" x2="480" y2="520" stroke="${C.line}" stroke-width="2"/>` + qmark(860, 160, 26),
    );
  },

  "m4t1-q13": () =>
    svg(
      heading("Not just accidental deletion...") +
        disk(300, 300, { scale: 2 }) +
        `<path d="M240 220 l40 50 l-20 20 l50 60" stroke="${C.bad}" stroke-width="7" fill="none" stroke-linecap="round"/>` +
        text(300, 460, "Click... click... click...", { size: 22, italic: true, anchor: "middle", color: C.muted }) +
        `<rect x="560" y="200" width="300" height="190" rx="10" fill="#fff" stroke="${C.line}"/>` + warnIcon(610, 250, 2) +
        text(650, 258, "Disk not found", { size: 22, weight: 700 }) + text(590, 310, "No bootable device --", { size: 18 }) + text(590, 338, "insert boot disk", { size: 18 }) +
        text(480, 540, "What else can a backup protect against?", { size: 22, weight: 600, anchor: "middle", color: Q }) + qmark(860, 160, 26),
    ),

  "m4t1-q14": () =>
    svg(
      heading("Backing up over the network") +
        pc(170, 300, { label: "Client-PC", sub: "10.10.0.101", scale: 0.9 }) + switchBox(480, 300) + server(790, 290, { label: "Server-PC", sub: "10.10.0.1" }) +
        line(240, 300, 408, 300) + line(552, 300, 734, 300) +
        arrow(230, 220, 730, 200, { color: C.accent, dashed: true }) + text(480, 190, "backup", { size: 18, anchor: "middle", color: C.accent }) +
        `<rect x="640" y="420" width="300" height="100" rx="10" fill="#fff7e6" stroke="${C.warn}" stroke-width="2"/>` + text(790, 462, "What must be true of", { size: 19, anchor: "middle", color: Q, weight: 600 }) + text(790, 490, "the Server-PC?", { size: 19, anchor: "middle", color: Q, weight: 600 }) + qmark(620, 420, 22),
    ),

  // ===== Module 4, Task 2 =====
  "m4t2-q11": () => {
    const leds = (x, off) => Array.from({ length: 8 }, (_, i) => `<circle cx="${x}" cy="${170 + i * 42}" r="13" fill="${i === off ? "#374151" : "#22c55e"}" stroke="#14532d"/>${text(x + 30, 177 + i * 42, String(i + 1), { size: 18, color: "#fff", weight: 700 })}`).join("");
    return svg(
      heading("LAN cable tester result") +
        `<rect x="210" y="120" width="200" height="380" rx="20" fill="#e5e7eb" stroke="#9ca3af" stroke-width="3"/><rect x="240" y="140" width="140" height="350" rx="10" fill="#1f2937"/>` + leds(285, 2) +
        `<rect x="560" y="140" width="160" height="340" rx="18" fill="#e5e7eb" stroke="#9ca3af" stroke-width="3"/><rect x="585" y="160" width="110" height="300" rx="8" fill="#1f2937"/>` +
        Array.from({ length: 8 }, (_, i) => `<circle cx="625" cy="${180 + i * 36}" r="11" fill="${i === 2 ? "#374151" : "#22c55e"}"/>`).join("") +
        `<path d="M410 470 C 470 560, 520 560, 560 470" stroke="#60a5fa" stroke-width="10" fill="none"/>` +
        text(420, 262, "← pin 3 dark", { size: 20, weight: 700, color: C.bad }) + qmark(820, 260, 28),
    );
  },

  "m4t2-q12": () =>
    svg(
      heading("Is this RAM stick the faulty part?") +
        `<rect x="140" y="230" width="280" height="64" rx="4" fill="#15803d"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${156 + i * 38}" y="242" width="26" height="32" fill="#111827"/>`).join("")}` + text(280, 330, "Suspect stick", { size: 20, weight: 600, anchor: "middle" }) + cross(410, 225, C.bad, 18) +
        `<rect x="540" y="230" width="280" height="64" rx="4" fill="#15803d"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${556 + i * 38}" y="242" width="26" height="32" fill="#111827"/>`).join("")}` + text(680, 330, "Known-good stick", { size: 20, weight: 600, anchor: "middle" }) + tick(810, 225, C.good, 18) +
        text(480, 450, "What's the best way to prove which part is bad?", { size: 22, weight: 600, anchor: "middle", color: Q }) + qmark(480, 520, 28),
    ),

  "m4t2-q13": () =>
    svg(
      heading("About to reseat the RAM") +
        `<rect x="150" y="140" width="320" height="380" rx="12" fill="#374151"/><rect x="180" y="170" width="260" height="320" rx="6" fill="#4b5563"/>` +
        [0, 1].map((i) => `<rect x="${300 + i * 34}" y="200" width="20" height="200" rx="3" fill="#15803d"/>`).join("") +
        `<rect x="200" y="420" width="80" height="60" rx="4" fill="#6b7280"/>` +
        checklist(540, 200, 340, [
          { label: "Safety step 1", state: "q" },
          { label: "Safety step 2", state: "q" },
          { label: "Safety step 3", state: "q" },
        ], { rowH: 90 }),
    ),

  "m4t2-q14": () =>
    svg(
      heading("Service report") +
        `<rect x="200" y="100" width="560" height="460" rx="12" fill="#fff" stroke="${C.line}" stroke-width="2"/>` +
        text(230, 150, "Ticket #1042    Date: ____    Technician: ____", { size: 18, color: C.muted }) +
        [0, 1, 2, 3].map((i) => `${qmark(250, 215 + i * 85, 18)}<rect x="285" y="${195 + i * 85}" width="440" height="40" rx="6" fill="#f9fafb" stroke="${C.line}"/>`).join("") +
        text(480, 590, "Which details belong in each section?", { size: 19, weight: 600, anchor: "middle", color: Q }),
    ),

  "m4t2-q15": () =>
    cmd([
      ...pingBlock("127.0.0.1", true), "",
      ...pingBlock("10.10.0.101", true), { t: "   (the PC's own IP address)", color: "#9ca3af" }, "",
      ...pingBlock("10.10.0.1", false), "Request timed out.", { t: "   (the server)", color: "#9ca3af" }, "",
      { t: "Where is the fault most likely?", color: "#fbbf24", bold: true },
    ]),

  // ===== UC4 practice-step pictures (these SHOW the right action) =====
  "module-4/images/restore-files": () =>
    svg(backupRestoreWin({ highlightRestore: true }) + arrow(860, 470, 790, 410, { color: C.warn, width: 6 })),

  "module-4/images/select-backup-file": () => {
    const body = `
      ${text(24, 48, "Browse or search your backup for files and folders", { size: 22, color: "#1e5aa8" })}
      ${text(24, 90, "Backups available on \\\\SERVER-PC\\Backup:", { size: 18 })}
      <rect x="24" y="106" width="620" height="200" fill="#fff" stroke="#8a94a3"/>
      ${text(40, 134, "Backup period", { size: 17, weight: 700 })}${text(400, 134, "Computer", { size: 17, weight: 700 })}
      <rect x="26" y="150" width="616" height="44" fill="#cce4f7" stroke="${C.accent}"/>
      ${text(40, 178, "Today, 10:42 AM  (the one you just made)", { size: 18, weight: 600 })}${text(400, 178, "CLIENT-PC", { size: 18 })}
      ${text(40, 228, "Last week", { size: 18, color: C.muted })}${text(400, 228, "CLIENT-PC", { size: 18, color: C.muted })}
      ${text(40, 278, "Two weeks ago", { size: 18, color: C.muted })}${text(400, 278, "CLIENT-PC", { size: 18, color: C.muted })}
      ${text(24, 340, "Files: D:\\MyFiles", { size: 18 })}
      ${button(424, 360, 100, "Next", { primary: true })}${button(540, 360, 100, "Cancel")}`;
    return svg(win(130, 60, 680, 470, "Restore Files", body) + tick(830, 230, C.good, 22));
  },

  "module-4/images/restore-original-location": () => {
    const body = `
      ${text(24, 52, "Where do you want to restore your files?", { size: 24, color: "#1e5aa8" })}
      <rect x="24" y="84" width="600" height="56" rx="6" fill="#dcfce7" stroke="${C.good}" stroke-width="2"/>
      ${radio(52, 112, "In the original location   (D:\\MyFiles)", true, 20)}
      ${radio(52, 176, "In the following location:", false, 20)}
      ${field(82, 194, 380, "")}${button(476, 193, 120, "Browse...")}
      <rect x="396" y="322" width="126" height="52" rx="8" fill="none" stroke="${C.warn}" stroke-width="4"/>
      ${button(404, 330, 110, "Restore", { primary: true })}${button(528, 330, 100, "Cancel")}`;
    return svg(win(150, 90, 660, 430, "Restore Files", body));
  },

  "module-4/images/verify-restored-files": () => {
    const body = `
      <rect width="760" height="44" fill="#f8fafc"/>${text(20, 29, "This PC  ›  Local Disk (D:)", { size: 18 })}
      <rect x="0" y="44" width="200" height="376" fill="#f8fafc"/>
      ${["Quick access", "This PC", "Local Disk (C:)", "Local Disk (D:)", "Network"].map((s, i) => text(20, 84 + i * 36, s, { size: 17, weight: i === 3 ? 700 : 400 })).join("")}
      ${text(224, 76, "Name", { size: 17, weight: 700 })}${text(520, 76, "Date modified", { size: 17, weight: 700 })}
      ${folder(244, 112, { scale: 0.28 })}${text(270, 120, "Downloads", { size: 18 })}
      <rect x="214" y="138" width="530" height="40" fill="#dcfce7" stroke="${C.good}" stroke-width="2"/>
      ${folder(244, 158, { scale: 0.28 })}${text(270, 166, "MyFiles   -- back, with all 3 files", { size: 18, weight: 600 })}`;
    return svg(win(100, 60, 760, 460, "Local Disk (D:)", body) + tick(820, 260, C.good, 28));
  },

  "module-4/images/ts-gather-info": () =>
    svg(
      heading("Step 1: Identify the problem -- talk to the user") +
        user(170, 300, { scale: 2.2, label: "" }) + text(170, 420, "User", { size: 20, weight: 600, anchor: "middle" }) +
        `<rect x="300" y="130" width="560" height="380" rx="12" fill="#fff" stroke="${C.line}" stroke-width="2"/>` +
        text(330, 175, "Help desk ticket #1042", { size: 22, weight: 700 }) +
        [["What happened?", "\"My PC can't open the shared folder.\""], ["When did it start?", "\"This morning.\""], ["What changed?", "\"Desk was moved yesterday.\""], ["Any error message?", "\"Network cable unplugged.\""]]
          .map(([q, a], i) => text(330, 230 + i * 70, q, { size: 19, weight: 700 }) + text(350, 258 + i * 70, a, { size: 18, color: "#374151", italic: true })).join(""),
    ),

  "module-4/images/ts-device-manager": () =>
    svg(
      deviceManagerWin(
        [
          { label: "DESKTOP-OFFICE01", expanded: true },
          { label: "Audio inputs and outputs", expanded: false, indent: 1 },
          { label: "Display adapters", expanded: false, indent: 1 },
          { label: "Keyboards", expanded: false, indent: 1 },
          { label: "Network adapters", expanded: true, indent: 1 },
          { label: "Realtek PCIe GbE Family Controller", warn: true, indent: 2 },
          { label: "Ports (COM & LPT)", expanded: false, indent: 1 },
          { label: "Processors", expanded: false, indent: 1 },
        ],
        "Device Manager",
        `<rect x="70" y="218" width="380" height="40" rx="4" fill="none" stroke="${C.warn}" stroke-width="3"/>${text(470, 244, "← driver problem", { size: 17, weight: 600, color: Q })}`,
      ),
    ),

  "module-4/images/ts-ping-test": () =>
    cmd([
      { t: "1) Loopback -- is TCP/IP working on this PC?", color: "#93c5fd" },
      ...pingBlock("127.0.0.1", true), "",
      { t: "2) Own IP -- is the network card working?", color: "#93c5fd" },
      ...pingBlock("10.10.0.101", true), "",
      { t: "3) Server -- can the PC reach the network?", color: "#93c5fd" },
      ...pingBlock("10.10.0.1", true),
    ]),

  "module-4/images/ts-apply-fix": () =>
    svg(
      heading("Apply the fix: swap in a known-good cable") +
        `<path d="M120 260 C 220 180, 320 340, 420 260" stroke="#94a3b8" stroke-width="10" fill="none"/>` + text(270, 350, "Faulty cable (pin 3 open)", { size: 19, anchor: "middle", weight: 600 }) + cross(270, 200, C.bad, 22) +
        arrow(450, 270, 520, 270, { color: C.accent, width: 6 }) +
        `<path d="M550 260 C 650 180, 750 340, 850 260" stroke="#3b82f6" stroke-width="10" fill="none"/>` + text(700, 350, "Known-good, tested cable", { size: 19, anchor: "middle", weight: 600 }) + tick(700, 200, C.good, 22) +
        `<rect x="200" y="410" width="560" height="120" rx="10" fill="#fff" stroke="${C.line}"/>` +
        text(230, 452, "Follow manufacturer instructions and OH&S:", { size: 19, weight: 700 }) + text(230, 486, "power off before opening a PC, wear an anti-static strap.", { size: 18 }),
    ),

  "module-4/images/ts-test-verify": () =>
    cmd([
      "C:\\Users\\Tech> ping 10.10.0.1",
      "",
      "Pinging 10.10.0.1 with 32 bytes of data:",
      { t: "Reply from 10.10.0.1: bytes=32 time<1ms TTL=128", color: "#86efac" },
      { t: "Reply from 10.10.0.1: bytes=32 time<1ms TTL=128", color: "#86efac" },
      { t: "Reply from 10.10.0.1: bytes=32 time<1ms TTL=128", color: "#86efac" },
      { t: "Reply from 10.10.0.1: bytes=32 time<1ms TTL=128", color: "#86efac" },
      "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)",
      "",
      "C:\\Users\\Tech> start \\\\10.10.0.1\\UserFiles",
      { t: "   Shared folder opened -- the user's problem is fixed.", color: "#86efac" },
    ]),

  "module-4/images/ts-document": () => {
    const rows = [["Problem", "PC can't open the shared folder"], ["Cause", "Damaged patch cable (pin 3 open)"], ["Fix applied", "Replaced with a tested cable"], ["Test results", "Ping server OK, share opens"]];
    return svg(
      heading("Document it: the service report") +
        `<rect x="160" y="110" width="640" height="440" rx="12" fill="#fff" stroke="${C.line}" stroke-width="2"/>` +
        text(190, 160, "Ticket #1042    Technician: J. Cruz    Status: Closed", { size: 18, color: C.muted }) +
        rows.map(([k, v], i) => `${text(190, 225 + i * 82, k, { size: 20, weight: 700 })}<rect x="350" y="${200 + i * 82}" width="420" height="40" rx="6" fill="#f9fafb" stroke="${C.line}"/>${text(362, 226 + i * 82, v, { size: 18 })}`).join(""),
    );
  },
};
