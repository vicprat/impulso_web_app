/* eslint-disable @next/next/no-img-element */
'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, BookOpen, DollarSign, Eye, Frame, Image, MousePointer, Printer, Sparkles, TrendingUp } from 'lucide-react'
import Script from 'next/script'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GradientBackground } from '@/src/components/Animations'

interface Service {
  id: string
  title: string
  description: string
  imageUrl: string
  icon: React.ComponentType<{ className?: string }>
  features: string[]
  price?: string
  popular?: boolean
  size?: 'normal' | 'large'
}

const services: Service[] = [
  {
    description: 'Desarrollamos artistas a través de la venta de obra original y gráfica (fotografía, serigrafía, grabado) de talentos mexicanos consagrados, emergentes y nuevos.',
    features: [ 'Obra original certificada', 'Gráfica limitada', 'Artistas emergentes', 'Asesoría personalizada' ],
    icon: DollarSign,
    id: '1',
    imageUrl: 'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/expo-colectiva.jpg',
    popular: true,
    price: 'Desde $500',
    size: 'large',
    title: 'Venta de Obra Original'
  },
  {
    description: 'Mantenemos altos estándares de calidad para la conservación de obras de arte, recuerdos, fotografías y objetos valiosos.',
    features: [ 'Marcos premium', 'Cristales UV', 'Conservación museística', 'Garantía de por vida' ],
    icon: Frame,
    id: '2',
    imageUrl: 'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/IMG_3321-scaled.webp',
    price: 'Cotización',
    title: 'Enmarcado Profesional'
  },
  {
    description: 'Equipos de alta calidad para reproducciones de arte y variedad de papeles para satisfacer todas las necesidades.',
    features: [ 'Impresión Giclée', 'Papeles de museo', 'Ediciones limitadas', 'Control de color' ],
    icon: Printer,
    id: '3',
    imageUrl: 'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/IMG_9333.jpeg',
    price: 'Cotización',
    title: 'Estudio de Impresión'
  },
  {
    description: 'El arte como inversión mantiene su valor y se comporta de manera diferente a otros activos financieros.',
    features: [ 'Asesoría especializada', 'Valuación profesional', 'Portfolio diversificado', 'ROI documentado' ],
    icon: TrendingUp,
    id: '4',
    imageUrl: 'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/Mira-de-frente-a-tus-suenos-y-ellos-te-observaran-desde-la-gloria-dnomada-arte-huesos-tigre-art-gold-color-dorado-tiger-vida-corazon-de-tigre-una-obra-que-se-inspira-en-la-inmortalidad-del-s.jpg',
    popular: true,
    price: 'Consultoría',
    size: 'large',
    title: 'Inversión en Arte'
  },
  {
    description: 'Facilita el colgado de cuadros con una gama completa de sistemas de colgaje profesionales.',
    features: [ 'Sistemas modulares', 'Hardware premium', 'Instalación incluida', 'Soporte técnico' ],
    icon: Image,
    id: '5',
    imageUrl: 'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/unnamed%20(1).png',
    price: 'Cotización',
    title: 'Sistema de Colgajes'
  },
  {
    description: 'Impresión especializada de revistas, folletos, catálogos y libros de arte en grandes cantidades.',
    features: [ 'Diseño editorial', 'Acabados premium', 'Tirajes grandes', 'Distribución' ],
    icon: BookOpen,
    id: '6',
    imageUrl: 'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/WhatsApp-Image-2024-03-11-at-6.06.29-PM.jpeg',
    price: 'Cotización',
    title: 'Catálogos y Libros de Arte'
  }
]


