import {
  BookOpen,
  Calendar,
  Crown,
  DollarSign,
  Frame,
  Image,
  Palette,
  Printer,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'

export const iconMap = {
  BookOpen,
  Calendar,
  Crown,
  DollarSign,
  Frame,
  Image,
  Palette,
  Printer,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
} as const

export type IconName = keyof typeof iconMap
