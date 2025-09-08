'use client'

import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const CTA: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3, duration: 0.8 }}
      className='mt-24 text-center'
    >
      <Card className='bg-card/50 border-primary/20 overflow-hidden shadow-elevation-3 backdrop-blur-sm'>
        <CardContent className='relative p-12'>
          {/* Background pattern */}
          <div className='absolute inset-0 opacity-5'>
            <div className='absolute inset-0 bg-gradient-to-br from-primary via-transparent to-primary' />
          </div>

          <div className='relative z-10 space-y-6'>
            <h2 className='text-3xl font-bold text-foreground lg:text-4xl'>
              ¿Necesitas algo más específico?
            </h2>
            <p className='mx-auto max-w-2xl text-xl text-muted-foreground'>
              Desarrollamos soluciones personalizadas para cada proyecto artístico
            </p>
            <div className='flex flex-col justify-center gap-4 sm:flex-row'>
              <Button variant='container-success' asChild>
                <a href='mailto:impulsogaleria@gmail.com'>Consultoría Personalizada</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
