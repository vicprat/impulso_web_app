let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function refreshAuthToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        credentials: 'include',
        method: 'POST',
      })

      if (response.ok) {
        return true
      }

      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

interface AuthFetchOptions extends RequestInit {
  skipAuthRefresh?: boolean
}

export async function authFetch(
  url: string | URL,
  options: AuthFetchOptions = {}
): Promise<Response> {
  const { skipAuthRefresh = false, ...fetchOptions } = options

  const makeRequest = async () => {
    return fetch(url, {
      ...fetchOptions,
      credentials: 'include',
    })
  }

  let response = await makeRequest()

  if (!skipAuthRefresh && (response.status === 401 || response.status === 403)) {
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const errorData = await response.json().catch(() => ({}))

      const isAuthError =
        errorData.error?.includes('Authentication required') ||
        errorData.error?.includes('Not authenticated') ||
        errorData.error?.includes('Invalid session') ||
        errorData.details?.includes('Token expired')

      if (isAuthError) {
        const refreshed = await refreshAuthToken()

        if (refreshed) {
          response = await makeRequest()
        } else {
          window.location.href = '/auth/login'
          throw new Error('Session expired. Please login again.')
        }
      }
    }
  }

  return response
}
