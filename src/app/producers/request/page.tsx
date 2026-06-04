"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { requestProducerAccess } from "@/actions/producers";
import ProducerShell from "@/components/producers/ProducerShell";
import SubmitButton from "@/components/ui/SubmitButton";
import Input from "@/components/ui/Input";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false };

export default function RequestAccessPage() {
  const [state, formAction] = useFormState(requestProducerAccess, initialState);

  if (state.success) {
    return (
      <ProducerShell mode="public">
        <main className="max-w-md mx-auto px-6 py-20 text-center">
          <div className="text-[40px] mb-4">✦</div>
          <h1 className="text-[24px] font-bold mb-3">Request received</h1>
          <p className="text-[14px] text-[#666] leading-relaxed mb-6">
            We will review your request and get back to you within a few days.
            You will receive sign-in credentials once approved.
          </p>
          <Link href="/producers" className="btn-ghost">
            Back to producers
          </Link>
        </main>
      </ProducerShell>
    );
  }

  return (
    <ProducerShell mode="public">
      <main className="max-w-lg mx-auto px-6 py-12">
        <Link href="/producers" className="text-[13px] text-[#888] hover:text-[#111] mb-6 block">
          ← Back
        </Link>

        <span className="eyebrow-ai">✦ Request access</span>
        <h1 className="text-[28px] font-bold tracking-[-0.5px] mt-3 mb-2">
          Join CrewConnect as a producer
        </h1>
        <p className="text-[14px] text-[#666] mb-8">
          Tell us about yourself and your company. We review requests and approve good fits.
        </p>

        <form action={formAction} className="space-y-5">
          <Input
            name="name"
            label="Full name"
            placeholder="e.g. Eva Mueller"
            required
          />
          <Input
            name="email"
            label="Work email"
            type="email"
            placeholder="eva@serviceplan.com"
            required
          />
          <Input
            name="company"
            label="Company / Agency"
            placeholder="e.g. Serviceplan Munich"
            required
          />
          <Input
            name="role"
            label="Your role"
            placeholder="e.g. Producer, Line Producer, EP"
            required
          />
          <Input
            name="website"
            label="Company website (optional)"
            placeholder="https://serviceplan.com"
          />
          <div>
            <label className="label mb-1.5 block">What do you produce? (optional)</label>
            <input
              name="produces"
              placeholder="e.g. automotive, commercial, documentary"
              className="w-full border border-[#EEE] rounded-md px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/20"
            />
            <p className="text-[11px] text-[#888] mt-1">Comma-separated project types</p>
          </div>
          <div>
            <label className="label mb-1.5 block">Why CrewConnect? (optional)</label>
            <textarea
              name="message"
              placeholder="Anything you'd like us to know..."
              rows={3}
              className="w-full border border-[#EEE] rounded-md px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#7C5CFC] focus:ring-2 focus:ring-[#7C5CFC]/20 resize-none"
            />
          </div>

          {state.error && (
            <p className="text-[13px] text-[#C44B4B]">{state.error}</p>
          )}

          <SubmitButton variant="primary" fullWidth className="!bg-[#7C5CFC] hover:!bg-[#5A3FD6]">
            Submit request ✦
          </SubmitButton>
        </form>
      </main>
    </ProducerShell>
  );
}
