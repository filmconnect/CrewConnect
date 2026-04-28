export default function SettingsLoading() {
  return (
    <div className="max-w-3xl animate-pulse space-y-8">
      <div className="h-8 bg-[#FAFAFA] rounded w-32" />
      <div className="space-y-3">
        <div className="h-4 bg-[#FAFAFA] rounded w-24" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-14 bg-[#FAFAFA] rounded-md" />
          <div className="h-14 bg-[#FAFAFA] rounded-md" />
        </div>
      </div>
      <div className="h-px bg-[#EEE]" />
      <div className="h-16 bg-[#FFF8E1] rounded-md" />
      <div className="h-px bg-[#EEE]" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-[#FAFAFA] rounded-md" />
        ))}
      </div>
    </div>
  );
}
