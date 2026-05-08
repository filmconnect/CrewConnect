import Link from "next/link";
import Logo from "./Logo";
import { logout } from "@/actions/auth";
import type { SessionUser } from "@/types";

interface NavbarProps {
  user?: SessionUser | null;
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="border-b border-[#EEE]">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 h-[60px]">
        <div className="flex items-center gap-8">
          <Logo href={user ? "/dashboard" : "/"} />
          {user ? (
            <div className="hidden sm:flex items-center gap-6">
              <NavLink href="/dashboard">Schedule</NavLink>
              <NavLink href="/dashboard/profile">Profile</NavLink>
              <NavLink href="/dashboard/settings">Settings</NavLink>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#111] text-white flex items-center justify-center text-[12px] font-bold uppercase">
                {getInitials(user.name || user.email)}
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-nav text-[#888] hover:text-[#111] transition-colors"
                >
                  Log out
                </button>
              </form>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-nav text-[#888] hover:text-[#111] transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="border border-[#111] text-[#111] bg-transparent rounded-md px-4 py-2 text-nav font-medium hover:bg-[#FAFAFA] transition-colors"
              >
                No account? Join
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-nav text-[#888] hover:text-[#111] transition-colors">
      {children}
    </Link>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}
