'use client'

import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowDown, Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FloatingParticles } from '@/components/Animations'
import { Button } from '@/components/ui/button'
import { useMouseTracking } from '@/hooks/useMouseTracking'

type YTPlayerEvent = {
  target: any
  data?: number
}

type YTReadyEvent = {
  target: any
}

type Props = {
  videoId?: string
  className?: string
}

const generateParticlePositions = (count: number) => {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
  }))
}

export const Hero: React.FC<Props> = ({ className = '', videoId = 'j5RAiTZ-w6E' }) => {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const particlePositions = useMemo(() => generateParticlePositions(20), [])

  const { mousePosition } = useMouseTracking(containerRef as React.RefObject<HTMLElement>)

  const VIDEO_START = 10
  const VIDEO_END = 48

  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, -300])
  const opacity = useTransform(scrollY, [0, 500], [1, 0])
  const scale = useTransform(scrollY, [0, 500], [1, 1.1])

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

  const initializePlayer = useCallback(() => {
    if (playerRef.current || !document.getElementById('enhanced-youtube-player')) return

    const YT = (window as any).YT
    playerRef.current = new YT.Player('enhanced-youtube-player', {
      events: {
        onReady: (event: YTReadyEvent) => {
          setIsLoaded(true)
          event.target.mute()
        },
        onStateChange: (event: YTPlayerEvent) => {
          if (event.data === YT.PlayerState.PLAYING) {
            setIsPlaying(true)
          } else if (event.data === YT.PlayerState.PAUSED) {
            setIsPlaying(false)
          } else if (event.data === YT.PlayerState.ENDED) {
            event.target.seekTo(VIDEO_START)
            event.target.playVideo()
          }
        },
      },
      height: '100%',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        end: VIDEO_END,
        fs: 0,
        iv_load_policy: 3,
        loop: 0,
        modestbranding: 1,
        mute: 1,
        playsinline: 1,
        rel: 0,
        showinfo: 0,
        start: VIDEO_START,
      },
      videoId,
      width: '100%',
    })
  }, [videoId])

  useEffect(() => {
    const YT = (window as any).YT
    if (!YT) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      document.body.appendChild(script)
      ;(window as any).onYouTubeIframeAPIReady = () => {
        initializePlayer()
      }
    } else {
      initializePlayer()
    }

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [initializePlayer])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
        if (playerRef.current && isLoaded) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            playerRef.current.playVideo()
          } else {
            playerRef.current.pauseVideo()
          }
        }
      },
      { threshold: [0.1, 0.3, 0.7] }
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
  }, [isLoaded])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (playerRef.current && isPlaying) {
      interval = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const current = playerRef.current.getCurrentTime()
          if (current >= VIDEO_END - 1) {
            playerRef.current.seekTo(VIDEO_START)
          }
        }
      }, 500)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying])

  const handlePlayPause = () => {
    if (!playerRef.current) return

    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  const handleMuteToggle = () => {
    if (!playerRef.current) return

    if (isMuted) {
      playerRef.current.unMute()
      setIsMuted(false)
    } else {
      playerRef.current.mute()
      setIsMuted(true)
    }
  }

  const videoPlayerStyles = {
    filter: isInView
      ? 'brightness(0.7) contrast(1.1) saturate(1.1)'
      : 'brightness(0.5) blur(2px) saturate(0.8)',
    pointerEvents: 'none' as const,
  }

  return (
    <motion.section
      ref={containerRef}
      style={{ opacity, y }}
      className={`relative h-screen overflow-hidden bg-black ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <motion.div style={{ scale }} className='absolute inset-0 size-full'>
        <motion.div
          style={{
            x: useTransform(mouseX, [-1, 1], [-20, 20]),
            y: useTransform(mouseY, [-1, 1], [-10, 10]),
          }}
          className='size-full'
        >
          {isTabletOrMobile ? (
            <div
              className='absolute left-1/2 top-1/2 h-full -translate-x-1/2 -translate-y-1/2'
              style={{ aspectRatio: '16 / 9' }}
            >
              <div id='enhanced-youtube-player' className='size-full' style={videoPlayerStyles} />
            </div>
          ) : (
            <div
              id='enhanced-youtube-player'
              className='absolute inset-0 size-full scale-110'
              style={videoPlayerStyles}
            />
          )}
        </motion.div>

        {!isLoaded && (
          <div className='absolute inset-0 flex items-center justify-center bg-black'></div>
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

      <FloatingParticles
        config={{
          color: 'bg-white/30',
          count: 150,
          maxDuration: 8,
          minDuration: 2,
        }}
      />

      <div
        className={`absolute inset-0 flex flex-col ${
          isTabletOrMobile
            ? 'items-center justify-center text-center'
            : 'items-start justify-center'
        } z-10 p-4 sm:p-8 md:p-12 lg:p-16 xl:p-24`}
      >
        <div className={`${isTabletOrMobile ? 'w-full max-w-sm' : 'w-full max-w-5xl'}`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            style={{
              x: useTransform(mouseX, [-1, 1], [-5, 5]),
            }}
            className={`relative mb-4 inline-block sm:mb-6 md:mb-8 ${isTabletOrMobile ? 'mx-auto' : ''}`}
          >
            <div className='absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 blur-xl' />
            <div className='relative rounded-full border border-white/20 bg-black/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-lg sm:px-4 sm:py-2 sm:text-sm md:px-6 md:py-3'>
              <span className='relative z-10'>✨ Descubre el Arte que Transforma</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isTabletOrMobile ? 0 : -100, y: isTabletOrMobile ? 30 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.7, duration: 1, ease: 'easeOut' }}
            style={{
              x: useTransform(mouseX, [-1, 1], isTabletOrMobile ? [0, 0] : [-10, 10]),
            }}
            className={`relative mb-4 sm:mb-6 ${
              isTabletOrMobile ? 'h-32 sm:h-40' : 'h-24 sm:h-32 md:h-40 lg:h-48 xl:h-56 2xl:h-64'
            }`}
          >
            <div
              className='h-full bg-gradient-to-br from-white from-30% via-blue-400 via-60% to-green-400'
              style={{
                WebkitMaskImage: 'url(/assets/logo2.svg)',
                WebkitMaskPosition: 'left center',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskSize: 'contain',
                aspectRatio: 'auto',
                maskImage: 'url(/assets/logo2.svg)',
                maskPosition: 'left center',
                maskRepeat: 'no-repeat',
                maskSize: 'contain',
              }}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: isTabletOrMobile ? 0 : -50, y: isTabletOrMobile ? 30 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            style={{
              x: useTransform(mouseX, [-1, 1], isTabletOrMobile ? [0, 0] : [-5, 5]),
            }}
            className={`${
              isTabletOrMobile
                ? 'text-lg sm:text-xl'
                : 'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl'
            } mb-6 text-white/90 sm:mb-8 md:mb-10 ${
              isTabletOrMobile ? 'max-w-sm' : 'max-w-3xl'
            } font-light leading-relaxed`}
          >
            Una experiencia inmersiva donde cada obra cuenta una historia única.
            <br className='hidden sm:block' />
            <span className='text-orange-400'>Explora. Descubre. Transforma.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            style={{
              x: useTransform(mouseX, [-1, 1], isTabletOrMobile ? [0, 0] : [-3, 3]),
            }}
            className={`flex ${isTabletOrMobile ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 sm:gap-6`}
          >
            <Link href='/store'>
              <Button
                className={`group relative bg-primary text-base text-primary-foreground hover:bg-primary/90 sm:text-lg ${
                  isTabletOrMobile ? 'px-8 py-5' : 'px-6 py-4 sm:px-8 sm:py-5 md:px-10 md:py-6'
                } overflow-hidden rounded-full bg-white font-bold text-black transition-all duration-500`}
              >
                <span className='relative z-10'>Explorar Nuestra Galería</span>
                <div className='absolute inset-0 translate-x-full bg-gradient-to-r from-blue-200 to-purple-300 transition-transform duration-500 group-hover:translate-x-0' />
              </Button>
            </Link>
          </motion.div>
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
          <div className='flex items-center gap-2 sm:gap-3'>
            <div className='relative'>
              <div className='size-2 animate-pulse rounded-full bg-red-500 sm:size-3' />
              <div className='absolute inset-0 size-2 animate-ping rounded-full bg-red-500 sm:size-3' />
            </div>
            <span className='text-xs font-semibold tracking-wider sm:text-sm'>
              EXPERIENCIAS EN VIVO
            </span>
          </div>
          <div className={`text-xs font-medium sm:text-sm ${isTabletOrMobile ? 'flex gap-6' : ''}`}>
            <div>
              <span className='text-lg font-bold text-orange-400 sm:text-xl md:text-2xl'>500+</span>{' '}
              Obras
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={showControls ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className='absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-8 sm:top-6 sm:gap-3 md:right-12 md:top-8 lg:right-16 xl:right-24'
      >
        {[
          { icon: isPlaying ? Pause : Play, ml: !isPlaying, onClick: handlePlayPause },
          { icon: isMuted ? VolumeX : Volume2, onClick: handleMuteToggle },
          { icon: Maximize2, onClick: () => {} },
        ].map((control, index) => (
          <Button
            key={index}
            variant='ghost'
            size='sm'
            onClick={control.onClick}
            className='group relative size-10 overflow-hidden rounded-full border border-white/10 bg-black/20 text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/10 sm:size-12 md:size-14'
          >
            <control.icon
              className={`relative z-10 size-4 sm:size-5 md:size-6 ${control.ml ? 'ml-0.5' : ''}`}
            />
            <div className='absolute inset-0 translate-x-full bg-gradient-to-r from-orange-400/20 to-pink-500/20 transition-transform duration-300 group-hover:translate-x-0' />
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
          <span className='text-[10px] font-bold uppercase tracking-[0.2em] sm:text-xs'>
            Descubre Más
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
            className='rounded-full border border-white/20 bg-black/5 p-1.5 backdrop-blur-sm sm:p-2'
          >
            <ArrowDown className='size-3 sm:size-4' />
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  )
}
