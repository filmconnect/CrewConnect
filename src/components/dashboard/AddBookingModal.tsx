"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useFormState } from "react-dom";
import { addBooking } from "@/actions/crew";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import SubmitButton from "@/components/ui/SubmitButton";
import Input from "@/components/ui/Input";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false };

interface AddBookingModalProps {
  trigger?: ReactNode;
}

export default function AddBookingModal({ trigger }: AddBookingModalProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(addBooking, initialState);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state]);

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setOpen(true); }}>
          {trigger}
        </div>
      ) : (
        <Button variant="outline" onClick={() => setOpen(true)}>
          + Add
        </Button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add booking">
        <form action={formAction} className="flex flex-col gap-4">
          <Input
            name="title"
            label="Project Name"
            placeholder="e.g. BMW 5 Series — Coastal Drive"
            required
          />
          <Input
            name="client"
            label="Client / Agency"
            placeholder="e.g. Serviceplan Munich"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input name="startDate" label="Start Date" type="date" required />
            <Input name="endDate" label="End Date" type="date" required />
          </div>
          <Input
            name="dayRate"
            label="Day Rate (€)"
            type="number"
            placeholder="e.g. 550"
            min={0}
            step={1}
          />
          <Input
            name="notes"
            label="Notes"
            placeholder="Optional notes"
          />

          {state.error ? (
            <p className="text-[13px] text-[#C44B4B]">{state.error}</p>
          ) : null}

          <div className="flex gap-3 mt-2">
            <SubmitButton variant="primary" fullWidth>
              Add booking
            </SubmitButton>
            <Button type="button" variant="outline" fullWidth onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
