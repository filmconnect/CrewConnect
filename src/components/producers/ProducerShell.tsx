import Link from "next/link";
import Image from "next/image";
import ProducerSignoutButton from "./ProducerSignoutButton";

interface ProducerShellProps {
  mode?: "public" | "producer";
  active?: "home" | "search" | "saved" | "bookings";
  producerName?: string;
  children: React.ReactNode;
}

export default function ProducerShell({
  mode = "public",
  active,
  producerName,
  children,
}: ProducerShellProps) {
  return (
    <div className="producer-shell">
      <header className="border-b border-[#EEE] bg-white">
        <div className="producer-nav">
          <Link
            href={mode === "producer" ? "/producers/home" : "/producers"}
            className="flex items-center gap-1"
            style={{ textDecoration: "none" }}
          >
            <Image src="/logo.png" alt="CrewConnect" width={120} height={16} />
            <span className="producer-chip">PRODUCERS</span>
          </Link>

          {mode === "producer" ? (
            <nav className="producer-nav-tabs">
              <Link
                href="/producers/search"
                className={`producer-nav-tab ${active === "search" ? "active" : ""}`}
              >
                Find crew
              </Link>
              <Link
                href="/producers/home"
                className={`producer-nav-tab ${active === "home" ? "active" : ""}`}
              >
                Home
              </Link>
            </nav>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/" className="text-[13px] text-[#888] hover:text-[#111]">
                For crew →
              </Link>
              <Link href="/producers/signin" className="btn-ghost text-[13px] !py-2 !px-4">
                Sign in
              </Link>
            </div>
          )}

          {mode === "producer" && producerName && (
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-[#888]">
                {producerName}
              </span>
              <ProducerSignoutButton />
            </div>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
