export const GET_CUSTOMER_PROFILE_QUERY = `
  query GetCustomerProfile {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      phoneNumber {
        phoneNumber
      }
      createdAt
      updatedAt
      acceptsMarketing
      defaultAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        zip
        country
        phone
      }
    }
  }
`;

// Customer Address Queries
export const GET_CUSTOMER_ADDRESSES_QUERY = `
  query GetCustomerAddresses {
    customer {
      addresses {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        zip
        country
        phone
      }
    }
  }
`;

// Customer Orders Queries
export const GET_CUSTOMER_ORDERS_QUERY = `
  query GetCustomerOrders($first: Int!, $after: String) {
    customer {
      orders(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            name
            processedAt
            fulfillmentStatus
            financialStatus
            currentTotalPrice {
              amount
              currencyCode
            }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    id
                    title
                    image {
                      url
                      altText
                    }
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
            shippingAddress {
              firstName
              lastName
              address1
              address2
              city
              province
              zip
              country
            }
          }
        }
      }
    }
  }
`;

// Customer Mutations
export const UPDATE_CUSTOMER_MUTATION = `
  mutation UpdateCustomer($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        firstName
        lastName
        emailAddress {
          emailAddress
        }
        phoneNumber {
          phoneNumber
        }
        acceptsMarketing
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CREATE_CUSTOMER_ADDRESS_MUTATION = `
  mutation CreateCustomerAddress($address: CustomerAddressInput!) {
    customerAddressCreate(address: $address) {
      customerAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        zip
        country
        phone
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const UPDATE_CUSTOMER_ADDRESS_MUTATION = `
  mutation UpdateCustomerAddress($id: ID!, $address: CustomerAddressInput!) {
    customerAddressUpdate(id: $id, address: $address) {
      customerAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        zip
        country
        phone
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const DELETE_CUSTOMER_ADDRESS_MUTATION = `
  mutation DeleteCustomerAddress($id: ID!) {
    customerAddressDelete(id: $id) {
      deletedCustomerAddressId
      userErrors {
        field
        message
      }
    }
  }
`;

export const SET_DEFAULT_ADDRESS_MUTATION = `
  mutation SetDefaultAddress($id: ID!) {
    customerDefaultAddressUpdate(addressId: $id) {
      customer {
        id
        defaultAddress {
          id
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;