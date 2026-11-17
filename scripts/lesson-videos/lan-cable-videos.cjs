// Renders UC2's two cable-making lesson videos (English on-screen captions, no narration), in the
// same dark style and 1280x720 VP9 WebM format as the app's other explainers:
//   public/modules/module-2/videos/make-lan-cable.webm         -- the whole job, start to finish
//   public/modules/module-2/videos/insert-and-crimp-rj45.webm  -- close-up of insert + crimp
// Every frame is an SVG rendered by sharp and piped to ffmpeg.
//   Run: FFMPEG=<path to ffmpeg.exe> node scripts/lesson-videos/lan-cable-videos.cjs [make|crimp]
// (ffmpeg isn't a project dependency; `npx ffmpeg-static` or any ffmpeg build works.)
const path = require("node:path");
const { spawn } = require("node:child_process");
const sharp = require("sharp");

const W = 1280, H = 720, FPS = 24;
const FONT = "Segoe UI, Arial, sans-serif";
const OUT = path.join(__dirname, "../../public/modules/module-2/videos");

// ---- helpers ----
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
/** 0..1 progress of `t` through the window [a, b], eased. */
const seg = (t, a, b) => ease(clamp((t - a) / (b - a)));
const lerp = (a, b, t) => a + (b - a) * t;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const txt = (x, y, s, { size = 22, color = "#e5edf7", weight = 400, anchor = "start", opacity = 1 } = {}) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}" opacity="${opacity}">${esc(s)}</text>`;

const COL = { orange: "#f97316", green: "#16a34a", blue: "#2563eb", brown: "#8b4513", copper: "#d97706", gold: "#facc15", cyan: "#22d3ee" };

// T568B order, pin 1 to pin 8. `pair` groups the twisted pairs; `start` is the pair's position in
// the cable before the wires are rearranged.
const WIRES = [
  { name: "White/Orange", short: "W/O", color: COL.orange, striped: true, pair: "orange" },
  { name: "Orange", short: "O", color: COL.orange, pair: "orange" },
  { name: "White/Green", short: "W/G", color: COL.green, striped: true, pair: "green" },
  { name: "Blue", short: "Bl", color: COL.blue, pair: "blue" },
  { name: "White/Blue", short: "W/Bl", color: COL.blue, striped: true, pair: "blue" },
  { name: "Green", short: "G", color: COL.green, pair: "green" },
  { name: "White/Brown", short: "W/Br", color: COL.brown, striped: true, pair: "brown" },
  { name: "Brown", short: "Br", color: COL.brown, pair: "brown" },
];
const PAIR_Y = { blue: 262, orange: 304, green: 346, brown: 388 };
const CY = 325; // cable centre line
const finalY = (i) => CY + (i - 3.5) * 16;
const pairY = (i) => {
  const w = WIRES[i];
  const first = WIRES.findIndex((x) => x.pair === w.pair) === i;
  return PAIR_Y[w.pair] + (first ? -7 : 7);
};

function wirePath(x1, x2, y, { twist = 0, phase = 0, wave = 0 } = {}) {
  // A wire from x1 to x2 at height y; `twist` (0..1) winds it round its pair partner.
  const pts = [];
  for (let x = x1; x <= x2 + 0.1; x += 6) {
    const k = (x - x1) / 22;
    pts.push(`${x.toFixed(1)},${(y + twist * 7 * Math.sin(k + phase) + wave * Math.sin(x / 40)).toFixed(1)}`);
  }
  return pts.join(" ");
}

function wire(i, x1, x2, y, opts = {}) {
  const w = WIRES[i];
  const p = wirePath(x1, x2, y, opts);
  const base = `<polyline points="${p}" fill="none" stroke="${w.striped ? "#f8fafc" : w.color}" stroke-width="11" stroke-linecap="round"/>`;
  const stripe = w.striped ? `<polyline points="${p}" fill="none" stroke="${w.color}" stroke-width="11" stroke-dasharray="9 9" stroke-linecap="butt"/>` : "";
  const end = opts.copper ? `<circle cx="${x2}" cy="${y}" r="4" fill="${COL.copper}"/>` : "";
  return base + stripe + end;
}

