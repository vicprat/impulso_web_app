import type {
  Benefit,
  CarouselSlide,
  Feature,
  Locale,
  NavigationLink,
  Service,
  SocialLink,
  TermsSection,
} from '@/types/notion-content.types'

import { getChildDatabases, getFileUrl, getRichTextPlain, PAGES, queryDatabase } from '@/lib/notion'

// --- Helper: query a simple Key/Value EN/Value ES table and return content dict ---
async function querySimpleContentTable(
  pageId: string,
  tableName: string
): Promise<Record<string, { en: string; es: string }>> {
  try {
    const databases = await getChildDatabases(pageId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = databases.find((d: any) => d.child_database.title.toLowerCase().includes(tableName))

    if (!db) return {}

    const results = await queryDatabase(db.id)
    const content: Record<string, { en: string; es: string }> = {}

    for (const item of results) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = item as any
      const key = getRichTextPlain(p.properties.Key?.title ?? [])
      if (!key) continue

      content[key] = {
        en: getRichTextPlain(
          p.properties['Value EN']?.rich_text ?? p.properties['Value ES']?.rich_text ?? []
        ),
        es: getRichTextPlain(p.properties['Value ES']?.rich_text ?? []),
      }
    }

    return content
  } catch (error) {
    console.error(`Error fetching ${tableName} content:`, error)
    return {}
  }
}

// --- Existing functions ---

