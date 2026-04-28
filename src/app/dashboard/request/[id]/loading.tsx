export default function RequestLoading() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-6">
      <div className="h-8 bg-[#FAFAFA] rounded w-80" />
      <div className="h-4 bg-[#FAFAFA] rounded w-48" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[72px] bg-[#FAFAFA] rounded-lg border border-[#EEE]" />
        ))}
      </div>
      <div className="h-[120px] bg-[#FAFAFA] rounded-lg" />
      <div className="h-[60px] bg-[#FAFAFA] rounded-lg" />
    </div>
  );
}
