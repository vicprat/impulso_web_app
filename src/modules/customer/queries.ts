export const GET_CUSTOMER_PROFILE_QUERY = `
  query GetProfile {
    customer {
      id
      firstName
      lastName
      displayName
      creationDate
      emailAddress {
        emailAddress
      }
      phoneNumber {
        phoneNumber
      }
      imageUrl
      tags
      defaultAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        zip
        country
        phoneNumber
      }
    }
  }
`

export const GET_CUSTOMER_ADDRESSES_QUERY = `
  query GetAddresses($first: Int!) {
    customer {
      addresses(first: $first) {
        edges {
          node {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            zip
            country
            province
            phoneNumber
            territoryCode
            zoneCode
            formattedArea
          }
        }
      }
    }
  }
`

export const GET_CUSTOMER_ORDERS_QUERY = `
  query GetOrders($first: Int!, $after: String) {
    customer {
      orders(first: $first, after: $after) {
        edges {
          cursor
          node {
            id
            name
            processedAt
            createdAt
            updatedAt
            totalPrice {
              amount
              currencyCode
            }
            fulfillmentStatus
            financialStatus
            currencyCode
            email
            cancelledAt
            cancelReason
            confirmationNumber
            edited
            requiresShipping
            statusPageUrl
            lineItems(first: 10) {
              edges {
                node {
                  id
                  title
                  quantity
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
            shippingAddress {
              id
              firstName
              lastName
              address1
              address2
              city
              zip
              country
            }
            billingAddress {
              id
              firstName
              lastName
              address1
              address2
              city
              zip
              country
            }
            subtotal {
              amount
              currencyCode
            }
            totalRefunded {
              amount
              currencyCode
            }
            totalShipping {
              amount
              currencyCode
            }
            totalTax {
              amount
              currencyCode
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  }
`

export const GET_SINGLE_ORDER_QUERY = `
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      name
      processedAt
      createdAt
      updatedAt
      totalPrice {
        amount
        currencyCode
      }
      fulfillmentStatus
      financialStatus
      currencyCode
      email
      cancelledAt
      cancelReason
      confirmationNumber
      edited
      requiresShipping
      statusPageUrl
      lineItems(first: 50) {
        edges {
          node {
            id
            title
            quantity
            price {
              amount
              currencyCode
            }
          }
        }
      }
      shippingAddress {
        id
        firstName
        lastName
        address1
        address2
        city
        zip
        country
      }
      billingAddress {
        id
        firstName
        lastName
        address1
        address2
        city
        zip
        country
      }
      subtotal {
        amount
        currencyCode
      }
      totalRefunded {
        amount
        currencyCode
      }
      totalShipping {
        amount
        currencyCode
      }
      totalTax {
        amount
        currencyCode
      }
      fulfillments(first: 10) {
        edges {
          node {
            id
            status
            updatedAt
          }
        }
      }
    }
  }
`

export const GET_ALL_ORDERS_QUERY = `
  query GetAllOrders($first: Int!, $after: String, $query: String) {
    orders(first: $first, after: $after, query: $query) {
      edges {
        node {
          id
          name
          processedAt
          createdAt
          updatedAt
          displayFulfillmentStatus
          displayFinancialStatus
          currencyCode
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          currentTotalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          customer {
            id
            firstName
            lastName
            email
          }
          shippingAddress {
            firstName
            lastName
            address1
            city
            province
            country
            zip
          }
          lineItems(first: 5) {
            edges {
              node {
                id
                title
                quantity
                currentQuantity
                originalUnitPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                discountedUnitPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
          fulfillments(first: 5) {
            id
            status
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`

export const GET_BASIC_INFO_QUERY = `
  query GetBasicInfo {
    customer {
      id
      displayName
      emailAddress {
        emailAddress
      }
    }
  }
`

export const UPDATE_CUSTOMER_MUTATION = `
  mutation UpdateCustomer($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        firstName
        lastName
        displayName
        emailAddress {
          emailAddress
        }
        phoneNumber {
          phoneNumber
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`

export const CREATE_CUSTOMER_ADDRESS_MUTATION = `
  mutation CreateAddress($address: CustomerAddressInput!) {
    customerAddressCreate(address: $address) {
      customerAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        zip
        country
        province
        phoneNumber
        territoryCode
        zoneCode
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`

export const UPDATE_CUSTOMER_ADDRESS_MUTATION = `
  mutation UpdateAddress($addressId: ID!, $address: CustomerAddressInput) {
    customerAddressUpdate(addressId: $addressId, address: $address) {
      customerAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        zip
        country
        province
        phoneNumber
        territoryCode
        zoneCode
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`

export const DELETE_CUSTOMER_ADDRESS_MUTATION = `
  mutation DeleteAddress($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedCustomerAddressId
      userErrors {
        field
        message
        code
      }
    }
  }
`

export const SET_DEFAULT_ADDRESS_MUTATION = `
  mutation SetDefaultAddress($addressId: ID!) {
    customerDefaultAddressUpdate(addressId: $addressId) {
      customer {
        id
        defaultAddress {
          id
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`
