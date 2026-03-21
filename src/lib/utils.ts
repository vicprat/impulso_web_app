import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeSearch(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function getWhatsAppLink(
  phoneNumber: string,
  serviceName?: string,
  message?: string
): string {
  const cleanNumber = phoneNumber.replace(/\D/g, '')
  const defaultMessage = serviceName
    ? `Hola! Me interesa el servicio de ${serviceName}. ¿Podrían darme más información?`
    : 'Hola! Me interesa conocer más sobre sus servicios.'
  const finalMessage = encodeURIComponent(message || defaultMessage)
  return `https://wa.me/${cleanNumber}?text=${finalMessage}`
}
