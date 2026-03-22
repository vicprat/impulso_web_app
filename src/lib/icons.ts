'use client'

import {
  Activity,
  Archive,
  BarChart,
  Headphones,
  Home,
  LayoutDashboard,
  Layers,
  MapPin,
  MessageSquare,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  TrendingUp,
  User,
  Users,
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

  layers: Layers,

  'map-pin': MapPin,

  'message-square': MessageSquare,

  package: Package,

  settings: Settings,

  shield: Shield,

  'shopping-cart': ShoppingCart,

  star: Star,

  'trending-up': TrendingUp,
  user: User,
  users: Users,
}

export const getIconComponent = (iconName?: string): FC<IconProps> => {
  if (!iconName) return () => null

  return iconMap[iconName] || Package
}
