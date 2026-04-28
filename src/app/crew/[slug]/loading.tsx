import Navbar from "@/components/layout/Navbar";

export default function CrewProfileLoading() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8 animate-pulse">
        {/* Header */}
        <div className="flex items-start gap-5 mb-8">
          <div className="w-[88px] h-[88px] rounded-lg bg-[#FAFAFA]" />
          <div className="space-y-2">
            <div className="h-7 bg-[#FAFAFA] rounded w-48" />
            <div className="h-4 bg-[#FAFAFA] rounded w-36" />
            <div className="h-4 bg-[#FAFAFA] rounded w-52" />
          </div>
        </div>
        {/* Video area */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="col-span-2 aspect-video bg-[#FAFAFA] rounded-lg" />
          <div className="h-[300px] bg-[#FAFAFA] rounded-lg" />
        </div>
        {/* Credits */}
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#FAFAFA] rounded" />
          ))}
        </div>
      </main>
    </div>
  );
}
