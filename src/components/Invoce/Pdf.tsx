'use client'
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

import { type CustomerOrder, type LineItem } from '@/src/modules/customer/types'

interface Props {
  order: CustomerOrder
}

interface LineItemEdge {
  node: LineItem
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
    flexDirection: 'column',
    alignItems: 'flex-start',
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
  table: {
    marginBottom: 30,
  },
  tableCell: {
    color: '#4b5563',
    fontSize: 9,
  },
  tableCellBold: {
    color: '#1f2937',
    fontSize: 9,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tableHeaderText: {
    color: '#374151',
    fontSize: 9,
    fontWeight: 'bold',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
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

export const PDF: React.FC<Props> = ({ order }) => {
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
            <Text style={pdfStyles.invoiceTitle}>Invoice {order.name}</Text>
            <Text style={pdfStyles.invoiceDetails}>Fecha: {formatDate(order.processedAt)}</Text>
            <Text style={pdfStyles.invoiceDetails}>Confirmación: {order.confirmationNumber}</Text>
          </View>
        </View>

        <View style={pdfStyles.fromToSection}>
          <View style={pdfStyles.addressBlock}>
            <Text style={pdfStyles.sectionTitle}>FROM:</Text>
            <Text style={pdfStyles.companyName}>Impulso Galería</Text>
            <Text style={pdfStyles.addressText}>Hacienda Escolásticas 107</Text>
            <Text style={pdfStyles.addressText}>Jardines de la Hacienda</Text>
            <Text style={pdfStyles.addressText}>Querétaro, Querétaro 76180</Text>
            <Text style={pdfStyles.addressText}>México</Text>
            <Text style={pdfStyles.addressText}>+52 442 157 0443</Text>
            <Text style={pdfStyles.addressText}>info@impulsogaleria.com</Text>
          </View>

          <View style={pdfStyles.addressBlock}>
            <Text style={pdfStyles.sectionTitle}>TO:</Text>
            <Text style={pdfStyles.companyName}>
              {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
            </Text>
            <Text style={pdfStyles.addressText}>{order.email}</Text>
            {order.shippingAddress && (
              <>
                <Text style={pdfStyles.addressText}>{order.shippingAddress.address1}</Text>
                {order.shippingAddress.address2 && (
                  <Text style={pdfStyles.addressText}>{order.shippingAddress.address2}</Text>
                )}
                <Text style={pdfStyles.addressText}>
                  {order.shippingAddress.city}, {order.shippingAddress.zip}
                </Text>
                <Text style={pdfStyles.addressText}>{order.shippingAddress.country}</Text>
                {order.shippingAddress.phone && (
                  <Text style={pdfStyles.addressText}>{order.shippingAddress.phone}</Text>
                )}
              </>
            )}
          </View>
        </View>

        <View style={pdfStyles.table}>
          <Text style={pdfStyles.sectionTitle}>INVOICE ITEMS</Text>

          <View style={pdfStyles.tableHeader}>
            <Text style={[ pdfStyles.tableHeaderText, pdfStyles.col6 ]}>Producto</Text>
            <Text style={[ pdfStyles.tableHeaderText, pdfStyles.col2 ]}>Cantidad</Text>
            <Text style={[ pdfStyles.tableHeaderText, pdfStyles.col2Right ]}>Precio Original</Text>
            <Text style={[ pdfStyles.tableHeaderText, pdfStyles.col2Right ]}>Precio Factura</Text>
          </View>

          {order.lineItems.edges.map((item: LineItemEdge, index: number) => (
            <View key={index} style={pdfStyles.tableRow}>
              <Text style={[ pdfStyles.tableCellBold, pdfStyles.col6 ]}>{item.node.title}</Text>
              <Text style={[ pdfStyles.tableCell, pdfStyles.col2 ]}>{item.node.quantity}</Text>
              <Text style={[ pdfStyles.tableCell, pdfStyles.col2Right ]}>
                {formatPrice(item.node.price.amount, item.node.price.currencyCode)}
              </Text>
              <Text style={[ pdfStyles.tableCellBold, pdfStyles.col2Right ]}>
                {formatPrice(item.node.price.amount, item.node.price.currencyCode)}
              </Text>
            </View>
          ))}
        </View>

        <View style={pdfStyles.totalsSection}>
          <View style={pdfStyles.totalsBlock}>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Subtotal:</Text>
              <Text style={pdfStyles.totalValue}>
                {formatPrice(order.subtotal.amount, order.subtotal.currencyCode)}
              </Text>
            </View>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Envío:</Text>
              <Text style={pdfStyles.totalValue}>
                {formatPrice(order.totalShipping.amount, order.totalShipping.currencyCode)}
              </Text>
            </View>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Impuestos:</Text>
              <Text style={pdfStyles.totalValue}>
                {formatPrice(order.totalTax.amount, order.totalTax.currencyCode)}
              </Text>
            </View>
            <View style={pdfStyles.grandTotalRow}>
              <Text style={pdfStyles.grandTotalLabel}>Total:</Text>
              <Text style={pdfStyles.grandTotalValue}>
                {formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}
              </Text>
            </View>

            {order.financialStatus === 'PAID' && (
              <View style={pdfStyles.paidBadge}>
                <Text style={pdfStyles.paidBadgeText}>✓ Paid</Text>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  )
}
