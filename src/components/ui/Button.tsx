"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 rounded-[var(--radius-full)] disabled:opacity-50 disabled:cursor-not-allowed disabled:saturate-50 active:scale-[0.98] cursor-pointer";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-[#04141c] shadow-[var(--shadow-glow-primary)] hover:bg-primary-strong",
  accent:
    "bg-accent text-[#160a2e] shadow-[var(--shadow-glow-accent)] hover:bg-accent-strong",
  secondary:
    "bg-surface-2 text-text border border-border hover:border-primary/60 hover:text-primary",
  ghost: "bg-transparent text-text-muted hover:text-text hover:bg-surface",
  danger: "bg-danger text-[#2b0410] hover:bg-danger-strong",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-base px-6 py-3",
  lg: "text-lg px-8 py-4",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
