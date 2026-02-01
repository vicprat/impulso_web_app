'use client'

import { motion } from 'framer-motion'
import { Copy, Gift, Sparkles, Star } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useWelcomeCoupon } from '@/hooks/useWelcomeCoupon'
import { ROUTES } from '@/src/config/routes'
import { useAuth } from '@/src/modules/auth/context/useAuth'

export function RegistrationDialog() {
  const [isVisible, setIsVisible] = useState(true)
  const { user } = useAuth()
  const { welcomeCoupon } = useWelcomeCoupon()

  const handleCopyCode = useCallback(() => {
    if (welcomeCoupon?.code) {
      void navigator.clipboard.writeText(welcomeCoupon.code)
      toast.success('Código copiado al portapapeles')
    }
  }, [welcomeCoupon?.code])

  if (!isVisible || user) return null

  const handleClose = () => {
    setIsVisible(false)
  }

  return (
    <Dialog open={isVisible} onOpenChange={handleClose}>
      <DialogContent className='max-w-lg border-0 bg-transparent p-0 shadow-none'>
        <div className=' border-border/50 relative overflow-hidden rounded-3xl border bg-background shadow-2xl backdrop-blur-xl'>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className='relative'
          >
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className='relative h-40 w-full overflow-hidden rounded-t-3xl'
            >
              <img
                src='https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/CrutityStudio-3378.webp'
                alt='Registro'
                className='size-full object-cover'
              />
              <div className='absolute inset-0' />
            </motion.div>

            <div className='p-8'>
              <DialogHeader className='mb-8 text-center'>
                <DialogTitle className='mb-3 text-3xl font-bold'>
                  ¡Únete a nuestra comunidad!
                </DialogTitle>

                <DialogDescription className='text-lg leading-relaxed text-muted-foreground'>
                  Regístrate para acceder a contenido exclusivo, ofertas especiales y una
                  experiencia personalizada
                </DialogDescription>
              </DialogHeader>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className='space-y-4'
              >
                <div className='space-y-3'>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                    className='flex items-center gap-3 text-sm text-muted-foreground'
                  >
                    <div className='bg-primary/10 flex size-8 items-center justify-center rounded-full'>
                      <Star className='size-4 text-primary' />
                    </div>
                    <span>Acceso a productos exclusivos</span>
                  </motion.div>

                  {welcomeCoupon && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8, duration: 0.4 }}
                      className='flex items-center justify-between text-sm text-muted-foreground'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='bg-primary/10 flex size-8 items-center justify-center rounded-full'>
                          <Gift className='size-4 text-primary' />
                        </div>
                        <span>
                          {welcomeCoupon.value}% de descuento en tu primera compra con el código:{' '}
                          <span className='font-bold text-foreground'>{welcomeCoupon.code}</span>
                        </span>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={handleCopyCode}
                        className='hover:bg-muted/50 size-8 p-0'
                      >
                        <Copy className='size-4' />
                      </Button>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                    className='flex items-center gap-3 text-sm text-muted-foreground'
                  >
                    <div className='bg-primary/10 flex size-8 items-center justify-center rounded-full'>
                      <Sparkles className='size-4 text-primary' />
                    </div>
                    <span>Experiencia de compra personalizada</span>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.4 }}
                  className='flex gap-3 pt-6'
                >
                  <Button
                    asChild
                    className='flex-1 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl'
                    onClick={handleClose}
                  >
                    <Link href={ROUTES.AUTH.LOGIN.PATH}>Registrarse ahora</Link>
                  </Button>

                  <Button
                    variant='outline'
                    onClick={handleClose}
                    className='hover:bg-muted/50 px-8 transition-all duration-300'
                  >
                    Más tarde
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
