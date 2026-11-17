// Drawing helpers for the generated quiz illustrations (see generate.cjs). Everything is plain SVG
// rendered to WebP with sharp, so the pictures are the project's own work -- no licensing needed.
const W = 960;
const H = 600;
const FONT = "Segoe UI, Arial, sans-serif";
const MONO = "Consolas, 'Courier New', monospace";

const C = {
  bg: "#e8eef6",
  ink: "#1f2937",
  muted: "#6b7280",
  line: "#c7d0dc",
  accent: "#0067c0",
  good: "#16a34a",
  bad: "#dc2626",
  warn: "#f59e0b",
  win: "#ffffff",
  title: "#f3f4f6",
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function text(x, y, s, { size = 20, color = C.ink, weight = 400, anchor = "start", font = FONT, italic = false } = {}) {
  return `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}"${italic ? ' font-style="italic"' : ""}>${esc(s)}</text>`;
}

function svg(inner, { bg = C.bg } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${bg}"/>${inner}</svg>`;
}

// Window style. "win10" is the client PCs' Windows 10 look; "server2012" matches the Windows
// Server 2012 R2 screenshots in the UC3/UC4 guides (cyan title bar, centered title, square corners
// and buttons, red close button). Wrap a scene with server2012() to draw it in that style.
let THEME = "win10";
const is2012 = () => THEME === "server2012";

function server2012(fn) {
  return (...args) => {
    const prev = THEME;
    THEME = "server2012";
    try {
      return fn(...args);
    } finally {
      THEME = prev;
    }
  };
}

function win2012(x, y, w, h, title, body, { bodyFill = "#ffffff" } = {}) {
  const tb = 34;
  return `<g transform="translate(${x},${y})">
    <rect x="4" y="6" width="${w}" height="${h}" fill="#000" opacity="0.15"/>
    <rect width="${w}" height="${h}" fill="#69cbe9"/>
    <rect x="6" y="${tb}" width="${w - 12}" height="${h - tb - 6}" fill="${bodyFill}"/>
    ${text(w / 2, 24, title, { size: 17, anchor: "middle", color: "#000" })}
    <rect x="${w - 128}" y="2" width="30" height="20" fill="#69cbe9"/>${text(w - 113, 18, "_", { size: 16, anchor: "middle", weight: 700 })}
    <rect x="${w - 96}" y="2" width="30" height="20" fill="#69cbe9"/><rect x="${w - 87}" y="7" width="12" height="9" fill="none" stroke="#000" stroke-width="2"/>
    <rect x="${w - 64}" y="1" width="52" height="21" fill="#c75050"/>${text(w - 38, 18, "✕", { size: 14, anchor: "middle", color: "#fff", weight: 700 })}
    <g transform="translate(6,${tb})">${body}</g>
  </g>`;
}

/** A Windows-style window: title bar with caption buttons, white body. `body` is drawn in the
 * window's own coordinates (0,0 = top-left of the body, under the title bar). */
function win(x, y, w, h, title, body, { titleBg = C.title, titleColor = C.ink, icon = null, bodyFill } = {}) {
  if (is2012()) return win2012(x, y, w, h, title, body, { bodyFill });
  const tb = 40;
  return `<g transform="translate(${x},${y})">
    <rect x="4" y="6" width="${w}" height="${h}" rx="8" fill="#000" opacity="0.12"/>
    <rect width="${w}" height="${h}" rx="8" fill="${C.win}" stroke="${C.line}"/>
    <path d="M0 8 a8 8 0 0 1 8 -8 h${w - 16} a8 8 0 0 1 8 8 v${tb - 8} h-${w} z" fill="${titleBg}"/>
    ${icon ? icon : ""}
    ${text(icon ? 44 : 16, 27, title, { size: 16, color: titleColor })}
    ${text(w - 96, 27, "—", { size: 16, color: titleColor })}${text(w - 62, 27, "☐", { size: 15, color: titleColor })}${text(w - 28, 28, "✕", { size: 15, color: titleColor })}
    <g transform="translate(0,${tb})">${body}</g>
  </g>`;
}

function radio(x, y, label, checked = false, size = 19) {
  return `<circle cx="${x}" cy="${y}" r="9" fill="#fff" stroke="#555" stroke-width="1.6"/>${checked ? `<circle cx="${x}" cy="${y}" r="4.5" fill="${C.ink}"/>` : ""}${text(x + 20, y + 6, label, { size })}`;
}

function checkbox(x, y, label, checked = false, size = 19) {
  return `<rect x="${x - 9}" y="${y - 9}" width="18" height="18" rx="3" fill="${checked ? C.accent : "#fff"}" stroke="${checked ? C.accent : "#555"}" stroke-width="1.6"/>${checked ? `<path d="M${x - 5} ${y} l4 4 l7 -8" stroke="#fff" stroke-width="2.4" fill="none"/>` : ""}${text(x + 20, y + 6, label, { size })}`;
}

function field(x, y, w, value = "", { h = 34, placeholder = false, size = 18 } = {}) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${is2012() ? 0 : 3}" fill="#fff" stroke="${is2012() ? "#abadb3" : "#8a94a3"}"/>${value ? text(x + 10, y + h / 2 + 6, value, { size, color: placeholder ? "#9ca3af" : C.ink }) : ""}`;
}

