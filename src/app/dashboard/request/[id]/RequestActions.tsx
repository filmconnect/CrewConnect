"use client";

import { useTransition } from "react";
import { acceptRequest, declineRequest } from "@/actions/booking";
import { formatEur } from "@/lib/format";
import Button from "@/components/ui/Button";

interface RequestActionsProps {
  requestId: string;
  status: string;
  total: number;
  crewName: string;
}

export default function RequestActions({
  requestId,
  status,
  total,
}: RequestActionsProps) {
  const [isPending, startTransition] = useTransition();

  if (status === "pending") {
    return (
      <div className="flex items-center gap-3">
        <Button
          variant="gold"
          className="flex-1"
          onClick={() =>
            startTransition(() => {
              void acceptRequest(requestId);
            })
          }
          loading={isPending}
          disabled={isPending}
        >
          Accept booking · {formatEur(total)} total
        </Button>
        <Button variant="primary" className="flex-1">
          Message
        </Button>
        <Button
          variant="danger"
          className="flex-1"
          onClick={() => {
            if (confirm("Are you sure you want to decline this request?")) {
              startTransition(() => {
                void declineRequest(requestId);
              });
            }
          }}
          disabled={isPending}
        >
          Decline
        </Button>
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <div className="flex items-center gap-3">
        <Button variant="gold" className="flex-1">
          Mark as done
        </Button>
        <Button variant="primary" className="flex-1">
          Download confirmation
        </Button>
        <Button variant="danger" className="flex-1">
          Cancel booking
        </Button>
      </div>
    );
  }

  if (status === "declined") {
    return (
      <div className="bg-[#FFF5F5] border border-[#C44B4B]/20 rounded-lg p-4 text-center">
        <p className="text-[14px] text-[#C44B4B] font-medium">
          This request has been declined
        </p>
      </div>
    );
  }

  return null;
}
