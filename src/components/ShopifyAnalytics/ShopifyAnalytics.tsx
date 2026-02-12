'use client'

import {
  AnalyticsEventName,
  getClientBrowserParameters,
  sendShopifyAnalytics,
  useShopifyCookies,
  type ShopifyPageViewPayload,
} from '@shopify/hydrogen-react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'

const SHOP_DATA = {
  acceptedLanguage: 'ES' as const,
  currency: 'MXN' as const,
  shopId: `gid://shopify/Shop/${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID}`,
  storefrontAccessToken: process.env.NEXT_PUBLIC_API_SHOPIFY_STOREFRONT ?? '',
}

function ShopifyAnalyticsInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)

  useShopifyCookies({ hasUserConsent: true })

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      sendPageView()
      return
    }

    sendPageView()
  }, [pathname, searchParams])

  const sendPageView = () => {
    const payload: ShopifyPageViewPayload = {
      ...getClientBrowserParameters(),
      ...SHOP_DATA,
      hasUserConsent: true,
    }

    void sendShopifyAnalytics({
      eventName: AnalyticsEventName.PAGE_VIEW,
      payload,
    })
  }

  return null
}

export function ShopifyAnalytics() {
  return (
    <Suspense fallback={null}>
      <ShopifyAnalyticsInner />
    </Suspense>
  )
}
