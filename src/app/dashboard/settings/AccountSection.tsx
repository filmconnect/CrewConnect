"use client";

import { useActionState } from "react";
import { updateAccount } from "@/actions/settings";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false };

export default function AccountSection({ email }: { email: string }) {
  const [state, formAction, isPending] = useActionState(updateAccount, initialState);

  return (
    <section>
      <h2 className="text-[16px] font-bold text-[#DBA508] mb-4">Account</h2>
      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="email"
            label="Email"
            type="email"
            defaultValue={email}
            required
          />
          <Input
            name="password"
            label="Password"
            type="password"
            placeholder="••••••"
            autoComplete="new-password"
          />
        </div>

        {state.success ? (
          <p className="text-[13px] text-[#1A8C5E]">Account updated!</p>
        ) : null}
        {state.error ? (
          <p className="text-[13px] text-[#C44B4B]">{state.error}</p>
        ) : null}

        <Button type="submit" variant="primary" loading={isPending}>
          Update account
        </Button>
      </form>
    </section>
  );
}
