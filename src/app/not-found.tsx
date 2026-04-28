import Link from "next/link";
import Logo from "@/components/layout/Logo";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[#EEE]">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 h-[60px]">
          <Logo />
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#DBA508] mb-3">
            PAGE NOT FOUND
          </p>
          <h1 className="text-[48px] font-black italic tracking-[-1px] mb-2">404</h1>
          <p className="text-[14px] text-[#888] mb-8 max-w-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link href="/">
            <Button variant="gold">Back to home</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
