export const CREATE_CHECKOUT_MUTATION = `
  mutation CheckoutCreate($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout {
        id
        webUrl
        totalPrice {
          amount
          currencyCode
        }
        subtotalPrice {
          amount
          currencyCode
        }
        totalTax {
          amount
          currencyCode
        }
        paymentDue {
          amount
          currencyCode
        }
        currencyCode
        requiresShipping
        ready
        lineItems(first: 250) {
          edges {
            node {
              id
              title
              quantity
              variant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                product {
                  handle
                  title
                }
              }
            }
          }
        }
        shippingAddress {
          id
          firstName
          lastName
          company
          address1
          address2
          city
          province
          country
          zip
          phone
        }
        availableShippingRates {
          ready
          shippingRates {
            handle
            title
            price {
              amount
              currencyCode
            }
          }
        }
        shippingLine {
          handle
          title
          price {
            amount
            currencyCode
          }
        }
      }
      checkoutUserErrors {
        field
        message
        code
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_CHECKOUT_SHIPPING_ADDRESS_MUTATION = `
  mutation CheckoutShippingAddressUpdate($checkoutId: ID!, $shippingAddress: MailingAddressInput!) {
    checkoutShippingAddressUpdateV2(checkoutId: $checkoutId, shippingAddress: $shippingAddress) {
      checkout {
        id
        shippingAddress {
          id
          firstName
          lastName
          company
          address1
          address2
          city
          province
          country
          zip
          phone
        }
        availableShippingRates {
          ready
          shippingRates {
            handle
            title
            price {
              amount
              currencyCode
            }
          }
        }
        totalPrice {
          amount
          currencyCode
        }
        paymentDue {
          amount
          currencyCode
        }
      }
      checkoutUserErrors {
        field
        message
        code
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_CHECKOUT_SHIPPING_LINE_MUTATION = `
  mutation CheckoutShippingLineUpdate($checkoutId: ID!, $shippingRateHandle: String!) {
    checkoutShippingLineUpdate(checkoutId: $checkoutId, shippingRateHandle: $shippingRateHandle) {
      checkout {
        id
        shippingLine {
          handle
          title
          price {
            amount
            currencyCode
          }
        }
        totalPrice {
          amount
          currencyCode
        }
        paymentDue {
          amount
          currencyCode
        }
        ready
      }
      checkoutUserErrors {
        field
        message
        code
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const GET_CHECKOUT_QUERY = `
  query GetCheckout($id: ID!) {
    node(id: $id) {
      ... on Checkout {
        id
        webUrl
        totalPrice {
          amount
          currencyCode
        }
        subtotalPrice {
          amount
          currencyCode
        }
        totalTax {
          amount
          currencyCode
        }
        paymentDue {
          amount
          currencyCode
        }
        currencyCode
        requiresShipping
        ready
        completedAt
        lineItems(first: 250) {
          edges {
            node {
              id
              title
              quantity
              variant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                product {
                  handle
                  title
                  featuredImage {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
        shippingAddress {
          id
          firstName
          lastName
          company
          address1
          address2
          city
          province
          country
          zip
          phone
        }
        availableShippingRates {
          ready
          shippingRates {
            handle
            title
            price {
              amount
              currencyCode
            }
          }
        }
        shippingLine {
          handle
          title
          price {
            amount
            currencyCode
          }
        }
        discountApplications(first: 10) {
          edges {
            node {
              allocationMethod
              targetSelection
              targetType
              value {
                ... on MoneyV2 {
                  amount
                  currencyCode
                }
                ... on PricingPercentageValue {
                  percentage
                }
              }
              ... on DiscountCodeApplication {
                code
              }
            }
          }
        }
      }
    }
  }
`;

export const CHECKOUT_DISCOUNT_CODE_APPLY_MUTATION = `
  mutation CheckoutDiscountCodeApply($discountCode: String!, $checkoutId: ID!) {
    checkoutDiscountCodeApplyV2(discountCode: $discountCode, checkoutId: $checkoutId) {
      checkout {
        id
        totalPrice {
          amount
          currencyCode
        }
        paymentDue {
          amount
          currencyCode
        }
        discountApplications(first: 10) {
          edges {
            node {
              allocationMethod
              targetSelection
              targetType
              value {
                ... on MoneyV2 {
                  amount
                  currencyCode
                }
                ... on PricingPercentageValue {
                  percentage
                }
              }
              ... on DiscountCodeApplication {
                code
              }
            }
          }
        }
      }
      checkoutUserErrors {
        field
        message
        code
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CHECKOUT_DISCOUNT_CODE_REMOVE_MUTATION = `
  mutation CheckoutDiscountCodeRemove($checkoutId: ID!) {
    checkoutDiscountCodeRemove(checkoutId: $checkoutId) {
      checkout {
        id
        totalPrice {
          amount
          currencyCode
        }
        paymentDue {
          amount
          currencyCode
        }
        discountApplications(first: 10) {
          edges {
            node {
              allocationMethod
              targetSelection
              targetType
              value {
                ... on MoneyV2 {
                  amount
                  currencyCode
                }
                ... on PricingPercentageValue {
                  percentage
                }
              }
            }
          }
        }
      }
      checkoutUserErrors {
        field
        message
        code
      }
      userErrors {
        field
        message
      }
    }
  }
`;