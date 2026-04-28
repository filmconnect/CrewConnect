import Navbar from "@/components/layout/Navbar";

export default function ProLoading() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16 animate-pulse">
        <div className="text-center space-y-4 mb-12">
          <div className="h-4 bg-[#FAFAFA] rounded w-32 mx-auto" />
          <div className="h-10 bg-[#FAFAFA] rounded w-80 mx-auto" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="h-48 bg-[#FAFAFA] rounded-lg border border-[#EEE]" />
          <div className="h-48 bg-[#FFF8E1] rounded-lg border border-[#DBA508]" />
        </div>
        <div className="h-[400px] bg-[#FAFAFA] rounded-lg border border-[#EEE]" />
      </main>
    </div>
  );
}
