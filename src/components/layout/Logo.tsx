import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  href?: string;
  className?: string;
}

export default function Logo({ href = "/", className = "" }: LogoProps) {
  const logo = (
    <Image
      src="/logo.png"
      alt="CrewConnect"
      width={140}
      height={19}
      className={`select-none ${className}`}
      priority
    />
  );

  return <Link href={href}>{logo}</Link>;
}
