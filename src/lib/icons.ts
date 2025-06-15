'use client';

import {  Home, User, Settings, Package, LayoutDashboard, MapPin, ShoppingCart, BarChart, Star, Headphones, MessageSquare, Users, Activity, Shield, Archive, TrendingUp } from 'lucide-react';
import { FC } from 'react';
export interface IconProps {
  className?: string;
  size?: number;
}

const iconMap: Record<string, FC<IconProps>> = {
  'home': Home,
  'layout-dashboard': LayoutDashboard, // Ejemplo de tu routes.ts
  'user': User,
  'package': Package,
  'map-pin': MapPin, // Asegúrate de añadir todos los que necesites
  'shopping-cart': ShoppingCart,
  'bar-chart': BarChart,
  'star': Star,
  'headphones': Headphones,
  'message-square': MessageSquare,
  'users': Users,
  'activity': Activity,
  'settings': Settings,
  'shield': Shield,
  'archive': Archive,
  'trending-up': TrendingUp,
  // ... añade todos los iconos que definiste en tu `routes.ts`
};

export const getIconComponent = (iconName?: string): FC<IconProps> => {
  if (!iconName) return () => null; 
  return iconMap[iconName] || Package;
};