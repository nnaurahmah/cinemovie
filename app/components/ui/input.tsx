import React, { useId } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = "", disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        <label
          htmlFor={inputId}
          className="text-[14px] font-medium text-[var(--color-text)]"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full min-h-[44px] px-3 py-2 bg-[var(--color-surface)] text-[var(--color-text)] text-[14px] rounded-[var(--radius-md)] border transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-[var(--color-text)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? "border-[var(--color-error)]"
              : "border-[var(--color-border)] focus-visible:border-[var(--color-text)]"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="text-[14px] text-[var(--color-error)]"
          >
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-[14px] text-[var(--color-text-muted)]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
