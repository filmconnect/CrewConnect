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
    <div className="bg-[#F0ECFF] border border-[#7C5CFC]/15 rounded-lg px-6 py-4 mt-8 flex items-center justify-between gap-4">
      <p className="text-[14px] text-[#333]">
        Are you a producer?{" "}
        {crewName
          ? `Search & book ${crewName} and other crew with AI.`
          : "Search & book crew with AI matching."}
      </p>
      <Link href="/producers" className="text-[14px] font-semibold text-[#7C5CFC] whitespace-nowrap hover:underline">
        Learn more →
      </Link>
    </div>
  );
}
