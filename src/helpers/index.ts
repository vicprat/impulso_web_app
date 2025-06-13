export const formatCurrency = (amount: string, currencyCode: string): string => {
  const numericAmount = parseFloat(amount);
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(numericAmount);
};
