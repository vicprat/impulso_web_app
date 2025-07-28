import type { ReactNode } from 'react'

interface CurrencyProps {
  amount: number
  currency?: string
  className?: string
  children?: ReactNode
}

export function Currency({ amount, children, className = '', currency = 'MXN' }: CurrencyProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: 'currency',
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
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'currency',
  }).format(amount)
} 