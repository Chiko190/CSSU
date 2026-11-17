// UC1 practice-step pictures (module-1 activity.ts) for the steps with no 3D model: the safety and
// power steps of Task 1 and the software steps of Tasks 3-5. Practice steps teach, so each picture
// SHOWS the correct action. Rendered by generate.cjs into public/modules/module-1/images/.
const L = require("./lib.cjs");
const { C, text, svg, win, radio, field, button, tick, cross, warnIcon, heading, pc, usb, arrow, treeRow, checkbox } = L;

/** Rufus main window. `state`: "ready" (device + ISO chosen), "warning" (START pressed: data-loss
 * prompt) or "done" (progress bar full). */
function rufus(state) {
  const status = state === "done" ? "READY" : state === "warning" ? "Preparing..." : "READY";
  const body = `
    ${text(24, 44, "Drive Properties", { size: 22, weight: 700 })}
    ${text(24, 84, "Device", { size: 16, color: C.muted })}${field(24, 92, 552, "USB Flash Drive (E:) [16 GB]")}
    ${text(24, 150, "Boot selection", { size: 16, color: C.muted })}${field(24, 158, 420, "Windows_Server_2012_R2_x64.iso")}${button(460, 157, 116, "SELECT")}
    ${text(24, 216, "Partition scheme", { size: 16, color: C.muted })}${field(24, 224, 260, "GPT")}
    ${text(316, 216, "Target system", { size: 16, color: C.muted })}${field(316, 224, 260, "UEFI (non CSM)")}
    ${text(24, 284, "File system", { size: 16, color: C.muted })}${field(24, 292, 260, "FAT32 (Default)")}
    ${text(24, 362, "Status", { size: 20, weight: 700 })}
    <rect x="24" y="374" width="552" height="32" fill="#e5e7eb" stroke="#cbd5e1"/>
    ${state === "done" ? `<rect x="24" y="374" width="552" height="32" fill="#16a34a"/>` : ""}
    ${text(300, 396, status, { size: 16, anchor: "middle", color: state === "done" ? "#fff" : C.ink, weight: 600 })}
    ${button(360, 430, 100, "START", { primary: state === "ready" })}${button(476, 430, 100, "CLOSE")}`;
  return win(170, 20, 620, 540, "Rufus 4.5", body);
}

function setupWindow(title, inner) {
  return win(110, 50, 740, 500, title, inner, { titleBg: "#1e3a8a", titleColor: "#fff" });
}

function installer(appTitle, line1, pct, color) {
  const body = `
    <rect width="620" height="120" fill="${color}"/>
    ${text(32, 70, appTitle, { size: 30, weight: 700, color: "#fff" })}
    ${text(32, 180, line1, { size: 20 })}
    <rect x="32" y="206" width="556" height="20" rx="10" fill="#e5e7eb"/><rect x="32" y="206" width="${Math.round(556 * pct)}" height="20" rx="10" fill="${color}"/>
    ${text(588, 252, `${Math.round(pct * 100)}%`, { size: 18, anchor: "end", color: C.muted })}
    ${button(488, 300, 100, "Cancel")}`;
  return win(170, 110, 620, 400, appTitle + " Setup", body);
}

