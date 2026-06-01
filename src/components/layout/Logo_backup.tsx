import Link from "next/link";

interface LogoProps {
  href?: string;
  className?: string;
}

export default function Logo({ href = "/", className = "" }: LogoProps) {
  const logo = (
    <span
      className={`text-[17px] font-bold tracking-[-0.6px] select-none ${className}`}
      style={{ fontStyle: "italic" }}
    >
      <span className="text-[#111]">crew</span>
      <span className="text-[#DBA508]">connect</span>
    </span>
  );

  return <Link href={href}>{logo}</Link>;
}
