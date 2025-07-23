'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'
import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FinanceMetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ElementType
  color?: 'default' | 'success' | 'warning' | 'error'
  subtitle?: string
}

export const FinanceMetricCard: React.FC<FinanceMetricCardProps> = ({
  change,
  color = 'default',
  icon: Icon,
  subtitle,
  title,
  value,
}) => {
  const isPositive = change !== undefined ? change >= 0 : null

  const colorClasses = {
    default: 'text-foreground',
    error: 'text-red-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
  }

  const iconClasses = {
    default: 'text-muted-foreground',
    error: 'text-red-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
  }

  return (
    <Card className='transition-all hover:shadow-md'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon className={`size-4 ${iconClasses[color]}`} />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        {subtitle && <p className='text-xs text-muted-foreground'>{subtitle}</p>}
        {change !== undefined && (
          <div className='flex items-center pt-1'>
            {isPositive ? (
              <TrendingUp className='mr-1 size-3 text-green-500' />
            ) : (
              <TrendingDown className='mr-1 size-3 text-red-500' />
            )}
            <span
              className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}
            >
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
