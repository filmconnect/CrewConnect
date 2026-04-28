import { formatEur } from "@/lib/format";

interface StatsCardsProps {
  confirmedDays: number;
  pendingCount: number;
  earningsThisMonth: number;
  avgDayRate: number;
}

export default function StatsCards({
  confirmedDays,
  pendingCount,
  earningsThisMonth,
  avgDayRate,
}: StatsCardsProps) {
  const stats = [
    { value: String(confirmedDays), label: "Confirmed days" },
    { value: String(pendingCount), label: "Pending" },
    { value: formatEur(earningsThisMonth), label: "This month" },
    { value: formatEur(avgDayRate), label: "Avg. day rate" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="border border-[#EEE] rounded-lg p-4 bg-white"
        >
          <p className="text-[20px] font-bold tracking-[-0.3px]">{stat.value}</p>
          <p className="text-[13px] text-[#888] mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
