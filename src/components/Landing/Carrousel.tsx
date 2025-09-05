/* eslint-disable @next/next/no-img-element */
'use client'

import { type EmblaOptionsType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useEmblaParallax, useNavigation } from '@/hooks/useEmbla'
import { fadeIn, slideUp } from '@/src/helpers/animations'

import { CarrouselNavigations } from './CarrouselNavigation'

interface Slide {
  imageUrl: string
  alt: string
  title: string
  subtitle: string
  parallaxFactor?: number
  actionUrl: string
  actionText: string
}
interface Props {
  slides: Slide[]
  options?: EmblaOptionsType
}

export const Carousel: React.FC<Props> = ({ options, slides }) => {
  const [ emblaRef, emblaApi ] = useEmblaCarousel(
    {
      ...options,
      align: 'center',
      dragFree: false,
      loop: true,
      skipSnaps: false,
    },
    [ Autoplay({ delay: 8000, stopOnInteraction: true }) ]
  )

  useEmblaParallax(emblaApi)

  const { onDotButtonClick, scrollSnaps, selectedIndex } = useNavigation(emblaApi)

  return (
    <div className='relative h-[60vh] overflow-hidden lg:h-[70vh]'>
      <Card className='bg-card/95 mx-4 h-full overflow-hidden shadow-elevation-3 backdrop-blur-sm'>
        <div className='h-full overflow-hidden' ref={emblaRef}>
          <div className='flex h-full'>
            {slides.map((slide, index) => (
              <div
                key={index}
                className='relative min-w-0 flex-[0_0_100%]'
                data-parallax-factor={slide.parallaxFactor ?? 1}
              >
                <motion.div className='relative size-full overflow-hidden'>
                  <div className='absolute inset-0 h-full w-[120%]'>
                    <img
                      src={slide.imageUrl}
                      alt={slide.alt}
                      className='size-full object-cover'
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </div>

                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent' />

                  <div className='absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center text-white'>
                    <motion.div
                      variants={fadeIn}
                      initial='initial'
                      animate='animate'
                      className='max-w-4xl space-y-6'
                    >
                      <h2 className='text-3xl font-bold leading-tight md:text-5xl lg:text-6xl xl:text-7xl'>
                        {slide.title}
                      </h2>
                      <p className='mx-auto max-w-2xl text-lg leading-relaxed opacity-90 md:text-xl lg:text-2xl'>
                        {slide.subtitle}
                      </p>
                      <motion.div
                        variants={slideUp}
                        initial='initial'
                        animate='animate'
                        transition={{ delay: 0.3 }}
                      >
                        <Button asChild size='lg' variant='container-success'>
                          <Link href={slide.actionUrl}>{slide.actionText}</Link>
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-card/80 absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 space-x-3 rounded-full px-4 py-2 shadow-elevation-2 backdrop-blur-sm'>
          {scrollSnaps.map((_, index) => (
            <CarrouselNavigations
              key={index}
              onClick={() => onDotButtonClick(index)}
              isSelected={index === selectedIndex}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}