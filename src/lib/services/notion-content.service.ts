import type {
  Benefit,
  CarouselSlide,
  Feature,
  Locale,
  Service,
  TermsSection,
} from '@/types/notion-content.types'

import { getChildDatabases, getFileUrl, getRichTextPlain, PAGES, queryDatabase } from '@/lib/notion'

export async function getCarouselSlides(locale: Locale = 'es'): Promise<CarouselSlide[]> {
  try {
    const databases = await getChildDatabases(PAGES.HOME)
    const slidesDb = databases.find(
      (db: any) =>
        db.child_database.title.toLowerCase().includes('carousel') ||
        db.child_database.title.toLowerCase().includes('slide')
    )

    if (!slidesDb) {
      console.warn('Carousel Slides database not found')
      return []
    }

    const results = await queryDatabase(slidesDb.id)

    return results.map((page: any) => ({
      actionText: {
        en: getRichTextPlain(
          page.properties['Action Text EN']?.rich_text ||
            page.properties['Action Text']?.rich_text ||
            []
        ),
        es: getRichTextPlain(
          page.properties['Action Text ES']?.rich_text ||
            page.properties['Action Text']?.rich_text ||
            []
        ),
      },
      actionUrl: getRichTextPlain(page.properties['Action URL']?.rich_text || []),
      id: page.id,
      imageUrl: getFileUrl(page.properties['Image URL']),
      order: page.properties.Order?.number || 0,
      subtitle: {
        en: getRichTextPlain(
          page.properties['Subtitle EN']?.rich_text || page.properties.Subtitle?.rich_text || []
        ),
        es: getRichTextPlain(
          page.properties['Subtitle ES']?.rich_text || page.properties.Subtitle?.rich_text || []
        ),
      },
      title: {
        en: getRichTextPlain(
          page.properties['Title EN']?.rich_text || page.properties.Title?.title || []
        ),
        es: getRichTextPlain(
          page.properties['Title ES']?.rich_text || page.properties.Title?.title || []
        ),
      },
    }))
  } catch (error) {
    console.error('Error fetching carousel slides:', error)
    return []
  }
}

export async function getServices(full = false): Promise<Service[]> {
  try {
    const pageId = PAGES.SERVICES
    const databases = await getChildDatabases(pageId)
    const servicesDb = databases.find((db: any) =>
      db.child_database.title.toLowerCase().includes('service')
    )

    if (!servicesDb) {
      console.warn('Services database not found')
      return []
    }

    const results = await queryDatabase(servicesDb.id)

    return results.map((page: any) => ({
      description: {
        en: getRichTextPlain(
          page.properties['Description EN']?.rich_text ||
            page.properties.Description?.rich_text ||
            []
        ),
        es: getRichTextPlain(
          page.properties['Description ES']?.rich_text ||
            page.properties.Description?.rich_text ||
            []
        ),
      },
      features: page.properties.Features?.multi_select?.map((f: any) => f.name) || [],
      iconName: page.properties['Icon Name']?.select?.name || '',
      id: page.id,
      imageUrl: getFileUrl(page.properties['Image URL']),
      order: page.properties.Order?.number || 0,
      popular: page.properties.Popular?.checkbox || false,
      price: full
        ? {
            en: getRichTextPlain(
              page.properties['Price EN']?.rich_text || page.properties.Price?.rich_text || []
            ),
            es: getRichTextPlain(
              page.properties['Price ES']?.rich_text || page.properties.Price?.rich_text || []
            ),
          }
        : undefined,
      size: (page.properties.Size?.select?.name as 'normal' | 'large') || 'normal',
      title: {
        en: getRichTextPlain(
          page.properties['Title EN']?.rich_text || page.properties.Title?.title || []
        ),
        es: getRichTextPlain(
          page.properties['Title ES']?.rich_text || page.properties.Title?.title || []
        ),
      },
    }))
  } catch (error) {
    console.error('Error fetching services:', error)
    return []
  }
}

