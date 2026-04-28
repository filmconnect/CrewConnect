"use client";

import { useEffect, useRef, useCallback } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, title, children, className = "" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      contentRef.current?.focus();
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Modal"}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={`bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto ${className}`}
      >
        {title ? (
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-h2">{title}</h2>
            <button
              onClick={onClose}
              className="text-[#888] hover:text-[#111] text-xl leading-none p-1"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        ) : null}
        <div className={title ? "px-5 pb-5" : "p-5"}>{children}</div>
      </div>
    </div>
  );
}
