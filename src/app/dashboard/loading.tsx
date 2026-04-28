export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Dual link bar */}
      <div className="grid grid-cols-2 gap-4">
        <div className="h-[72px] bg-[#FAFAFA] rounded-lg" />
        <div className="h-[72px] bg-[#FAFAFA] rounded-lg" />
      </div>
      {/* Greeting */}
      <div className="h-8 bg-[#FAFAFA] rounded w-64" />
      <div className="h-4 bg-[#FAFAFA] rounded w-48" />
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[80px] bg-[#FAFAFA] rounded-lg border border-[#EEE]" />
        ))}
      </div>
      {/* Calendar area */}
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 h-[320px] bg-[#FAFAFA] rounded-lg" />
        <div className="col-span-2 h-[320px] bg-[#FAFAFA] rounded-lg" />
      </div>
    </div>
  );
}
