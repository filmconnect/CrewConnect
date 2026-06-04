import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatEur, formatDateRange } from "@/lib/format";
import { format } from "date-fns";
import logger from "@/lib/logger";
import ConfirmationDocument from "@/components/invoice/ConfirmationDocument";

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
      include: {
        profile: {
          select: {
            userId: true,
            name: true,
            role: true,
            rateIncludesEquipment: true,
            user: { select: { email: true } },
          },
        },
      },
    });

    if (!request || request.profile.userId !== session.userId) {
      return new Response("Not found", { status: 404 });
    }

    if (request.status !== "accepted" && request.status !== "done") {
      return new Response("Confirmation only available for accepted bookings", { status: 400 });
    }

    if (!request.confirmationId) {
      return new Response("No confirmation ID on this booking", { status: 400 });
    }

    const days =
      Math.ceil(
        (request.endDate.getTime() - request.startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    const total = request.offeredRate * days;

    const data = {
      confirmationId: request.confirmationId,
      sentAt: format(request.createdAt, "MMM d, yyyy · HH:mm 'CET'"),
      acceptedAt: request.acceptedAt
        ? format(request.acceptedAt, "MMM d, yyyy · HH:mm 'CET'")
        : "—",
      crewName: request.profile.name,
      crewRole: request.profile.role,
      crewEmail: request.profile.user?.email ?? null,
      crewPhone: null,
      producerName: request.producerName,
      producerCompany: request.producerCompany,
      producerEmail: request.producerEmail,
      producerPhone: request.producerPhone,
      projectName: request.projectName,
      role: request.role || request.profile.role,
      dateRange: formatDateRange(request.startDate, request.endDate),
      days,
      rateFormatted: `${formatEur(request.offeredRate)}/day`,
      totalFormatted: formatEur(total),
      inclEquipment: request.profile.rateIncludesEquipment,
      notes: request.message,
    };

    const buffer = await renderToBuffer(ConfirmationDocument({ data }));

    logger.info({ requestId, confirmationId: request.confirmationId }, "confirmation:pdf_generated");

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${request.confirmationId}.pdf"`,
      },
    });
  } catch (err) {
    logger.error({ err, requestId }, "confirmation:pdf_error");
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
