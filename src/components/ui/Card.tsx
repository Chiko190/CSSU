import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-border bg-surface [box-shadow:var(--shadow-card)] ${className}`}
      {...props}
    />
  );
}
