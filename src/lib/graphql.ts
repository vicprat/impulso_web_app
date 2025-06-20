import { AuthenticationError } from '@/modules/user/types'; 
export const handleGraphQLErrors = (errors: unknown): never => {
  if (Array.isArray(errors) && errors.length > 0) {
    const firstError = errors[0];

    if (typeof firstError === 'object' && firstError !== null && 'message' in firstError) {
      const message = String(firstError.message);

      if (message.toLowerCase().includes('unauthenticated')) {
        throw new AuthenticationError(message); 
      }
      throw new Error(message);
    }
  }
  throw new Error('Unknown GraphQL error occurred');  
};