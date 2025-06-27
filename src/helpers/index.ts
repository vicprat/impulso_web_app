export const formatCurrency = (amount: string, currencyCode: string): string => {
  const numericAmount = parseFloat(amount)

  return new Intl.NumberFormat('es-MX', {
    currency: currencyCode,
    minimumFractionDigits: 2,
    style: 'currency',
  }).format(numericAmount)
}
