"use client";

import Button from "@/components/ui/Button";


export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error({ message: error.message, digest: error.digest }, "crew_profile:error");

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#C44B4B] mb-3">
        SOMETHING WENT WRONG
      </p>
      <h1 className="text-h1 mb-2">Error</h1>
      <p className="text-[14px] text-[#888] mb-6 max-w-sm text-center">
        {error.message || "An unexpected error occurred."}
      </p>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
