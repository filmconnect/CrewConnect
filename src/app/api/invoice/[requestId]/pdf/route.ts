import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatEur, formatDate, formatDateRange } from "@/lib/format";
import { addDays, format } from "date-fns";
import logger from "@/lib/logger";
import InvoiceDocument from "@/components/invoice/InvoiceDocument";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  const session = await getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const request = await prisma.bookingRequest.findUnique({
      where: { id: requestId },
      include: { profile: true },
    });

    if (!request || request.profile.userId !== session.userId) {
      return new Response("Not found", { status: 404 });
    }

    if (request.status !== "accepted" && request.status !== "done") {
      return new Response("Invoice only available for accepted bookings", { status: 400 });
    }

    const profile = request.profile;
    const days = Math.ceil(
      (request.endDate.getTime() - request.startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    const subtotal = request.offeredRate * days;
    const vatRate = request.vatRate ?? 25;
    const vatAmount = Math.round(subtotal * vatRate / 100);
    const total = subtotal + vatAmount;

    const termsMatch = profile.paymentTerms.match(/\d+/);
    const termsDays = termsMatch ? parseInt(termsMatch[0], 10) : 14;

    const year = new Date().getFullYear();
    const invoiceNumber = request.invoiceNumber
      ? `INV-${year}-${String(request.invoiceNumber).padStart(5, "0")}`
      : `INV-${year}-${String(profile.invoiceCounter + 1).padStart(5, "0")}`;

    const data = {
      invoiceNumber,
      dateIssued: format(request.invoiceIssuedAt || new Date(), "MMMM d, yyyy"),
      dueDate: format(addDays(request.invoiceIssuedAt || new Date(), termsDays), "MMMM d, yyyy"),
      paymentTerms: profile.paymentTerms,
      fromName: profile.legalName || profile.name,
      fromAddress: profile.address,
      fromVat: profile.vatNumber,
      fromIban: profile.iban,
      toName: request.producerName,
      toCompany: request.producerCompany,
      toEmail: request.producerEmail,
      toVat: request.producerVat,
      projectName: request.projectName,
      role: request.role || profile.role,
      dateRange: formatDateRange(request.startDate, request.endDate),
      inclEquipment: profile.rateIncludesEquipment,
      days,
      rateFormatted: formatEur(request.offeredRate),
      amountFormatted: formatEur(subtotal),
      subtotalFormatted: formatEur(subtotal),
      vatRate,
      vatFormatted: formatEur(vatAmount),
      totalFormatted: formatEur(total),
      confirmationId: request.confirmationId,
    };

    const buffer = await renderToBuffer(InvoiceDocument({ data }));

    logger.info({ requestId, invoiceNumber }, "invoice:pdf_generated");

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoiceNumber}.pdf"`,
      },
    });
  } catch (err) {
    logger.error({ err, requestId }, "invoice:pdf_error");
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
