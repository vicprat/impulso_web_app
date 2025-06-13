export const api = {
  createCheckout: async (cartId: string) => {
    try {
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cartId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create checkout: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  }
};