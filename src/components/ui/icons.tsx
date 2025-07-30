import {
  Activity,
  Archive,
  BarChart,
  BarChart3,
  Calendar,
  CreditCard,
  Download,
  Edit,
  Edit3,
  Eye,
  FileText,
  Grid3X3,
  Headphones,
  Home,
  LayoutDashboard,
  List,
  Lock,
  LogIn,
  MapPin,
  MessageSquare,
  Package,
  Plus,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Star,
  Ticket,
  TrendingUp,
  User,
  Users,
  X
} from 'lucide-react'

export const Icons = {
  activity: Activity,
  archive: Archive,
  'bar-chart': BarChart,
  'bar-chart-3': BarChart3,
  calendar: Calendar,
  'credit-card': CreditCard,
  download: Download,
  edit: Edit,
  'edit-3': Edit3,
  eye: Eye,
  'file-text': FileText,
  grid: Grid3X3,
  headphones: Headphones,
  home: Home,
  'layout-dashboard': LayoutDashboard,
  list: List,
  lock: Lock,
  'log-in': LogIn,
  'map-pin': MapPin,
  'message-square': MessageSquare,
  package: Package,
  plus: Plus,
  search: Search,
  settings: Settings,
  shield: Shield,
  'shopping-bag': ShoppingBag,
  'shopping-cart': ShoppingCart,
  star: Star,
  ticket: Ticket,
  'trending-up': TrendingUp,
  user: User,
  'user-edit': Edit,
  users: Users,
  x: X,
}

export type IconName = keyof typeof Icons

export interface IconProps {
  name: IconName
  className?: string
  size?: number
}

export const Icon = ({ className, name, size = 24 }: IconProps) => {
  const IconComponent = Icons[name]

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return <IconComponent className={className} size={size} />
}
