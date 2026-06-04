import Link from "next/link";
import { requireProducer } from "@/lib/producer-auth";
import { prisma } from "@/lib/prisma";
import { formatEur, formatDateRange } from "@/lib/format";
import ProducerShell from "@/components/producers/ProducerShell";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-[#FFF8E1] text-[#8B6508] border-[#F5E6A3]" },
  accepted: { label: "Confirmed", className: "bg-[#E8F5E9] text-[#1B5E20] border-[#1A8C5E]/20" },
  declined: { label: "Declined", className: "bg-[#FFEBEE] text-[#B71C1C] border-[#C44B4B]/20" },
  done: { label: "Done", className: "bg-[#F5F5F5] text-[#666] border-[#DDD]" },
};

export default async function ProducerHomePage() {
  const { producerId, producer } = await requireProducer();

  const [savedCount, searchCount, recentSearches, bookingRequests] = await Promise.all([
    prisma.savedCrew.count({ where: { producerId } }),
    prisma.searchQuery.count({ where: { producerId } }),
    prisma.searchQuery.findMany({
      where: { producerId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.bookingRequest.findMany({
      where: { producerEmail: producer.email },
      include: { profile: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activeBookingsCount = bookingRequests.filter(
    (r) => r.status === "accepted"
  ).length;

  const firstName = producer.name.split(" ")[0];

  return (
    <ProducerShell mode="producer" active="home" producerName={`${producer.name} · ${producer.company}`}>
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Greeting */}
        <h1 className="text-[28px] font-bold tracking-[-0.5px] mb-1">
          Welcome, {firstName}
        </h1>
        <p className="text-[14px] text-[#888] mb-8">
          {producer.company} · {producer.role}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-[#EEE] rounded-lg p-5">
            <p className="text-[28px] font-bold">{searchCount}</p>
            <p className="text-[13px] text-[#888]">AI searches</p>
          </div>
          <div className="bg-white border border-[#EEE] rounded-lg p-5">
            <p className="text-[28px] font-bold">{savedCount}</p>
            <p className="text-[13px] text-[#888]">Saved crew</p>
          </div>
          <div className="bg-white border border-[#EEE] rounded-lg p-5">
            <p className="text-[28px] font-bold">{activeBookingsCount}</p>
            <p className="text-[13px] text-[#888]">Active bookings</p>
          </div>
        </div>

        {/* Booking requests */}
        {bookingRequests.length > 0 && (
          <section className="mb-10">
            <h2 className="text-[15px] font-bold mb-4">Your booking requests</h2>
            <div className="space-y-2">
              {bookingRequests.map((r) => {
                const status = STATUS_STYLES[r.status] ?? STATUS_STYLES.pending;
                return (
                  <div
                    key={r.id}
                    className="bg-white border border-[#EEE] rounded-lg p-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <p className="text-[14px] font-bold text-[#111] truncate">
                          {r.projectName}
                        </p>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#666] mt-1">
                        <Link
                          href={`/crew/${r.profile.slug}`}
                          target="_blank"
                          className="hover:underline"
                        >
                          {r.profile.name}
                        </Link>
                        {" · "}
                        {formatDateRange(r.startDate, r.endDate)}
                        {" · "}
                        {formatEur(r.offeredRate)}/day
                      </p>
                    </div>
                    <p className="text-[12px] text-[#888] whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Quick actions */}
        <div className="flex gap-4 mb-10">
          <Link href="/producers/search" className="btn-ai text-[15px] !py-3 !px-8">
            ✦ Find crew with AI
          </Link>
        </div>

        {/* Recent searches */}
        {recentSearches.length > 0 && (
          <section>
            <h2 className="text-[15px] font-bold mb-4">Recent searches</h2>
            <div className="space-y-2">
              {recentSearches.map((s) => (
                <div key={s.id} className="bg-white border border-[#EEE] rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[14px] text-[#111]">{s.rawText.slice(0, 80)}{s.rawText.length > 80 ? "..." : ""}</p>
                    <p className="text-[12px] text-[#888]">
                      {new Date(s.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <span className="text-[12px] text-[#7C5CFC]">✦</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {recentSearches.length === 0 && (
          <div className="bg-white border border-dashed border-[#DDD] rounded-lg p-10 text-center">
            <p className="text-[14px] text-[#888] mb-4">
              No searches yet. Describe your next shoot and let AI find the right crew.
            </p>
            <Link href="/producers/search" className="btn-ai">
              ✦ Start your first search
            </Link>
          </div>
        )}
      </main>
    </ProducerShell>
  );
}
