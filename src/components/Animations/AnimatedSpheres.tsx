'use client'

import { useState, useEffect } from 'react'

export interface SphereConfig {
  id: string
  size: string
  gradient: string
  blur: string
  opacity: string
  initialPosition: { x: number; y: number }
  animationDuration: number
  maxDistance?: number
  transitionCurve?: string
  pulseAnimation?: boolean
  pulseDelay?: string
  pulseDuration?: string
}

interface Props {
  spheres?: SphereConfig[]
  mousePosition?: { x: number; y: number }
  enableMouseTracking?: boolean
  className?: string
}

const defaultSpheres: SphereConfig[] = [
  {
    animationDuration: 8000,
    blur: 'blur-3xl',
    gradient:
      'bg-gradient-to-br from-violet-300/60 to-purple-200/30 dark:from-violet-600/25 dark:to-purple-700/15',
    id: 'store-sphere-1',
    initialPosition: { x: 25, y: 35 },
    maxDistance: 20,
    opacity: '',
    pulseAnimation: true,
    pulseDuration: '3s',
    size: 'w-96 h-96',
    transitionCurve: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  {
    animationDuration: 10000,
    blur: 'blur-3xl',
    gradient:
      'bg-gradient-to-bl from-rose-300/55 to-pink-200/35 dark:from-rose-600/20 dark:to-pink-700/12',
    id: 'store-sphere-2',
    initialPosition: { x: 75, y: 25 },
    maxDistance: 25,
    opacity: '',
    pulseAnimation: true,
    pulseDelay: '1s',
    pulseDuration: '4s',
    size: 'w-80 h-80',
    transitionCurve: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  },
  {
    animationDuration: 12000,
    blur: 'blur-2xl',
    gradient:
      'bg-gradient-to-tr from-emerald-300/50 to-teal-200/30 dark:from-emerald-600/18 dark:to-teal-700/10',
    id: 'store-sphere-3',
    initialPosition: { x: 20, y: 80 },
    maxDistance: 30,
    opacity: '',
    pulseAnimation: true,
    pulseDelay: '2s',
    pulseDuration: '5s',
    size: 'w-72 h-72',
    transitionCurve: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  // {
  //   id: 'store-sphere-4',
  //   size: 'w-64 h-64',
  //   gradient: 'bg-gradient-to-tl from-indigo-300/45 to-blue-200/35 dark:from-indigo-600/22 dark:to-blue-700/15',
  //   blur: 'blur-2xl',
  //   opacity: '',
  //   initialPosition: { x: 70, y: 85 },
  //   animationDuration: 9000,
  //   maxDistance: 15,
  //   transitionCurve: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  //   pulseAnimation: true,
  //   pulseDuration: '3.5s',
  //   pulseDelay: '0.5s'
  // },
  {
    animationDuration: 11000,
    blur: 'blur-xl',
    gradient:
      'bg-gradient-to-br from-cyan-300/40 to-sky-200/25 dark:from-cyan-600/16 dark:to-sky-700/8',
    id: 'store-sphere-5',
    initialPosition: { x: 45, y: 15 },
    maxDistance: 35,
    opacity: '',
    pulseAnimation: true,
    pulseDelay: '3s',
    pulseDuration: '6s',
    size: 'w-48 h-48',
    transitionCurve: 'cubic-bezier(0.23, 1, 0.320, 1)',
  },
]
export const AnimatedSpheres: React.FC<Props> = ({
  className = '',
  enableMouseTracking = true,
  mousePosition = { x: 0, y: 0 },
  spheres = defaultSpheres,
}) => {
  const [spherePositions, setSpherePositions] = useState<Record<string, { x: number; y: number }>>(
    () => {
      const initialPositions: Record<string, { x: number; y: number }> = {}
      spheres.forEach((sphere) => {
        initialPositions[sphere.id] = sphere.initialPosition
      })
      return initialPositions
    }
  )

  const getRandomPosition = (currentPos: { x: number; y: number }, maxDistance = 25) => {
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * maxDistance

    let newX = currentPos.x + Math.cos(angle) * distance
    let newY = currentPos.y + Math.sin(angle) * distance

    newX = Math.max(-20, Math.min(120, newX))
    newY = Math.max(-20, Math.min(120, newY))

    return { x: newX, y: newY }
  }

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = []

    spheres.forEach((sphere) => {
      const interval = setInterval(() => {
        setSpherePositions((prev) => ({
          ...prev,
          [sphere.id]: getRandomPosition(prev[sphere.id], sphere.maxDistance),
        }))
      }, sphere.animationDuration)

      intervals.push(interval)
    })

    return () => {
      intervals.forEach((interval) => clearInterval(interval))
    }
  }, [spheres])

  const calculateMouseOffset = (sphereIndex: number) => {
    if (!enableMouseTracking) return { x: 0, y: 0 }

    const multiplier = sphereIndex % 2 === 0 ? 1 : -1
    const strength = 4 + sphereIndex * 2

    return {
      x: mousePosition.x * strength * multiplier,
      y: mousePosition.y * strength * (multiplier * -1),
    }
  }

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {spheres.map((sphere, index) => {
        const position = spherePositions[sphere.id] || sphere.initialPosition
        const mouseOffset = calculateMouseOffset(index)

        return (
          <div
            key={sphere.id}
            className={`absolute ${sphere.size} ${sphere.gradient} ${sphere.blur} ${sphere.opacity} ${
              sphere.pulseAnimation ? 'animate-pulse' : ''
            }`}
            style={{
              animationDelay: sphere.pulseDelay,
              animationDuration: sphere.pulseDuration,
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: `translate(-50%, -50%) translate(${mouseOffset.x}px, ${mouseOffset.y}px)`,
              transition: `all ${sphere.animationDuration}ms ${sphere.transitionCurve || 'ease-in-out'}`,
            }}
          />
        )
      })}
    </div>
  )
}
