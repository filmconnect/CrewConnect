import Link from "next/link";
import { requireProducer } from "@/lib/producer-auth";
import { prisma } from "@/lib/prisma";
import ProducerShell from "@/components/producers/ProducerShell";

export default async function ProducerHomePage() {
  const { producerId, producer } = await requireProducer();

  const [savedCount, searchCount, recentSearches] = await Promise.all([
    prisma.savedCrew.count({ where: { producerId } }),
    prisma.searchQuery.count({ where: { producerId } }),
    prisma.searchQuery.findMany({
      where: { producerId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

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
            <p className="text-[28px] font-bold">0</p>
            <p className="text-[13px] text-[#888]">Active bookings</p>
          </div>
        </div>

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
