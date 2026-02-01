import Link from 'next/link'

import type { Service } from '@/app/(public)/page'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/src/config/routes'

interface Props {
  data: Service[]
}

const ServiceCard = ({ service }: { service: Service; _index: number }) => {
  const IconComponent = service.icon

  return (
    <div className='group h-full'>
      <Card
        className={`border-primary/30 relative h-full overflow-hidden bg-card shadow-elevation-3 transition-all duration-300 hover:-translate-y-2 hover:shadow-elevation-4`}
      >
        <div className='pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent' />

        <CardContent className='relative z-10 flex h-full flex-col p-6'>
          {/* Header con ícono */}
          <div className='mb-4 flex items-start gap-4'>
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-elevation-2 transition-all duration-300 group-hover:scale-110`}
            >
              <IconComponent className='size-7 text-white' />
            </div>
          </div>

          {/* Título */}
          <h3 className='mb-3 text-lg font-semibold leading-tight text-foreground'>
            {service.title}
          </h3>

          {/* Descripción */}
          <p className='mb-4 grow text-sm leading-relaxed text-muted-foreground'>
            {service.description}
          </p>

          {/* Features si existen */}
          {service.features && (
            <div className='mt-auto space-y-2'>
              <div className='flex flex-wrap gap-1'>
                {service.features.slice(0, 3).map((feature, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center rounded-md border bg-surface-container px-2 py-1 text-xs text-on-surface transition-colors`}
                  >
                    {feature}
                  </span>
                ))}
                {service.features.length > 3 && (
                  <span
                    className={`inline-flex items-center rounded-md border bg-surface-container px-2 py-1 text-xs text-on-surface`}
                  >
                    +{service.features.length - 3} más
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export const Services: React.FC<Props> = ({ data }) => {
  return (
    <>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8'>
        {data.map((service, _index) => (
          <div
            key={service.id}
            className='animate-fade-in-up'
            style={{ animationDelay: `${_index * 100}ms` }}
          >
            <ServiceCard service={service} _index={_index} />
          </div>
        ))}
      </div>

      <div className='mt-12 animate-fade-in-up text-center' style={{ animationDelay: '0.6s' }}>
        <div className='mx-auto max-w-2xl space-y-4'>
          <h3 className='text-xl font-semibold text-foreground'>
            ¿Necesitas un servicio personalizado?
          </h3>
          <p className='text-muted-foreground'>
            Contacta con nuestro equipo para desarrollar una solución específica para tus
            necesidades artísticas
          </p>
          <div className='flex flex-col justify-center gap-4 sm:flex-row'>
            <Button
              asChild
              variant='outline'
              size='lg'
              className='border-border hover:bg-surface-container'
            >
              <Link href={ROUTES.STORE.SERVICES.PATH}>Ver Detalles</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
