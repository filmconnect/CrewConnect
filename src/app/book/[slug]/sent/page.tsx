import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookingSentPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#F0FAF5] flex items-center justify-center mx-auto mb-6">
            <span className="text-[28px]">✉️</span>
          </div>

          <h1 className="text-[24px] font-bold tracking-[-0.5px] mb-2">
            Request sent!
          </h1>
          <p className="text-[14px] text-[#888] mb-6">
            Your booking request has been sent. The crew member will review it
            and respond. You&apos;ll receive a notification at your email when
            they accept or decline.
          </p>

          <div className="flex flex-col gap-3">
            <Link href={`/crew/${slug}`}>
              <Button variant="outline" fullWidth>
                Back to profile
              </Button>
            </Link>
            <Link href="/">
              <Button variant="primary" fullWidth>
                Go to homepage
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
