import { Check } from 'lucide-react'
import Link from 'next/link'
import { type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/src/config/routes'

interface LocalizedBenefit {
  id: string
  text: ReactNode
  order: number
}

interface Props {
  data: LocalizedBenefit[]
  content?: Record<string, { en: string; es: string }>
}

export const Membership: React.FC<Props> = ({ content = {}, data }) => {
  const t = (key: string, fallback: string) => content[key]?.es ?? fallback

  return (
    <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2'>
      {/* Left Content - Benefits List */}
      <div className='animate-fade-in-left text-center lg:text-left'>
        <div className='mb-8'>
          <h3 className='mb-6 text-2xl font-bold text-foreground lg:text-3xl'>
            {t('landing.membership.benefitsTitle', 'Beneficios para ti')}
          </h3>
          <div className='space-y-4'>
            {data.map((benefit, index) => (
              <div
                key={benefit.id}
                className='flex animate-fade-in-up items-start gap-3'
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Check className='mt-0.5 size-5 shrink-0 text-green-500' />
                <span className='text-sm text-muted-foreground lg:text-base'>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Content - Membership Card */}
      <div className='animate-fade-in-right rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-900'>
        <div className='mb-6 text-center'>
          <h3 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
            {t('landing.membership.cardTitle', 'Mi espacio Impulso')}
          </h3>
          <div className='mb-4'>
            <span className='text-sm text-gray-600 dark:text-gray-400'>
              {t('landing.membership.priceLabel', 'POR SOLO')}
            </span>
            <div className='text-4xl font-bold text-gray-900 dark:text-white'>
              {t('landing.membership.price', '$500.00')}
            </div>
            <span className='text-sm text-gray-600 dark:text-gray-400'>
              {t('landing.membership.period', 'MXN/mensual')}
            </span>
          </div>
          <div className='mx-auto mb-6 h-px w-24 bg-amber-400'></div>
        </div>

        <Button
          asChild
          size='lg'
          className='w-full bg-gray-900 text-white transition-colors duration-200 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
        >
          <Link href={ROUTES.STORE.MEMBERSHIP.PATH}>
            {t('landing.membership.button', 'Adquirir')}
          </Link>
        </Button>
      </div>
    </div>
  )
}
