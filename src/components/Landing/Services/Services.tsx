import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/src/config/routes'

import type { Service } from '@/app/(public)/page'


interface Props {
  data: Service[]
}


const ServiceCard = ({ service }: { service: Service; _index: number }) => {
  const IconComponent = service.icon

  return (
    <div
      className='group h-full'
    >
      <Card className={`h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-elevation-4 ${service.highlighted
        ? 'border-primary/30 relative overflow-hidden bg-card shadow-elevation-3'
        : 'bg-card shadow-elevation-1 hover:shadow-elevation-3'
        }`}>
        {/* Subtle glow effect for highlighted services */}
        {service.highlighted && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent" />
        )}
        <CardContent className='relative z-10 flex h-full flex-col p-6'>
          {/* Header con ícono */}
          <div className='mb-4 flex items-start gap-4'>
            <div className={`flex size-14 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${service.highlighted
              ? 'bg-primary text-on-primary shadow-elevation-2'
              : 'bg-primary-container text-primary shadow-elevation-1'
              }`}>
              <IconComponent className='size-7 text-white' />
            </div>

            {service.highlighted && (
              <div className='bg-primary/90 rounded-full px-3 py-1.5  font-medium  shadow-elevation-1 backdrop-blur-sm'>
                Destacado
              </div>
            )}
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
              <div className='text-xs font-medium text-foreground'>
                Incluye:
              </div>
              <div className='flex flex-wrap gap-1'>
                {service.features.slice(0, 3).map((feature, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center rounded-md border px-2 py-1 text-xs transition-colors ${service.highlighted
                      ? 'border-primary/30 bg-primary/20 font-medium text-primary'
                      : 'bg-surface-container text-on-surface'
                      }`}
                  >
                    {feature}
                  </span>
                ))}
                {service.features.length > 3 && (
                  <span className={`inline-flex items-center rounded-md border px-2 py-1 text-xs ${service.highlighted
                    ? 'border-primary/30 bg-primary/20 font-medium text-primary'
                    : 'bg-surface-container text-on-surface'
                    }`}>
                    +{service.features.length - 3} más
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Hover indicator */}
          <div className='border-border/50 mt-4 border-t pt-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
            <div className='flex items-center gap-2 text-sm font-medium text-primary'>
              <span>Conocer más</span>
              <ArrowRight className='size-4 transition-transform duration-300 group-hover:translate-x-1' />
            </div>
          </div>
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
            Contacta con nuestro equipo para desarrollar una solución específica para tus necesidades artísticas
          </p>
          <div className='flex flex-col justify-center gap-4 sm:flex-row'>
            <Button
              asChild
              variant='outline'
              size='lg'
              className='border-border hover:bg-surface-container'
            >
              <Link href={ROUTES.STORE.SERVICES.PATH}>
                Ver Detalles
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}