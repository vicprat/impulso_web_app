export const formatCurrency = (amount: string, currencyCode: string): string => {
  const numericAmount = parseFloat(amount)

  return new Intl.NumberFormat('es-MX', {
    currency: currencyCode,
    minimumFractionDigits: 2,
    style: 'currency',
  }).format(numericAmount)
}
export const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export const getStatusColor = (status: string, type: 'financial' | 'fulfillment') => {
  if (type === 'financial') {
    return status === 'PAID'
      ? 'bg-success-container text-success'
      : 'bg-warning-container text-on-warning-container'
  } else {
    return status === 'FULFILLED'
      ? 'bg-primary-container text-on-primary-container'
      : 'bg-secondary-container text-on-secondary-container'
  }
}
