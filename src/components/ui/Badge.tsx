import type { BadgeVariant } from "@/types";

const variantStyles: Record<BadgeVariant, string> = {
  pending: "bg-[#FFF8E1] text-[#8B6508] border-[#F5E6A3]",
  confirmed: "bg-[#F0FAF5] text-[#1A8C5E] border-[#1A8C5E]/20",
  danger: "bg-[#FFF5F5] text-[#C44B4B] border-[#C44B4B]/20",
  done: "bg-[#F5F5F5] text-[#AAA] border-[#DDD]",
};

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium uppercase tracking-[0.5px] border
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