function button(x, y, w, label, { primary = false, h = 36, disabled = false } = {}) {
  if (is2012()) {
    // Server 2012: flat grey buttons; the default button gets a blue border instead of a blue fill.
    const color = disabled ? "#a0a0a0" : "#000";
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${disabled ? "#f4f4f4" : "#e1e1e1"}" stroke="${primary ? "#3c7fb1" : "#adadad"}" stroke-width="${primary ? 2 : 1}"/>${text(x + w / 2, y + h / 2 + 6, label, { size: 17, color, anchor: "middle" })}`;
  }
  const fill = disabled ? "#eef0f3" : primary ? C.accent : "#f4f5f7";
  const color = disabled ? "#a3a9b3" : primary ? "#fff" : C.ink;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}" stroke="${primary ? C.accent : "#9aa3af"}"/>${text(x + w / 2, y + h / 2 + 6, label, { size: 17, color, anchor: "middle" })}`;
}

/** Big friendly "?" badge -- marks the thing the question asks about without answering it. */
function qmark(x, y, r = 26) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.warn}"/>${text(x, y + r * 0.38, "?", { size: r * 1.15, color: "#fff", weight: 700, anchor: "middle" })}`;
}

function tick(x, y, color = C.good, r = 15) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/><path d="M${x - r * 0.45} ${y} l${r * 0.32} ${r * 0.35} l${r * 0.6} -${r * 0.7}" stroke="#fff" stroke-width="${r * 0.22}" fill="none" stroke-linecap="round"/>`;
}

function cross(x, y, color = C.bad, r = 15) {
  const d = r * 0.42;
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/><path d="M${x - d} ${y - d} L${x + d} ${y + d} M${x + d} ${y - d} L${x - d} ${y + d}" stroke="#fff" stroke-width="${r * 0.22}" stroke-linecap="round"/>`;
}

function warnIcon(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M0 -11 L11 9 L-11 9 Z" fill="${C.warn}" stroke="#b45309" stroke-width="1.2" stroke-linejoin="round"/>${text(0, 7, "!", { size: 14, weight: 700, color: "#1f2937", anchor: "middle" })}</g>`;
}

/** A Windows Command Prompt window filling most of the canvas. `lines` are strings; a line that is
 * an object {t, color} gets its own colour. */
function cmd(lines, { title = "Command Prompt", size = 21 } = {}) {
  const x = 60, y = 40, w = 840, h = 520;
  const lh = size * 1.45;
  const body = lines
    .map((l, i) => {
      const o = typeof l === "string" ? { t: l } : l;
      return text(24, 40 + i * lh, o.t, { size, color: o.color ?? "#d4d4d4", font: MONO, weight: o.bold ? 700 : 400 });
    })
    .join("");
  const icon = `<rect x="14" y="12" width="20" height="16" rx="2" fill="#111" stroke="#666"/>${text(17, 25, ">_", { size: 10, color: "#ddd", font: MONO })}`;
  return svg(win(x, y, w, h, title, `<rect width="${w}" height="${h - 40}" fill="#0c0c0c"/>${body}`, { titleBg: "#1f1f1f", titleColor: "#e5e5e5", icon }), { bg: C.bg });
}

/** A numbered step list -- "done" steps get a tick, "q" a "?" badge, "x" a cross, "todo" an empty circle. */
function checklist(x, y, w, items, { rowH = 62, size = 22 } = {}) {
  return items
    .map((it, i) => {
      const cy = y + i * rowH;
      const state = it.state ?? "todo";
      const badge =
        state === "done" ? tick(x + 26, cy, C.good, 17)
        : state === "x" ? cross(x + 26, cy, C.bad, 17)
        : state === "q" ? qmark(x + 26, cy, 18)
        : `<circle cx="${x + 26}" cy="${cy}" r="16" fill="#fff" stroke="${C.line}" stroke-width="2"/>`;
      const fill = state === "q" ? "#fff7e6" : "#fff";
      const stroke = state === "q" ? C.warn : C.line;
      return `<rect x="${x}" y="${cy - rowH / 2 + 5}" width="${w}" height="${rowH - 10}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="${state === "q" ? 2 : 1}"/>${badge}${text(x + 58, cy + 8, it.label, { size, color: state === "q" ? "#92400e" : C.ink, weight: state === "q" ? 600 : 400 })}`;
    })
    .join("");
}

