import Head from 'next/head'

interface OpenGraphProps {
  title: string
  description: string
  url: string
  image?: string
  type?: 'website' | 'article' | 'profile'
  siteName?: string
  locale?: string
}

export function OpenGraph({
  title,
  description,
  url,
  image = '/og-image.jpg',
  type = 'website',
  siteName = 'Impulso Galería',
  locale = 'es_MX',
}: OpenGraphProps) {
  const fullUrl = `https://impulsogaleria.com${url}`

  return (
    <Head>
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={`https://impulsogaleria.com${image}`} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`https://impulsogaleria.com${image}`} />
      <meta name="twitter:site" content="@impulsogaleria" />
      <meta name="twitter:creator" content="@impulsogaleria" />

      {/* Additional SEO */}
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />
    </Head>
  )
} 