export async function getCarouselSlides(_locale: Locale = 'es'): Promise<CarouselSlide[]> {
  try {
    const databases = await getChildDatabases(PAGES.HOME)
    const slidesDb = databases.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          page.properties['Action Text EN']?.rich_text ??
            page.properties['Action Text']?.rich_text ??
            []
        ),
        es: getRichTextPlain(
          page.properties['Action Text ES']?.rich_text ??
            page.properties['Action Text']?.rich_text ??
            []
        ),
      },
      actionUrl: getRichTextPlain(page.properties['Action URL']?.rich_text ?? []),
      id: page.id,
      imageUrl: getFileUrl(page.properties['Image URL']),
      order: page.properties.Order?.number ?? 0,
      subtitle: {
        en: getRichTextPlain(
          page.properties['Subtitle EN']?.rich_text ?? page.properties.Subtitle?.rich_text ?? []
        ),
        es: getRichTextPlain(
          page.properties['Subtitle ES']?.rich_text ?? page.properties.Subtitle?.rich_text ?? []
        ),
      },
      title: {
        en: getRichTextPlain(
          page.properties['Title EN']?.rich_text ?? page.properties.Title?.title ?? []
        ),
        es: getRichTextPlain(
          page.properties['Title ES']?.rich_text ?? page.properties.Title?.title ?? []
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const servicesDb = databases.find((db: any) =>
      db.child_database.title.toLowerCase().includes('service')
    )

    if (!servicesDb) {
      console.warn('Services database not found')
      return []
    }

    const results = await queryDatabase(servicesDb.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return results.map((page: any) => ({
      description: {
        en: getRichTextPlain(
          page.properties['Description EN']?.rich_text ??
            page.properties.Description?.rich_text ??
            []
        ),
        es: getRichTextPlain(
          page.properties['Description ES']?.rich_text ??
            page.properties.Description?.rich_text ??
            []
        ),
      },
      features: getRichTextPlain(page.properties.Features?.rich_text ?? [])
        .split(',')
        .map((f: string) => f.trim())
        .filter(Boolean),
      iconName: getRichTextPlain(page.properties['Icon Name']?.rich_text ?? []),
      id: page.id,
      imageUrl: getFileUrl(page.properties['Image URL']),
      order: page.properties.Order?.number ?? 0,
      popular: page.properties.Popular?.checkbox ?? false,
      price: full
        ? {
            en: getRichTextPlain(
              page.properties['Price EN']?.rich_text ?? page.properties.Price?.rich_text ?? []
            ),
            es: getRichTextPlain(
              page.properties['Price ES']?.rich_text ?? page.properties.Price?.rich_text ?? []
            ),
          }
        : undefined,
      size:
        (getRichTextPlain(page.properties.Size?.rich_text ?? []) as 'normal' | 'large') || 'normal',
      title: {
        en: getRichTextPlain(
          page.properties['Title EN']?.rich_text ?? page.properties.Title?.title ?? []
        ),
        es: getRichTextPlain(
          page.properties['Title ES']?.rich_text ?? page.properties.Title?.title ?? []
        ),
      },
    }))
  } catch (error) {
    console.error('Error fetching services:', error)
    return []
  }
}

export async function getBenefits(_page: 'landing' | 'membership' = 'landing'): Promise<Benefit[]> {
  try {
    // Benefits database lives under MEMBERSHIP page
    const databases = await getChildDatabases(PAGES.MEMBERSHIP)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const benefitsDb = databases.find((db: any) =>
      db.child_database.title.toLowerCase().includes('benefit')
    )

    if (!benefitsDb) {
      console.warn('Benefits database not found')
      return []
    }

    const results = await queryDatabase(benefitsDb.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return results.map((page: any) => ({
      id: page.id,
      order: page.properties.Order?.number ?? 0,
      text: {
        en: getRichTextPlain(
          page.properties['Text EN']?.rich_text ?? page.properties.Text?.title ?? []
        ),
        es: getRichTextPlain(
          page.properties['Text ES']?.title ??
            page.properties['Text ES']?.rich_text ??
            page.properties.Text?.title ??
            []
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const featuresDb = databases.find((db: any) =>
      db.child_database.title.toLowerCase().includes('feature')
    )

    if (!featuresDb) {
      console.warn('Features database not found')
      return []
    }

    const results = await queryDatabase(featuresDb.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return results.map((page: any) => ({
      description: {
        en: getRichTextPlain(
          page.properties['Description EN']?.rich_text ??
            page.properties.Description?.rich_text ??
            []
        ),
        es: getRichTextPlain(
          page.properties['Description ES']?.rich_text ??
            page.properties.Description?.rich_text ??
            []
        ),
      },
      iconName: getRichTextPlain(page.properties['Icon Name']?.rich_text ?? []),
      id: page.id,
      order: page.properties.Order?.number ?? 0,
      title: {
        en: getRichTextPlain(
          page.properties['Title EN']?.rich_text ?? page.properties.Title?.title ?? []
        ),
        es: getRichTextPlain(
          page.properties['Title ES']?.title ??
            page.properties['Title ES']?.rich_text ??
            page.properties.Title?.title ??
            []
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const termsDb = databases.find((db: any) =>
      db.child_database.title.toLowerCase().includes('term')
    )

    if (!termsDb) {
      console.warn('Terms sections database not found')
      return []
    }

    const results = await queryDatabase(termsDb.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return results.map((page: any) => ({
      content: {
        en: getRichTextPlain(
          page.properties['Content EN']?.rich_text ?? page.properties.Content?.rich_text ?? []
        ),
        es: getRichTextPlain(
          page.properties['Content ES']?.rich_text ?? page.properties.Content?.rich_text ?? []
        ),
      },
      id: page.id,
      order: page.properties.Order?.number ?? 0,
      title: {
        en: getRichTextPlain(
          page.properties['Title EN']?.rich_text ?? page.properties.Title?.title ?? []
        ),
        es: getRichTextPlain(
          page.properties['Title ES']?.rich_text ?? page.properties.Title?.title ?? []
        ),
      },
    }))
  } catch (error) {
    console.error('Error fetching terms sections:', error)
    return []
  }
}

// --- Helper: query a Key/Page/Value EN/Value ES table and return content dict ---
async function queryPagedContentTable(
  pageId: string,
  tableName: string,
  targetPage?: string
): Promise<Record<string, { en: string; es: string }>> {
  try {
    const databases = await getChildDatabases(pageId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = databases.find((d: any) => d.child_database.title.toLowerCase().includes(tableName))

    if (!db) return {}

    const results = await queryDatabase(db.id)
    const content: Record<string, { en: string; es: string }> = {}

    for (const item of results) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = item as any
      const key = getRichTextPlain(p.properties.Key?.title ?? [])
      if (!key) continue

      // Filter by page if specified
      if (targetPage) {
        const itemPage = p.properties.Page?.select?.name
        if (itemPage && itemPage !== targetPage.toLowerCase()) continue
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
    console.error(`Error fetching ${tableName} content:`, error)
    return {}
  }
}

// --- Granular Fetchers ---

export async function getHeroContent(
  page?: string
): Promise<Record<string, { en: string; es: string }>> {
  return queryPagedContentTable(PAGES.HOME, 'hero', page)
}

export async function getCTAContent(
  page?: string
): Promise<Record<string, { en: string; es: string }>> {
  return queryPagedContentTable(PAGES.HOME, 'cta', page)
}

export async function getSectionContent(
  page?: string
): Promise<Record<string, { en: string; es: string }>> {
  return queryPagedContentTable(PAGES.HOME, 'section', page)
}

export async function getCardContent(
  page?: string
): Promise<Record<string, { en: string; es: string }>> {
  return queryPagedContentTable(PAGES.HOME, 'card', page)
}

export async function getFilterContent(
  page?: string
): Promise<Record<string, { en: string; es: string }>> {
  return queryPagedContentTable(PAGES.HOME, 'filter', page)
}

// --- Restructured getPageContent ---
// Queries ALL content tables (Hero, CTA, Section, Card, Filter) and merges them.
// Now uses the granular fetchers internally.

export async function getPageContent(
  page?: string
): Promise<Record<string, { en: string; es: string }>> {
  try {
    const [hero, cta, section, card, filter] = await Promise.all([
      getHeroContent(page),
      getCTAContent(page),
      getSectionContent(page),
      getCardContent(page),
      getFilterContent(page),
    ])

    return { ...hero, ...cta, ...section, ...card, ...filter }
  } catch (error) {
    console.error('Error fetching page content:', error)
    return {}
  }
}

// --- New functions: Banners page content ---

export async function getBannerContent(
  tableName: 'welcome banner' | 'registration dialog' | 'coupon'
): Promise<Record<string, { en: string; es: string }>> {
  return querySimpleContentTable(PAGES.BANNERS, tableName)
}

// --- New functions: Contact page content ---

export async function getContactContent(
  tableName: 'info' | 'whatsapp' | 'footer'
): Promise<Record<string, { en: string; es: string }>> {
  return querySimpleContentTable(PAGES.CONTACT, tableName)
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const databases = await getChildDatabases(PAGES.CONTACT)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = databases.find((d: any) => d.child_database.title.toLowerCase().includes('social'))

    if (!db) {
      console.warn('Social Links database not found')
      return []
    }

    const results = await queryDatabase(db.id)

    return (
      results
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((page: any) => ({
          handle: getRichTextPlain(page.properties.Handle?.rich_text ?? []),
          name: getRichTextPlain(page.properties.Name?.title ?? []),
          order: page.properties.Order?.number ?? 0,
          url: page.properties.URL?.url ?? '',
        }))
        .sort((a: SocialLink, b: SocialLink) => a.order - b.order)
    )
  } catch (error) {
    console.error('Error fetching social links:', error)
    return []
  }
}

export async function getNavigationLinks(): Promise<NavigationLink[]> {
  try {
    const databases = await getChildDatabases(PAGES.CONTACT)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = databases.find((d: any) =>
      d.child_database.title.toLowerCase().includes('navigation')
    )

    if (!db) {
      console.warn('Navigation Links database not found')
      return []
    }

    const results = await queryDatabase(db.id)

    return (
      results
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((page: any) => ({
          name: {
            en: getRichTextPlain(page.properties['Name EN']?.rich_text ?? []),
            es: getRichTextPlain(page.properties['Name ES']?.title ?? []),
          },
          order: page.properties.Order?.number ?? 0,
          path: getRichTextPlain(page.properties.Path?.rich_text ?? []),
        }))
        .sort((a: NavigationLink, b: NavigationLink) => a.order - b.order)
    )
  } catch (error) {
    console.error('Error fetching navigation links:', error)
    return []
  }
}
