'use client'

import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, DollarSign, Frame, Image, Printer, Settings, TrendingUp } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/src/config/routes'

interface Service {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  features?: string[]
  highlighted?: boolean
}

const services: Service[] = [
  {
    description: 'Desarrollamos artistas a través de la venta de obra original y gráfica con asesoría especializada.',
    features: [ 'Obra original', 'Gráfica limitada', 'Asesoría de ventas', 'Promoción de artistas' ],
    highlighted: true,
    icon: DollarSign,
    id: '1',
    title: 'Venta de Obra Original'
  },
  {
    description: 'Mantenemos altos estándares de calidad para la conservación profesional de obras de arte.',
    features: [ 'Marcos personalizados', 'Conservación', 'Cristales UV', 'Montaje profesional' ],
    icon: Frame,
    id: '2',
    title: 'Enmarcado Profesional'
  },
  {
    description: 'Equipos de alta calidad para reproducciones de arte con variedad de papeles premium.',
    features: [ 'Impresión Giclée', 'Papeles de arte', 'Ediciones limitadas', 'Control de calidad' ],
    icon: Printer,
    id: '3',
    title: 'Estudio de Impresión'
  },
  {
    description: 'El arte como inversión mantiene su valor y se comporta diferente a otros activos financieros.',
    features: [ 'Asesoría especializada', 'Valuación', 'Portafolio de arte', 'Análisis de mercado' ],
    highlighted: true,
    icon: TrendingUp,
    id: '4',
    title: 'Inversión en Arte'
  },
  {
    description: 'Facilita el colgado de cuadros con una gama completa de sistemas profesionales.',
    features: [ 'Sistemas modulares', 'Hardware profesional', 'Instalación', 'Mantenimiento' ],
    icon: Image,
    id: '5',
    title: 'Sistema de Colgajes'
  },
  {
    description: 'Impresión especializada de revistas, folletos, catálogos y libros de arte de alta calidad.',
    features: [ 'Catálogos de arte', 'Libros especializados', 'Diseño editorial', 'Acabados premium' ],
    icon: BookOpen,
    id: '6',
    title: 'Fabricación de Catálogos'
  }
]

// Animaciones mejoradas
const fadeIn = {
  animate: { opacity: 1, y: 0 },
  initial: { opacity: 0, y: 20 },
  transition: { duration: 0.6, ease: 'easeOut' },
}

const slideUp = {
  animate: { opacity: 1, y: 0 },
  initial: { opacity: 0, y: 40 },
  transition: { duration: 0.8, ease: 'easeOut' },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const scaleIn = {
  animate: { opacity: 1, scale: 1 },
  initial: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.5, ease: 'easeOut' },
}

// Componente de tarjeta de servicio
const ServiceCard = ({ index, service }: { service: Service; index: number }) => {
  const IconComponent = service.icon

  return (
    <motion.div
      variants={fadeIn}
      style={{ transitionDelay: `${index * 0.1}s` }}
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
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs transition-colors ${service.highlighted
                      ? 'bg-primary/15 border-primary/20 border text-primary'
                      : 'bg-surface-container text-on-surface'
                      }`}
                  >
                    {feature}
                  </span>
                ))}
                {service.features.length > 3 && (
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs ${service.highlighted
                    ? 'bg-primary/15 border-primary/20 border text-primary'
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
    </motion.div>
  )
}

// Componente principal
export const ServicesSection: React.FC = () => {
  return (
    <div className='py-16 lg:py-24'>
      <div className='container mx-auto px-6'>
        {/* Header de sección */}
        <motion.div
          variants={fadeIn}
          initial='initial'
          whileInView='animate'
          viewport={{ once: true }}
          className='mb-12'
        >
          <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex items-start gap-4'>
              <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary shadow-elevation-1'>
                <Settings className='size-6 text-white' />
              </div>
              <div>
                <h2 className='text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl'>
                  Nuestros Servicios
                </h2>
                <p className='mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground'>
                  Ofrecemos una gama completa de servicios especializados para el mundo del arte,
                  desde la venta de obra original hasta servicios técnicos de alta calidad
                </p>
              </div>
            </div>

            <motion.div
              variants={slideUp}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
            >
              <Button
                asChild
                size='lg'
                variant='container-success'
              >
                <Link href={ROUTES.STORE.SERVICES.PATH} className='flex items-center gap-2'>
                  Ver Todos los Servicios
                  <ArrowRight className='size-4' />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8'
          variants={staggerContainer}
          initial='initial'
          whileInView='animate'
          viewport={{ once: true }}
        >
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </motion.div>

        {/* Stats o info adicional */}
        {/* <motion.div
          variants={fadeIn}
          initial='initial'
          whileInView='animate'
          viewport={{ amount: 0.3, once: true }}
          className='mt-16'
        >
          <Card className='bg-card/50 border-primary/10 shadow-elevation-2 backdrop-blur-sm'>
            <CardContent className='p-8'>
              <div className='grid grid-cols-1 gap-8 text-center md:grid-cols-3'>
                <motion.div variants={scaleIn} className='space-y-2'>
                  <div className='text-3xl font-bold text-primary'>15+</div>
                  <div className='text-sm text-muted-foreground'>Años de experiencia</div>
                </motion.div>
                <motion.div variants={scaleIn} className='space-y-2'>
                  <div className='text-3xl font-bold text-primary'>500+</div>
                  <div className='text-sm text-muted-foreground'>Proyectos realizados</div>
                </motion.div>
                <motion.div variants={scaleIn} className='space-y-2'>
                  <div className='text-3xl font-bold text-primary'>100+</div>
                  <div className='text-sm text-muted-foreground'>Artistas representados</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div> */}

        {/* CTA final */}
        <motion.div
          variants={slideUp}
          initial='initial'
          whileInView='animate'
          viewport={{ once: true }}
          className='mt-12 text-center'
        >
          <div className='mx-auto max-w-2xl space-y-4'>
            <h3 className='text-xl font-semibold text-foreground'>
              ¿Necesitas un servicio personalizado?
            </h3>
            <p className='text-muted-foreground'>
              Contacta con nuestro equipo para desarrollar una solución específica para tus necesidades artísticas
            </p>
            <div className='flex flex-col justify-center gap-4 sm:flex-row'>
              {/* <Button
                asChild
                size='lg'
                className='hover:bg-primary/90 bg-primary text-on-primary'
              >
                <Link href={ROUTES.CONTACT}>
                  Contactar Ahora
                </Link>
              </Button> */}
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
        </motion.div>
      </div>
    </div>
  )
}