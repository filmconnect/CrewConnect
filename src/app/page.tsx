import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ─── Hero ──────────────────────────────────────── */}
      <section className="text-center py-16 px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#DBA508] mb-4">
          FOR EUROPEAN FILM CREW
        </p>
        <h1 className="text-[36px] sm:text-[44px] font-bold tracking-[-0.8px] leading-[1.15]">
          <span
            className="relative inline-block"
            style={{
              background:
                "linear-gradient(180deg, transparent 55%, #DBA508 55%, #DBA508 90%, transparent 90%)",
            }}
          >
            <span className="font-black italic">your work.</span>
          </span>{" "}
          your schedule.
          <br />
          one link.
        </h1>
        <p className="text-[14px] text-[#888] mt-4 max-w-md mx-auto">
          Showreel, credits, and live availability.
          <br />
          Share it. Get booked.
        </p>
        <Link
          href="/auth/register"
          className="inline-block mt-6 bg-[#111] text-white font-bold rounded-md px-6 py-3 hover:bg-[#222] transition-colors"
        >
          Create your page - free!
        </Link>
      </section>

      {/* ─── Dual Link Visual ──────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Public card */}
          <div className="border border-[#EEE] rounded-lg overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#111] flex items-center justify-center text-white text-[12px] font-bold">
                MH
              </div>
              <div>
                <p className="text-[14px] font-bold">Marko Horvat</p>
                <p className="text-[12px] text-[#DBA508]">Director of Photography</p>
              </div>
            </div>
            <div className="px-4 pb-3 space-y-1.5">
              <div className="flex items-center gap-2 text-[12px] text-[#888]">
                <span className="w-2 h-2 rounded-full bg-[#1A8C5E]" />
                Showreel + project clips
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#888]">
                <span className="w-2 h-2 rounded-full bg-[#1A8C5E]" />
                Credits + equipment
              </div>
            </div>
            <div className="bg-[#FAFAFA] px-4 py-3 border-t border-[#EEE]">
              <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888]">
                PUBLIC - YOUR PORTFOLIO
              </p>
              <p className="text-[12px] text-[#888] mt-0.5">
                crewconnect.com/marko-horvat
              </p>
            </div>
          </div>

          {/* Private card */}
          <div className="border border-[#DBA508] rounded-lg overflow-hidden bg-[#FFFDF5]">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#DBA508] flex items-center justify-center text-[#111] text-[12px] font-bold">
                MH
              </div>
              <div>
                <p className="text-[14px] font-bold">Marko Horvat</p>
                <p className="text-[12px] text-[#DBA508]">Director of Photography</p>
              </div>
            </div>
            <div className="px-4 pb-3 space-y-1.5">
              <div className="flex items-center gap-2 text-[12px] text-[#888]">
                <span className="w-2 h-2 rounded-full bg-[#1A8C5E]" />
                Everything from public +
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#888]">
                <span className="w-2 h-2 rounded-full bg-[#DBA508]" />
                Live availability + booking
              </div>
            </div>
            <div className="bg-[#DBA508]/10 px-4 py-3 border-t border-[#DBA508]/30">
              <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#DBA508]">
                PRIVATE - FOR PRODUCERS
              </p>
              <p className="text-[12px] text-[#888] mt-0.5">
                crewconnect.com/marko-horvat?key=x7k9m
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────── */}
      <section className="bg-[#FAFAFA] py-16 px-6">
        <h2 className="text-[28px] font-bold tracking-[-0.5px] text-center mb-12">
          <span className="font-black italic">how</span> it works
        </h2>
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <Step
            num={1}
            title="build"
            rest="your page"
            desc="Showreel, clips, credits. 5 minutes."
          />
          <Step
            num={2}
            title="keep"
            rest="calendar updated"
            desc="Add bookings, block dates. Green = free. Red = booked."
          />
          <Step
            num={3}
            title="share"
            rest="your links"
            desc="Public page for everyone. Booking link for producers."
          />
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-[28px] font-bold tracking-[-0.5px] leading-[1.2] mb-4">
              <span className="font-black italic">more</span> than a calendar.
              <br />
              your professional{" "}
              <span className="font-black italic">page.</span>
            </h2>
            <p className="text-[14px] text-[#888] mb-6">
              Showreel, project clips, credits, equipment — all in one place.
              Public link for everyone. Booking link only for producers you choose.
            </p>
            <ul className="space-y-2.5">
              <Feature text="Showreel + project clips (Vimeo/YouTube)" />
              <Feature text="Credits — your filmography" />
              <Feature text="Private link with live availability" />
              <Feature text="One-click booking with contract upload" />
            </ul>
          </div>

          {/* Mini dashboard preview */}
          <div className="border border-[#EEE] rounded-lg p-5 bg-white">
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] mb-3">
              YOUR DASHBOARD
            </p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="border border-[#EEE] rounded-md p-3">
                <p className="text-[18px] font-bold">5</p>
                <p className="text-[11px] text-[#888]">Confirmed days</p>
              </div>
              <div className="border border-[#EEE] rounded-md p-3">
                <p className="text-[18px] font-bold">€2,750</p>
                <p className="text-[11px] text-[#888]">This month</p>
              </div>
            </div>
            <div className="bg-[#FFF8E1] border border-[#F5E6A3] rounded-md p-3 mb-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#DBA508]">
                NEW REQUEST
              </p>
              <p className="text-[12px] text-[#888] mt-0.5">
                BMW 5 Series · Apr 15-18 · €600/day
              </p>
            </div>
            <div className="bg-[#FFF8E1] border border-[#F5E6A3] rounded-md p-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#DBA508]">
                COMING SOON
              </p>
              <p className="text-[14px] font-bold mt-1">
                <span className="font-black italic">secure</span> payments
              </p>
              <p className="text-[12px] text-[#888] mt-0.5">
                Producers pay upfront. You get paid after wrap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ────────────────────────────────── */}
      <section className="bg-[#111] py-16 text-center">
        <h2 className="text-[28px] font-bold text-white tracking-[-0.5px]">
          <span
            className="relative inline-block"
            style={{
              background:
                "linear-gradient(180deg, transparent 55%, #DBA508 55%, #DBA508 90%, transparent 90%)",
            }}
          >
            <span className="font-black italic">your work.</span>
          </span>{" "}
          your calendar.
          <br />
          one page.
        </h2>
        <p className="text-[14px] text-[#888] mt-4">
          Free for crew. Always.
        </p>
        <Link
          href="/auth/register"
          className="inline-block mt-6 bg-[#DBA508] text-[#111] font-bold rounded-md px-6 py-3 hover:bg-[#c99507] transition-colors"
        >
          Create your page - free!
        </Link>
      </section>

      {/* ─── Footer ────────────────────────────────────── */}
      <footer className="border-t border-[#EEE] py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-[12px] text-[#888]">
          <p>Crewconnect © {new Date().getFullYear()}. Built in Zagreb by Sekvenca</p>
          <div className="flex items-center gap-4">
            <Link href="/producers" className="hover:text-[#7C5CFC] font-medium">For producers</Link>
            <span className="text-[#DDD]">·</span>
            <Link href="/privacy" className="hover:text-[#111]">Privacy policy</Link>
            <Link href="/terms" className="hover:text-[#111]">Terms of Service</Link>
            <Link href="/contact" className="hover:text-[#111]">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Step({
  num,
  title,
  rest,
  desc,
}: {
  num: number;
  title: string;
  rest: string;
  desc: string;
}) {
  return (
    <div>
      <div className="w-12 h-12 rounded-full bg-[#DBA508] text-[#111] font-bold text-[18px] flex items-center justify-center mx-auto mb-3">
        {num}
      </div>
      <p className="text-[16px] font-bold">
        <span
          className="relative inline-block"
          style={{
            background:
              "linear-gradient(180deg, transparent 55%, #DBA508 55%, #DBA508 90%, transparent 90%)",
          }}
        >
          <span className="font-black italic">{title}</span>
        </span>{" "}
        {rest}
      </p>
      <p className="text-[13px] text-[#888] mt-1">{desc}</p>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-[13px] text-[#111]">
      <span className="text-[#1A8C5E]">✓</span>
      {text}
    </li>
  );
}
