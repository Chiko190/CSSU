"use client";

import type { SceneNodeKind, SceneNodeStatus } from "@/core/content/types";
import type { SceneState } from "@/core/content/missionGame";

/** The scene's coordinate space. Content positions nodes in 0-100 x 0-52; the container keeps the
 * same aspect ratio so HTML overlays (badges) can be placed by percentage. Kept short on purpose so
 * the map and the dialogue box under it fit on one screen. */
export const VIEW_W = 100;
export const VIEW_H = 52;
const MAX_BADGES = 3;

const ICONS: Record<SceneNodeKind, string> = {
  server: "🗄️",
  pc: "💻",
  printer: "🖨️",
  switch: "🔀",
  disk: "💽",
  folder: "📁",
  backup: "💾",
};

export function nodeIcon(kind: SceneNodeKind): string {
  return ICONS[kind];
}

const RING_CLASS: Record<SceneNodeStatus, string> = {
  off: "stroke-border",
  on: "stroke-primary/40",
  good: "stroke-success",
  alert: "stroke-danger animate-pulse",
  gone: "stroke-danger",
};

export interface ActivePulse {
  key: number;
  link: string;
  reverse?: boolean;
  /** Keep looping (during a wait step) instead of a single run. */
  loop?: boolean;
}

/** Straight cable, or an arc over the top for logical links (e.g. an RDP session). */
function linkPath(a: { x: number; y: number }, b: { x: number; y: number }, curved?: boolean, reverse?: boolean) {
  const [p, q] = reverse ? [b, a] : [a, b];
  if (!curved) return `M ${p.x} ${p.y} L ${q.x} ${q.y}`;
  const cx = (p.x + q.x) / 2;
  const cy = Math.min(p.y, q.y) - 11;
  return `M ${p.x} ${p.y} Q ${cx} ${cy} ${q.x} ${q.y}`;
}

/** Live 2D network map for the UC3/UC4 mission games: devices, cables carrying animated packets,
 * status rings, badges earned by completed steps, and a pulsing 💬 marker on whoever is talking
 * (their actual line is shown in the dialogue box under the map, so nothing covers the devices). */
export function NetworkScene({
  scene,
  speakerId,
  pulses,
}: {
  scene: SceneState;
  speakerId: string | null;
  pulses: ActivePulse[];
}) {
  const byId = new Map(scene.nodes.map((n) => [n.id, n]));

  return (
    <div className="relative w-full aspect-[100/52] select-none">
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="absolute inset-0 h-full w-full" role="img" aria-label="Network map">
        <defs>
          <pattern id="scene-grid" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M 4 0 L 0 0 0 4" fill="none" className="stroke-border-soft" strokeWidth="0.12" />
          </pattern>
          <radialGradient id="scene-vignette" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="rgba(79,209,255,0.06)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <rect width={VIEW_W} height={VIEW_H} fill="url(#scene-grid)" />
        <rect width={VIEW_W} height={VIEW_H} fill="url(#scene-vignette)" />

        {scene.links.map((link) => {
          if (link.hidden && !link.active) return null;
          const a = byId.get(link.from);
          const b = byId.get(link.to);
          if (!a || !b) return null;
          const dim = [a.status, b.status].some((s) => s === "off" || s === "gone");
          return (
            <path
              key={link.id}
              d={linkPath(a, b, link.curved)}
              fill="none"
              strokeLinecap="round"
              strokeWidth={link.active ? 0.6 : 0.45}
              strokeDasharray={link.active || link.curved ? "1.6 0.9" : undefined}
              className={link.active ? "stroke-primary animate-game-dash" : dim ? "stroke-border" : "stroke-text-faint/70"}
            />
          );
        })}

        {pulses.map((pulse) => {
          const link = scene.links.find((l) => l.id === pulse.link);
          const a = link && byId.get(link.from);
          const b = link && byId.get(link.to);
          if (!link || !a || !b) return null;
          return (
            <circle key={pulse.key} r="0.9" className="fill-xp">
              <animateMotion
                dur="0.9s"
                repeatCount={pulse.loop ? "indefinite" : "1"}
                fill="freeze"
                path={linkPath(a, b, link.curved, pulse.reverse)}
              />
            </circle>
          );
        })}

        {scene.nodes.map((node) => {
          const status = node.status ?? "on";
          const faded = status === "off" || status === "gone";
          const speaking = node.id === speakerId;
          return (
            <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
              {speaking && <circle r="6.6" className="fill-primary/10 stroke-primary/50 animate-pulse" strokeWidth="0.25" />}
              <circle
                r="5.1"
                className={`fill-bg-elevated ${RING_CLASS[status]}`}
                strokeWidth="0.45"
                strokeDasharray={status === "gone" ? "1.2 0.8" : undefined}
              />
              <rect x="-3.9" y="-3.9" width="7.8" height="7.8" rx="1.8" className={`fill-surface-2 ${faded ? "opacity-40" : ""}`} />
              <text
                key={status}
                fontSize="4.4"
                textAnchor="middle"
                dominantBaseline="central"
                className={status === "gone" ? "animate-game-boom" : faded ? "opacity-35 grayscale" : ""}
              >
                {status === "gone" ? "💥" : ICONS[node.kind]}
              </text>
              {status === "good" && (
                <g transform="translate(3.8 -3.8)">
                  <circle r="1.35" className="fill-success" />
                  <text fontSize="1.7" textAnchor="middle" dominantBaseline="central" className="fill-[#03140d] font-bold">
                    ✓
                  </text>
                </g>
              )}
              {speaking && (
                <g transform="translate(-4 -5.2)">
                  <circle r="1.9" className="fill-primary" />
                  <text fontSize="2" textAnchor="middle" dominantBaseline="central">
                    💬
                  </text>
                </g>
              )}
              <text y="7.4" fontSize="2.1" textAnchor="middle" className={`font-semibold ${speaking ? "fill-primary" : "fill-text"}`}>
                {node.label}
              </text>
              {node.sublabel && (
                <text
                  y="9.6"
                  fontSize="1.6"
                  textAnchor="middle"
                  className={status === "gone" || status === "alert" ? "fill-danger" : status === "good" ? "fill-success" : "fill-text-muted"}
                >
                  {node.sublabel}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Badges as HTML so they stay crisp; newest few only so the map stays readable. */}
      {scene.nodes.map((node) => {
        if (node.badges.length === 0) return null;
        const shown = node.badges.slice(-MAX_BADGES);
        const hidden = node.badges.length - shown.length;
        return (
          <div
            key={`badges-${node.id}`}
            className="absolute flex w-[28%] -translate-x-1/2 flex-wrap justify-center gap-0.5"
            style={{ left: `${(node.x / VIEW_W) * 100}%`, top: `${((node.y + 10.6) / VIEW_H) * 100}%` }}
            title={node.badges.join(", ")}
          >
            {shown.map((badge) => (
              <span
                key={badge}
                className="animate-game-pop max-w-full truncate rounded-full border border-accent/40 bg-accent/15 px-1.5 text-[9px] sm:text-[10px] leading-4 text-text"
              >
                {badge}
              </span>
            ))}
            {hidden > 0 && (
              <span className="rounded-full border border-border bg-surface-2 px-1.5 text-[9px] sm:text-[10px] leading-4 text-text-faint">
                +{hidden} more
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
