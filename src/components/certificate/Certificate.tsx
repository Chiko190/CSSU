"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatIssuedDate } from "./format";

/** One template per unit -- public/certificates/uc{order}.jpg. Each already carries the UC title
 * and competency areas; its "[NAME OF STUDENT]" placeholder was erased so only the blue banner is
 * left. This component draws the three things that vary per learner: their name inside that
 * banner, and the certificate serial + issue date + verify address in the bottom-right corner.
 * The screen preview and the download are the same canvas, so they can never disagree. All
 * coordinates are in the templates' own 1536x1024 pixel space. */
const TEMPLATE_WIDTH = 1536;
const TEMPLATE_HEIGHT = 1024;

function certificateTemplateSrc(moduleOrder: number): string {
  return `/certificates/uc${moduleOrder}.jpg`;
}

/** The banner's inner blue area runs x ~200-1330, y ~372-460. */
const NAME_LINE = { centerX: 765, centerY: 418, maxWidth: 1000, fontSize: 74 };

/** Bottom-right serial box, right-aligned against the gold swoosh and kept below the body text's
 * last line (which ends around y 945). */
const SERIAL_BOX = { right: 1518, bottom: 1016, paddingX: 14, paddingY: 8, radius: 10, lineGap: 4 };
const SERIAL_FONT = { size: 16, css: "700 16px 'Courier New', monospace" };
const DETAIL_FONT = { size: 12, css: "500 12px Arial, Helvetica, sans-serif" };

export interface CertificateProps {
  moduleOrder: number;
  moduleTitle: string;
  recipientName: string;
  certificateId: string;
  issuedAt: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function drawCertificate(props: CertificateProps, verifyUrl: string): Promise<HTMLCanvasElement> {
  const image = await loadImage(certificateTemplateSrc(props.moduleOrder));
  const canvas = document.createElement("canvas");
  canvas.width = TEMPLATE_WIDTH;
  canvas.height = TEMPLATE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(image, 0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);

  // Name: white, bold, shrunk to fit the banner if it's long.
  const name = props.recipientName.toUpperCase();
  let nameSize = NAME_LINE.fontSize;
  ctx.font = `800 ${nameSize}px Arial, Helvetica, sans-serif`;
  const measured = ctx.measureText(name).width;
  if (measured > NAME_LINE.maxWidth) {
    nameSize = Math.floor((nameSize * NAME_LINE.maxWidth) / measured);
    ctx.font = `800 ${nameSize}px Arial, Helvetica, sans-serif`;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(name, NAME_LINE.centerX, NAME_LINE.centerY);
  ctx.shadowColor = "transparent";

  // Serial box: dark navy pill so it reads over the blue/gold corner art.
  const serialLine = `Certificate No. ${props.certificateId}`;
  const detailLines = [`Issued ${formatIssuedDate(props.issuedAt)}`, `Verify: ${verifyUrl.replace(/^https?:\/\//, "")}`];
  ctx.font = SERIAL_FONT.css;
  const serialWidth = ctx.measureText(serialLine).width;
  ctx.font = DETAIL_FONT.css;
  const detailWidth = Math.max(...detailLines.map((l) => ctx.measureText(l).width));
  const boxWidth = Math.max(serialWidth, detailWidth) + SERIAL_BOX.paddingX * 2;
  const boxHeight =
    SERIAL_FONT.size + detailLines.length * (SERIAL_BOX.lineGap + DETAIL_FONT.size) + SERIAL_BOX.paddingY * 2;
  const boxX = SERIAL_BOX.right - boxWidth;
  const boxY = SERIAL_BOX.bottom - boxHeight;

  ctx.fillStyle = "rgba(4, 20, 70, 0.88)";
  ctx.strokeStyle = "#e3b341";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, SERIAL_BOX.radius);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  const textRight = SERIAL_BOX.right - SERIAL_BOX.paddingX;
  let textY = boxY + SERIAL_BOX.paddingY;
  ctx.font = SERIAL_FONT.css;
  ctx.fillStyle = "#f5d76e";
  ctx.fillText(serialLine, textRight, textY);
  textY += SERIAL_FONT.size + SERIAL_BOX.lineGap;
  ctx.font = DETAIL_FONT.css;
  ctx.fillStyle = "#e5ecff";
  for (const line of detailLines) {
    ctx.fillText(line, textRight, textY);
    textY += DETAIL_FONT.size + SERIAL_BOX.lineGap;
  }

  return canvas;
}

export function Certificate(props: CertificateProps) {
  const { moduleOrder, moduleTitle, recipientName, certificateId, issuedAt } = props;
  const [rendered, setRendered] = useState<{ previewUrl: string; verifyUrl: string } | null>(null);
  const previewUrl = rendered?.previewUrl ?? null;
  const verifyUrl = rendered?.verifyUrl ?? null;
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // The verify address uses whatever host the app is being served from, which is only known in the
  // browser -- so the certificate is drawn after mount, with the bare template shown until then.
  useEffect(() => {
    const url = `${window.location.origin}/verify/${certificateId}`;
    let cancelled = false;
    drawCertificate({ moduleOrder, moduleTitle, recipientName, certificateId, issuedAt }, url)
      .then((canvas) => {
        if (!cancelled) setRendered({ previewUrl: canvas.toDataURL("image/jpeg", 0.92), verifyUrl: url });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [moduleOrder, moduleTitle, recipientName, certificateId, issuedAt]);

  async function handleDownload() {
    if (!verifyUrl) return;
    setDownloading(true);
    try {
      const canvas = await drawCertificate(props, verifyUrl);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Certificate - UC${moduleOrder} ${moduleTitle} - ${recipientName} (${certificateId}).png`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopy() {
    if (!verifyUrl) return;
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure origin, permissions) -- the link is still shown below.
    }
  }

  return (
    <div className="w-full max-w-3xl space-y-3">
      <div
        className="relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-border shadow-lg"
        style={{ aspectRatio: `${TEMPLATE_WIDTH} / ${TEMPLATE_HEIGHT}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- a canvas-rendered data URL, which
         * next/image can't optimize; before it's ready the plain template stands in. */}
        <img
          src={previewUrl ?? certificateTemplateSrc(moduleOrder)}
          alt={`UC ${moduleOrder} certificate of completion for ${recipientName}`}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity ${previewUrl ? "" : "opacity-60"}`}
        />
      </div>
      <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-border-soft bg-bg-elevated px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span className="text-text-faint">Certificate No. </span>
          <span className="font-mono-tabular font-semibold text-text">{certificateId}</span>
          <span className="text-text-faint"> · Issued {formatIssuedDate(issuedAt)}</span>
        </div>
        {verifyUrl && (
          <a href={verifyUrl} target="_blank" rel="noreferrer" className="shrink-0 font-semibold text-primary hover:underline">
            View public verification ↗
          </a>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button variant="secondary" className="w-full" onClick={handleDownload} disabled={downloading || !verifyUrl}>
          {downloading ? "Preparing..." : "Download Certificate"}
        </Button>
        <Button variant="secondary" className="w-full" onClick={handleCopy} disabled={!verifyUrl}>
          {copied ? "Link copied!" : "Copy verification link"}
        </Button>
      </div>
    </div>
  );
}
