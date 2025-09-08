'use client'

import { motion } from 'framer-motion'
import { Headphones, Settings, Shield, Star } from 'lucide-react'

import { slideUp } from '@/src/helpers/animations'

interface Feature {
  id: string
  title: string
  description: string
  iconName: string
}

interface Props {
  feature: Feature
  index: number
}

const iconMap = {
  Headphones,
  Settings,
  Shield,
  Star,
} as const

export const Feature: React.FC<Props> = ({ feature, index }) => {
  const IconComponent = iconMap[feature.iconName as keyof typeof iconMap]

  return (
    <motion.div
      variants={slideUp}
      initial='initial'
      whileInView='animate'
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className='mt-8 text-center'
    >
      <div className='mx-auto mb-4 flex size-20 items-center justify-center rounded-full border-2 border-amber-400 bg-white/10'>
        <IconComponent className='size-10 text-amber-400' />
      </div>
      <h3 className='mb-2 text-lg font-semibold'>{feature.title}</h3>
      <p className='text-sm'>{feature.description}</p>
    </motion.div>
  )
}