const ServiceCard = ({ index, service }: { service: Service; index: number }) => {
  const IconComponent = service.icon
  const isLarge = service.size === 'large'

  return (
    <motion.a
      initial="initial"
      whileInView="animate"
      viewport={{ amount: 0.3, once: true }}
      transition={{ delay: index * 0.1 }}
      className={`group relative ${isLarge ? 'md:col-span-2 lg:col-span-1' : ''} pointer-events-auto`}
      href='mailto:impulsogaleria@gmail.com'
    >
      <Card className="bg-card/80 h-full overflow-hidden border-0 shadow-elevation-2 backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 hover:rotate-1 hover:shadow-elevation-5">
        {/* Gradient overlay sutil */}
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />

        {/* Badge popular */}
        {service.popular && (
          <motion.div
            className="absolute right-4 top-4 z-20"
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.5, stiffness: 300, type: "spring" }}
          >
            <div className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-on-primary shadow-elevation-3">
              <Sparkles className="size-3" />
              Popular
            </div>
          </motion.div>
        )}

        {/* Hero Image/Icon Section - Altura fija */}
        <div className="relative h-48 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={service.imageUrl}
              alt={service.title}
              className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
            {/* Overlay para mejorar contraste */}
            <div className="absolute inset-0 bg-black/40 transition-opacity duration-500 group-hover:bg-black/30" />
          </div>

          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br to-transparent opacity-60"
            animate={{
              backgroundPosition: [ '0% 50%', '100% 50%', '0% 50%' ],
            }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
          />

          {/* Floating icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            variants={{
              animate: {
                transition: {
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity
                },
                y: [ -10, 10, -10 ]
              }
            }}
            animate="animate"
          >
            <motion.div
              className="relative"
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 scale-150 rounded-full bg-white/20 blur-xl" />
              <div className="relative flex size-20 items-center justify-center rounded-2xl border border-white/30 bg-white/90 text-primary shadow-elevation-3 backdrop-blur-sm">
                <IconComponent className="size-10" />
              </div>
            </motion.div>
          </motion.div>

          {/* Particle effects */}
          <div className="absolute inset-0">
            {[ ...Array(6) ].map((_, i) => (
              <motion.div
                key={i}
                className="absolute size-1 rounded-full bg-white/60"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`,
                }}
                animate={{
                  opacity: [ 0, 1, 0 ],
                  y: [ -20, 20, -20 ],
                }}
                transition={{
                  delay: i * 0.3,
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        </div>

        {/* Contenido con flexbox para alineación */}
        <CardContent className="relative z-10 flex h-[calc(100%-12rem)] flex-col p-6">
          {/* Header - Altura fija */}
          <div className="mb-4">
            <div className="mb-2 flex min-h-12 items-start justify-between">
              <h3 className="text-xl font-bold leading-tight text-foreground">
                {service.title}
              </h3>
              {service.price && (
                <motion.div
                  className="rounded-md bg-success-container px-2 py-1 text-sm font-semibold text-success"
                  whileHover={{ scale: 1.05 }}
                >
                  {service.price}
                </motion.div>
              )}
            </div>
            {/* Descripción con altura mínima */}
            <div className="min-h-16">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            </div>
          </div>

          {/* Features - Área que crece */}
          <div className="mb-6 flex-1 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-foreground">
              Incluye:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {service.features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center gap-2 text-xs"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + idx * 0.05 }}
                >
                  <div className="size-1.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA - Siempre al final */}
          <motion.div
            className="mt-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant='container-success'
              className='w-full'
            >
              <span>Solicitar Información</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>

          {/* Hover reveal */}
          <motion.div
            className="bg-primary/5 pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        </CardContent>
      </Card>
    </motion.a>
  )
}

export default function ServicesPage() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [ 0, 300 ], [ 0, -50 ])
  const y2 = useTransform(scrollY, [ 0, 300 ], [ 0, -100 ])
  const opacity = useTransform(scrollY, [ 0, 200 ], [ 1, 0.3 ])

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "areaServed": "México",
    "description": "Servicios especializados en arte contemporáneo: venta de obra original, enmarcado, impresión digital, inversión en arte, sistemas de colgaje y fabricación de catálogos.",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "itemListElement": services.map((service) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "description": service.description,
          "name": service.title
        }
      })),
      "name": "Servicios de Arte"
    },
    "name": "Servicios de Arte - Impulso Galería",
    "provider": {
      "@type": "Organization",
      "name": "Impulso Galería",
      "url": "https://impulsogaleria.com"
    },
    "serviceType": "Servicios de Arte"
  }

  return (
    <>
      <Script
        id="services-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className='min-h-screen bg-surface'>
        {/* Hero Section */}
        <GradientBackground className="relative overflow-hidden py-24 lg:py-32">
          {/* Animated background elements */}
          <motion.div
            className="bg-primary/10 absolute left-10 top-20 size-32 rounded-full blur-3xl"
            style={{ y: y1 }}
          />
          <motion.div
            className="bg-primary/5 absolute bottom-20 right-10 size-48 rounded-full blur-3xl"
            style={{ y: y2 }}
          />

          <div className='container mx-auto px-6'>
            <motion.header
              initial={{ opacity: 0, scale: 0.9, y: 60 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className='relative z-10 text-center'
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mb-6"
              >
                <div className="bg-card/80 mb-8 inline-flex items-center gap-3 rounded-full px-6 py-3 shadow-elevation-2 backdrop-blur-sm">
                  <Eye className="size-5 text-primary" />
                  <span className="text-sm font-medium text-white">Servicios Especializados</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className='mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl xl:text-8xl'
                style={{ opacity }}
              >
                Servicios que
                <motion.span
                  className="block bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: [ '0% 50%', '100% 50%', '0% 50%' ],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  Transforman Ideas
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className='mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-white lg:text-2xl'
              >
                Desde la venta de obra original hasta servicios técnicos de vanguardia,
                creamos experiencias artísticas que trascienden lo convencional
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex items-center justify-center gap-2 text-sm text-white"
              >
                <MousePointer className="size-4" />
                <span>Interactúa con las tarjetas para descubrir más</span>
              </motion.div>
            </motion.header>
          </div>
        </GradientBackground>

        {/* Services Grid */}
        <section className="py-16 lg:py-24" aria-label="Servicios disponibles">
          <div className='container mx-auto px-6'>
            {/* Grid asimétrico */}
            <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12'>
              {services.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-24 text-center"
            >
              <Card className="bg-card/50 border-primary/20 overflow-hidden shadow-elevation-3 backdrop-blur-sm">
                <CardContent className="relative p-12">
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-transparent to-primary" />
                  </div>

                  <div className="relative z-10 space-y-6">
                    <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
                      ¿Necesitas algo más específico?
                    </h2>
                    <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                      Desarrollamos soluciones personalizadas para cada proyecto artístico
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                      <Button
                        variant='container-success'
                        asChild
                      >
                        <a href='mailto:impulsogaleria@gmail.com'>
                          Consultoría Personalizada
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}