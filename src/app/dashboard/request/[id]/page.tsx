import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatEur, formatDateRange, formatDate } from "@/lib/format";
import { format } from "date-fns";
import logger from "@/lib/logger";
import Badge from "@/components/ui/Badge";
import RequestActions from "./RequestActions";
import type { BadgeVariant } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

function statusBadge(status: string): { variant: BadgeVariant; label: string } {
  switch (status) {
    case "pending":
      return { variant: "pending", label: "Pending" };
    case "accepted":
      return { variant: "confirmed", label: "Confirmed" };
    case "declined":
      return { variant: "danger", label: "Declined" };
    default:
      return { variant: "done", label: status };
  }
}

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await requireAuth();

  const request = await prisma.bookingRequest.findUnique({
    where: { id },
    include: {
      profile: {
        select: { userId: true, name: true },
      },
    },
  });

  if (!request || request.profile.userId !== userId) {
    logger.warn({ requestId: id, userId }, "request:not_found_or_unauthorized");
    notFound();
  }

  logger.info(
    { requestId: id, status: request.status, project: request.projectName },
    "request:detail_viewed"
  );

  const days =
    Math.ceil(
      (request.endDate.getTime() - request.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  const total = request.offeredRate * days;
  const badge = statusBadge(request.status);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back + Title */}
      <div className="flex items-center gap-3 mb-1">
        <Link
          href="/dashboard"
          className="w-8 h-8 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#888] hover:text-[#111] transition-colors"
        >
          ←
        </Link>
        <h1 className="text-[24px] font-bold tracking-[-0.5px]">
          {request.projectName}
        </h1>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>
      <p className="text-[14px] text-[#888] ml-11 mb-6">
        {request.producerName}
        {request.producerCompany ? ` · ${request.producerCompany}` : ""}
      </p>

      {/* Info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <InfoCard value={request.role || "—"} label="Role" />
        <InfoCard
          value={formatDateRange(request.startDate, request.endDate)}
          label="Dates"
        />
        <InfoCard value={String(days)} label="Days" />
        <InfoCard value={`${formatEur(request.offeredRate)}/day`} label="Offered" />
      </div>

      {/* Accepted: confirmation box */}
      {request.status === "accepted" && request.confirmationId ? (
        <div className="bg-[#F0FAF5] border border-[#1A8C5E]/20 rounded-lg p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[20px]">✅</span>
              <h3 className="text-[16px] font-bold text-[#1A8C5E]">
                Booking Confirmed
              </h3>
            </div>
            <span className="text-[13px] text-[#1A8C5E]/70">
              ID: {request.confirmationId}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#1A8C5E]/70">
                Sent by producer
              </p>
              <p className="text-[14px] font-bold text-[#1A8C5E] mt-1">
                {request.producerName}
              </p>
              <p className="text-[13px] text-[#1A8C5E]/70">
                {format(request.createdAt, "MMM d, yyyy · HH:mm")} CET
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#1A8C5E]/70">
                Accepted by crew
              </p>
              <p className="text-[14px] font-bold text-[#1A8C5E] mt-1">
                {request.profile.name}
              </p>
              {request.acceptedAt ? (
                <p className="text-[13px] text-[#1A8C5E]/70">
                  {format(request.acceptedAt, "MMM d, yyyy · HH:mm")} CET
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Contact details - only when accepted */}
      {request.status === "accepted" ? (
        <div className="mb-6">
          <h2 className="text-h2 mb-3">Contact Details</h2>
          <div className="flex items-center gap-6">
            {request.producerPhone ? (
              <a
                href={`tel:${request.producerPhone}`}
                className="flex items-center gap-2 text-[14px] text-[#111] hover:text-[#DBA508] transition-colors"
              >
                <PhoneIcon />
                {request.producerPhone}
              </a>
            ) : null}
            <a
              href={`mailto:${request.producerEmail}`}
              className="flex items-center gap-2 text-[14px] text-[#111] hover:text-[#DBA508] transition-colors"
            >
              <MailIcon />
              {request.producerEmail}
            </a>
          </div>
        </div>
      ) : null}

      {/* Message */}
      {request.message ? (
        <div className="bg-[#FAFAFA] rounded-lg p-5 mb-6">
          <p className="text-[14px] text-[#111] leading-relaxed whitespace-pre-wrap">
            {request.message}
          </p>
        </div>
      ) : null}

      {/* Attachment */}
      {request.attachmentUrl ? (
        <div className="border border-[#EEE] rounded-lg p-4 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FAFAFA] rounded flex items-center justify-center text-[#888]">
              <FileIcon />
            </div>
            <div>
              <p className="text-[14px] font-medium">{request.attachmentName || "Attachment"}</p>
              {request.attachmentSize ? (
                <p className="text-[12px] text-[#888]">
                  {Math.round(request.attachmentSize / 1024)} KB · Attached by{" "}
                  {request.producerName}
                </p>
              ) : null}
            </div>
          </div>
          <a
            href={request.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#111] text-[#111] rounded-md px-4 py-2 text-[13px] font-medium hover:bg-[#FAFAFA] transition-colors"
          >
            Download attachment
          </a>
        </div>
      ) : null}

      {/* Contact locked notice (pending) */}
      {request.status === "pending" ? (
        <div className="border border-[#EEE] rounded-lg p-4 flex items-center gap-3 mb-6">
          <LockIcon />
          <p className="text-[14px] text-[#888]">
            Contact details shared after you accept
          </p>
        </div>
      ) : null}

      {/* Action buttons */}
      <RequestActions
        requestId={request.id}
        status={request.status}
        total={total}
        crewName={request.profile.name}
      />

      {/* Legal note (pending) */}
      {request.status === "pending" ? (
        <p className="text-[12px] text-[#888] text-center mt-4 max-w-lg mx-auto">
          By clicking &quot;Accept&quot; you confirm this booking at the terms above.
          Both parties receive a timestamped confirmation and contact details are
          shared.
        </p>
      ) : null}
    </div>
  );
}

function InfoCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="border border-[#EEE] rounded-lg p-4 bg-white">
      <p className="text-[16px] font-bold">{value}</p>
      <p className="text-[12px] text-[#888] mt-0.5">{label}</p>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M14.5 11.3v1.7a1.1 1.1 0 01-1.2 1.1A11 11 0 012 2.7 1.1 1.1 0 013.1 1.5H4.8a1.1 1.1 0 011.1 1c.1.6.2 1.1.4 1.7a1.1 1.1 0 01-.3 1.2l-.7.7a8.9 8.9 0 004 4l.7-.7a1.1 1.1 0 011.2-.3c.5.2 1.1.4 1.7.4a1.1 1.1 0 011 1.1z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 4.5L8 9l6.5-4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M11 2H5.5A1.5 1.5 0 004 3.5v13A1.5 1.5 0 005.5 18h9a1.5 1.5 0 001.5-1.5V7L11 2z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M11 2v5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="9" width="12" height="8" rx="1.5" stroke="#888" strokeWidth="1.2" />
      <path d="M6.5 9V6.5a3.5 3.5 0 017 0V9" stroke="#888" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