function jacket(x1, x2, { opacity = 1, label = true } = {}) {
  return `<g opacity="${opacity}"><rect x="${x1}" y="${CY - 34}" width="${x2 - x1}" height="68" rx="10" fill="#94a3b8" stroke="#64748b" stroke-width="2"/>${label && x2 - x1 > 220 ? txt(x1 + 30, CY + 8, "Cat5e UTP cable", { size: 20, color: "#1e293b", weight: 600 }) : ""}</g>`;
}

/** Top view of the RJ45 plug. `dx` slides it right (not yet on); `contactsDown` 0..1. */
function plugTop(dx = 0, { contactsDown = 0 } = {}) {
  const x = 470 + dx, y = CY - 82, w = 140, h = 164;
  const contacts = WIRES.map((_, i) => `<rect x="${x + 104}" y="${finalY(i) - 5}" width="22" height="10" rx="2" fill="${COL.gold}" opacity="${0.55 + 0.45 * contactsDown}" stroke="#a16207"/>`).join("");
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="#e0f2fe" fill-opacity="0.28" stroke="#cbd5e1" stroke-width="3"/>
    <rect x="${x + w - 12}" y="${y + 6}" width="8" height="${h - 12}" fill="#e2e8f0" fill-opacity="0.5"/>
    ${contacts}${txt(x + w / 2, y - 12, "RJ45 plug", { size: 17, anchor: "middle", color: "#cbd5e1" })}</g>`;
}

function boot(x, opacity = 1) {
  return `<path d="M${x} ${CY - 44} h70 l26 12 v64 l-26 12 h-70 z" fill="#38bdf8" fill-opacity="0.75" stroke="#0284c7" stroke-width="2" opacity="${opacity}"/>`;
}

function frameChrome(meta, step, total, label, caption, opacity = 1) {
  const dashes = Array.from({ length: total }, (_, i) => `<rect x="${W - 40 - (total - i) * 34}" y="30" width="26" height="6" rx="3" fill="${i < step ? COL.cyan : "#1e3a5f"}"/>`).join("");
  const lines = Array.isArray(caption) ? caption : [caption];
  return `${txt(40, 40, meta, { size: 15, color: COL.cyan, weight: 700 })}${txt(40, 62, "UC2 · Task 1 -- Installing Network Cables", { size: 14, color: "#64748b" })}${dashes}
    <g opacity="${opacity}"><rect x="40" y="${H - 132}" width="${W - 80}" height="104" rx="12" fill="#0b1a2e" stroke="#1e3a5f" stroke-width="2"/>
    ${txt(64, H - 100, label, { size: 15, color: COL.cyan, weight: 700 })}
    ${lines.map((l, i) => txt(64, H - 68 + i * 30, l, { size: 24, weight: 600 })).join("")}</g>`;
}

function titleCard(icon, title, sub, t) {
  const o = seg(t, 0, 0.25);
  return `<g opacity="${o}">${icon}${txt(W / 2, 360, title, { size: 46, weight: 800, anchor: "middle", color: "#fff" })}${txt(W / 2, 404, sub, { size: 22, anchor: "middle", color: "#94a3b8" })}</g>`;
}

function bg(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="g" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#0c1a33"/><stop offset="1" stop-color="#050b16"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/>${inner}</svg>`;
}

const cableIcon = `<g transform="translate(640,250)"><rect x="-90" y="-14" width="120" height="28" rx="8" fill="#94a3b8"/>${WIRES.map((w, i) => `<rect x="30" y="${-14 + i * 3.5}" width="${50 + (i % 2) * 6}" height="3" fill="${w.striped && i % 2 === 0 ? "#f8fafc" : w.color}"/>`).join("")}<rect x="78" y="-20" width="40" height="40" rx="5" fill="#e0f2fe" fill-opacity="0.35" stroke="#cbd5e1" stroke-width="2"/></g>`;

