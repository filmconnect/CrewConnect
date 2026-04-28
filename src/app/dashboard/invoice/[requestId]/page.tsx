import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatEur, formatDate } from "@/lib/format";
import { addDays, format } from "date-fns";
import logger from "@/lib/logger";
import InvoiceActions from "./InvoiceActions";

interface PageProps {
  params: Promise<{ requestId: string }>;
}

export default async function InvoicePage({ params }: PageProps) {
  const { requestId } = await params;
  const { userId } = await requireAuth();

  const request = await prisma.bookingRequest.findUnique({
    where: { id: requestId },
    include: {
      profile: true,
    },
  });

  if (!request || request.profile.userId !== userId) {
    logger.warn({ requestId, userId }, "invoice:not_found_or_unauthorized");
    notFound();
  }

  if (request.status !== "accepted" && request.status !== "done") {
    notFound();
  }

  const profile = request.profile;
  const days = Math.ceil(
    (request.endDate.getTime() - request.startDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const ratePerDay = request.offeredRate;
  const subtotal = ratePerDay * days;
  const defaultVat = request.vatRate ?? 25;
  const vatAmount = Math.round(subtotal * defaultVat / 100);
  const total = subtotal + vatAmount;

  // Default invoice number
  const year = new Date().getFullYear();
  const nextCounter = profile.invoiceCounter + 1;
  const defaultInvoiceNumber = `INV-${year}-${String(nextCounter).padStart(5, "0")}`;

  // Payment terms days
  const termsMatch = profile.paymentTerms.match(/\d+/);
  const termsDays = termsMatch ? parseInt(termsMatch[0], 10) : 14;
  const dueDate = addDays(new Date(), termsDays);

  logger.info({ requestId, project: request.projectName }, "invoice:viewed");

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/dashboard/request/${requestId}`}
          className="w-8 h-8 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#888] hover:text-[#111]"
        >
          ←
        </Link>
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.5px]">Generate invoice</h1>
          <p className="text-[13px] text-[#888]">From booking: {request.projectName}</p>
        </div>
      </div>

      {/* Invoice preview */}
      <div className="border border-[#EEE] rounded-lg bg-white">
        {/* Top: Invoice number + dates */}
        <div className="p-6 flex justify-between items-start border-b border-[#EEE]">
          <div>
            <p className="text-[24px] font-black">INVOICE</p>
            <p className="text-[13px] text-[#888] mt-1">{defaultInvoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888]">Date issued</p>
            <p className="text-[14px] font-bold">{format(new Date(), "MMMM d, yyyy")}</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] mt-2">Due date</p>
            <p className="text-[14px] font-bold">
              {format(dueDate, "MMMM d, yyyy")} <span className="font-normal text-[#888]">({profile.paymentTerms})</span>
            </p>
          </div>
        </div>

        {/* FROM / TO */}
        <div className="p-6 grid grid-cols-2 gap-8 border-b border-[#EEE]">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] mb-2">FROM</p>
            <p className="text-[14px] font-bold">{profile.legalName || profile.name}</p>
            {profile.address ? <p className="text-[13px] text-[#888] mt-1">{profile.address}</p> : null}
            {profile.vatNumber ? <p className="text-[13px] text-[#888] mt-1">VAT: {profile.vatNumber}</p> : null}
            {profile.iban ? <p className="text-[13px] text-[#888]">IBAN: {profile.iban}</p> : null}
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] mb-2">TO</p>
            <p className="text-[14px] font-bold">{request.producerCompany || request.producerName}</p>
            <p className="text-[13px] text-[#888] mt-1">{request.producerName}</p>
            <p className="text-[13px] text-[#888]">{request.producerEmail}</p>
            {request.producerVat ? <p className="text-[13px] text-[#888]">VAT: {request.producerVat}</p> : null}
          </div>
        </div>

        {/* Service line */}
        <div className="p-6 border-b border-[#EEE]">
          <div className="grid grid-cols-[1fr_80px_80px_100px] gap-4 mb-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888]">SERVICE</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] text-right">DAYS</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] text-right">RATE</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888] text-right">AMOUNT</p>
          </div>
          <div className="grid grid-cols-[1fr_80px_80px_100px] gap-4 items-start">
            <div>
              <p className="text-[14px] font-bold">{request.projectName}</p>
              <p className="text-[13px] text-[#888]">
                {request.role || profile.role} · {formatDate(request.startDate)}–{formatDate(request.endDate)}
              </p>
              {profile.rateIncludesEquipment ? (
                <p className="text-[12px] text-[#DBA508] mt-0.5">incl. equipment</p>
              ) : null}
            </div>
            <p className="text-[14px] text-right font-bold">{days}</p>
            <p className="text-[14px] text-right">{formatEur(ratePerDay)}</p>
            <p className="text-[14px] text-right font-bold">{formatEur(subtotal)}</p>
          </div>
        </div>

        {/* Totals */}
        <div className="p-6 bg-[#FAFAFA] border-b border-[#EEE]">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888]">SUBTOTAL</span>
                <span className="font-bold">{formatEur(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[13px] border-b border-[#EEE] pb-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#888]">VAT ({defaultVat}%)</span>
                <span>{formatEur(vatAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#DBA508]">TOTAL</span>
                <span className="text-[20px] font-bold text-[#DBA508]">{formatEur(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment info */}
        <div className="px-6 py-4 text-[12px] text-[#888]">
          {profile.iban ? <p>Payment to: IBAN {profile.iban} · {profile.legalName || profile.name}</p> : null}
          <p>Reference: {defaultInvoiceNumber} · Booking {request.confirmationId || "—"}</p>
        </div>
      </div>

      {/* Adjust + Actions */}
      <InvoiceActions
        requestId={requestId}
        defaultVatRate={defaultVat}
        defaultPaymentTerms={profile.paymentTerms}
        defaultInvoiceNumber={defaultInvoiceNumber}
        producerEmail={request.producerEmail}
      />
    </div>
  );
}
