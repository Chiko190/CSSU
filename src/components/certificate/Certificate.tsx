"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/** The blank template already has the "CERTIFICATE" title, the crest, the blue rule, and "This
 * certificate is awarded to" baked in -- see public/certificates/certificate-template.jpg. This
 * component only ever draws the two things that vary per learner: the module name (between the
 * title and the crest) and the player's own name (just above the rule). Every position below is
 * a fraction of the template's own pixel dimensions, calibrated by eye against a reference
 * certificate image for Module 1, so it lines up whether this renders as a small card or a full
 * download -- both the on-screen overlay and the downloaded PNG draw from these same numbers. */
const TEMPLATE_WIDTH = 2000;
const TEMPLATE_HEIGHT = 1414;
const TEMPLATE_SRC = "/certificates/certificate-template.jpg";

/** Calibrated by pixel-scanning both the blank template (for the blue rule's position, ~72.6-
 * 72.9% down) and a reference certificate image with a name already placed on it (for the
 * paragraph/name text's actual position, size, and horizontal center, ~47.3%). All percentages
 * are fractions of the template's own width or height, matching how `top`/font-size are expressed
 * below (top as % of height, font-size as cqw i.e. % of width). */
const MODULE_LINE = {
  centerXPct: 0.473,
  topPct: 0.366,
  maxWidthPct: 0.48,
  fontSizePct: 0.031,
  lineHeightPct: 0.042,
};

const NAME_LINE = {
  centerXPct: 0.473,
  topPct: 0.6,
  fontSizePct: 0.073,
};

const TEXT_COLOR = "#1f2937";

/** Names longer than the reference certificate's name ("MECO P. PALCO", 13 characters -- what
 * NAME_LINE.fontSizePct was calibrated against) get scaled down proportionally so a long full
 * name doesn't run into the certificate's decorative side panels. Short/typical names render at
 * the full calibrated size. */
const NAME_CALIBRATION_CHARS = 13;
function nameFontSizeFactor(name: string): number {
  return name.length > NAME_CALIBRATION_CHARS ? NAME_CALIBRATION_CHARS / name.length : 1;
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function drawCertificate(moduleTitle: string, playerName: string): Promise<HTMLCanvasElement> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = TEMPLATE_SRC;
  });

  const canvas = document.createElement("canvas");
  canvas.width = TEMPLATE_WIDTH;
  canvas.height = TEMPLATE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(image, 0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
  ctx.fillStyle = TEXT_COLOR;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const moduleFontSize = MODULE_LINE.fontSizePct * TEMPLATE_WIDTH;
  ctx.font = `600 ${moduleFontSize}px Arial, sans-serif`;
  const moduleLines = wrapCanvasText(ctx, `OF ${moduleTitle.toUpperCase()} COMPLETING`, MODULE_LINE.maxWidthPct * TEMPLATE_WIDTH);
  const moduleLineHeight = MODULE_LINE.lineHeightPct * TEMPLATE_HEIGHT;
  moduleLines.forEach((line, i) => {
    ctx.fillText(line, MODULE_LINE.centerXPct * TEMPLATE_WIDTH, MODULE_LINE.topPct * TEMPLATE_HEIGHT + i * moduleLineHeight);
  });

  const nameFontSize = NAME_LINE.fontSizePct * TEMPLATE_WIDTH * nameFontSizeFactor(playerName);
  ctx.font = `700 ${nameFontSize}px Arial, sans-serif`;
  ctx.fillText(playerName.toUpperCase(), NAME_LINE.centerXPct * TEMPLATE_WIDTH, NAME_LINE.topPct * TEMPLATE_HEIGHT);

  return canvas;
}

export function Certificate({ moduleTitle, playerName }: { moduleTitle: string; playerName: string }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const canvas = await drawCertificate(moduleTitle, playerName);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Certificate - ${moduleTitle} - ${playerName}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-3">
      <div
        className="relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-border shadow-lg"
        style={{ aspectRatio: `${TEMPLATE_WIDTH} / ${TEMPLATE_HEIGHT}`, containerType: "inline-size" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered onto a <canvas> for
         * download too, so a plain <img> keeps the two code paths (screen + export) reading the
         * exact same file instead of next/image's separately-optimized variant. */}
        <img src={TEMPLATE_SRC} alt="Certificate template" className="absolute inset-0 h-full w-full object-cover" />
        <p
          className="absolute font-semibold uppercase leading-tight text-[#1f2937]"
          style={{
            left: `${(MODULE_LINE.centerXPct - MODULE_LINE.maxWidthPct / 2) * 100}%`,
            width: `${MODULE_LINE.maxWidthPct * 100}%`,
            top: `${MODULE_LINE.topPct * 100}%`,
            fontSize: `${MODULE_LINE.fontSizePct * 100}cqw`,
            lineHeight: `${MODULE_LINE.lineHeightPct * 100}cqw`,
            textAlign: "center",
          }}
        >
          OF {moduleTitle.toUpperCase()} COMPLETING
        </p>
        <p
          className="absolute font-bold uppercase text-[#1f2937] whitespace-nowrap"
          style={{
            left: `${NAME_LINE.centerXPct * 100}%`,
            top: `${NAME_LINE.topPct * 100}%`,
            transform: "translateX(-50%)",
            fontSize: `${NAME_LINE.fontSizePct * nameFontSizeFactor(playerName) * 100}cqw`,
            lineHeight: 1,
          }}
        >
          {playerName}
        </p>
      </div>
      <Button variant="secondary" className="w-full" onClick={handleDownload} disabled={downloading}>
        {downloading ? "Preparing..." : "Download Certificate"}
      </Button>
    </div>
  );
}
