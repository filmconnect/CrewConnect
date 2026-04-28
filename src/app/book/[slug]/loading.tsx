import Navbar from "@/components/layout/Navbar";

export default function BookingLoading() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-8 animate-pulse">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-[72px] h-[72px] rounded-lg bg-[#FAFAFA]" />
          <div className="space-y-2">
            <div className="h-7 bg-[#FAFAFA] rounded w-64" />
            <div className="h-4 bg-[#FAFAFA] rounded w-40" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-[#FAFAFA] rounded-md" />
          ))}
        </div>
      </main>
    </div>
  );
}
