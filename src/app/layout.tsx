import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CrewConnect — Film Crew Scheduling & Portfolio",
  description:
    "Professional portfolio and scheduling tool for freelance film crew. Build your profile, manage availability, and get booked.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  openGraph: {
    title: "CrewConnect",
    description: "Portfolio + scheduling for film crew",
    siteName: "CrewConnect",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className={dmSans.className}>{children}</body>
    </html>
  );
}
