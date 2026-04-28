import { requireAuth } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAuth();

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
