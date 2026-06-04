"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { producerSignin } from "@/actions/producers";
import ProducerShell from "@/components/producers/ProducerShell";
import SubmitButton from "@/components/ui/SubmitButton";
import Input from "@/components/ui/Input";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false };

export default function ProducerSigninPage() {
  const [state, formAction] = useFormState(producerSignin, initialState);

  return (
    <ProducerShell mode="public">
      <main className="max-w-sm mx-auto px-6 py-20">
        <div className="text-center mb-8">
          <span className="eyebrow-ai">✦ Producer sign in</span>
          <h1 className="text-[24px] font-bold tracking-[-0.5px] mt-3">
            Welcome back
          </h1>
          <p className="text-[14px] text-[#666] mt-2">
            Sign in with your producer credentials.
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          <Input
            name="email"
            label="Email"
            type="email"
            placeholder="your@company.com"
            required
          />
          <Input
            name="password"
            label="Password"
            type="password"
            placeholder="Your password"
            required
          />

          {state.error && (
            <p className="text-[13px] text-[#C44B4B]">{state.error}</p>
          )}

          <SubmitButton variant="primary" fullWidth className="!bg-[#7C5CFC] hover:!bg-[#5A3FD6]">
            Sign in
          </SubmitButton>
        </form>

        <p className="text-center text-[13px] text-[#888] mt-6">
          No account yet?{" "}
          <Link href="/producers/request" className="text-[#7C5CFC] font-medium hover:underline">
            Request access
          </Link>
        </p>
      </main>
    </ProducerShell>
  );
}
