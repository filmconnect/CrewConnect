"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import type { ButtonVariant } from "@/types";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[#111] text-white hover:bg-[#222]",
  gold: "bg-[#DBA508] text-[#111] font-bold hover:bg-[#c99507]",
  outline: "border border-[#111] text-[#111] bg-transparent hover:bg-[#FAFAFA]",
  danger: "border border-[#C44B4B] text-[#C44B4B] bg-transparent hover:bg-[#FFF5F5]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading = false, fullWidth = false, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center rounded-md px-5 py-3 text-[14px] font-medium
          transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
