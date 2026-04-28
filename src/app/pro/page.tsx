import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { getSession } from "@/lib/auth";

const FEATURES = [
  { name: "Video clips", free: "3", pro: "5" },
  { name: "Credits", free: "10", pro: "Unlimited" },
  { name: "Invoice generation", free: "3 free", pro: "Unlimited" },
  { name: "Verified badge", free: "–", pro: "check" },
  { name: "Earnings dashboard", free: "–", pro: "check" },
  { name: "PDF portfolio export", free: "–", pro: "check" },
  { name: "Multiple booking links", free: "1", pro: "5" },
  { name: "Priority in search", free: "–", pro: "coming" },
] as const;

export default async function ProPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={session?.user} />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#DBA508] mb-4">
            CREWCONNECT PRO
          </p>
          <h1 className="text-[36px] font-bold tracking-[-0.8px]">
            <span
              className="relative inline-block"
              style={{ background: "linear-gradient(180deg, transparent 55%, #DBA508 55%, #DBA508 90%, transparent 90%)" }}
            >
              <span className="font-black italic">more work.</span>
            </span>{" "}
            less admin.
          </h1>
          <p className="text-[14px] text-[#888] mt-3">
            Tools to get booked more and manage your business.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {/* Monthly */}
          <div className="border border-[#EEE] rounded-lg p-6 text-center">
            <p className="text-[14px] font-black italic">monthly</p>
            <p className="text-[40px] font-bold mt-2">€9</p>
            <p className="text-[13px] text-[#888]">per month</p>
            <button
              className="w-full mt-6 border border-[#111] text-[#111] font-bold rounded-md py-3 hover:bg-[#FAFAFA] transition-colors"
              onClick={undefined}
            >
              Choose monthly
            </button>
          </div>

          {/* Yearly */}
          <div className="border border-[#DBA508] rounded-lg p-6 text-center bg-[#FFF8E1] relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#DBA508] text-[#111] text-[10px] font-bold uppercase px-3 py-1 rounded">
              SAVE 18%
            </span>
            <p className="text-[14px] font-black italic">yearly</p>
            <p className="text-[40px] font-bold mt-2 text-[#DBA508]">€89</p>
            <p className="text-[13px] text-[#DBA508]">per month</p>
            <button className="w-full mt-6 bg-[#DBA508] text-[#111] font-bold rounded-md py-3 hover:bg-[#c99507] transition-colors">
              Choose yearly
            </button>
          </div>
        </div>

        {/* Feature table */}
        <div className="border border-[#EEE] rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_100px] gap-4 px-5 py-3 bg-[#FAFAFA] border-b border-[#EEE]">
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888]">FEATURE</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] text-center">FREE</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#DBA508] text-center">PRO</p>
          </div>
          {FEATURES.map((f) => (
            <div key={f.name} className="grid grid-cols-[1fr_100px_100px] gap-4 px-5 py-3 border-b border-[#EEE] last:border-0">
              <p className="text-[14px]">{f.name}</p>
              <p className="text-[14px] text-center text-[#888]">{f.free}</p>
              <p className="text-[14px] text-center font-bold">
                {f.pro === "check" ? "✅" : f.pro === "coming" ? (
                  <span className="bg-[#DBA508] text-[#111] text-[9px] font-bold px-2 py-0.5 rounded italic">coming soon</span>
                ) : f.pro}
              </p>
            </div>
          ))}
        </div>

        <p className="text-[12px] text-[#888] text-center mt-6 max-w-lg mx-auto">
          <span className="font-bold">Always free:</span> Profile page, public + booking link, calendar,
          booking requests, up to 3 clips, up to 10 credits. No credit card required.
        </p>
      </main>
    </div>
  );
}
