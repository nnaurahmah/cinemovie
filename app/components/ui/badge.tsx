import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "success" | "warning" | "error" | "info";
}

export function Badge({
  children,
  variant = "neutral",
  className = "",
  ...props
}: BadgeProps) {
  const variantStyles = {
    neutral:
      "bg-[var(--color-surface-elevated)] text-[var(--color-text)] border-[var(--color-border)]",
    success:
      "bg-[var(--color-success)]/15 text-[#4ade80] border-[var(--color-success)]/30",
    warning:
      "bg-[var(--color-warning)]/15 text-[#fbbf24] border-[var(--color-warning)]/30",
    error:
      "bg-[var(--color-error)]/15 text-[#f87171] border-[var(--color-error)]/30",
    info:
      "bg-[var(--color-info)]/15 text-[#60a5fa] border-[var(--color-info)]/30",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-[var(--radius-sm)] text-[14px] font-medium border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
