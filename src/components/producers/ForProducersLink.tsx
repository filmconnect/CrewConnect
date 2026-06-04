import Link from "next/link";

interface ForProducersLinkProps {
  variant?: "link" | "banner";
  crewName?: string;
}

export default function ForProducersLink({ variant = "link", crewName }: ForProducersLinkProps) {
  if (variant === "link") {
    return (
      <Link
        href="/producers"
        className="text-[13px] text-[#888] hover:text-[#7C5CFC] transition-colors"
      >
        For producers →
      </Link>
    );
  }

  return (
    <div className="for-producers-banner">
      <p>
        Are you a producer?{" "}
        {crewName
          ? `Search & book ${crewName} and other crew with AI.`
          : "Search & book crew with AI matching."}
      </p>
      <Link href="/producers">
        Learn more →
      </Link>
    </div>
  );
}
