"use client";

import { useState, useMemo } from "react";
import { useFormState } from "react-dom";
import { sendRequest } from "@/actions/send-request";
import SubmitButton from "@/components/ui/SubmitButton";
import Input from "@/components/ui/Input";
import type { ActionResult } from "@/types";

interface BookingFormProps {
  profileId: string;
  slug: string;
  crewName: string;
  defaultRate?: number;
  crewRole: string;
}

const initialState: ActionResult = { success: false };

export default function BookingForm({
  profileId,
  slug,
  crewName,
  defaultRate,
  crewRole,
}: BookingFormProps) {
  const [state, formAction] = useFormState(sendRequest, initialState);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rate, setRate] = useState(defaultRate?.toString() || "");
  const [fileName, setFileName] = useState<string | null>(null);

  // Auto-calc total
  const totalInfo = useMemo(() => {
    if (!startDate || !endDate || !rate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return null;
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const rateNum = parseFloat(rate);
    if (isNaN(rateNum) || rateNum <= 0) return null;
    const total = days * rateNum;
    return { days, rate: rateNum, total };
  }, [startDate, endDate, rate]);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="slug" value={slug} />

      {/* Your Details */}
      <section>
        <h2 className="text-[16px] font-bold text-[#DBA508] mb-4">Your Details</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            name="producerName"
            label="Full Name"
            placeholder="Marko Horvat"
            required
          />
          <Input
            name="producerCompany"
            label="Company"
            placeholder="Serviceplan Munich"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            name="producerEmail"
            type="email"
            label="Work Email"
            placeholder="marko@serviceplan.com"
            required
          />
          <Input
            name="producerVat"
            label="VAT Number"
            placeholder="DE123456789"
          />
        </div>
        <label className="flex items-center gap-2 text-[13px] text-[#888] cursor-pointer">
          <input type="checkbox" className="rounded border-[#EEE]" />
          Remember my details for next time
        </label>
      </section>

      <hr className="border-[#EEE]" />

      {/* Booking Request */}
      <section>
        <h2 className="text-[16px] font-bold text-[#DBA508] mb-4">Booking Request</h2>

        <div className="space-y-4">
          <Input
            name="projectName"
            label="Project Name"
            placeholder="BMW 5 Series - Coastal Drive"
            required
          />

          <Input
            name="role"
            label="Role"
            defaultValue={crewRole}
            placeholder="Director of Photography"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="startDate"
              label="Start Date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              name="endDate"
              label="End Date"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              name="offeredRate"
              label="Offered Rate (€/day)"
              type="number"
              min={1}
              step={1}
              placeholder="600"
              required
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <div>
              <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] block mb-1.5">
                Total
              </label>
              <div className="border border-[#EEE] rounded-md px-3 py-3 text-[14px] bg-[#FAFAFA]">
                {totalInfo ? (
                  <span>
                    <span className="font-bold">
                      €{totalInfo.total.toLocaleString("en-IE")}
                    </span>
                    <span className="text-[#888] ml-1">
                      · {totalInfo.days} days × €{totalInfo.rate}
                    </span>
                  </span>
                ) : (
                  <span className="text-[#CCC]">—</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] block mb-1.5">
              Message <span className="normal-case text-[#BBB]">(Optional)</span>
            </label>
            <textarea
              name="message"
              rows={4}
              className="w-full border border-[#EEE] rounded-md px-3 py-3 text-[14px] text-[#111] placeholder:text-[#CCC] focus:outline-none focus:border-[#111] resize-none"
              placeholder={`Hi ${crewName.split(" ")[0]}, we're shooting a...`}
            />
          </div>

          {/* PDF Upload */}
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] block mb-1.5">
              Contract or Brief{" "}
              <span className="normal-case text-[#BBB]">(Optional · PDF max 10MB)</span>
            </label>
            <label className="block border-2 border-dashed border-[#EEE] rounded-lg p-6 text-center cursor-pointer hover:border-[#DBA508] transition-colors">
              {fileName ? (
                <div>
                  <p className="text-[14px] text-[#111] font-medium">{fileName}</p>
                  <p className="text-[12px] text-[#888] mt-1">Click to change</p>
                </div>
              ) : (
                <div>
                  <p className="text-[14px] text-[#DBA508] font-medium">+ Upload PDF</p>
                  <p className="text-[12px] text-[#888] mt-1">
                    Contract, brief or call sheet
                  </p>
                </div>
              )}
              <input
                type="file"
                name="attachment"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setFileName(file?.name || null);
                }}
              />
            </label>
          </div>
        </div>
      </section>

      {/* Error */}
      {state.error ? (
        <p className="text-[13px] text-[#C44B4B] text-center">{state.error}</p>
      ) : null}

      {/* Submit */}
      <SubmitButton variant="gold" fullWidth>
        Send booking request
      </SubmitButton>

      <p className="text-[12px] text-[#888] text-center">
        {crewName.split(" ")[0]} will receive your request and can accept or decline.
        Your contact details will be shared only if they accept.
      </p>
    </form>
  );
}
