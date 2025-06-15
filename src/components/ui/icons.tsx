// components/ui/icons.tsx
import {
  Home,
  LayoutDashboard,
  User,
  Package,
  MapPin,
  ShoppingCart,
  BarChart,
  Star,
  Headphones,
  MessageSquare,
  Users,
  Activity,
  Settings,
  Shield,
  Archive,
  TrendingUp,
  List
  // ... importa todos los iconos que necesites de 'lucide-react'
} from 'lucide-react';

// Este es el objeto que importaremos en otros componentes
export const Icons = {
  home: Home,
  'layout-dashboard': LayoutDashboard,
  user: User,
  package: Package,
  'map-pin': MapPin,
  'shopping-cart': ShoppingCart,
  'bar-chart': BarChart,
  star: Star,
  headphones: Headphones,
  'message-square': MessageSquare,
  users: Users,
  activity: Activity,
  settings: Settings,
  shield: Shield,
  archive: Archive,
  'trending-up': TrendingUp,
  list: List,
};

// (Opcional pero recomendado)
// Creamos un tipo dinámico a partir de las llaves del objeto Icons.
// Si añades un nuevo ícono a `Icons`, se añade automáticamente a este tipo.
export type IconName = keyof typeof Icons;