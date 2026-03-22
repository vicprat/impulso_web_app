import { ArrowLeft, Palette, Package, MapPin, Building2, FileText, Tag } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OPTIONS_CONFIG } from '@/src/config/options'
import { ROUTES } from '@/src/config/routes'

const CARD_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  arrendamientos: Building2,
  artists: Palette,
  artwork_types: Package,
  locations: MapPin,
  techniques: FileText,
}

export default function OptionsIndexPage() {
  const options = Object.values(OPTIONS_CONFIG)

  return (
    <div className='min-w-0 max-w-full space-y-6 p-4 md:p-6'>
      <div>
        <Link href={ROUTES.INVENTORY.MAIN.PATH}>
          <Button variant='ghost' size='sm' className='mb-4'>
            <ArrowLeft className='mr-2 size-4' />
            Volver al Inventario
          </Button>
        </Link>
        <h1 className='text-2xl font-bold'>Gestión de Catálogos</h1>
        <p className='text-muted-foreground'>
          Administra los catálogos disponibles en tu aplicación
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {options.map((option) => {
          const Icon = CARD_ICON_MAP[option.name] || Tag

          return (
            <Link
              key={option.name}
              href={ROUTES.INVENTORY.OPTIONS.LIST.PATH.replace(':name', option.name)}
            >
              <Card className='hover:bg-accent/50 cursor-pointer transition-colors hover:border-primary'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='flex items-center gap-2 text-lg font-medium'>
                    <Icon className='size-5 text-blue-500' />
                    {option.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{option.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
