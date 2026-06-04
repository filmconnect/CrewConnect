"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { useFormState } from "react-dom";
import { addBooking, editBooking, deleteBooking } from "@/actions/crew";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import SubmitButton from "@/components/ui/SubmitButton";
import Input from "@/components/ui/Input";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: false };

export interface BookingData {
  id: string;
  title: string;
  client: string | null;
  startDate: string;
  endDate: string;
  dayRate: number | null;
  notes: string | null;
  status: string;
}

interface AddBookingModalProps {
  trigger?: ReactNode;
  defaultDate?: string;
  booking?: BookingData | null;
  open?: boolean;
  onClose?: () => void;
}

export default function AddBookingModal({ trigger, defaultDate, booking, open: controlledOpen, onClose }: AddBookingModalProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;

  const isEdit = !!booking;
  const endDateRef = useRef<HTMLInputElement>(null);
  const [deleting, setDeleting] = useState(false);

  const [addState, addAction] = useFormState(addBooking, initialState);
  const [editState, editAction] = useFormState(editBooking, initialState);

  const state = isEdit ? editState : addState;
  const formAction = isEdit ? editAction : addAction;

  function handleClose() {
    setDeleting(false);
    if (isControlled) {
      onClose?.();
    } else {
      setInternalOpen(false);
    }
  }

  function handleOpen() {
    if (!isControlled) {
      setInternalOpen(true);
    }
  }

  function handleStartDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val && endDateRef.current) {
      const endVal = endDateRef.current.value;
      if (!endVal || endVal < val) {
        endDateRef.current.value = val;
      }
    }
  }

  async function handleDelete() {
    if (!booking) return;
    setDeleting(true);
    const result = await deleteBooking(booking.id);
    if (result.success) {
      handleClose();
    } else {
      setDeleting(false);
    }
  }

  useEffect(() => {
    if (state.success) {
      handleClose();
    }
  }, [state]);

  return (
    <>
      {!isControlled && (
        trigger ? (
          <div onClick={handleOpen} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") handleOpen(); }}>
            {trigger}
          </div>
        ) : (
          <Button variant="outline" onClick={handleOpen}>
            + Add
          </Button>
        )
      )}

      <Modal open={open} onClose={handleClose} title={isEdit ? "Edit booking" : "Add booking"}>
        <form action={formAction} className="flex flex-col gap-4">
          {isEdit && (
            <input type="hidden" name="bookingId" value={booking.id} />
          )}
          <Input
            name="title"
            label="Project Name"
            placeholder="e.g. BMW 5 Series — Coastal Drive"
            defaultValue={booking?.title ?? ""}
            required
          />
          <Input
            name="client"
            label="Client / Agency"
            placeholder="e.g. Serviceplan Munich"
            defaultValue={booking?.client ?? ""}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              name="startDate"
              label="Start Date"
              type="date"
              defaultValue={booking?.startDate ?? defaultDate ?? ""}
              onChange={handleStartDateChange}
              required
            />
            <Input
              ref={endDateRef}
              name="endDate"
              label="End Date"
              type="date"
              defaultValue={booking?.endDate ?? defaultDate ?? ""}
              required
            />
          </div>
          <Input
            name="dayRate"
            label="Day Rate (€)"
            type="number"
            placeholder="e.g. 550"
            defaultValue={booking?.dayRate != null ? booking.dayRate / 100 : ""}
            min={0}
            step={1}
          />
          <Input
            name="notes"
            label="Notes"
            placeholder="Optional notes"
            defaultValue={booking?.notes ?? ""}
          />

          {state.error ? (
            <p className="text-[13px] text-[#C44B4B]">{state.error}</p>
          ) : null}

          <div className="flex gap-3 mt-2">
            <SubmitButton variant="primary" fullWidth>
              {isEdit ? "Save changes" : "Add booking"}
            </SubmitButton>
            <Button type="button" variant="outline" fullWidth onClick={handleClose}>
              Cancel
            </Button>
          </div>

          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-[13px] text-[#C44B4B] hover:text-[#A03030] transition-colors mt-1 text-center disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete this booking"}
            </button>
          )}
        </form>
      </Modal>
    </>
  );
}
