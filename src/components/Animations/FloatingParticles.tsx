'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

interface ParticleConfig {
  count?: number;
  size?: string; 
  color?: string; 
  minDuration?: number;
  maxDuration?: number;
  minDelay?: number;
  maxDelay?: number;
  movement?: {
    x?: [number, number, number];
    y?: [number, number, number];
    opacity?: [number, number, number];
  };
  randomMovement?: boolean; 
}

interface FloatingParticlesProps {
  config?: ParticleConfig;
  className?: string;
}

const defaultConfig: ParticleConfig = {
  count: 20,
  size: 'w-1 h-1',
  color: 'bg-white/20',
  minDuration: 3,
  maxDuration: 8,
  minDelay: 0,
  maxDelay: 3,
  movement: {
    y: [0, -30, 0],
    opacity: [0.2, 0.8, 0.2]
  },
  randomMovement: true
};

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const generateRandomMovement = (seed: number) => {
  const angle = seededRandom(seed * 2) * Math.PI * 2;
  const distance = 20 + seededRandom(seed * 3) * 40; 
  
  return {
    x: [0, Math.cos(angle) * distance, 0],
    y: [0, Math.sin(angle) * distance, 0],
    opacity: [0.2, 0.6 + seededRandom(seed * 4) * 0.4, 0.2]
  };
};

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  config = defaultConfig,
  className = ''
}) => {
  const [isMounted, setIsMounted] = useState(false);

  const {
    count = 20,
    size = 'w-1 h-1',
    color = 'bg-white/20',
    minDuration = 3,
    maxDuration = 8,
    minDelay = 0,
    maxDelay = 3,
    movement = defaultConfig.movement,
    randomMovement = true
  } = config;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const particles = useMemo(() => {
    if (!isMounted) return [];
    
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      movement: randomMovement ? generateRandomMovement(i) : movement,
      duration: minDuration + seededRandom(i * 5) * (maxDuration - minDuration),
      delay: minDelay + seededRandom(i * 6) * (maxDelay - minDelay),
      position: {
        left: seededRandom(i * 7) * 100,
        top: seededRandom(i * 8) * 100
      }
    }));
  }, [isMounted, count, minDuration, maxDuration, minDelay, maxDelay, movement, randomMovement]);

  if (!isMounted) {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} />
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
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
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
            repeatType: "loop"
          }}
        />
      ))}
    </div>
  );
};