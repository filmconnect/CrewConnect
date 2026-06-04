import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const gold = "#DBA508";
const primary = "#111111";
const secondary = "#888888";
const border = "#EEEEEE";
const confirmed = "#1A8C5E";

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: primary },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  title: { fontSize: 24, fontWeight: "bold", fontFamily: "Helvetica-Bold" },
  confirmId: { fontSize: 10, color: secondary, marginTop: 4 },
  labelSm: { fontSize: 8, color: secondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  bold: { fontFamily: "Helvetica-Bold" },
  fromTo: { flexDirection: "row", gap: 40, borderTop: `1px solid ${border}`, paddingTop: 16, paddingBottom: 16 },
  half: { flex: 1 },
  section: { borderTop: `1px solid ${border}`, paddingTop: 16, paddingBottom: 16 },
  banner: { backgroundColor: "#F0FAF5", borderLeft: `3px solid ${confirmed}`, padding: 12, marginBottom: 20 },
  bannerTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: confirmed },
  bannerText: { fontSize: 9, color: confirmed, marginTop: 4 },
  detailsGrid: { flexDirection: "row", gap: 40, marginTop: 8 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", width: 200, marginTop: 8 },
  totalLabel: { fontSize: 9, color: gold, textTransform: "uppercase", fontFamily: "Helvetica-Bold" },
  totalValue: { fontSize: 16, fontFamily: "Helvetica-Bold", color: gold },
  totalsContainer: { alignItems: "flex-end", borderTop: `1px solid ${border}`, paddingTop: 16 },
  footer: { borderTop: `1px solid ${border}`, paddingTop: 12, marginTop: 20, fontSize: 9, color: secondary },
});

interface ConfirmationData {
  confirmationId: string;
  acceptedAt: string;          // formatted
  sentAt: string;              // formatted
  crewName: string;
  crewRole: string;
  crewEmail: string | null;
  crewPhone: string | null;
  producerName: string;
  producerCompany: string | null;
  producerEmail: string;
  producerPhone: string | null;
  projectName: string;
  role: string;
  dateRange: string;
  days: number;
  rateFormatted: string;
  totalFormatted: string;
  inclEquipment: boolean;
  notes: string | null;
}

export default function ConfirmationDocument({ data }: { data: ConfirmationData }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.title}>BOOKING CONFIRMATION</Text>
            <Text style={s.confirmId}>{data.confirmationId}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.labelSm}>Sent by producer</Text>
            <Text style={s.bold}>{data.sentAt}</Text>
            <Text style={[s.labelSm, { marginTop: 8 }]}>Accepted by crew</Text>
            <Text style={s.bold}>{data.acceptedAt}</Text>
          </View>
        </View>

        <View style={s.banner}>
          <Text style={s.bannerTitle}>Booking confirmed</Text>
          <Text style={s.bannerText}>
            Both parties have agreed to the terms below. Keep this document for your records.
          </Text>
        </View>

        <View style={s.fromTo}>
          <View style={s.half}>
            <Text style={s.labelSm}>CREW</Text>
            <Text style={s.bold}>{data.crewName}</Text>
            <Text style={{ color: secondary, marginTop: 4 }}>{data.crewRole}</Text>
            {data.crewEmail ? <Text style={{ color: secondary, marginTop: 2 }}>{data.crewEmail}</Text> : null}
            {data.crewPhone ? <Text style={{ color: secondary, marginTop: 2 }}>{data.crewPhone}</Text> : null}
          </View>
          <View style={s.half}>
            <Text style={s.labelSm}>PRODUCER</Text>
            <Text style={s.bold}>{data.producerCompany || data.producerName}</Text>
            <Text style={{ color: secondary, marginTop: 4 }}>{data.producerName}</Text>
            <Text style={{ color: secondary }}>{data.producerEmail}</Text>
            {data.producerPhone ? <Text style={{ color: secondary, marginTop: 2 }}>{data.producerPhone}</Text> : null}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.labelSm}>PROJECT</Text>
          <Text style={s.bold}>{data.projectName}</Text>
          <View style={s.detailsGrid}>
            <View style={s.half}>
              <Text style={[s.labelSm, { marginTop: 12 }]}>Role</Text>
              <Text>{data.role}</Text>
            </View>
            <View style={s.half}>
              <Text style={[s.labelSm, { marginTop: 12 }]}>Dates</Text>
              <Text>{data.dateRange}</Text>
            </View>
            <View style={s.half}>
              <Text style={[s.labelSm, { marginTop: 12 }]}>Days</Text>
              <Text>{data.days}</Text>
            </View>
            <View style={s.half}>
              <Text style={[s.labelSm, { marginTop: 12 }]}>Day rate</Text>
              <Text>
                {data.rateFormatted}
                {data.inclEquipment ? " (incl. equipment)" : ""}
              </Text>
            </View>
          </View>
        </View>

        {data.notes ? (
          <View style={s.section}>
            <Text style={s.labelSm}>NOTES FROM PRODUCER</Text>
            <Text style={{ color: secondary, marginTop: 6 }}>{data.notes}</Text>
          </View>
        ) : null}

        <View style={s.totalsContainer}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>TOTAL</Text>
            <Text style={s.totalValue}>{data.totalFormatted}</Text>
          </View>
        </View>

        <View style={s.footer}>
          <Text>
            Confirmation {data.confirmationId} · Issued via CrewConnect ·
            This document records a timestamped agreement between the parties above.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
