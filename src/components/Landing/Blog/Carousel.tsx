'use client'

import AutoScroll from 'embla-carousel-auto-scroll'
import useEmblaCarousel from 'embla-carousel-react'
import React from 'react'

import { BlogCard } from '@/components/Card/Blog'
import { type PaginatedResult, type PostWithRelations } from '@/modules/blog/types'

interface Props {
  posts: PaginatedResult<PostWithRelations>
  title: string
  subtitle?: string
  autoplay?: boolean
  scrollSpeed?: number
  stopOnInteraction?: boolean
}

export const Carousel: React.FC<Props> = ({
  autoplay = true,
  posts,
  scrollSpeed = 1,
  stopOnInteraction = false,
  subtitle,
  title,
}) => {
  const duplicatedPosts = [...posts.items, ...posts.items, ...posts.items]

  const [emblaRef] = useEmblaCarousel(
    {
      align: 'start',
      containScroll: false,
      dragFree: true,
      loop: true,
      skipSnaps: false,
      slidesToScroll: 1,
    },
    autoplay
      ? [
          AutoScroll({
            direction: 'forward',
            playOnInit: true,
            speed: scrollSpeed,
            stopOnFocusIn: false,
            stopOnInteraction,
            stopOnMouseEnter: true,
          }),
        ]
      : []
  )

  if (posts.items.length === 0) {
    return null
  }

  return (
    <div className='overflow-hidden' ref={emblaRef}>
      <div className='flex gap-4 md:gap-6'>
        {duplicatedPosts.map((post, index) => (
          <div key={`${post.id}-${index}`} className='w-64 flex-none sm:w-72 md:w-80'>
            <BlogCard post={post} />
          </div>
        ))}
      </div>
    </div>
  )
}
