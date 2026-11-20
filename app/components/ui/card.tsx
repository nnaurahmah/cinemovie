import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated";
}

export function Card({
  children,
  variant = "default",
  className = "",
  ...props
}: CardProps) {
  const bg =
    variant === "elevated"
      ? "bg-[var(--color-surface-elevated)]"
      : "bg-[var(--color-surface)]";

  return (
    <div
      className={`rounded-[var(--radius-xl)] border border-[var(--color-border)] ${bg} p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`pb-4 border-b border-[var(--color-border-subtle)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`pt-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