// ---- shared states of the cable, used by several scenes ----
const JX = 520; // where the jacket ends once stripped
const STRIP_END = 700; // wire ends before trimming
const TRIM_END = 598; // wire ends after trimming (about 1.3 cm)

function arrangedWires(end, { copper = false, order = 1 } = {}) {
  return WIRES.map((_, i) => wire(i, JX - 10, end, lerp(pairY(i), finalY(i), order), { copper })).join("");
}

function pinLabels(x, opacity = 1) {
  return `<g opacity="${opacity}">${WIRES.map((w, i) => txt(x, finalY(i) + 5, `${i + 1}  ${w.name}`, { size: 14, color: "#cbd5e1" })).join("")}</g>`;
}

function tester(t) {
  const lit = Math.floor(clamp(t) * 10); // LEDs light 1..8 in turn, twice through
  const box = (x, label) => `<rect x="${x}" y="190" width="200" height="300" rx="18" fill="#e2e8f0" stroke="#94a3b8" stroke-width="3"/><rect x="${x + 30}" y="215" width="140" height="250" rx="10" fill="#111827"/>
    ${WIRES.map((_, i) => `<circle cx="${x + 80}" cy="${240 + i * 28}" r="10" fill="${lit % 9 > i || lit >= 9 ? "#22c55e" : "#1f2937"}" stroke="#14532d"/>${txt(x + 104, 246 + i * 28, String(i + 1), { size: 16, color: "#e5e7eb", weight: 700 })}`).join("")}
    ${txt(x + 100, 520, label, { size: 18, anchor: "middle", color: "#cbd5e1", weight: 600 })}`;
  return box(300, "Main unit") + box(780, "Remote unit") + `<path d="M500 420 C 600 560, 680 560, 780 420" stroke="#94a3b8" stroke-width="12" fill="none"/>`;
}

// ---- Video 1: Making a LAN cable ----
const STEPS1 = 11;
/** Cable close-ups in video 1 are drawn 1.3x around the plug so they fill the frame. */
const big = (fn) => (t) => `<g transform="translate(470,${CY}) scale(1.3) translate(-470,-${CY})">${fn(t)}</g>`;
const makeScenes = [
  { d: 3.5, draw: (t) => titleCard(cableIcon, "Making a LAN cable", "Straight-through cable, T568B on both ends", t) },
  {
    d: 6, step: 1, label: "WHAT YOU NEED", caption: "UTP cable, RJ45 plugs and boots, a wire stripper, a crimping tool and a LAN cable tester.",
    draw: (t) => {
      const items = [["UTP cable", `<rect x="-60" y="-12" width="120" height="24" rx="8" fill="#94a3b8"/>`], ["RJ45 plugs", `<rect x="-30" y="-24" width="60" height="48" rx="6" fill="#e0f2fe" fill-opacity="0.35" stroke="#cbd5e1" stroke-width="3"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${-22 + i * 6}" y="-20" width="3" height="10" fill="${COL.gold}"/>`).join("")}`], ["Boots", `<path d="M-30 -20 h40 l20 10 v20 l-20 10 h-40 z" fill="#38bdf8" fill-opacity="0.75"/>`], ["Wire stripper", `<rect x="-50" y="-16" width="100" height="32" rx="16" fill="#475569"/><circle cx="20" cy="0" r="9" fill="#0f172a"/>`], ["Crimping tool", `<path d="M-60 -6 L20 -22 L60 -10 L20 0 Z M-60 6 L20 22 L60 10 L20 0 Z" fill="#334155" stroke="#94a3b8" stroke-width="2"/><rect x="40" y="-14" width="20" height="28" fill="#94a3b8"/>`], ["LAN tester", `<rect x="-26" y="-36" width="52" height="72" rx="8" fill="#e2e8f0"/>${[0, 1, 2, 3].map((i) => `<circle cx="0" cy="${-22 + i * 14}" r="4" fill="#22c55e"/>`).join("")}`]];
      return items.map(([label, icon], i) => {
        const o = seg(t, i * 0.1, i * 0.1 + 0.15);
        const x = 190 + i * 180;
        return `<g opacity="${o}"><rect x="${x - 80}" y="220" width="160" height="200" rx="16" fill="#0b1a2e" stroke="#1e3a5f" stroke-width="2"/><g transform="translate(${x},305)">${icon}</g>${txt(x, 395, label, { size: 18, anchor: "middle", weight: 600 })}</g>`;
      }).join("");
    },
  },
  {
    d: 5, step: 2, label: "STEP 1 · BOOT FIRST", caption: "Slide the boot onto the cable first. It can't go on after the plug is crimped.",
    draw: big((t) => jacket(80, STRIP_END) + boot(lerp(1000, 380, seg(t, 0.1, 0.7)))),
  },
  {
    d: 6.5, step: 3, label: "STEP 2 · STRIP THE JACKET", caption: "Strip about 3 cm (1.2 in) of the outer jacket. Don't nick the wires inside.",
    draw: big((t) => {
      const off = seg(t, 0.45, 0.85);
      const twisted = WIRES.map((_, i) => wire(i, JX - 10, STRIP_END, PAIR_Y[WIRES[i].pair], { twist: 1, phase: WIRES.findIndex((x) => x.pair === WIRES[i].pair) === i ? 0 : Math.PI })).join("");
      const tool = `<g transform="translate(${JX},${CY}) rotate(${seg(t, 0.05, 0.45) * 540})" opacity="${1 - seg(t, 0.45, 0.6)}"><circle r="56" fill="none" stroke="#475569" stroke-width="14"/><rect x="-6" y="-62" width="12" height="18" fill="#e2e8f0"/></g>`;
      return jacket(80, JX, { label: true }) + boot(380) + `<g opacity="${off}">${twisted}</g>` + `<g transform="translate(${off * 260},0)" opacity="${1 - off}">${jacket(JX, STRIP_END, { label: false })}</g>` + tool;
    }),
  },
  {
    d: 5.5, step: 4, label: "STEP 3 · UNTWIST", caption: "Untwist the four pairs and straighten each wire.",
    draw: big((t) => {
      const u = seg(t, 0.1, 0.8);
      return jacket(80, JX) + boot(380) + WIRES.map((_, i) => {
        const first = WIRES.findIndex((x) => x.pair === WIRES[i].pair) === i;
        return wire(i, JX - 10, STRIP_END, lerp(PAIR_Y[WIRES[i].pair], pairY(i), u), { twist: 1 - u, phase: first ? 0 : Math.PI });
      }).join("");
    }),
  },
  {
    d: 9, step: 5, label: "STEP 4 · ARRANGE IN T568B ORDER", caption: ["Pin 1 to 8: White/Orange, Orange, White/Green, Blue,", "White/Blue, Green, White/Brown, Brown."],
    draw: big((t) => jacket(80, JX) + boot(380) + arrangedWires(STRIP_END, { order: seg(t, 0.05, 0.6) }) + pinLabels(STRIP_END + 24, seg(t, 0.55, 0.75))),
  },
  {
    d: 6, step: 6, label: "STEP 5 · TRIM", caption: "Hold them flat and cut straight across, leaving about 1.3 cm (½ in).",
    draw: big((t) => {
      const cut = seg(t, 0.25, 0.5);
      const fall = seg(t, 0.5, 0.85);
      const offcuts = `<g transform="translate(${fall * 60},${fall * 140})" opacity="${1 - fall}">${WIRES.map((_, i) => wire(i, TRIM_END + 6, STRIP_END, finalY(i))).join("")}</g>`;
      const line = `<line x1="${TRIM_END + 3}" y1="${CY - 90}" x2="${TRIM_END + 3}" y2="${lerp(CY - 90, CY + 90, cut)}" stroke="#f87171" stroke-width="3" stroke-dasharray="8 6" opacity="${1 - fall}"/>`;
      return jacket(80, JX) + boot(380) + WIRES.map((_, i) => wire(i, JX - 10, cut < 1 ? STRIP_END : TRIM_END, finalY(i))).join("") + (cut >= 1 ? offcuts : "") + line +
        `<g opacity="${seg(t, 0.6, 0.8)}"><path d="M${JX} ${CY + 110} H${TRIM_END}" stroke="${COL.cyan}" stroke-width="2"/>${txt((JX + TRIM_END) / 2, CY + 134, "about 1.3 cm", { size: 17, anchor: "middle", color: COL.cyan })}</g>`;
    }),
  },
  {
    d: 6.5, step: 7, label: "STEP 6 · INSERT", caption: "Clip facing down, push the wires straight in until all eight touch the front of the plug.",
    draw: big((t) => jacket(80, JX) + boot(380) + arrangedWires(TRIM_END, { copper: true }) + plugTop(lerp(420, 0, seg(t, 0.1, 0.75)))),
  },
  {
    d: 6, step: 8, label: "STEP 7 · CHECK BEFORE CRIMPING", caption: "Every wire reaches the front, in order, and the jacket sits inside the plug.",
    draw: big((t) => {
      const a = seg(t, 0.1, 0.35), b = seg(t, 0.5, 0.75);
      return jacket(80, JX) + boot(380) + arrangedWires(TRIM_END, { copper: true }) + plugTop(0) +
        `<g opacity="${a}"><rect x="${TRIM_END - 18}" y="${CY - 76}" width="34" height="152" rx="8" fill="none" stroke="#22c55e" stroke-width="4"/>${txt(TRIM_END + 40, CY - 40, "all 8 wires at the front", { size: 18, color: "#86efac", weight: 600 })}</g>` +
        `<g opacity="${b}"><rect x="476" y="${CY - 44}" width="${JX - 476 + 4}" height="88" rx="8" fill="none" stroke="#22c55e" stroke-width="4"/>${txt(330, CY + 110, "jacket inside the plug", { size: 18, color: "#86efac", weight: 600 })}</g>`;
    }),
  },
  {
    d: 6.5, step: 9, label: "STEP 8 · CRIMP", caption: "Put the plug in the crimper's 8P die and squeeze firmly until it clicks.",
    draw: big((t) => {
      const c = seg(t, 0.2, 0.55);
      const jawTop = lerp(CY - 170, CY - 88, c), jawBot = lerp(CY + 170, CY + 88, c);
      const jaws = `<rect x="440" y="${jawTop - 80}" width="200" height="80" rx="12" fill="#334155" stroke="#94a3b8" stroke-width="3"/><rect x="440" y="${jawBot}" width="200" height="80" rx="12" fill="#334155" stroke="#94a3b8" stroke-width="3"/>`;
      return jacket(80, JX) + boot(380) + arrangedWires(TRIM_END, { copper: true }) + plugTop(0, { contactsDown: c }) + jaws +
        `<g opacity="${seg(t, 0.55, 0.65) * (1 - seg(t, 0.85, 1))}">${txt(700, CY - 120, "click!", { size: 40, weight: 800, color: COL.gold })}</g>` +
        `<g opacity="${seg(t, 0.65, 0.8)}">${txt(700, CY + 10, "The gold pins press down", { size: 20, color: "#fde68a", weight: 600 })}${txt(700, CY + 38, "through the wires' insulation.", { size: 20, color: "#fde68a", weight: 600 })}</g>`;
    }),
  },
  {
    d: 6, step: 10, label: "STEP 9 · THE OTHER END", caption: "Do the other end the same way: T568B again. Same standard on both ends = straight-through.",
    draw: (t) => {
      const o = seg(t, 0.05, 0.3);
      const end = (x, flip) => `<g transform="translate(${x},330) scale(${flip ? -1 : 1},1)"><rect x="0" y="-40" width="110" height="80" rx="10" fill="#e0f2fe" fill-opacity="0.3" stroke="#cbd5e1" stroke-width="3"/>${WIRES.map((w, i) => `<rect x="20" y="${-30 + i * 8}" width="70" height="5" fill="${w.striped ? "#f8fafc" : w.color}"/>`).join("")}<path d="M-60 -24 h60 v48 h-60 z" fill="#38bdf8" fill-opacity="0.7"/></g>`;
      return `<g opacity="${o}"><path d="M330 330 C 520 230, 760 430, 950 330" stroke="#94a3b8" stroke-width="22" fill="none"/>${end(220, false)}${end(1060, true)}
        ${txt(220 + 55, 420, "T568B", { size: 26, weight: 800, anchor: "middle", color: COL.cyan })}${txt(1060 - 55, 420, "T568B", { size: 26, weight: 800, anchor: "middle", color: COL.cyan })}</g>
        <g opacity="${seg(t, 0.45, 0.65)}">${txt(640, 230, "straight-through cable", { size: 26, weight: 700, anchor: "middle", color: "#86efac" })}</g>`;
    },
  },
  {
    d: 7, step: 11, label: "STEP 10 · TEST", caption: "Plug both ends into the LAN tester. Lights 1 to 8 must flash in the same order on both units.",
    draw: (t) => tester(seg(t, 0.1, 0.95)),
  },
  { d: 3.5, draw: (t) => titleCard(`<g transform="translate(640,250)"><circle r="44" fill="#16a34a"/><path d="M-20 0 l14 15 l28 -30" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`, "Cable passes the test", "Now it's ready to connect a PC to the switch or router.", t) },
];