export async function getBenefits(page: 'landing' | 'membership' = 'landing'): Promise<Benefit[]> {
  try {
    const pageId = page === 'landing' ? PAGES.HOME : PAGES.MEMBERSHIP
    // Si estamos en membership, podríamos reutilizar la db de home o buscar una nueva
    // Según plan, Benefits database se reutiliza del Home para Membership page?
    // "Note: Benefits database se reutiliza del Home" in plan under Membership Page
    // So default to fetching from HOME page for benefits database logic?

    // Check logic:
    // If page is membership, do we fetch from membership page?
    // The plan says: "Benefits database se reutiliza del Home".
    // So we should fetch from HOME page.

    const databases = await getChildDatabases(PAGES.HOME)
    const benefitsDb = databases.find((db: any) =>
      db.child_database.title.toLowerCase().includes('benefit')
    )

    if (!benefitsDb) {
      console.warn('Benefits database not found')
      return []
    }

    const results = await queryDatabase(benefitsDb.id)

    return results.map((page: any) => ({
      id: page.id,
      order: page.properties.Order?.number || 0,
      text: {
        en: getRichTextPlain(
          page.properties['Text EN']?.rich_text || page.properties.Text?.title || []
        ),
        es: getRichTextPlain(
          page.properties['Text ES']?.rich_text || page.properties.Text?.title || []
        ),
      },
    }))
  } catch (error) {
    console.error('Error fetching benefits:', error)
    return []
  }
}

export async function getFeatures(): Promise<Feature[]> {
  try {
    const databases = await getChildDatabases(PAGES.MEMBERSHIP)
    const featuresDb = databases.find((db: any) =>
      db.child_database.title.toLowerCase().includes('feature')
    )

    if (!featuresDb) {
      console.warn('Features database not found')
      return []
    }

    const results = await queryDatabase(featuresDb.id)

    return results.map((page: any) => ({
      description: {
        en: getRichTextPlain(
          page.properties['Description EN']?.rich_text ||
            page.properties.Description?.rich_text ||
            []
        ),
        es: getRichTextPlain(
          page.properties['Description ES']?.rich_text ||
            page.properties.Description?.rich_text ||
            []
        ),
      },
      iconName: page.properties['Icon Name']?.select?.name || '',
      id: page.id,
      order: page.properties.Order?.number || 0,
      title: {
        en: getRichTextPlain(
          page.properties['Title EN']?.rich_text || page.properties.Title?.title || []
        ),
        es: getRichTextPlain(
          page.properties['Title ES']?.rich_text || page.properties.Title?.title || []
        ),
      },
    }))
  } catch (error) {
    console.error('Error fetching features:', error)
    return []
  }
}

export async function getTermsSections(): Promise<TermsSection[]> {
  try {
    const databases = await getChildDatabases(PAGES.TERMS)
    const termsDb = databases.find((db: any) =>
      db.child_database.title.toLowerCase().includes('section')
    )

    if (!termsDb) {
      console.warn('Terms sections database not found')
      return []
    }

    const results = await queryDatabase(termsDb.id)

    return results.map((page: any) => ({
      content: {
        en: getRichTextPlain(
          page.properties['Content EN']?.rich_text || page.properties.Content?.rich_text || []
        ),
        es: getRichTextPlain(
          page.properties['Content ES']?.rich_text || page.properties.Content?.rich_text || []
        ),
      },
      id: page.id,
      order: page.properties.Order?.number || 0,
      title: {
        en: getRichTextPlain(
          page.properties['Title EN']?.rich_text || page.properties.Title?.title || []
        ),
        es: getRichTextPlain(
          page.properties['Title ES']?.rich_text || page.properties.Title?.title || []
        ),
      },
    }))
  } catch (error) {
    console.error('Error fetching terms sections:', error)
    return []
  }
}

export async function getPageContent(
  page?: string
): Promise<Record<string, { en: string; es: string }>> {
  try {
    const databases = await getChildDatabases(PAGES.HOME)
    const contentDb = databases.find((db: any) =>
      db.child_database.title.toLowerCase().includes('page content')
    )

    if (!contentDb) {
      console.warn('Page Content database not found')
      return {}
    }

    const results = await queryDatabase(contentDb.id)

    const content: Record<string, { en: string; es: string }> = {}

    for (const item of results) {
      const p = item as any
      const key = getRichTextPlain(p.properties.Key?.title ?? [])
      if (!key) continue

      // Filter by page if specified
      if (page) {
        const itemPage = p.properties.Page?.select?.name
        if (itemPage && itemPage !== page) continue
      }

      content[key] = {
        en: getRichTextPlain(
          p.properties['Value EN']?.rich_text ?? p.properties['Value ES']?.rich_text ?? []
        ),
        es: getRichTextPlain(p.properties['Value ES']?.rich_text ?? []),
      }
    }

    return content
  } catch (error) {
    console.error('Error fetching page content:', error)
    return {}
  }
}
