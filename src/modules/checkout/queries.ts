export const CREATE_CHECKOUT_MUTATION = `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
        checkoutUrl
        buyerIdentity {
          email
          countryCode
          phone
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;