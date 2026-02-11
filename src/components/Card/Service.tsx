'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

import { iconMap } from '@/lib/icon-map'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ServiceType {
  id: string
  title: string
  description: string
  imageUrl: string
  iconName: string
  features: string[]
  price?: string
  popular?: boolean
  size?: 'normal' | 'large'
}

interface Props {
  service: ServiceType
  index: number
}

export const Service: React.FC<Props> = ({ index, service }) => {
  const IconComponent = iconMap[service.iconName as keyof typeof iconMap] || iconMap.Settings
  const isLarge = service.size === 'large'

  return (
    <motion.a
      initial='initial'
      whileInView='animate'
      viewport={{ amount: 0.3, once: true }}
      transition={{ delay: index * 0.1 }}
      className={`group relative ${isLarge ? 'md:col-span-2 lg:col-span-1' : ''} pointer-events-auto`}
      href='mailto:impulsogaleria@gmail.com'
    >
      <Card className='bg-card/80 h-full overflow-hidden border-0 shadow-elevation-2 backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 hover:rotate-1 hover:shadow-elevation-5'>
        <motion.div className='pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

        {service.popular && (
          <motion.div
            className='absolute right-4 top-4 z-20'
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.5, stiffness: 300, type: 'spring' }}
          >
            <div className='flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-on-primary shadow-elevation-3'>
              <Sparkles className='size-3' />
              Popular
            </div>
          </motion.div>
        )}

        <div className='relative h-48 overflow-hidden'>
          <div className='absolute inset-0'>
            <img
              src={service.imageUrl}
              alt={service.title}
              className='size-full object-cover transition-transform duration-700 group-hover:scale-110'
              loading='lazy'
              decoding='async'
              fetchPriority='low'
            />
            <div className='absolute inset-0 bg-black/40 transition-opacity duration-500 group-hover:bg-black/30' />
          </div>

          <motion.div
            className='absolute inset-0 bg-gradient-to-br to-transparent opacity-60'
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
          />

          <motion.div
            className='absolute inset-0 flex items-center justify-center'
            variants={{
              animate: {
                transition: {
                  duration: 2,
                  ease: 'easeInOut',
                  repeat: Infinity,
                },
                y: [-10, 10, -10],
              },
            }}
            animate='animate'
          >
            <motion.div
              className='relative'
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              <div className='absolute inset-0 scale-150 rounded-full bg-white/20 blur-xl' />
              <div className='relative flex size-20 items-center justify-center rounded-2xl border border-white/30 bg-white/90 text-primary shadow-elevation-3 backdrop-blur-sm'>
                <IconComponent className='size-8' />
              </div>
            </motion.div>
          </motion.div>

          <div className='absolute inset-0'>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className='absolute size-1 rounded-full bg-white/60'
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [-20, 20, -20],
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

        <CardContent className='relative z-10 flex h-[calc(100%-12rem)] flex-col p-6'>
          <div className='mb-4'>
            <div className='mb-2 flex min-h-12 items-start justify-between'>
              <h3 className='text-xl font-bold leading-tight text-foreground'>{service.title}</h3>
              {service.price && (
                <motion.div
                  className='rounded-md bg-success-container px-2 py-1 text-sm font-semibold text-success'
                  whileHover={{ scale: 1.05 }}
                >
                  {service.price}
                </motion.div>
              )}
            </div>
            <div className='min-h-16'>
              <p className='text-sm leading-relaxed text-muted-foreground'>{service.description}</p>
            </div>
          </div>

          <div className='mb-6 flex-1 space-y-3'>
            <div className='text-xs font-semibold uppercase tracking-wide text-foreground'>
              Incluye:
            </div>
            <div className='grid grid-cols-2 gap-2'>
              {service.features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  className='flex items-center gap-2 text-xs'
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + idx * 0.05 }}
                >
                  <div className='size-1.5 rounded-full bg-primary' />
                  <span className='text-muted-foreground'>{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div className='mt-auto' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant='container-success' className='w-full'>
              <span>Solicitar Información</span>
              <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
            </Button>
          </motion.div>

          <motion.div className='bg-primary/5 pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100' />
        </CardContent>
      </Card>
    </motion.a>
  )
}
