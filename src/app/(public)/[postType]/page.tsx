import { Suspense } from 'react'

import { generatePostTypeMetadata } from '@/lib/metadata'
import { blogService } from '@/modules/blog/service'

import { Loader } from './components/Loader'
import { PostTypePageClient } from './PostTypePageClient'

import type { PostType } from '@prisma/client'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postType: string }>
}): Promise<Metadata> {
  const { postType } = await params
  return generatePostTypeMetadata(postType)
}

export default async function Page({ params }: { params: Promise<{ postType: string }> }) {
  const { postType } = await params

  const normalizedPostType = postType.toUpperCase() === 'EVENTS' ? 'EVENT' : postType.toUpperCase()

  const posts = await blogService.listPosts({
    page: 1,
    pageSize: 12,
    postType: normalizedPostType as PostType,
  })
  const categories = await blogService.listCategories()
  const tags = await blogService.listTags()

  return (
    <Suspense fallback={<Loader.List />}>
      <PostTypePageClient
        postType={postType}
        initialPosts={posts}
        initialCategories={categories}
        initialTags={tags}
      />
    </Suspense>
  )
}
