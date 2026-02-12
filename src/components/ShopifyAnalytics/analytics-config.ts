const language = 'ES' as const
const currency = 'MXN' as const

export const SHOP_DATA = {
  acceptedLanguage: language,
  currency,
  shopId: `gid://shopify/Shop/${process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID}`,
  storefrontAccessToken: process.env.NEXT_PUBLIC_API_SHOPIFY_STOREFRONT ?? '',
}

export const CONSENT_DATA = {
  analyticsAllowed: true,
  hasUserConsent: true,
  marketingAllowed: true,
  saleOfDataAllowed: true,
}
