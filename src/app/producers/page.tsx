import Link from "next/link";
import ProducerShell from "@/components/producers/ProducerShell";

export const metadata = {
  title: "For Producers — CrewConnect",
  description: "Find and book film crew with AI matching. Invite-only access for producers.",
};

export default function ProducersGatePage() {
  return (
    <ProducerShell mode="public">
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <section className="mb-16">
          <span className="eyebrow-ai">✦ CrewConnect for Producers · Invite only</span>
          <h1 className="text-[40px] font-bold tracking-[-1px] mt-4 leading-tight">
            The right crew,
            <br />
            <span
              className="relative inline-block"
              style={{
                background: "linear-gradient(180deg, transparent 55%, #7C5CFC 55%, #7C5CFC 90%, transparent 90%)",
              }}
            >
              <span className="font-black italic">ranked by AI.</span>
            </span>
          </h1>
          <p className="text-[16px] text-[#666] mt-4 max-w-lg leading-relaxed">
            Describe the shoot and CrewConnect ranks available crew by gear, credits, rate,
            reviews — and who has already worked with your partners. Every match is explained.
          </p>

          <div className="flex items-center gap-4 mt-8">
            <Link href="/producers/request" className="btn-ai text-[15px] !py-3 !px-8">
              Request access ✦
            </Link>
            <Link href="/producers/signin" className="btn-ghost text-[15px] !py-3 !px-8">
              Have an invite? Sign in
            </Link>
          </div>

          <p className="text-[12px] text-[#888] mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1A8C5E] inline-block" />
            Currently invite-only — we approve good fits within a few days.
          </p>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 rounded-lg bg-white border border-[#EEE]">
            <div className="text-[20px] mb-3">✦</div>
            <h3 className="text-[15px] font-bold mb-2">AI Search</h3>
            <p className="text-[13px] text-[#666] leading-relaxed">
              Describe the role in plain language — get a ranked shortlist of available crew, with the reasoning shown.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-white border border-[#EEE]">
            <div className="text-[20px] mb-3">✦</div>
            <h3 className="text-[15px] font-bold mb-2">Smart recommendations</h3>
            <p className="text-[13px] text-[#666] leading-relaxed">
              Crew your production partners already trust, plus people frequently booked together on similar shoots.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-white border border-[#EEE] border-l-[3px] border-l-[#DBA508]">
            <div className="text-[20px] mb-3">★</div>
            <h3 className="text-[15px] font-bold mb-2">Verified &amp; reviewed</h3>
            <p className="text-[13px] text-[#666] leading-relaxed">
              Real credits and honest producer reviews. Live availability, no price-dumping.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[1px] text-[#888] mb-6">How it works</p>
          <div className="space-y-6">
            {[
              { n: "1", title: "Describe the shoot", desc: "Role, dates, gear, budget, project type — in one sentence." },
              { n: "2", title: "Get matched", desc: "A ranked shortlist with an explainable AI match score for each name." },
              { n: "3", title: "Book in one click", desc: "Send a request with brief or contract. Timestamped confirmation on accept." },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-[#7C5CFC] text-white flex items-center justify-center text-[14px] font-bold flex-shrink-0">
                  {step.n}
                </span>
                <div>
                  <p className="text-[14px] font-bold">{step.title}</p>
                  <p className="text-[13px] text-[#666]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#EEE] pt-6 flex items-center justify-between text-[12px] text-[#888]">
          <span>CrewConnect © 2026 · Built in Zagreb by Sekvenca</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-[#111]">For crew</Link>
            <Link href="/privacy" className="hover:text-[#111]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#111]">Terms</Link>
          </div>
        </footer>
      </main>
    </ProducerShell>
  );
}
