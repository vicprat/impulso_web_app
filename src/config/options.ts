import { Building2, FileText, MapPin, Package, Palette } from 'lucide-react'

export interface OptionConfig {
  name: string
  label: string
  singularLabel: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  apiKey: string
}

export const OPTIONS_CONFIG: Record<string, OptionConfig> = {
  arrendamientos: {
    apiKey: 'arrendamientos',
    description: 'Gestiona los tipos de arrendamiento disponibles',
    icon: Building2,
    label: 'Arrendamientos',
    name: 'arrendamientos',
    singularLabel: 'Arrendamiento',
  },
  artists: {
    apiKey: 'artists',
    description: 'Gestiona los artistas disponibles en tu catálogo',
    icon: Palette,
    label: 'Artistas',
    name: 'artists',
    singularLabel: 'Artista',
  },
  artwork_types: {
    apiKey: 'artwork_types',
    description: 'Gestiona los tipos de obra disponibles',
    icon: Package,
    label: 'Tipos de Obra',
    name: 'artwork_types',
    singularLabel: 'Tipo de Obra',
  },
  locations: {
    apiKey: 'locations',
    description: 'Gestiona las ubicaciones de almacenamiento',
    icon: MapPin,
    label: 'Ubicaciones',
    name: 'locations',
    singularLabel: 'Ubicación',
  },
  techniques: {
    apiKey: 'techniques',
    description: 'Gestiona las técnicas artísticas disponibles',
    icon: FileText,
    label: 'Técnicas',
    name: 'techniques',
    singularLabel: 'Técnica',
  },
}

export const VALID_OPTION_NAMES = Object.keys(OPTIONS_CONFIG)

export function getOptionConfig(name: string): OptionConfig | undefined {
  return OPTIONS_CONFIG[name]
}

export function isValidOption(name: string): boolean {
  return name in OPTIONS_CONFIG
}
