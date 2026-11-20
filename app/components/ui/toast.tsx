import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export interface ToastProps {
  type?: "success" | "warning" | "error" | "info";
  message: string;
  onClose?: () => void;
  className?: string;
}

export function Toast({
  type = "info",
  message,
  onClose,
  className = "",
}: ToastProps) {
  const iconProps = {
    size: 20,
    strokeWidth: 1.75,
    className: "shrink-0",
    "aria-hidden": true,
  };

  const config = {
    success: {
      border: "border-[var(--color-success)]",
      icon: <CheckCircle2 {...iconProps} className="shrink-0 text-[var(--color-success)]" />,
    },
    warning: {
      border: "border-[var(--color-warning)]",
      icon: <AlertTriangle {...iconProps} className="shrink-0 text-[var(--color-warning)]" />,
    },
    error: {
      border: "border-[var(--color-error)]",
      icon: <AlertCircle {...iconProps} className="shrink-0 text-[var(--color-error)]" />,
    },
    info: {
      border: "border-[var(--color-info)]",
      icon: <Info {...iconProps} className="shrink-0 text-[var(--color-info)]" />,
    },
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-3 p-4 bg-[var(--color-surface-elevated)] border rounded-[var(--radius-lg)] text-[var(--color-text)] shadow-[var(--shadow-subtle)] ${config[type].border} ${className}`}
    >
      {config[type].icon}
      <p className="text-[14px] leading-normal flex-1">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup pemberitahuan"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer rounded-[var(--radius-sm)] focus-visible:outline-2 focus-visible:outline-[var(--color-text)]"
        >
          <X size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
