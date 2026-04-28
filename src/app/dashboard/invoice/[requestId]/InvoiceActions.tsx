"use client";

import { useFormState } from "react-dom";
import { generateInvoice } from "@/actions/invoice";
import Input from "@/components/ui/Input";
import type { ActionResult } from "@/types";

interface InvoiceActionsProps {
  requestId: string;
  defaultVatRate: number;
  defaultPaymentTerms: string;
  defaultInvoiceNumber: string;
  producerEmail: string;
}

const initialState: ActionResult<{ invoiceNumber: string }> = { success: false };

export default function InvoiceActions({
  requestId,
  defaultVatRate,
  defaultPaymentTerms,
  defaultInvoiceNumber,
  producerEmail,
}: InvoiceActionsProps) {
  const [state, formAction] = useFormState(generateInvoice, initialState);

  return (
    <div className="mt-6 space-y-4">
      {/* Adjust section */}
      <div className="border border-[#EEE] rounded-lg p-5">
        <p className="text-[14px] font-bold mb-4">Adjust before generating</p>
        <form action={formAction}>
          <input type="hidden" name="requestId" value={requestId} />
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Input
              name="vatRate"
              label="VAT Rate (%)"
              type="number"
              min={0}
              max={100}
              defaultValue={defaultVatRate}
            />
            <Input
              name="paymentTerms"
              label="Payment Terms"
              defaultValue={defaultPaymentTerms}
            />
            <Input
              name="invoiceNumber"
              label="Invoice Number"
              defaultValue={defaultInvoiceNumber}
            />
          </div>

          {state.error ? (
            <p className="text-[13px] text-[#C44B4B] mb-3">{state.error}</p>
          ) : null}
          {state.success ? (
            <p className="text-[13px] text-[#1A8C5E] mb-3">Invoice generated!</p>
          ) : null}
        </form>
      </div>

      {/* CTA buttons */}
      <div className="grid grid-cols-2 gap-4">
        <a
          href={`/api/invoice/${requestId}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center bg-[#DBA508] text-[#111] font-bold rounded-md py-3 hover:bg-[#c99507] transition-colors"
        >
          Download PDF
        </a>
        <a
          href={`mailto:${producerEmail}?subject=Invoice for booking&body=Please find the invoice attached.`}
          className="flex items-center justify-center bg-[#111] text-white font-bold rounded-md py-3 hover:bg-[#222] transition-colors"
        >
          Send to client
        </a>
      </div>

      <p className="text-[12px] text-[#888] text-center">
        &quot;Send to client&quot; emails the PDF to {producerEmail}
      </p>
    </div>
  );
}
