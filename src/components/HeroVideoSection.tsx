'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize2, ArrowDown } from 'lucide-react';
import { Button } from './ui/button';
import {
  FloatingParticles,
} from '@/components/Animations';
import { useMouseTracking } from '@/hooks/useMouseTracking';
import Link from 'next/link';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface EnhancedHeroVideoProps {
  videoId?: string;
  className?: string;
}

export const EnhancedHeroVideo: React.FC<EnhancedHeroVideoProps> = ({ 
  videoId = 'j5RAiTZ-w6E', 
  className = '' 
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
  
  const { mousePosition } = useMouseTracking(containerRef);
  
  const VIDEO_START = 10;
  const VIDEO_END = 48;

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);
  
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const mouseX = useSpring(mousePosition.x, springConfig);
  const mouseY = useSpring(mousePosition.y, springConfig);

  useEffect(() => {
    const checkIsTabletOrMobile = () => {
      setIsTabletOrMobile(window.matchMedia('(max-width: 1024px)').matches);
    };
    
    checkIsTabletOrMobile();
    window.addEventListener('resize', checkIsTabletOrMobile);
    
    return () => window.removeEventListener('resize', checkIsTabletOrMobile);
  }, []);

  const initializePlayer = useCallback(() => {
    if (playerRef.current || !document.getElementById('enhanced-youtube-player')) return;

    playerRef.current = new window.YT.Player('enhanced-youtube-player', {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        mute: 1,
        controls: 0,
        showinfo: 0,
        rel: 0,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        start: VIDEO_START,
        end: VIDEO_END,
        loop: 0, 
        iv_load_policy: 3,
        disablekb: 1
      },
      events: {
        onReady: (event) => {
          setIsLoaded(true);
          event.target.mute();
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === window.YT.PlayerState.ENDED) {
            event.target.seekTo(VIDEO_START);
            event.target.playVideo();
          }
        }
      }
    });
  }, [videoId]);

  useEffect(() => {
    if (!window.YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api'; 
      script.async = true;
      document.body.appendChild(script);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [initializePlayer]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (playerRef.current && isLoaded) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            playerRef.current.playVideo();
          } else {
            playerRef.current.pauseVideo();
          }
        }
      },
      { threshold: [0.1, 0.3, 0.7] }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
        if (currentRef) {
            observer.unobserve(currentRef);
        }
    };
  }, [isLoaded]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (playerRef.current && isPlaying) {
      interval = setInterval(() => {
        if(playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
            const current = playerRef.current.getCurrentTime();
            if (current >= VIDEO_END - 1) {
              playerRef.current.seekTo(VIDEO_START);
            }
        }
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleMuteToggle = () => {
    if (!playerRef.current) return;
    
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const videoPlayerStyles = {
    pointerEvents: 'none' as const,
    filter: isInView 
      ? 'brightness(0.7) contrast(1.1) saturate(1.1)' 
      : 'brightness(0.5) blur(2px) saturate(0.8)'
  };

  return (
    <motion.section 
      ref={containerRef}
      style={{ y, opacity }}
      className={`relative h-screen overflow-hidden bg-black ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <motion.div 
        style={{ scale }}
        className="absolute inset-0 w-full h-full"
      >
        <motion.div
          style={{
            x: useTransform(mouseX, [-1, 1], [-20, 20]),
            y: useTransform(mouseY, [-1, 1], [-10, 10]),
          }}
          className="w-full h-full"
        >
          {isTabletOrMobile ? (
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full"
              style={{ aspectRatio: '16 / 9' }}
            >
              <div
                id="enhanced-youtube-player"
                className="w-full h-full" 
                style={videoPlayerStyles}
              />
            </div>
          ) : (
            <div
              id="enhanced-youtube-player"
              className="absolute inset-0 w-full h-full scale-110"
              style={videoPlayerStyles}
            />
          )}
        </motion.div>
        
        {!isLoaded && (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            {/* Loading indicator */}
          </div>
        )}
      </motion.div>

  <div className={`absolute inset-0 ${
        isTabletOrMobile 
          ? 'bg-gradient-to-b from-black/90 via-black/20 to-black/90' 
          : 'bg-gradient-to-br from-black/80 via-transparent to-purple-900/30'
      }`} />
      <div className={`absolute inset-0 ${
        isTabletOrMobile
          ? 'bg-gradient-to-t from-black/95 via-transparent to-black/60'
          : 'bg-gradient-to-t from-black/90 via-transparent to-transparent'
      }`} />
      <div className={`absolute inset-0 ${
        isTabletOrMobile
          ? 'bg-gradient-to-r from-black/50 via-transparent to-black/50'
          : 'bg-gradient-to-r from-black/60 via-transparent to-transparent'
      }`} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
   <FloatingParticles 
            config={{
              count: 150,
              color: 'bg-white/30',
              minDuration: 2,
              maxDuration: 8
            }}
          />

      <div className={`absolute inset-0 flex flex-col ${
        isTabletOrMobile ? 'justify-center items-center text-center' : 'justify-center items-start'
      } p-4 sm:p-8 md:p-12 lg:p-16 xl:p-24 z-10`}>
        <div className={`${isTabletOrMobile ? 'max-w-sm w-full' : 'max-w-5xl w-full'}`}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            style={{
              x: useTransform(mouseX, [-1, 1], [-5, 5]),
            }}
            className={`relative inline-block mb-4 sm:mb-6 md:mb-8 ${isTabletOrMobile ? 'mx-auto' : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full blur-xl" />
            <div className="relative px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 bg-black/10 backdrop-blur-lg rounded-full text-white text-xs sm:text-sm font-medium border border-white/20">
              <span className="relative z-10">✨ Descubre el Arte que Transforma</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isTabletOrMobile ? 0 : -100, y: isTabletOrMobile ? 30 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
            style={{
              x: useTransform(mouseX, [-1, 1], isTabletOrMobile ? [0, 0] : [-10, 10]),
            }}
            className={`relative mb-4 sm:mb-6 ${
              isTabletOrMobile 
                ? 'h-32 sm:h-40' 
                : 'h-24 sm:h-32 md:h-40 lg:h-48 xl:h-56 2xl:h-64'
            }`}
          >
            <div 
              className="h-full bg-gradient-to-br from-white from-30% via-blue-400 via-60% to-green-400"
              style={{
                maskImage: 'url(/assets/logo2.svg)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'left center',
                WebkitMaskImage: 'url(/assets/logo2.svg)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'left center',
                aspectRatio: 'auto'
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
            } text-white/90 mb-6 sm:mb-8 md:mb-10 ${
              isTabletOrMobile ? 'max-w-sm' : 'max-w-3xl'
            } leading-relaxed font-light`}
          >
            Una experiencia inmersiva donde cada obra cuenta una historia única. 
            <br className="hidden sm:block" />
            <span className="text-orange-400">Explora. Descubre. Transforma.</span>
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
              className={`relative group bg-primary text-primary-foreground hover:bg-primary/90 text-base sm:text-lg ${
                isTabletOrMobile ? 'px-8 py-5' : 'px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6'
              } rounded-full font-bold transition-all duration-500 overflow-hidden bg-white text-black`}
            >
              <span className="relative z-10">Explorar Nuestra Galería</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-300 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
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
              ? 'bottom-20 left-1/2 transform -translate-x-1/2 flex-col items-center gap-3' 
              : 'bottom-6 sm:bottom-8 md:bottom-12 left-4 sm:left-8 md:left-12 lg:left-16 xl:left-24 flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 md:gap-8'
          } flex text-white/80`}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-ping" />
            </div>
            <span className="text-xs sm:text-sm font-semibold tracking-wider">EXPERIENCIAS EN VIVO</span>
          </div>
          <div className={`text-xs sm:text-sm font-medium ${isTabletOrMobile ? 'flex gap-6' : ''}`}>
            <div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-orange-400">500+</span> Obras
            </div>
            {/* <div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-pink-400">50+</span> Artistas
            </div> */}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={showControls ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="absolute top-4 sm:top-6 md:top-8 right-4 sm:right-8 md:right-12 lg:right-16 xl:right-24 flex items-center gap-2 sm:gap-3 z-20"
      >
        {[
          { icon: isPlaying ? Pause : Play, onClick: handlePlayPause, ml: !isPlaying },
          { icon: isMuted ? VolumeX : Volume2, onClick: handleMuteToggle },
          { icon: Maximize2, onClick: () => {} }
        ].map((control, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={control.onClick}
            className="relative group w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all duration-300 overflow-hidden"
          >
            <control.icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 relative z-10 ${control.ml ? 'ml-0.5' : ''}`} />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-pink-500/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
          </Button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        className={`absolute ${
          isTabletOrMobile 
            ? 'bottom-4 left-1/2 transform -translate-x-1/2' 
            : 'bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2'
        } text-white/60 z-10`}
      >
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">Descubre Más</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="p-1.5 sm:p-2 rounded-full border border-white/20 bg-black/5 backdrop-blur-sm"
          >
            <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
};