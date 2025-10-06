'use client'
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

interface Attendee {
  id: string
  name: string
  customerName: string
  displayFinancialStatus: string
  displayFulfillmentStatus: string
  lineItemsCount: number
  processedAt: string
  totalPrice: {
    amount: string
    currencyCode: string
  }
}

interface Event {
  id: string
  title: string
}

interface Props {
  attendees: Attendee[]
  event: Event
  stats: {
    total: number
    totalTickets: number
    totalRevenue: number
    paid: number
    pending: number
    refunded: number
  }
}

const pdfStyles = StyleSheet.create({
  addressBlock: {
    width: '45%',
  },
  addressText: {
    color: '#4b5563',
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 2,
  },
  col2: { textAlign: 'center', width: '16.67%' },
  col2Right: { textAlign: 'right', width: '16.67%' },
  col3: { width: '25%' },
  col4: { width: '33.33%' },
  col6: { width: '50%' },
  companyName: {
    color: '#1f2937',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  fromToSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  grandTotalLabel: {
    color: '#1f2937',
    fontSize: 12,
    fontWeight: 'bold',
  },
  grandTotalRow: {
    borderColor: '#d1d5db',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
  },
  grandTotalValue: {
    color: '#1f2937',
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  invoiceDetails: {
    color: '#6b7280',
    fontSize: 9,
    marginTop: 4,
    textAlign: 'right',
  },
  invoiceTitle: {
    color: '#1f2937',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  logo: {
    height: 60,
    objectFit: 'contain',
    width: 180
  },
  logoSection: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  logoSubtitle: {
    color: '#6b7280',
    fontSize: 10,
    marginTop: 2,
  },
  logoTitle: {
    color: '#1f2937',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  page: {
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingBottom: 65,
    paddingHorizontal: 35,
    paddingTop: 35,
  },
  paidBadge: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  paidBadgeText: {
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    color: '#166534',
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sectionTitle: {
    color: '#1f2937',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsBlock: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    width: '22%',
  },
  statsLabel: {
    color: '#6b7280',
    fontSize: 8,
    marginBottom: 4,
  },
  statsValue: {
    color: '#1f2937',
    fontSize: 12,
    fontWeight: 'bold',
  },
  table: {
    marginBottom: 30,
  },
  tableCell: {
    color: '#4b5563',
    fontSize: 8,
  },
  tableCellBold: {
    color: '#1f2937',
    fontSize: 8,
    fontWeight: 'bold',
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tableHeaderText: {
    color: '#374151',
    fontSize: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  totalLabel: {
    color: '#6b7280',
    fontSize: 9,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalValue: {
    color: '#1f2937',
    fontSize: 9,
  },
  totalsBlock: {
    width: 200,
  },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
})

export const PDF: React.FC<Props> = ({ attendees, event, stats }) => {
  const formatPrice = (amount: string, currency: string) => {
    const numericAmount = parseFloat(amount)
    return `${numericAmount.toLocaleString('es-MX')} ${currency}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return '#166534'
      case 'PENDING':
        return '#d97706'
      case 'REFUNDED':
        return '#dc2626'
      default:
        return '#6b7280'
    }
  }

  return (
    <Document>
      <Page size='A4' style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <View style={pdfStyles.logoSection}>
            <Image
              src="/assets/logo.png"
              style={pdfStyles.logo}
            />
          </View>
          <View>
            <Text style={pdfStyles.invoiceTitle}>Lista de Asistentes</Text>
            <Text style={pdfStyles.invoiceDetails}>Evento: {event.title}</Text>
            <Text style={pdfStyles.invoiceDetails}>Fecha de generación: {formatDate(new Date().toISOString())}</Text>
          </View>
        </View>

        <View style={pdfStyles.statsSection}>
          <View style={pdfStyles.statsBlock}>
            <Text style={pdfStyles.statsLabel}>Total Órdenes</Text>
            <Text style={pdfStyles.statsValue}>{stats.total}</Text>
          </View>
          <View style={pdfStyles.statsBlock}>
            <Text style={pdfStyles.statsLabel}>Total Boletos</Text>
            <Text style={pdfStyles.statsValue}>{stats.totalTickets}</Text>
          </View>
          <View style={pdfStyles.statsBlock}>
            <Text style={pdfStyles.statsLabel}>Ingresos</Text>
            <Text style={pdfStyles.statsValue}>${stats.totalRevenue.toLocaleString('es-MX')}</Text>
          </View>
          <View style={pdfStyles.statsBlock}>
            <Text style={pdfStyles.statsLabel}>Pagados</Text>
            <Text style={pdfStyles.statsValue}>{stats.paid}</Text>
          </View>
        </View>

        <View style={pdfStyles.table}>
          <Text style={pdfStyles.sectionTitle}>REGISTRO DE ASISTENTES</Text>

          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.col3]}>Cliente</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.col2]}>Orden</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.col2]}>Boletos</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.col2]}>Estado Pago</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.col2Right]}>Total</Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.col3]}>Fecha</Text>
          </View>

          {attendees.map((attendee, index) => (
            <View key={index} style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableCellBold, pdfStyles.col3]}>
                {attendee.customerName}
              </Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.col2]}>
                {attendee.name}
              </Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.col2]}>
                {attendee.lineItemsCount}
              </Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.col2, { color: getStatusColor(attendee.displayFinancialStatus) }]}>
                {attendee.displayFinancialStatus}
              </Text>
              <Text style={[pdfStyles.tableCellBold, pdfStyles.col2Right]}>
                {formatPrice(attendee.totalPrice.amount, attendee.totalPrice.currencyCode)}
              </Text>
              <Text style={[pdfStyles.tableCell, pdfStyles.col3]}>
                {formatDate(attendee.processedAt)}
              </Text>
            </View>
          ))}
        </View>

        <View style={pdfStyles.totalsSection}>
          <View style={pdfStyles.totalsBlock}>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Total Órdenes:</Text>
              <Text style={pdfStyles.totalValue}>{stats.total}</Text>
            </View>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Total Boletos:</Text>
              <Text style={pdfStyles.totalValue}>{stats.totalTickets}</Text>
            </View>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Pagados:</Text>
              <Text style={pdfStyles.totalValue}>{stats.paid}</Text>
            </View>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Pendientes:</Text>
              <Text style={pdfStyles.totalValue}>{stats.pending}</Text>
            </View>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Reembolsados:</Text>
              <Text style={pdfStyles.totalValue}>{stats.refunded}</Text>
            </View>
            <View style={pdfStyles.grandTotalRow}>
              <Text style={pdfStyles.grandTotalLabel}>Ingresos Totales:</Text>
              <Text style={pdfStyles.grandTotalValue}>
                ${stats.totalRevenue.toLocaleString('es-MX')}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
