'use client'

import { ChevronRight, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'

import { PLATFORMS } from '@/src/config/platforms'
import { getPlatformStyles } from '@/src/helpers'

import type { Link as LinkType } from '@/types/user'

interface Props {
  links: LinkType[]
}

const getPlatformData = (platformId: string) => {
  const platform = PLATFORMS.find((p) => p.id === platformId.toLowerCase())
  return (
    platform ?? {
      icon: <LinkIcon className='size-5' />,
      id: 'custom',
      name: platformId,
    }
  )
}

export const List: React.FC<Props> = ({ links }) => {
  return (
    <div className='space-y-3 xl:space-y-4 2xl:space-y-5'>
      {links.map((link) => {
        const platformData = getPlatformData(link.platform)
        const { iconBgClass, iconColorClass, linkClasses } = getPlatformStyles(link.platform)

        return (
          <Link
            key={link.id}
            href={link.url}
            target='_blank'
            rel='noopener noreferrer'
            className={`group flex items-center rounded-2xl p-3 transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface xl:p-4 2xl:p-5 ${linkClasses}`}
          >
            <div
              className={`mr-3 flex items-center justify-center rounded-xl p-2 transition-all duration-300 xl:mr-4 xl:p-3 2xl:mr-5 2xl:p-4 ${iconColorClass} ${iconBgClass}`}
            >
              {platformData.icon}
            </div>

            <span className='flex-1 font-medium text-on-surface transition-colors duration-300 xl:text-lg 2xl:text-xl'>
              {platformData.name}
            </span>

            <ChevronRight className='size-4 text-on-surface-variant transition-all duration-300 group-hover:translate-x-1 group-hover:text-on-surface xl:size-5 2xl:size-6' />
          </Link>
        )
      })}
    </div>
  )
}
