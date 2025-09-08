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




export const getPlatformStyles = (platformId: string) => {
  const styles: Record<
    string,
    {
      linkClasses: string
      iconColorClass: string
      iconBgClass: string
    }
  > = {
    behance: {
      iconBgClass: 'bg-chart-1',
      iconColorClass: 'text-on-primary',
      linkClasses: 'bg-surface-container-low/50 hover:bg-surface-container/70 backdrop-blur-sm',
    },
    custom: {
      iconBgClass: 'bg-surface-container-high',
      iconColorClass: 'text-on-surface',
      linkClasses: 'bg-surface-container-low/50 hover:bg-surface-container/70 backdrop-blur-sm',
    },
    github: {
      iconBgClass: 'bg-surface-container-highest',
      iconColorClass: 'text-on-surface',
      linkClasses: 'bg-surface-container-low/50 hover:bg-surface-container/70 backdrop-blur-sm',
    },
    instagram: {
      iconBgClass: 'bg-gradient-to-r from-chart-2 via-chart-3 to-warning',
      iconColorClass: 'text-on-primary',
      linkClasses: 'bg-surface-container-low/50 hover:bg-surface-container/70 backdrop-blur-sm',
    },
    linkedin: {
      iconBgClass: 'bg-chart-1',
      iconColorClass: 'text-on-primary',
      linkClasses: 'bg-surface-container-low/50 hover:bg-surface-container/70 backdrop-blur-sm',
    },
    twitter: {
      iconBgClass: 'bg-surface-container-highest',
      iconColorClass: 'text-on-surface',
      linkClasses: 'bg-surface-container-low/50 hover:bg-surface-container/70 backdrop-blur-sm',
    },
    website: {
      iconBgClass: 'bg-surface-container-high',
      iconColorClass: 'text-on-surface',
      linkClasses: 'bg-surface-container-low/50 hover:bg-surface-container/70 backdrop-blur-sm',
    },
    youtube: {
      iconBgClass: 'bg-error',
      iconColorClass: 'text-on-error',
      linkClasses: 'bg-surface-container-low/50 hover:bg-surface-container/70 backdrop-blur-sm',
    },
  }
  return styles[platformId.toLowerCase()] ?? styles.custom
}
