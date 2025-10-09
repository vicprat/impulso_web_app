'use client'

import { motion, useSpring, useTransform } from 'framer-motion'
import { ArrowDown, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useTheme } from 'next-themes'
import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useMouseTracking } from '@/hooks/useMouseTracking'

const FloatingParticles = lazy(() =>
  import('@/components/Animations').then((module) => ({ default: module.FloatingParticles }))
)

interface Props {
  className?: string
}

const generateParticlePositions = (count: number) => {
  return Array.from({ length: count }, () => ({
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
  }))
}

export const Hero: React.FC<Props> = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const { setTheme, theme } = useTheme()
  const userPreferredThemeRef = useRef<string | undefined>(undefined)

  const particlePositions = useMemo(() => generateParticlePositions(10), [])

  const { mousePosition } = useMouseTracking(containerRef as React.RefObject<HTMLElement>)

  const VIDEO_URL =
    'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/impulso.mp4'
  const VIDEO_POSTER =
    'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/impulso.webp'

  const springConfig = { damping: 30, restDelta: 0.001, stiffness: 100 }
  const mouseX = useSpring(mousePosition.x, springConfig)
  const mouseY = useSpring(mousePosition.y, springConfig)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const checkIsTabletOrMobile = () => {
      setIsTabletOrMobile(window.matchMedia('(max-width: 1024px)').matches)
    }

    checkIsTabletOrMobile()
    window.addEventListener('resize', checkIsTabletOrMobile)

    return () => window.removeEventListener('resize', checkIsTabletOrMobile)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleCanPlay = () => {
      setIsLoaded(true)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = () => {
      video.currentTime = 0
      video.play().catch((error) => console.error('Failed to play video:', error))
    }

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
        const video = videoRef.current

        if (video && isLoaded) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            video.play().catch((error) => console.error('Failed to play video:', error))
          } else {
            video.pause()
          }
        }

        if (entry.isIntersecting) {
          if (entry.intersectionRatio > 0.5) {
            if (theme !== 'dark') {
              userPreferredThemeRef.current = theme
              setTheme('dark')
            }
          } else {
            if (userPreferredThemeRef.current && theme !== userPreferredThemeRef.current) {
              setTheme(userPreferredThemeRef.current)
            }
          }
        } else {
          if (userPreferredThemeRef.current && theme !== userPreferredThemeRef.current) {
            setTheme(userPreferredThemeRef.current)
          }
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    )

    const currentRef = containerRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [isLoaded, theme, setTheme])

  const handlePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play().catch((error) => console.error('Failed to play video:', error))
    }
  }

  const handleMuteToggle = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.muted = false
      setIsMuted(false)
    } else {
      video.muted = true
      setIsMuted(true)
    }
  }

  const videoPlayerStyles = {
    filter: isInView
      ? 'brightness(0.7) contrast(1.1) saturate(1.1)'
      : 'brightness(0.5) blur(2px) saturate(0.8)',
    objectFit: 'cover' as const,
    pointerEvents: 'none' as const,
  }

  return (
    <motion.section
      ref={containerRef}
      className={`relative ${isTabletOrMobile ? 'min-h-screen' : 'min-h-[90vh]'} overflow-hidden bg-black`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <motion.div className='absolute inset-0 size-full'>
        <motion.div
          style={{
            x: useTransform(mouseX, [-1, 1], [-20, 20]),
            y: useTransform(mouseY, [-1, 1], [-10, 10]),
          }}
          className='size-full'
        >
          <video
            ref={videoRef}
            className='absolute inset-0 size-full scale-110'
            style={videoPlayerStyles}
            src={VIDEO_URL}
            poster={VIDEO_POSTER}
            loop
            muted
            playsInline
            preload='metadata'
          />
        </motion.div>

        {!isLoaded && (
          <div className='absolute inset-0 flex items-center justify-center bg-black'>
            <div className='size-12 animate-spin rounded-full border-4 border-white/20 border-t-white' />
          </div>
        )}
      </motion.div>

      <div
        className={`absolute inset-0 ${
          isTabletOrMobile
            ? 'bg-gradient-to-b from-black/90 via-black/20 to-black/90'
            : 'bg-gradient-to-br from-black/80 via-transparent to-purple-900/30'
        }`}
      />
      <div
        className={`absolute inset-0 ${
          isTabletOrMobile
            ? 'bg-gradient-to-t from-black/95 via-transparent to-black/60'
            : 'bg-gradient-to-t from-black/90 via-transparent to-transparent'
        }`}
      />
      <div
        className={`absolute inset-0 ${
          isTabletOrMobile
            ? 'bg-gradient-to-r from-black/50 via-transparent to-black/50'
            : 'bg-gradient-to-r from-black/60 via-transparent to-transparent'
        }`}
      />

      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        {isClient &&
          particlePositions.map((particle, i) => (
            <motion.div
              key={i}
              className='absolute size-1 rounded-full bg-white/20'
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                y: [0, -20, 0],
              }}
              transition={{
                delay: particle.delay,
                duration: particle.duration,
                ease: 'easeInOut',
                repeat: Infinity,
              }}
            />
          ))}
      </div>

      <Suspense fallback={null}>
        <FloatingParticles
          config={{
            color: 'bg-white/30',
            count: 50, // Reducir partículas para mejor rendimiento
            maxDuration: 6,
            minDuration: 2,
          }}
        />
      </Suspense>

      <div
        className={`absolute inset-0 flex flex-col ${
          isTabletOrMobile
            ? 'items-center justify-center text-center'
            : 'items-start justify-center'
        } z-10 p-4 sm:p-8 md:p-12 lg:p-16 xl:p-24`}
      >
        <div className={`${isTabletOrMobile ? 'w-full max-w-sm' : 'w-full max-w-6xl'}`}>
          <motion.h1
            initial={{ opacity: 0, x: isTabletOrMobile ? 0 : -50, y: isTabletOrMobile ? 30 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            style={{
              x: useTransform(mouseX, [-1, 1], isTabletOrMobile ? [0, 0] : [-5, 5]),
            }}
            className={`${
              isTabletOrMobile
                ? 'text-2xl sm:text-3xl'
                : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl'
            } mb-6 font-bold leading-tight tracking-wide text-white sm:mb-8 md:mb-10 ${isTabletOrMobile ? 'max-w-sm' : 'max-w-4xl'} 
    bg-gradient-to-r from-white via-white/95 to-white/90 bg-clip-text text-transparent
    shadow-black/50 drop-shadow-lg`}
          >
            Bienvenido a Impulso Galería
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: isTabletOrMobile ? 0 : -30, y: isTabletOrMobile ? 20 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            style={{
              x: useTransform(mouseX, [-1, 1], isTabletOrMobile ? [0, 0] : [-3, 3]),
            }}
            className={`${
              isTabletOrMobile ? 'text-base sm:text-lg' : 'text-lg sm:text-xl md:text-xl'
            } mb-8 text-white/80 sm:mb-12 ${
              isTabletOrMobile ? 'max-w-sm' : 'max-w-2xl'
            } font-medium italic tracking-wide`}
          >
            Impulso Galería tiene como objetivo crear un espacio que fomente el arte como plataforma
            cultural; impulsando el desarrollo de artistas emergentes, y de artistas consolidados,
            para así brindar calidad a nuestros clientes.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className={`absolute ${
            isTabletOrMobile
              ? 'bottom-20 left-1/2 -translate-x-1/2 flex-col items-center gap-3'
              : 'bottom-6 left-4 flex-col items-start gap-4 sm:bottom-8 sm:left-8 sm:flex-row sm:items-center sm:gap-6 md:bottom-12 md:left-12 md:gap-8 lg:left-16 xl:left-24'
          } flex text-white/80`}
        >
          <div className='flex-col items-center gap-2 sm:gap-3'>
            <div
              className={`text-xs font-medium sm:text-sm ${isTabletOrMobile ? 'flex gap-6' : ''}`}
            >
              <div>
                <span className='text-lg font-bold text-green-400 sm:text-xl md:text-2xl'>
                  500+
                </span>{' '}
                Obras
              </div>
            </div>

            <div className='mb-4 flex items-center gap-2 sm:gap-3'>
              <div className='relative'>
                <div className='size-2 animate-pulse rounded-full bg-red-500 sm:size-3' />
                <div className='absolute inset-0 size-2 animate-ping rounded-full bg-red-500 sm:size-3' />
              </div>
              <span className='text-xs font-semibold tracking-wider sm:text-sm'>
                EXPERIENCIAS EN VIVO
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={showControls ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className='absolute right-4 top-24 z-20 flex items-center gap-2 sm:right-8 sm:top-28 sm:gap-3 md:right-12 md:top-32 lg:right-16 xl:right-24'
      >
        {[
          {
            icon: isPlaying ? Pause : Play,
            ml: !isPlaying,
            onClick: handlePlayPause,
          },
          {
            icon: isMuted ? VolumeX : Volume2,
            onClick: handleMuteToggle,
          },
        ].map((control, index) => (
          <Button
            key={index}
            variant='ghost'
            size='sm'
            onClick={control.onClick}
            className='size-10 rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-xl hover:bg-white/20 sm:size-12 md:size-14'
          >
            <control.icon className={`size-4 sm:size-5 md:size-6 ${control.ml ? 'ml-0.5' : ''}`} />
          </Button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        className={`absolute ${
          isTabletOrMobile
            ? 'bottom-4 left-1/2 -translate-x-1/2'
            : 'bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6 md:bottom-8'
        } z-10 text-white/60`}
      >
        <div className='flex flex-col items-center gap-2 sm:gap-3'>
          <span className='text-[10px] font-light uppercase tracking-[0.2em] sm:text-xs'>
            Descubre más
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
            className='rounded-full border border-white/20 bg-white/5 p-1.5 backdrop-blur-sm sm:p-2'
          >
            <ArrowDown className='size-3 sm:size-4' />
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  )
}
