'use client'

import {
  Home,
  User,
  Settings,
  Package,
  LayoutDashboard,
  MapPin,
  ShoppingCart,
  BarChart,
  Star,
  Headphones,
  MessageSquare,
  Users,
  Activity,
  Shield,
  Archive,
  TrendingUp,
} from 'lucide-react'
import { type FC } from 'react'
export interface IconProps {
  className?: string
  size?: number
}

const iconMap: Record<string, FC<IconProps>> = {
  activity: Activity,
  archive: Archive,
  'bar-chart': BarChart,

  headphones: Headphones,

  home: Home,

  'layout-dashboard': LayoutDashboard,

  'map-pin': MapPin,

  'message-square': MessageSquare,

  package: Package,

  settings: Settings,

  shield: Shield,

  // Asegúrate de añadir todos los que necesites
  'shopping-cart': ShoppingCart,

  star: Star,

  'trending-up': TrendingUp,
  // Ejemplo de tu routes.ts
  user: User,
  users: Users,
  // ... añade todos los iconos que definiste en tu `routes.ts`
}

export const getIconComponent = (iconName?: string): FC<IconProps> => {
  if (!iconName) return () => null
  return iconMap[iconName] || Package
}
