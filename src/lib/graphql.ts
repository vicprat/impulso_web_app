export const handleGraphQLErrors = (errors: unknown): never => {
  if (Array.isArray(errors) && errors.length > 0) {
    const firstError = errors[0];
    if (typeof firstError === 'object' && firstError !== null && 'message' in firstError) {
      throw new Error(String(firstError.message));
    }
  }
  throw new Error('Unknown GraphQL error occurred');
};