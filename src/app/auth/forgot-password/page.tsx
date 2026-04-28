"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/actions/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Logo from "@/components/layout/Logo";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false };

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, initialState);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[#EEE]">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 h-[60px]">
          <Logo />
          <Link
            href="/auth/login"
            className="border border-[#111] text-[#111] bg-transparent rounded-md px-4 py-2 text-[13px] font-medium hover:bg-[#FAFAFA] transition-colors"
          >
            Back to login
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex items-start justify-center pt-20 px-4">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#DBA508] mb-3">
              RESET YOUR PASSWORD
            </p>
            <h1 className="text-[32px] font-bold tracking-[-0.5px]">
              <span className="font-black italic">forgot</span>{" "}
              <span className="font-bold">password?</span>
            </h1>
            <p className="text-[14px] text-[#888] mt-3">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {state.success ? (
            <div className="bg-[#F0FAF5] border border-[#1A8C5E]/20 rounded-lg p-4 text-center">
              <p className="text-[14px] text-[#1A8C5E] font-medium">
                If an account exists with that email, you&apos;ll receive a reset link shortly.
              </p>
            </div>
          ) : (
            <form action={formAction} className="flex flex-col gap-5">
              <Input
                name="email"
                type="email"
                label="Email"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />

              {state.error ? (
                <p className="text-[13px] text-[#C44B4B] text-center">{state.error}</p>
              ) : null}

              <Button type="submit" variant="gold" fullWidth loading={isPending}>
                Send reset link
              </Button>
            </form>
          )}

          <p className="text-center text-[13px] text-[#888] mt-6">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-[#DBA508] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
