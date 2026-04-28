import Link from "next/link";

const PRO_FEATURES = [
  ["Invoice generation", "auto PDF from booking data"],
  ["Unlimited credits", "instead of 10"],
  ["Earnings dashboard", "monthly + yearly totals"],
  ["Multiple booking links", "track by producer"],
  ["5 video clips", "instead of 3"],
  ["Verified badge", "on your profile"],
  ["PDF portfolio", "export profile as PDF"],
  ["Priority in search", "when marketplace launches"],
];

export default function ProUpsell() {
  return (
    <div className="bg-[#FFF8E1] border border-[#F5E6A3] rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[17px] font-bold tracking-[-0.6px]">
            <span className="font-black italic">crew</span>
            <span className="text-[#DBA508] font-bold">connect</span>
            <span className="text-[#DBA508] font-black ml-1">PRO</span>
          </p>
          <p className="text-[13px] text-[#8B6508] mt-0.5">
            For crew who want more visibility and tools
          </p>
        </div>
        <div className="text-right">
          <p className="text-[28px] font-bold">€9<span className="text-[14px] font-normal text-[#888]">/mo</span></p>
          <p className="text-[12px] text-[#888]">or €89/year</p>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6">
        {PRO_FEATURES.map(([title, desc]) => (
          <div key={title} className="flex items-start gap-2">
            <span className="text-[#DBA508] mt-0.5">★</span>
            <p className="text-[13px]">
              <span className="font-bold">{title}</span>
              <span className="text-[#888]"> — {desc}</span>
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/pro"
        className="block w-full bg-[#DBA508] text-[#111] font-bold text-center rounded-md py-3 hover:bg-[#c99507] transition-colors"
      >
        Upgrade to PRO — €9/month
      </Link>
      <p className="text-[12px] text-[#8B6508] text-center mt-2">
        Cancel anytime. 7-day free trial.
      </p>
    </div>
  );
}
