"use client";

import { useActionState, useState } from "react";
import { updateInvoiceDetails } from "@/actions/settings";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { ActionResult } from "@/types";

interface InvoiceSectionProps {
  legalName: string;
  address: string;
  vatNumber: string;
  iban: string;
  paymentTerms: string;
}

const TERMS = ["Net 7", "Net 14", "Net 30", "Net 60"] as const;
const initialState: ActionResult = { success: false };

export default function InvoiceSection({
  legalName,
  address,
  vatNumber,
  iban,
  paymentTerms,
}: InvoiceSectionProps) {
  const [state, formAction, isPending] = useActionState(updateInvoiceDetails, initialState);
  const [terms, setTerms] = useState(paymentTerms);

  return (
    <section>
      <h2 className="text-[16px] font-bold text-[#DBA508] mb-1">Invoice Details</h2>
      <p className="text-[13px] text-[#888] mb-4">For generating invoices</p>

      <form action={formAction} className="space-y-4">
        <Input
          name="legalName"
          label="Legal Name / Business Name"
          defaultValue={legalName}
          placeholder="Marko Horvat - obrt za filmsku djelatnost"
        />
        <Input
          name="address"
          label="Address"
          defaultValue={address}
          placeholder="Ilica 42, 10000 Zagreb, Croatia"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="vatNumber"
            label="VAT / OIB Number"
            defaultValue={vatNumber}
            placeholder="HR12345678901"
          />
          <Input
            name="iban"
            label="IBAN"
            defaultValue={iban}
            placeholder="HR1234567890123456789"
          />
        </div>

        {/* Payment terms */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] mb-2">
            DEFAULT PAYMENT TERMS
          </p>
          <div className="flex items-center gap-2">
            {TERMS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTerms(t)}
                className={`px-4 py-2 rounded-md text-[13px] font-medium border transition-colors ${
                  terms === t
                    ? "border-[#DBA508] text-[#DBA508] bg-[#FFFDF5]"
                    : "border-[#EEE] text-[#888] hover:border-[#111] hover:text-[#111]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <input type="hidden" name="paymentTerms" value={terms} />
        </div>

        {state.success ? (
          <p className="text-[13px] text-[#1A8C5E]">Invoice details saved!</p>
        ) : null}
        {state.error ? (
          <p className="text-[13px] text-[#C44B4B]">{state.error}</p>
        ) : null}

        <Button type="submit" variant="primary" loading={isPending}>
          Save invoice details
        </Button>
      </form>
    </section>
  );
}
