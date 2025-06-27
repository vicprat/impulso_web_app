import { type GraphQLError } from 'graphql'

export const handleGraphQLErrors = (errors: readonly GraphQLError[] | undefined) => {
  if (errors && errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        console.error('GraphQL Error Details:', JSON.stringify(error, null, 2))
        return `Message: ${error.message}, Path: ${error.path?.join(' > ')}`
      })
      .join('\n')

    throw new Error(`GraphQL request failed:\n${errorMessages}`)
  }
}
