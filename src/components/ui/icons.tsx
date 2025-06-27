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
  List,
  // ... importa todos los iconos que necesites de 'lucide-react'
} from 'lucide-react'

// Este es el objeto que importaremos en otros componentes
export const Icons = {
  activity: Activity,
  archive: Archive,
  'bar-chart': BarChart,
  headphones: Headphones,
  home: Home,
  'layout-dashboard': LayoutDashboard,
  list: List,
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

// (Opcional pero recomendado)
// Creamos un tipo dinámico a partir de las llaves del objeto Icons.
// Si añades un nuevo ícono a `Icons`, se añade automáticamente a este tipo.
export type IconName = keyof typeof Icons
