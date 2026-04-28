"use client";

import { useTransition } from "react";
import Link from "next/link";
import { acceptRequest, declineRequest } from "@/actions/booking";
import { formatEur, formatDateRange } from "@/lib/format";
import { formatDistanceToNow } from "date-fns";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface PendingRequest {
  id: string;
  producerName: string;
  producerCompany: string | null;
  projectName: string;
  role: string | null;
  startDate: Date;
  endDate: Date;
  offeredRate: number;
  createdAt: Date;
}

interface PendingRequestAlertProps {
  requests: PendingRequest[];
}

export default function PendingRequestAlert({ requests }: PendingRequestAlertProps) {
  if (requests.length === 0) return null;

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <PendingCard key={req.id} request={req} />
      ))}
    </div>
  );
}

function PendingCard({ request }: { request: PendingRequest }) {
  const [isPending, startTransition] = useTransition();

  const days = Math.ceil(
    (request.endDate.getTime() - request.startDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  function handleAccept() {
    startTransition(async () => {
      await acceptRequest(request.id);
    });
  }

  function handleDecline() {
    startTransition(async () => {
      await declineRequest(request.id);
    });
  }

  return (
    <div className="bg-[#FFF8E1] border border-[#F5E6A3] rounded-lg p-5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[20px]">🟡</span>
            <h3 className="text-[16px] font-bold text-[#8B6508]">New booking request</h3>
          </div>
          <p className="text-[13px] text-[#8B6508]/70 mt-0.5">
            {request.producerName}
            {request.producerCompany ? ` · ${request.producerCompany}` : ""}
            {" · "}
            {formatDistanceToNow(request.createdAt, { addSuffix: true })}
          </p>
        </div>
        <Badge variant="pending">Pending</Badge>
      </div>

      <p className="text-[14px] text-[#111] mt-3">
        {request.projectName}
        {request.role ? ` — ${request.role}` : ""}
        {", "}
        {formatDateRange(request.startDate, request.endDate)}
        {` (${days} days)`}
        {", offering "}
        {formatEur(request.offeredRate)}/day
      </p>

      <div className="flex items-center gap-3 mt-4">
        <Button variant="gold" onClick={handleAccept} loading={isPending} disabled={isPending}>
          Accept
        </Button>
        <Link href={`/dashboard/request/${request.id}`}>
          <Button variant="primary">View details</Button>
        </Link>
        <Button variant="danger" onClick={handleDecline} disabled={isPending}>
          Decline
        </Button>
      </div>
    </div>
  );
}
