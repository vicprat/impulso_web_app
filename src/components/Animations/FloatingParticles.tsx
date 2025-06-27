'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'

interface ParticleConfig {
  count?: number
  size?: string
  color?: string
  minDuration?: number
  maxDuration?: number
  minDelay?: number
  maxDelay?: number
  movement?: {
    x?: [number, number, number]
    y?: [number, number, number]
    opacity?: [number, number, number]
  }
  randomMovement?: boolean
}

interface FloatingParticlesProps {
  config?: ParticleConfig
  className?: string
}

const defaultConfig: ParticleConfig = {
  color: 'bg-white/20',
  count: 20,
  maxDelay: 3,
  maxDuration: 8,
  minDelay: 0,
  minDuration: 3,
  movement: {
    opacity: [0.2, 0.8, 0.2],
    y: [0, -30, 0],
  },
  randomMovement: true,
  size: 'w-1 h-1',
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const generateRandomMovement = (seed: number) => {
  const angle = seededRandom(seed * 2) * Math.PI * 2
  const distance = 20 + seededRandom(seed * 3) * 40

  return {
    opacity: [0.2, 0.6 + seededRandom(seed * 4) * 0.4, 0.2],
    x: [0, Math.cos(angle) * distance, 0],
    y: [0, Math.sin(angle) * distance, 0],
  }
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  className = '',
  config = defaultConfig,
}) => {
  const [isMounted, setIsMounted] = useState(false)

  const {
    color = 'bg-white/20',
    count = 20,
    maxDelay = 3,
    maxDuration = 8,
    minDelay = 0,
    minDuration = 3,
    movement = defaultConfig.movement,
    randomMovement = true,
    size = 'w-1 h-1',
  } = config

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const particles = useMemo(() => {
    if (!isMounted) return []

    return Array.from({ length: count }, (_, i) => ({
      delay: minDelay + seededRandom(i * 6) * (maxDelay - minDelay),
      duration: minDuration + seededRandom(i * 5) * (maxDuration - minDuration),
      id: i,
      movement: randomMovement ? generateRandomMovement(i) : movement,
      position: {
        left: seededRandom(i * 7) * 100,
        top: seededRandom(i * 8) * 100,
      },
    }))
  }, [isMounted, count, minDuration, maxDuration, minDelay, maxDelay, movement, randomMovement])

  if (!isMounted) {
    return <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} />
  }

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute ${size} ${color} rounded-full`}
          style={{
            left: `${particle.position.left}%`,
            top: `${particle.position.top}%`,
          }}
          animate={particle.movement}
          transition={{
            delay: particle.delay,
            duration: particle.duration,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'loop',
          }}
        />
      ))}
    </div>
  )
}
