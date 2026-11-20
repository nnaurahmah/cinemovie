import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      isLoading = false,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] text-[14px] font-medium min-h-[44px] min-w-[44px] px-4 py-2 transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-[var(--color-text)] focus-visible:outline-offset-2 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer select-none";

    const variantStyles = {
      primary:
        "bg-[var(--color-primary)] text-[var(--color-text)] hover:brightness-110 active:brightness-95",
      secondary:
        "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] active:brightness-95",
      ghost:
        "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] active:bg-[var(--color-surface-elevated)]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && (
          <Loader2
            className="animate-spin text-current"
            size={18}
            strokeWidth={1.75}
            aria-hidden="true"
          />
        )}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
