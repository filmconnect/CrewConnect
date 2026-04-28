import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const gold = "#DBA508";
const primary = "#111111";
const secondary = "#888888";
const border = "#EEEEEE";

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: primary },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  invoiceTitle: { fontSize: 24, fontWeight: "bold", fontFamily: "Helvetica-Bold" },
  invoiceNum: { fontSize: 10, color: secondary, marginTop: 4 },
  labelSm: { fontSize: 8, color: secondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  bold: { fontFamily: "Helvetica-Bold" },
  row: { flexDirection: "row" },
  section: { borderTop: `1px solid ${border}`, paddingTop: 16, paddingBottom: 16 },
  fromTo: { flexDirection: "row", gap: 40, borderTop: `1px solid ${border}`, paddingTop: 16, paddingBottom: 16 },
  half: { flex: 1 },
  tableHeader: { flexDirection: "row", marginBottom: 8 },
  tableRow: { flexDirection: "row", alignItems: "flex-start" },
  colService: { flex: 1 },
  colNum: { width: 60, textAlign: "right" },
  totalsContainer: { alignItems: "flex-end", borderTop: `1px solid ${border}`, paddingTop: 16 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", width: 200, marginBottom: 4 },
  totalFinal: { flexDirection: "row", justifyContent: "space-between", width: 200, marginTop: 8 },
  totalLabel: { fontSize: 9, color: gold, textTransform: "uppercase", fontFamily: "Helvetica-Bold" },
  totalValue: { fontSize: 16, fontFamily: "Helvetica-Bold", color: gold },
  footer: { borderTop: `1px solid ${border}`, paddingTop: 12, marginTop: 20, fontSize: 9, color: secondary },
  goldText: { color: gold, fontSize: 9, marginTop: 2 },
});

interface InvoiceData {
  invoiceNumber: string;
  dateIssued: string;
  dueDate: string;
  paymentTerms: string;
  fromName: string;
  fromAddress: string | null;
  fromVat: string | null;
  fromIban: string | null;
  toName: string;
  toCompany: string | null;
  toEmail: string;
  toVat: string | null;
  projectName: string;
  role: string;
  dateRange: string;
  inclEquipment: boolean;
  days: number;
  rateFormatted: string;
  amountFormatted: string;
  subtotalFormatted: string;
  vatRate: number;
  vatFormatted: string;
  totalFormatted: string;
  confirmationId: string | null;
}

export default function InvoiceDocument({ data }: { data: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.invoiceTitle}>INVOICE</Text>
            <Text style={s.invoiceNum}>{data.invoiceNumber}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.labelSm}>Date issued</Text>
            <Text style={s.bold}>{data.dateIssued}</Text>
            <Text style={[s.labelSm, { marginTop: 8 }]}>Due date</Text>
            <Text style={s.bold}>{data.dueDate} ({data.paymentTerms})</Text>
          </View>
        </View>

        {/* From / To */}
        <View style={s.fromTo}>
          <View style={s.half}>
            <Text style={s.labelSm}>FROM</Text>
            <Text style={s.bold}>{data.fromName}</Text>
            {data.fromAddress ? <Text style={{ color: secondary, marginTop: 4 }}>{data.fromAddress}</Text> : null}
            {data.fromVat ? <Text style={{ color: secondary, marginTop: 2 }}>VAT: {data.fromVat}</Text> : null}
            {data.fromIban ? <Text style={{ color: secondary, marginTop: 2 }}>IBAN: {data.fromIban}</Text> : null}
          </View>
          <View style={s.half}>
            <Text style={s.labelSm}>TO</Text>
            <Text style={s.bold}>{data.toCompany || data.toName}</Text>
            <Text style={{ color: secondary, marginTop: 4 }}>{data.toName}</Text>
            <Text style={{ color: secondary }}>{data.toEmail}</Text>
            {data.toVat ? <Text style={{ color: secondary, marginTop: 2 }}>VAT: {data.toVat}</Text> : null}
          </View>
        </View>

        {/* Service table */}
        <View style={s.section}>
          <View style={s.tableHeader}>
            <Text style={[s.labelSm, s.colService]}>SERVICE</Text>
            <Text style={[s.labelSm, s.colNum]}>DAYS</Text>
            <Text style={[s.labelSm, s.colNum]}>RATE</Text>
            <Text style={[s.labelSm, s.colNum]}>AMOUNT</Text>
          </View>
          <View style={s.tableRow}>
            <View style={s.colService}>
              <Text style={s.bold}>{data.projectName}</Text>
              <Text style={{ color: secondary, marginTop: 2 }}>{data.role} · {data.dateRange}</Text>
              {data.inclEquipment ? <Text style={s.goldText}>incl. equipment</Text> : null}
            </View>
            <Text style={[s.bold, s.colNum]}>{data.days}</Text>
            <Text style={s.colNum}>{data.rateFormatted}</Text>
            <Text style={[s.bold, s.colNum]}>{data.amountFormatted}</Text>
          </View>
        </View>

        {/* Totals */}
        <View style={s.totalsContainer}>
          <View style={s.totalsRow}>
            <Text style={s.labelSm}>SUBTOTAL</Text>
            <Text style={s.bold}>{data.subtotalFormatted}</Text>
          </View>
          <View style={s.totalsRow}>
            <Text style={s.labelSm}>VAT ({data.vatRate}%)</Text>
            <Text>{data.vatFormatted}</Text>
          </View>
          <View style={s.totalFinal}>
            <Text style={s.totalLabel}>TOTAL</Text>
            <Text style={s.totalValue}>{data.totalFormatted}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          {data.fromIban ? (
            <Text>Payment to: IBAN {data.fromIban} · {data.fromName}</Text>
          ) : null}
          <Text>Reference: {data.invoiceNumber} · Booking {data.confirmationId || "—"}</Text>
        </View>
      </Page>
    </Document>
  );
}
