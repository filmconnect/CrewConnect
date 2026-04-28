"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { resetPassword } from "@/actions/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Logo from "@/components/layout/Logo";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false };

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, formAction, isPending] = useActionState(resetPassword, initialState);

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-[14px] text-[#C44B4B]">Invalid reset link. Please request a new one.</p>
        <Link href="/auth/forgot-password" className="text-[#DBA508] hover:underline text-[13px] mt-2 inline-block">
          Request new link
        </Link>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="text-center">
        <div className="bg-[#F0FAF5] border border-[#1A8C5E]/20 rounded-lg p-4 mb-4">
          <p className="text-[14px] text-[#1A8C5E] font-medium">Password reset successfully!</p>
        </div>
        <Link href="/auth/login" className="text-[#DBA508] hover:underline text-[14px] font-medium">
          Log in with your new password
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />
      <Input
        name="password"
        type="password"
        label="New Password"
        placeholder="At least 8 characters"
        required
        autoComplete="new-password"
      />

      {state.error ? (
        <p className="text-[13px] text-[#C44B4B] text-center">{state.error}</p>
      ) : null}

      <Button type="submit" variant="gold" fullWidth loading={isPending}>
        Reset password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[#EEE]">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 h-[60px]">
          <Logo />
        </nav>
      </header>

      <main className="flex-1 flex items-start justify-center pt-20 px-4">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#DBA508] mb-3">
              CHOOSE A NEW PASSWORD
            </p>
            <h1 className="text-[32px] font-bold tracking-[-0.5px]">
              <span className="font-black italic">reset</span>{" "}
              <span className="font-bold">password</span>
            </h1>
          </div>

          <Suspense fallback={<div className="text-center text-[#888]">Loading...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
