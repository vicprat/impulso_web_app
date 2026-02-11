import type { ReactNode } from 'react'

export type Locale = 'es' | 'en'

export interface CarouselSlide {
  id: string
  title: Record<Locale, string>
  subtitle: Record<Locale, string>
  imageUrl: string
  actionText: Record<Locale, string>
  actionUrl: string
  order: number
}

export interface Service {
  id: string
  title: Record<Locale, string>
  description: Record<Locale, string>
  iconName: string
  features: string[]
  order: number
  imageUrl?: string
  price?: Record<Locale, string>
  popular?: boolean
  size?: 'normal' | 'large'
}

export interface Benefit {
  id: string
  text: Record<Locale, string> | ReactNode
  order: number
}

export interface Feature {
  id: string
  title: Record<Locale, string>
  description: Record<Locale, string>
  iconName: string
  order: number
}

export interface TermsSection {
  id: string
  title: Record<Locale, string>
  content: Record<Locale, string>
  order: number
}
