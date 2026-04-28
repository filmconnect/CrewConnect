export default function ProfileLoading() {
  return (
    <div className="max-w-3xl animate-pulse space-y-6">
      <div className="h-8 bg-[#FAFAFA] rounded w-48" />
      <div className="h-4 bg-[#FAFAFA] rounded w-32" />
      <div className="flex gap-4">
        <div className="w-[80px] h-[80px] bg-[#FAFAFA] rounded-lg" />
        <div className="flex-1 h-[48px] bg-[#FAFAFA] rounded" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-[48px] bg-[#FAFAFA] rounded" />
        <div className="h-[48px] bg-[#FAFAFA] rounded" />
      </div>
      <div className="h-[100px] bg-[#FAFAFA] rounded" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-[100px] bg-[#FAFAFA] rounded" />
        <div className="h-[48px] bg-[#FAFAFA] rounded" />
      </div>
      <div className="h-4 bg-[#FAFAFA] rounded w-32 mt-8" />
      <div className="space-y-3">
        <div className="h-[100px] bg-[#FAFAFA] rounded" />
        <div className="h-[100px] bg-[#FAFAFA] rounded" />
      </div>
    </div>
  );
}
