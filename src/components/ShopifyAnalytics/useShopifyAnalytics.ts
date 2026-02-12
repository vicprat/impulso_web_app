'use client'

import {
  AnalyticsEventName,
  getClientBrowserParameters,
  sendShopifyAnalytics,
  type ShopifyAddToCartPayload,
  type ShopifyAnalyticsProduct,
  type ShopifyPageViewPayload,
} from '@shopify/hydrogen-react'
import { useCallback } from 'react'

import { CONSENT_DATA, SHOP_DATA } from './analytics-config'

interface ProductViewData {
  productGid: string
  variantGid?: string
  name: string
  variantName?: string
  brand: string
  category?: string
  price: string
  sku?: string | null
}

interface AddToCartData {
  cartId: string
  products: ProductViewData[]
  totalValue?: number
}

export function useShopifyAnalytics() {
  const trackProductView = useCallback((product: ProductViewData) => {
    const analyticsProduct: ShopifyAnalyticsProduct = {
      brand: product.brand,
      category: product.category,
      name: product.name,
      price: product.price,
      productGid: product.productGid,
      sku: product.sku ?? undefined,
      variantGid: product.variantGid,
      variantName: product.variantName,
    }

    const payload: ShopifyPageViewPayload = {
      ...getClientBrowserParameters(),
      ...SHOP_DATA,
      ...CONSENT_DATA,
      pageType: 'product',
      products: [analyticsProduct],
      resourceId: product.productGid,
      totalValue: parseFloat(product.price) || 0,
    }

    void sendShopifyAnalytics({
      eventName: AnalyticsEventName.PAGE_VIEW,
      payload,
    })
  }, [])

  const trackAddToCart = useCallback((data: AddToCartData) => {
    const products: ShopifyAnalyticsProduct[] = data.products.map((p) => ({
      brand: p.brand,
      category: p.category,
      name: p.name,
      price: p.price,
      productGid: p.productGid,
      quantity: 1,
      sku: p.sku ?? undefined,
      variantGid: p.variantGid,
      variantName: p.variantName,
    }))

    const payload: ShopifyAddToCartPayload = {
      ...getClientBrowserParameters(),
      ...SHOP_DATA,
      ...CONSENT_DATA,
      cartId: data.cartId,
      products,
      totalValue:
        data.totalValue ?? products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0),
    }

    void sendShopifyAnalytics({
      eventName: AnalyticsEventName.ADD_TO_CART,
      payload,
    })
  }, [])

  return { trackAddToCart, trackProductView }
}
