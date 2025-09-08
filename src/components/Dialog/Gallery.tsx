'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface Props {
  images: { url: string; alt: string }[]
  initialIndex?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
}

interface NavigationProps {
  onClick: () => void
  isSelected: boolean
}

const GalleryNavigation: React.FC<NavigationProps> = ({ isSelected, onClick }) => (
  <button
    className={`size-3 rounded-full transition-all duration-300 ${
      isSelected ? 'scale-125 bg-white shadow-lg' : 'bg-white/40 hover:scale-110 hover:bg-white/60'
    }`}
    onClick={onClick}
    aria-label={isSelected ? 'Imagen actual' : 'Ir a imagen'}
    aria-pressed={isSelected}
  />
)

export const Gallery: React.FC<Props> = ({
  images,
  initialIndex = 0,
  onOpenChange,
  open,
  title,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    dragFree: false,
    loop: true,
    skipSnaps: false,
    startIndex: initialIndex,
  })
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (emblaApi && open) {
      emblaApi.scrollTo(initialIndex)
      setSelectedIndex(initialIndex)
    }
  }, [emblaApi, initialIndex, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='fixed inset-0 z-50 h-screen max-h-none w-screen max-w-none translate-x-0 translate-y-0 border-0 bg-black/95 p-0 backdrop-blur-sm'
        onEscapeKeyDown={() => onOpenChange(false)}
      >
        <div className='flex size-full items-center justify-center'>
          <div className='relative size-full'>
            <div className='h-full overflow-hidden' ref={emblaRef}>
              <div className='flex h-full'>
                {images.map((image, index) => (
                  <div key={index} className='h-full min-w-0 flex-[0_0_100%]'>
                    <motion.div
                      className='flex size-full items-center justify-center p-8'
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className='size-full object-contain transition-transform duration-300'
                        style={{
                          filter: 'drop-shadow(0 20px 50px rgba(0, 0, 0, 0.5))',
                        }}
                        loading={index === selectedIndex ? 'eager' : 'lazy'}
                      />
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>

            {images.length > 1 && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className='absolute left-6 top-1/2 -translate-y-1/2'
                >
                  <Button
                    variant='outline'
                    size='lg'
                    onClick={scrollPrev}
                    className='size-12 rounded-full border-2 border-white/30 bg-black/50 p-0 text-white backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-white/50 hover:bg-white/20 active:scale-95'
                  >
                    <ChevronLeft className='size-6' />
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className='absolute right-6 top-1/2 -translate-y-1/2'
                >
                  <Button
                    variant='outline'
                    size='lg'
                    onClick={scrollNext}
                    className='size-12 rounded-full border-2 border-white/30 bg-black/50 p-0 text-white backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-white/50 hover:bg-white/20 active:scale-95'
                  >
                    <ChevronRight className='size-6' />
                  </Button>
                </motion.div>
              </>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className='absolute bottom-8 left-1/2 -translate-x-1/2'
        >
          <div className='flex flex-col items-center gap-6'>
            {/* Título de la imagen actual */}
            <motion.h3
              key={selectedIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='max-w-3xl text-center text-xl font-medium text-white/95 drop-shadow-lg'
            >
              {images[selectedIndex]?.alt}
            </motion.h3>

            {images.length > 1 && (
              <div className='flex items-center gap-6'>
                <div className='flex space-x-3 rounded-full bg-black/50 px-4 py-2 backdrop-blur-md'>
                  {images.map((_, index) => (
                    <GalleryNavigation
                      key={index}
                      onClick={() => scrollTo(index)}
                      isSelected={index === selectedIndex}
                    />
                  ))}
                </div>

                <div className='rounded-full border border-white/30 bg-black/50 px-4 py-2 backdrop-blur-md'>
                  <span className='text-sm font-medium text-white'>
                    {selectedIndex + 1} / {images.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40' />
      </DialogContent>
    </Dialog>
  )
}
