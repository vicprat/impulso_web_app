import { CTA } from './components/CTA'
import { Hero } from './components/Hero'

import type { Metadata } from 'next'

import { getPageContent, getTermsSections } from '@/lib/landing-data'
import { routeMetadata } from '@/lib/metadata'

export const metadata: Metadata = routeMetadata['/terms']

// Data fetched in the Page component

export default async function Page() {
  const [notionTerms, pageContent] = await Promise.all([
    getTermsSections(),
    getPageContent('terms'),
  ])

  const t = (key: string, fallback = '') => pageContent[key]?.es ?? fallback

  const termsSections = notionTerms.map((s) => ({
    content: s.content.es,
    id: s.id,
    title: s.title.es,
  }))
  return (
    <>
      <div className='min-h-screen'>
        <Hero content={pageContent} />

        <section className='py-16 lg:py-24' aria-label='Términos y condiciones'>
          <div className='container mx-auto px-6'>
            <div className='space-y-12'>
              {termsSections.map((section) => (
                <div key={section.id} className='border-b border-gray-200 pb-8 last:border-b-0'>
                  <div className='mb-4'>
                    <h2 className='mb-2 text-2xl font-bold'>{section.title}</h2>
                    <p className='text-sm font-medium'>
                      {t('terms.sections.suggestedLabel', 'Texto sugerido:')}
                    </p>
                  </div>
                  <div className='max-w-none'>
                    {section.content.split('\n\n').map((paragraph, pIndex) => (
                      <p key={pIndex} className='mb-4 leading-relaxed last:mb-0'>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <CTA content={pageContent} />
          </div>
        </section>
      </div>
    </>
  )
}
