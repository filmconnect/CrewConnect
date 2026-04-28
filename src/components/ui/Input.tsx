"use client";

import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888]">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={`
            border border-[#EEE] rounded-md px-3 py-3 text-[14px] text-[#111]
            placeholder:text-[#CCC] transition-colors duration-150
            focus:outline-none focus:border-[#111]
            ${error ? "border-[#C44B4B]" : ""}
            ${className}
          `}
          {...props}
        />
        {error ? <p className="text-[12px] text-[#C44B4B]">{error}</p> : null}
        {helper && !error ? <p className="text-[12px] text-[#888]">{helper}</p> : null}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
