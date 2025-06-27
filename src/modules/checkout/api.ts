export const api = {
  createCheckout: async (cartId: string) => {
    try {
      const response = await fetch('/api/checkout/create', {
        body: JSON.stringify({ cartId }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create checkout: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating checkout:', error)
      throw error
    }
  },
}