function heading(s, sub) {
  return text(W / 2, 58, s, { size: 30, weight: 700, anchor: "middle" }) + (sub ? text(W / 2, 92, sub, { size: 19, color: C.muted, anchor: "middle" }) : "");
}

// ---- Device icons (centered at x,y) ----

function pc(x, y, { label = "", sub = "", scale = 1, screen = "#cfe3ff", screenInner = "" } = {}) {
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <rect x="-70" y="-62" width="140" height="94" rx="7" fill="#374151"/>
    <rect x="-62" y="-54" width="124" height="76" rx="3" fill="${screen}"/>
    ${screenInner}
    <rect x="-12" y="32" width="24" height="18" fill="#4b5563"/>
    <rect x="-42" y="49" width="84" height="8" rx="4" fill="#374151"/>
  </g>${label ? text(x, y + 82 * scale, label, { size: 19, weight: 600, anchor: "middle" }) : ""}${sub ? text(x, y + 82 * scale + 24, sub, { size: 16, color: C.muted, anchor: "middle" }) : ""}`;
}

function server(x, y, { label = "", sub = "", scale = 1 } = {}) {
  const units = [0, 1, 2]
    .map((i) => `<rect x="-48" y="${-66 + i * 40}" width="96" height="32" rx="4" fill="#4b5563"/><circle cx="-32" cy="${-50 + i * 40}" r="4" fill="#4ade80"/><rect x="-18" y="${-53 + i * 40}" width="54" height="6" rx="3" fill="#6b7280"/>`)
    .join("");
  return `<g transform="translate(${x},${y}) scale(${scale})"><rect x="-56" y="-74" width="112" height="132" rx="8" fill="#1f2937"/>${units}</g>${label ? text(x, y + 84 * scale, label, { size: 19, weight: 600, anchor: "middle" }) : ""}${sub ? text(x, y + 84 * scale + 24, sub, { size: 16, color: C.muted, anchor: "middle" }) : ""}`;
}

function printer(x, y, { label = "", scale = 1, paper = "" } = {}) {
  return `<g transform="translate(${x},${y}) scale(${scale})">
    <rect x="-40" y="-70" width="80" height="40" fill="#fff" stroke="${C.line}"/>
    <rect x="-70" y="-38" width="140" height="62" rx="8" fill="#6b7280"/>
    <rect x="-50" y="14" width="100" height="58" fill="#fff" stroke="${C.line}"/>
    ${paper}
    <circle cx="50" cy="-22" r="5" fill="#4ade80"/>
  </g>${label ? text(x, y + 98 * scale, label, { size: 19, weight: 600, anchor: "middle" }) : ""}`;
}

function switchBox(x, y, { label = "Switch", scale = 1 } = {}) {
  const ports = Array.from({ length: 6 }, (_, i) => `<rect x="${-63 + i * 21}" y="-6" width="15" height="12" fill="#111827"/><circle cx="${-56 + i * 21}" cy="-12" r="2.5" fill="#4ade80"/>`).join("");
  return `<g transform="translate(${x},${y}) scale(${scale})"><rect x="-72" y="-20" width="144" height="36" rx="6" fill="#64748b"/>${ports}</g>${label ? text(x, y + 44 * scale, label, { size: 18, weight: 600, anchor: "middle" }) : ""}`;
}

function router(x, y, { label = "Router", sub = "", scale = 1 } = {}) {
  return `<g transform="translate(${x},${y}) scale(${scale})"><rect x="-26" y="-56" width="6" height="40" rx="3" fill="#374151" transform="rotate(-12 -23 -16)"/><rect x="20" y="-56" width="6" height="40" rx="3" fill="#374151" transform="rotate(12 23 -16)"/><rect x="-66" y="-20" width="132" height="40" rx="10" fill="#334155"/>${[0, 1, 2, 3].map((i) => `<circle cx="${-40 + i * 16}" cy="0" r="3.5" fill="#60a5fa"/>`).join("")}</g>${label ? text(x, y + 48 * scale, label, { size: 18, weight: 600, anchor: "middle" }) : ""}${sub ? text(x, y + 48 * scale + 22, sub, { size: 16, color: C.muted, anchor: "middle" }) : ""}`;
}

function cloud(x, y, { label = "Internet", scale = 1 } = {}) {
  return `<g transform="translate(${x},${y}) scale(${scale})"><path d="M-60 25 a30 30 0 0 1 4 -59 a40 40 0 0 1 74 -8 a32 32 0 0 1 44 34 a27 27 0 0 1 -8 33 z" fill="#dbeafe" stroke="#93c5fd" stroke-width="3"/></g>${text(x + 4, y + 10, label, { size: 19, weight: 600, anchor: "middle", color: "#1e40af" })}`;
}

function folder(x, y, { label = "", scale = 1, color = "#f6c344" } = {}) {
  return `<g transform="translate(${x},${y}) scale(${scale})"><path d="M-50 -34 h34 l10 10 h56 a6 6 0 0 1 6 6 v52 a6 6 0 0 1 -6 6 h-94 a6 6 0 0 1 -6 -6 z" fill="${color}"/><rect x="-50" y="-16" width="100" height="56" rx="6" fill="#fcd667"/></g>${label ? text(x, y + 66 * scale, label, { size: 18, weight: 600, anchor: "middle" }) : ""}`;
}

function disk(x, y, { label = "", sub = "", scale = 1 } = {}) {
  return `<g transform="translate(${x},${y}) scale(${scale})"><rect x="-56" y="-40" width="112" height="80" rx="10" fill="#9ca3af"/><circle cx="-6" cy="0" r="28" fill="#e5e7eb" stroke="#6b7280" stroke-width="2"/><circle cx="-6" cy="0" r="6" fill="#6b7280"/><path d="M38 -28 L10 6" stroke="#374151" stroke-width="5" stroke-linecap="round"/></g>${label ? text(x, y + 66 * scale, label, { size: 18, weight: 600, anchor: "middle" }) : ""}${sub ? text(x, y + 66 * scale + 22, sub, { size: 16, color: C.muted, anchor: "middle" }) : ""}`;
}

function user(x, y, { label = "", scale = 1, color = "#60a5fa" } = {}) {
  return `<g transform="translate(${x},${y}) scale(${scale})"><circle cx="0" cy="-16" r="15" fill="${color}"/><path d="M-26 22 a26 24 0 0 1 52 0 z" fill="${color}"/></g>${label ? text(x, y + 46 * scale, label, { size: 17, anchor: "middle" }) : ""}`;
}

function usb(x, y, { scale = 1, color = "#1f2937", label = "" } = {}) {
  return `<g transform="translate(${x},${y}) scale(${scale})"><rect x="-22" y="-60" width="44" height="80" rx="8" fill="${color}"/><rect x="-14" y="20" width="28" height="30" fill="#d1d5db" stroke="#9ca3af"/><rect x="-8" y="28" width="6" height="6" fill="#6b7280"/><rect x="2" y="28" width="6" height="6" fill="#6b7280"/>${label ? text(0, -20, label, { size: 13, color: "#fff", weight: 700, anchor: "middle" }) : ""}</g>`;
}

function arrow(x1, y1, x2, y2, { color = C.accent, width = 4, dashed = false, head = true } = {}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hx = x2 - 14 * Math.cos(a), hy = y2 - 14 * Math.sin(a);
  const p1 = `${hx - 8 * Math.sin(a)},${hy + 8 * Math.cos(a)}`, p2 = `${hx + 8 * Math.sin(a)},${hy - 8 * Math.cos(a)}`;
  return `<line x1="${x1}" y1="${y1}" x2="${head ? hx : x2}" y2="${head ? hy : y2}" stroke="${color}" stroke-width="${width}"${dashed ? ' stroke-dasharray="10 8"' : ""} stroke-linecap="round"/>${head ? `<polygon points="${x2},${y2} ${p1} ${p2}" fill="${color}"/>` : ""}`;
}

function line(x1, y1, x2, y2, color = "#64748b", width = 4) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
}

/** Device Manager-style tree row. */
function treeRow(x, y, label, { warn = false, expanded = null, indent = 0, size = 19 } = {}) {
  const ix = x + indent * 28;
  const chevron = expanded === null ? "" : text(ix - 18, y + 6, expanded ? "⌄" : "›", { size: 18, color: C.muted });
  const ico = warn ? warnIcon(ix + 10, y - 1, 1) : `<rect x="${ix}" y="${y - 10}" width="20" height="16" rx="2" fill="#94a3b8"/>`;
  return `${chevron}${ico}${text(ix + 30, y + 6, label, { size })}`;
}

module.exports = { W, H, C, FONT, MONO, esc, server2012, is2012, text, svg, win, radio, checkbox, field, button, qmark, tick, cross, warnIcon, cmd, checklist, heading, pc, server, printer, switchBox, router, cloud, folder, disk, user, usb, arrow, line, treeRow };