module.exports = {
  "module-1/images/follow-ohs": () => {
    const item = (x, y, label, draw) => `<rect x="${x - 100}" y="${y - 90}" width="200" height="200" rx="14" fill="#fff" stroke="${C.line}"/>${draw}${text(x, y + 88, label, { size: 18, weight: 600, anchor: "middle" })}${tick(x + 80, y - 70, C.good, 16)}`;
    const glasses = (x, y) => `<g transform="translate(${x},${y})"><path d="M-70 -10 h140" stroke="#334155" stroke-width="6"/><rect x="-66" y="-14" width="58" height="40" rx="14" fill="#bfdbfe" stroke="#334155" stroke-width="5"/><rect x="8" y="-14" width="58" height="40" rx="14" fill="#bfdbfe" stroke="#334155" stroke-width="5"/></g>`;
    const strap = (x, y) => `<g transform="translate(${x},${y})"><rect x="-40" y="-16" width="80" height="34" rx="17" fill="none" stroke="#2563eb" stroke-width="10"/><path d="M40 0 c30 0 20 40 50 40" stroke="#2563eb" stroke-width="4" fill="none"/><rect x="82" y="34" width="16" height="12" fill="#9ca3af"/></g>`;
    const plug = (x, y) => `<g transform="translate(${x},${y})"><rect x="-30" y="-30" width="60" height="50" rx="8" fill="#374151"/><rect x="-16" y="-52" width="8" height="24" fill="#9ca3af"/><rect x="8" y="-52" width="8" height="24" fill="#9ca3af"/><path d="M0 20 v30" stroke="#374151" stroke-width="8"/></g>`;
    const desk = (x, y) => `<g transform="translate(${x},${y})"><rect x="-70" y="-6" width="140" height="12" fill="#a16207"/><rect x="-60" y="6" width="10" height="40" fill="#a16207"/><rect x="50" y="6" width="10" height="40" fill="#a16207"/><rect x="-40" y="-40" width="50" height="34" rx="4" fill="#64748b"/><rect x="20" y="-28" width="30" height="22" rx="3" fill="#94a3b8"/></g>`;
    return svg(
      heading("Safety first: OH&S and PPE") +
        item(150, 260, "Safety eyewear", glasses(150, 240)) + item(370, 260, "Anti-static strap", strap(355, 240)) +
        item(590, 260, "Clean, dry work area", desk(590, 245)) + item(810, 260, "Unplugged power", plug(810, 250)) +
        text(480, 470, "Protective equipment and a safe workspace come before any tool touches the PC.", { size: 19, anchor: "middle", color: C.muted }),
    );
  },

  "module-1/images/verify-working": () => {
    const post = `${text(-56, -38, "BIOS v2.1  POST", { size: 9, color: "#e5e7eb", font: L.MONO })}${text(-56, -24, "CPU ........ OK", { size: 9, color: "#86efac", font: L.MONO })}${text(-56, -10, "Memory 8 GB  OK", { size: 9, color: "#86efac", font: L.MONO })}${text(-56, 4, "Drives ..... OK", { size: 9, color: "#86efac", font: L.MONO })}`;
    return svg(
      heading("Before opening it: confirm the PC works") +
        `<rect x="140" y="170" width="170" height="320" rx="12" fill="#374151"/><circle cx="225" cy="215" r="16" fill="#1f2937" stroke="#4ade80" stroke-width="4"/><circle cx="225" cy="260" r="6" fill="#4ade80"/>` +
        pc(560, 330, { scale: 2, screen: "#0b1220", screenInner: post }) +
        tick(780, 190, C.good, 28) + text(560, 520, "It boots and passes POST -- now you have a baseline.", { size: 20, anchor: "middle", weight: 600 }),
    );
  },

  "module-1/images/power-off": () => {
    const menu = `<rect x="80" y="160" width="300" height="230" rx="10" fill="#1f2937"/>` +
      ["Sleep", "Shut down", "Restart"].map((s, i) => `${i === 1 ? `<rect x="92" y="${190 + i * 60}" width="276" height="46" rx="6" fill="#2563eb"/>` : ""}${text(120, 221 + i * 60, s, { size: 21, color: "#fff", weight: i === 1 ? 700 : 400 })}`).join("");
    const plug = `<g transform="translate(700,300)"><rect x="-60" y="-60" width="120" height="120" rx="10" fill="#e5e7eb" stroke="#9ca3af"/><rect x="-26" y="-30" width="12" height="30" fill="#374151"/><rect x="14" y="-30" width="12" height="30" fill="#374151"/></g>` +
      `<g transform="translate(860,300)"><rect x="-40" y="-36" width="70" height="72" rx="10" fill="#374151"/><rect x="-62" y="-18" width="24" height="10" fill="#9ca3af"/><rect x="-62" y="8" width="24" height="10" fill="#9ca3af"/><path d="M30 0 h60" stroke="#374151" stroke-width="12"/></g>` +
      arrow(790, 250, 850, 250, { color: C.bad, width: 5 });
    return svg(
      heading("Turn it off -- then unplug it") +
        menu + text(230, 430, "1. Start > Power > Shut down", { size: 19, anchor: "middle", weight: 600 }) +
        arrow(410, 280, 560, 280, { color: "#94a3b8" }) +
        plug + text(760, 430, "2. Unplug the power cord", { size: 19, anchor: "middle", weight: 600 }),
    );
  },

  "module-1/images/power-on": () =>
    svg(
      heading("Reassembled -- power it back on") +
        `<rect x="150" y="160" width="190" height="340" rx="14" fill="#374151"/><circle cx="245" cy="215" r="26" fill="#1f2937" stroke="#4ade80" stroke-width="5"/><path d="M245 199 v16 M232 206 a17 17 0 1 0 26 0" stroke="#4ade80" stroke-width="4" fill="none" stroke-linecap="round"/>` +
        `<path d="M300 200 l40 -30" stroke="#fde047" stroke-width="4"/><path d="M305 225 h45" stroke="#fde047" stroke-width="4"/><path d="M300 250 l40 30" stroke="#fde047" stroke-width="4"/>` +
        pc(620, 320, { scale: 2, screen: "#1e40af", screenInner: `${text(0, -12, "Welcome", { size: 16, color: "#fff", anchor: "middle", weight: 600 })}<circle cx="0" cy="10" r="6" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 4"/>` }) +
        tick(840, 180, C.good, 26) + text(480, 540, "Fans spin, POST passes, Windows loads: the rebuild worked.", { size: 20, anchor: "middle", weight: 600 }),
    ),

  "module-1/images/open-rufus": () => svg(rufus("ready")),

  "module-1/images/follow-bootable-instructions": () => {
    const dialog = `<rect x="250" y="180" width="460" height="230" fill="#fff" stroke="#9ca3af"/>${warnIcon(300, 240, 2.2)}` +
      text(345, 234, "WARNING: ALL DATA ON DEVICE", { size: 18, weight: 700 }) + text(345, 260, "'USB Flash Drive (E:)' WILL BE DESTROYED.", { size: 17, weight: 700 }) +
      text(270, 310, "To continue with this operation, click OK.", { size: 16 }) +
      button(470, 350, 100, "OK", { primary: true }) + button(590, 350, 100, "Cancel");
    return svg(rufus("warning") + `<rect x="0" y="0" width="960" height="600" fill="#000" opacity="0.25"/>` + dialog +
      text(480, 590, "Read each prompt and the license terms before you click OK.", { size: 18, anchor: "middle", weight: 600 }));
  },

  "module-1/images/test-bootable-device": () => {
    const body = `
      ${text(30, 50, "Please select boot device:", { size: 22, color: "#fff", font: L.MONO })}
      ${["Windows Boot Manager (ST500DM002)", "USB: Kingston DataTraveler 16GB", "UEFI: Network Boot (IPv4)", "Enter Setup"].map((s, i) => `${i === 1 ? `<rect x="22" y="${80 + i * 48}" width="560" height="40" fill="#e5e7eb"/>` : ""}${text(40, 108 + i * 48, s, { size: 21, color: i === 1 ? "#000" : "#e5e7eb", font: L.MONO })}`).join("")}
      ${text(30, 330, "↑ and ↓ to move selection", { size: 17, color: "#9ca3af", font: L.MONO })}
      ${text(30, 358, "ENTER to select boot device", { size: 17, color: "#9ca3af", font: L.MONO })}`;
    return svg(
      `<rect x="60" y="60" width="600" height="420" fill="#111827" stroke="#9ca3af" stroke-width="3"/><g transform="translate(70,70)">${body}</g>` +
        text(360, 530, "Boot menu (F12) -- pick the USB drive", { size: 19, anchor: "middle", weight: 600 }) +
        arrow(680, 270, 760, 270, { color: C.good, width: 5 }) +
        `<rect x="770" y="170" width="160" height="200" rx="10" fill="#1e3a8a"/>` + text(850, 250, "Windows", { size: 18, color: "#fff", anchor: "middle", weight: 700 }) + text(850, 276, "Setup", { size: 18, color: "#fff", anchor: "middle", weight: 700 }) + text(850, 320, "loads ✓", { size: 17, color: "#86efac", anchor: "middle" }),
      { bg: "#e8eef6" },
    );
  },

  "module-1/images/install-os": () =>
    svg(
      setupWindow(
        "Windows Setup",
        `<rect width="740" height="460" fill="#1e3a8a"/>
        <g transform="translate(250,170)">${[0, 1, 2, 3].map((i) => `<rect x="${(i % 2) * 30}" y="${Math.floor(i / 2) * 30}" width="26" height="26" fill="#fff"/>`).join("")}</g>
        ${text(320, 200, "Windows Server 2012 R2", { size: 30, color: "#fff" })}
        <rect x="300" y="260" width="160" height="44" fill="none" stroke="#fff" stroke-width="2"/>${text(380, 289, "Install now", { size: 20, color: "#fff", anchor: "middle" })}
        ${text(30, 420, "Repair your computer", { size: 17, color: "#cbd5e1" })}`,
      ) + text(480, 585, "Boot from the tested USB, then follow the established installation procedure.", { size: 18, anchor: "middle", weight: 600 }),
    ),

  "module-1/images/create-partitions": () => {
    const row = (y, name, size, type, sel) => `${sel ? `<rect x="20" y="${y - 24}" width="660" height="36" fill="#cce4f7"/>` : ""}<rect x="34" y="${y - 16}" width="26" height="18" rx="3" fill="#94a3b8"/>${text(74, y, name, { size: 18 })}${text(430, y, size, { size: 18 })}${text(560, y, type, { size: 18 })}`;
    const body = `
      ${text(24, 44, "Where do you want to install Windows?", { size: 24, color: "#1e3a8a" })}
      <rect x="20" y="66" width="660" height="230" fill="#fff" stroke="#9ca3af"/>
      ${text(74, 92, "Name", { size: 17, weight: 700 })}${text(430, 92, "Total size", { size: 17, weight: 700 })}${text(560, 92, "Type", { size: 17, weight: 700 })}
      ${row(132, "Drive 0 Partition 1: System Reserved", "350 MB", "System")}
      ${row(172, "Drive 0 Partition 2  (C:)  Windows", "200.0 GB", "Primary", true)}
      ${row(212, "Drive 0 Partition 3  (D:)  Data", "265.4 GB", "Primary")}
      ${text(30, 336, "↻ Refresh", { size: 17, color: C.accent })}${text(170, 336, "✕ Delete", { size: 17, color: C.accent })}${text(310, 336, "✎ Format", { size: 17, color: C.accent })}${text(450, 336, "✱ New", { size: 17, color: C.accent })}
      ${button(570, 390, 110, "Next", { primary: true })}`;
    return svg(win(120, 50, 720, 500, "Windows Setup", body) + tick(860, 230, C.good, 24) +
      text(480, 585, "At least two partitions: one for Windows (C:), one for data (D:).", { size: 18, anchor: "middle", weight: 600 }));
  },

  "module-1/images/install-drivers": () => {
    const rows = [
      { label: "DESKTOP-NEWINSTALL", expanded: true },
      { label: "Display adapters", expanded: true, indent: 1 },
      { label: "NVIDIA GeForce GTX 650 Ti", indent: 2 },
      { label: "Network adapters", expanded: true, indent: 1 },
      { label: "Realtek PCIe GbE Family Controller", indent: 2 },
      { label: "Sound, video and game controllers", expanded: true, indent: 1 },
      { label: "Realtek High Definition Audio", indent: 2 },
    ];
    const body = rows.map((r, i) => treeRow(36, 44 + i * 40, r.label, r)).join("") +
      [2, 4, 6].map((i) => tick(520, 38 + i * 40, C.good, 12)).join("") +
      text(36, 360, "No more yellow warning icons -- every device has its driver.", { size: 18, weight: 600, color: "#166534" });
    return svg(win(150, 60, 660, 460, "Device Manager -- after installing the drivers", body) +
      text(480, 570, "Get each driver from the manufacturer's site or the hardware's disc.", { size: 18, anchor: "middle", weight: 600 }));
  },

  "module-1/images/install-browser": () =>
    svg(installer("Web Browser", "Installing the browser (e.g. Google Chrome)...", 0.7, "#2563eb") +
      text(480, 570, "Install the browser the end user needs, per its installation guide.", { size: 18, anchor: "middle", weight: 600 })),

  "module-1/images/install-office": () => {
    const body = `
      ${text(30, 50, "Choose the installation you want", { size: 26, color: "#c2410c" })}
      ${text(30, 92, "Please choose your preferred type of Office installation below.", { size: 17, color: C.muted })}
      <rect x="230" y="140" width="220" height="60" fill="#fff7ed" stroke="#ea580c" stroke-width="3"/>${text(340, 178, "Install Now", { size: 22, anchor: "middle", weight: 600 })}
      <rect x="230" y="230" width="220" height="60" fill="#fff" stroke="#9ca3af"/>${text(340, 268, "Customize", { size: 22, anchor: "middle" })}
      ${checkbox(40, 360, "I accept the terms of this agreement", true, 18)}`;
    return svg(win(150, 60, 660, 460, "Office Suite Setup", body) +
      text(480, 570, "Install the office suite the user needs -- after accepting its license terms.", { size: 18, anchor: "middle", weight: 600 }));
  },

  "module-1/images/install-antivirus": () => {
    const body = `
      <path d="M90 60 l70 26 v56 c0 46 -36 76 -70 92 c-34 -16 -70 -46 -70 -92 v-56 z" fill="#dcfce7" stroke="${C.good}" stroke-width="4"/>
      <path d="M62 150 l20 20 l42 -48" stroke="${C.good}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${text(200, 110, "You're protected", { size: 30, weight: 700 })}
      ${text(200, 148, "Real-time protection: On", { size: 19, color: "#166534" })}
      ${text(200, 178, "Virus definitions: Up to date", { size: 19, color: "#166534" })}
      ${text(200, 208, "Last scan: Just now -- no threats found", { size: 19, color: C.muted })}
      ${button(440, 290, 160, "Scan now", { primary: true })}`;
    return svg(win(170, 110, 620, 400, "Antivirus", body) +
      text(480, 570, "Install antivirus (if required) before the PC starts browsing the web.", { size: 18, anchor: "middle", weight: 600 }));
  },
};
