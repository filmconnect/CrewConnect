"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/actions/auth";
import { getGoogleAuthUrl } from "@/lib/google-oauth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Logo from "@/components/layout/Logo";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false };

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b border-[#EEE]">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 h-[60px]">
          <Logo />
          <Link
            href="/auth/login"
            className="border border-[#111] text-[#111] bg-transparent rounded-md px-4 py-2 text-[13px] font-medium hover:bg-[#FAFAFA] transition-colors"
          >
            Have an account? Log in
          </Link>
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center pt-16 px-4 pb-12">
        <div className="w-full max-w-[400px]">
          {/* Heading */}
          <div className="text-center mb-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#DBA508] mb-3">
              FREE - TAKES 2 MINUTES
            </p>
            <h1 className="text-[32px] font-bold tracking-[-0.5px]">
              <span
                className="relative inline-block"
                style={{
                  background: "linear-gradient(180deg, transparent 55%, #DBA508 55%, #DBA508 90%, transparent 90%)",
                }}
              >
                <span className="font-black italic">create</span>
              </span>{" "}
              <span className="font-bold italic">your profile</span>
            </h1>
          </div>

          {/* Google OAuth */}
          <a
            href={getGoogleAuthUrl("signup")}
            className="w-full flex items-center justify-center gap-3 border border-[#EEE] rounded-md px-4 py-3 text-[14px] font-medium hover:bg-[#FAFAFA] transition-colors"
          >
            <GoogleIcon />
            Sign up with Google
          </a>

          {/* Divider */}
          <div className="divider-or my-6">or</div>

          {/* Form */}
          <form action={formAction} className="flex flex-col gap-5">
            <Input
              name="name"
              label="Full Name"
              placeholder="Marko Horvat"
              required
              autoComplete="name"
            />
            <Input
              name="role"
              label="Primary Role"
              placeholder="e.g. DP, Gaffer, Editor"
              required
            />
            <Input
              name="country"
              label="Country"
              placeholder="e.g. Croatia"
              required
            />
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
            />
            <Input
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Repeat your password"
              required
              autoComplete="new-password"
            />

            {state.error ? (
              <p className="text-[13px] text-[#C44B4B] text-center">{state.error}</p>
            ) : null}

            <Button type="submit" variant="gold" fullWidth loading={isPending}>
              Create profile
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-[12px] text-[#888] mt-5">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="text-[#DBA508] hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[#DBA508] hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
