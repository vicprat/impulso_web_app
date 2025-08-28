'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { FaTimes, FaWhatsapp } from 'react-icons/fa'

import { CONTACT } from '@/config/constants'

import { Button } from './ui/button'

export const WhatsAppButton = () => {
  const [ showBanner, setShowBanner ] = useState(true)

  const handleWhatsAppClick = () => {
    window.open(CONTACT.WHATSAPP.URL, '_blank')
  }

  const handleCloseBanner = () => {
    setShowBanner(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 100 }}
            transition={{
              damping: 20,
              duration: 0.5,
              stiffness: 200,
              type: "spring"
            }}
            className="absolute bottom-full right-0 mb-4"
          >
            <div className="relative">
              <motion.div
                className="flex w-72 flex-col gap-3 rounded-xl bg-white px-6 py-4 shadow-2xl ring-1 ring-black/5"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className='flex w-full justify-end'>
                  <Button
                    onClick={handleCloseBanner}
                    size="sm"
                    variant="ghost"
                    className="size-6 rounded-full p-0 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Cerrar mensaje"
                  >
                    <FaTimes size={10} />
                  </Button>
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900">
                    ¡Hola! 👋 ¿Necesitas ayuda?
                  </p>
                  <p className="text-sm text-gray-600">
                    Descubre nuestra galeria, eventos y experiencias
                  </p>
                </div>


              </motion.div>

              <div className="absolute left-3/4 top-full -translate-x-1/2">
                <div className="border-8 border-transparent border-t-white drop-shadow-sm"></div>
              </div>
            </div>
          </motion.div >
        )
        }
      </AnimatePresence >

      < div className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20" />

      < motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ damping: 20, stiffness: 300, type: "spring" }}
      >
        <Button
          onClick={handleWhatsAppClick}
          size="icon"
          className="group relative size-14 rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 ease-out hover:bg-[#128C7E] hover:shadow-2xl hover:shadow-[#25D366]/30 focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
          aria-label="Contactar por WhatsApp"
          title="¡Escríbenos por WhatsApp!"
        >
          <motion.div
            animate={{ rotate: [ 0, 5, -5, 0 ] }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            <FaWhatsapp size={28} />
          </motion.div>

          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        </Button>
      </motion.div >
    </div >
  )
}