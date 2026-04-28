import Link from "next/link";

interface OnboardingChecklistProps {
  hasClips: boolean;
  hasCredits: boolean;
  slug: string;
  bookingKey: string;
}

const steps = [
  { key: "clips", label: "Add your showreel", href: "/dashboard/profile", icon: "🎬" },
  { key: "credits", label: "Fill in your credits", href: "/dashboard/profile", icon: "📋" },
  { key: "public", label: "Share your public link", href: null, icon: "🔗" },
  { key: "booking", label: "Send booking link to a producer", href: null, icon: "📨" },
] as const;

export default function OnboardingChecklist({
  hasClips,
  hasCredits,
  slug,
  bookingKey,
}: OnboardingChecklistProps) {
  const completed = {
    clips: hasClips,
    credits: hasCredits,
    public: false,
    booking: false,
  };

  const completedCount = Object.values(completed).filter(Boolean).length;

  return (
    <div className="border border-[#EEE] rounded-lg p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[14px] font-bold">Get started</p>
        <span className="text-[12px] text-[#888]">{completedCount}/4 complete</span>
      </div>

      <div className="space-y-3">
        {steps.map((step) => {
          const done = completed[step.key];
          const href =
            step.key === "public"
              ? `/crew/${slug}`
              : step.key === "booking"
                ? `/crew/${slug}?key=${bookingKey}`
                : step.href;

          return (
            <Link
              key={step.key}
              href={href || "#"}
              className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
                done
                  ? "border-[#1A8C5E]/20 bg-[#F0FAF5]"
                  : "border-[#EEE] hover:border-[#DBA508]"
              }`}
            >
              <span className="text-[16px]">{done ? "✅" : step.icon}</span>
              <span
                className={`text-[13px] ${
                  done ? "text-[#1A8C5E] line-through" : "text-[#111] font-medium"
                }`}
              >
                {step.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
