import type { ReactNode } from 'react'

interface CurrencyProps {
  amount: number
  currency?: string
  className?: string
  children?: ReactNode
}

export function Currency({ amount, currency = 'MXN', className = '', children }: CurrencyProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formattedAmount = formatCurrency(amount)
  const isNegative = amount < 0
  const isPositive = amount > 0

  return (
    <span 
      className={`font-mono ${className} ${
        isNegative ? 'text-error' : 
        isPositive ? 'text-success' : 
        'text-foreground'
      }`}
    >
      {children || formattedAmount}
    </span>
  )
}

export function formatCurrency(amount: number, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
} 