// ---- Video 2: Inserting the wires and crimping (close-up) ----
const STEPS2 = 6;
const zoom = (s, cx, cy, inner) => `<g transform="translate(${cx},${cy}) scale(${s}) translate(${-cx},${-cy})">${inner}</g>`;

/** Cross-section of the plug seen from the front: the 8 wires side by side, each with its own gold
 * pin above it. `down` 0..1 drives the pins down through the insulation into the copper. */
function plugSection(down) {
  const x0 = 360, gap = 70, wy = 400;
  const wires = WIRES.map((w, i) => {
    const cx = x0 + 35 + i * gap;
    return `<circle cx="${cx}" cy="${wy}" r="26" fill="${w.striped ? "#f8fafc" : w.color}" stroke="${w.color}" stroke-width="${w.striped ? 8 : 0}"/><circle cx="${cx}" cy="${wy}" r="10" fill="${COL.copper}"/>
      <path d="M${cx - 9} ${250 + down * 118} v-110 h18 v110 l-9 16 z" fill="${COL.gold}" stroke="#a16207" stroke-width="2"/>
      ${txt(cx, wy + 58, String(i + 1), { size: 18, anchor: "middle", color: "#cbd5e1", weight: 700 })}`;
  }).join("");
  return `<rect x="${x0 - 20}" y="150" width="${8 * gap + 40}" height="320" rx="18" fill="#e0f2fe" fill-opacity="0.16" stroke="#cbd5e1" stroke-width="3"/>${wires}
    ${txt(640, 130, "Inside the plug, seen from the front", { size: 20, anchor: "middle", color: "#94a3b8" })}`;
}

