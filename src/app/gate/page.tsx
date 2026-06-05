"use client";

import { useFormState } from "react-dom";
import Image from "next/image";
import { submitAccessCode } from "@/actions/site-gate";
import SubmitButton from "@/components/ui/SubmitButton";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false };

export default function GatePage() {
  const [state, formAction] = useFormState(submitAccessCode, initialState);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <Image
            src="/logo.png"
            alt="CrewConnect"
            width={160}
            height={22}
            priority
            className="select-none"
          />
        </div>

        <form action={formAction} className="space-y-5">
          <div>
            <label
              htmlFor="code"
              className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] block mb-1.5"
            >
              Access code
            </label>
            <input
              id="code"
              name="code"
              type="password"
              autoComplete="off"
              autoFocus
              required
              className="w-full border border-[#EEE] rounded-md px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#111] focus:ring-2 focus:ring-[#111]/10"
            />
          </div>

          {state.error ? (
            <p className="text-[13px] text-[#C44B4B]">{state.error}</p>
          ) : null}

          <SubmitButton variant="primary" fullWidth>
            Enter
          </SubmitButton>
        </form>

        <p className="text-[12px] text-[#888] text-center mt-6">
          This site is in private preview.
        </p>
      </div>
    </main>
  );
}
