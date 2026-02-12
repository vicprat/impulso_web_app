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

import { CONSENT_DATA, SHOP_DATA } from './analytics-config'

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
      ...CONSENT_DATA,
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