const crimpScenes = [
  { d: 3.5, draw: (t) => titleCard(cableIcon, "Inserting the wires and crimping", "A closer look at the step that decides whether the cable works", t) },
  {
    d: 7, step: 1, label: "CHECK THE ORDER", caption: ["Hold the 8 wires flat in T568B order and check them", "against the chart one more time."],
    draw: (t) => zoom(1.25, 560, CY, jacket(80, JX) + arrangedWires(TRIM_END) + pinLabels(TRIM_END + 30, seg(t, 0.15, 0.4))),
  },
  {
    d: 6.5, step: 2, label: "HOLD THE PLUG THE RIGHT WAY", caption: "Clip facing down, away from you. Pin 1 is then on the left -- the White/Orange wire.",
    draw: (t) => zoom(1.25, 560, CY, jacket(80, JX) + arrangedWires(TRIM_END) + plugTop(260) + `<g opacity="${seg(t, 0.3, 0.55)}">${txt(880, finalY(0) + 6, "← pin 1: White/Orange", { size: 17, color: COL.orange, weight: 700 })}</g>`),
  },
  {
    d: 7, step: 3, label: "PUSH THEM ALL THE WAY IN", caption: "Push firmly and straight. The wires slide along their channels to the front of the plug.",
    draw: (t) => zoom(1.25, 560, CY, jacket(80, JX) + arrangedWires(TRIM_END, { copper: true }) + plugTop(lerp(260, 0, seg(t, 0.05, 0.8)))),
  },
  {
    d: 7, step: 4, label: "LOOK AT THE FRONT", caption: "Through the clear plug you should see eight copper ends touching the front wall.",
    draw: (t) => {
      const z = lerp(1.25, 2.3, seg(t, 0.05, 0.5));
      return zoom(z, TRIM_END, CY, jacket(80, JX) + arrangedWires(TRIM_END, { copper: true }) + plugTop(0) + `<g opacity="${seg(t, 0.5, 0.7)}">${WIRES.map((_, i) => `<circle cx="${TRIM_END}" cy="${finalY(i)}" r="7" fill="none" stroke="#22c55e" stroke-width="2.5"/>`).join("")}</g>`);
    },
  },
  {
    d: 8, step: 5, label: "CRIMP", caption: "Squeeze until it clicks: each gold pin cuts through the insulation into its own wire.",
    draw: (t) => {
      const c = seg(t, 0.2, 0.6);
      return plugSection(c) + `<g opacity="${seg(t, 0.6, 0.75)}">${txt(980, 300, "8 pins, 8 wires --", { size: 19, color: "#fde68a", weight: 600 })}${txt(980, 326, "each pin touches copper", { size: 19, color: "#fde68a", weight: 600 })}</g>`;
    },
  },
  {
    d: 9, step: 6, label: "COMMON MISTAKES", caption: "Any of these fails the LAN tester. Cut the plug off and make that end again.",
    draw: (t) => {
      const panel = (x, title, inner, i) => `<g opacity="${seg(t, i * 0.18, i * 0.18 + 0.15)}"><rect x="${x - 180}" y="150" width="360" height="300" rx="16" fill="#0b1a2e" stroke="#7f1d1d" stroke-width="3"/>${inner}<circle cx="${x + 150}" cy="180" r="18" fill="#dc2626"/>${txt(x + 150, 188, "✕", { size: 20, color: "#fff", anchor: "middle", weight: 800 })}${txt(x, 420, title, { size: 20, anchor: "middle", weight: 700 })}</g>`;
      const mini = (x, ends, order) => `<rect x="${x - 120}" y="220" width="70" height="140" rx="8" fill="#94a3b8"/>${order.map((wi, i) => `<rect x="${x - 50}" y="${228 + i * 16}" width="${ends[i]}" height="9" fill="${WIRES[wi].striped ? "#f8fafc" : WIRES[wi].color}"/>`).join("")}<rect x="${x - 70}" y="210" width="190" height="160" rx="10" fill="#e0f2fe" fill-opacity="0.18" stroke="#cbd5e1" stroke-width="2"/>`;
      const full = [150, 150, 150, 150, 150, 150, 150, 150];
      return panel(240, "A wire stops short", mini(240, [150, 150, 150, 110, 150, 150, 150, 150], [0, 1, 2, 3, 4, 5, 6, 7]), 0) +
        panel(640, "Two wires swapped", mini(640, full, [0, 1, 5, 3, 4, 2, 6, 7]), 1) +
        panel(1040, "Jacket outside the plug", `<rect x="900" y="220" width="40" height="140" rx="8" fill="#94a3b8"/>${WIRES.map((w, i) => `<rect x="940" y="${228 + i * 16}" width="170" height="9" fill="${w.striped ? "#f8fafc" : w.color}"/>`).join("")}<rect x="970" y="210" width="190" height="160" rx="10" fill="#e0f2fe" fill-opacity="0.18" stroke="#cbd5e1" stroke-width="2"/>`, 2);
    },
  },
  { d: 3.5, draw: (t) => titleCard(`<g transform="translate(640,250)"><circle r="44" fill="#16a34a"/><path d="M-20 0 l14 15 l28 -30" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`, "Then test it", "Every new cable goes on the LAN tester before it's used.", t) },
];

async function render(name, scenes, totalSteps, meta) {
  const ffmpeg = process.env.FFMPEG;
  if (!ffmpeg) throw new Error("Set FFMPEG to the path of an ffmpeg executable.");
  const file = path.join(OUT, `${name}.webm`);
  const ff = spawn(ffmpeg, ["-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${W}x${H}`, "-r", String(FPS), "-i", "-", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "34", "-row-mt", "1", "-deadline", "good", "-cpu-used", "4", "-pix_fmt", "yuv420p", file], { stdio: ["pipe", "inherit", "inherit"] });
  let frames = 0;
  for (const sc of scenes) {
    const n = Math.round(sc.d * FPS);
    for (let f = 0; f < n; f++) {
      const t = f / (n - 1);
      const fade = Math.min(seg(t, 0, 0.06), 1 - seg(t, 0.94, 1)); // brief fade between scenes
      const chrome = sc.label ? frameChrome(meta, sc.step, totalSteps, sc.label, sc.caption, seg(t, 0, 0.08)) : frameChrome(meta, sc.step ?? 0, totalSteps, "", "", 0);
      const svgDoc = bg(`<g opacity="${fade}">${sc.draw(t)}</g>${chrome}`);
      const buf = await sharp(Buffer.from(svgDoc)).removeAlpha().raw().toBuffer();
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
      frames++;
    }
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on("close", (code) => (code === 0 ? res() : rej(new Error(`ffmpeg exited ${code}`)))));
  console.log(`${name}.webm: ${frames} frames, ${(frames / FPS).toFixed(1)} s`);
}

/** Renders a single frame of a scene to PNG -- for checking layouts without encoding a video. */
async function still(scenes, totalSteps, meta, sceneIdx, t, file) {
  const sc = scenes[sceneIdx];
  const chrome = sc.label ? frameChrome(meta, sc.step, totalSteps, sc.label, sc.caption) : "";
  await sharp(Buffer.from(bg(sc.draw(t) + chrome))).png().toFile(file);
}

const VIDEOS = {
  make: ["make-lan-cable", makeScenes, STEPS1, "MAKING A LAN CABLE (T568B)"],
  crimp: ["insert-and-crimp-rj45", crimpScenes, STEPS2, "INSERTING THE WIRES AND CRIMPING"],
};

if (require.main === module) {
  (async () => {
    const which = process.argv[2];
    if (which === "still") {
      // node lan-cable-videos.cjs still <make|crimp> <sceneIdx> <t> <out.png>
      const [, , , v, idx, t, out] = process.argv;
      const [, scenes, steps, meta] = VIDEOS[v];
      return still(scenes, steps, meta, Number(idx), Number(t), out);
    }
    for (const key of which ? [which] : Object.keys(VIDEOS)) {
      const [name, scenes, steps, meta] = VIDEOS[key];
      await render(name, scenes, steps, meta);
    }
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { VIDEOS, still };
