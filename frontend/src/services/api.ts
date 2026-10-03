const resolveApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    const configured = import.meta.env.VITE_API_BASE_URL;
    if (configured && configured.startsWith('http://')) {
      return ''; // Use relative path so Vite proxy forwards requests securely without mixed-content errors
    }
  }
  return (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
};

export const API_BASE_URL = resolveApiBaseUrl();

export class ApiError extends Error {
  status: number;
  code: string;
  details: any;

  constructor(status: number, message: string, code: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

// Memory-only access token storage
let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const onAuthFailure = () => {
  // Dispatched when refresh fails completely
  setAccessToken(null);
  window.dispatchEvent(new Event('auth:unauthorized'));
};

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  const makeRequest = async (tokenOverride?: string) => {
    const tokenToUse = tokenOverride !== undefined ? tokenOverride : accessToken;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options?.headers as Record<string, string>) || {}),
    };

    if (tokenToUse && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${tokenToUse}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 && !options?.headers?.hasOwnProperty('No-Retry')) {
        return { response, failed401: true } as { response: Response; failed401: true };
      }

      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.error?.message || errorData.detail || response.statusText,
        errorData.error?.code || 'UNKNOWN_ERROR',
        errorData.error?.details
      );
    }

    if (response.status === 204) {
      return { response: {} as T, failed401: false } as { response: T; failed401: false };
    }

    return { response: (await response.json()) as T, failed401: false } as { response: T; failed401: false };
  };

  try {
    let result = await makeRequest();

    if (result.failed401) {
      const res = result.response as Response;
      // Avoid infinite loop if this request was already the refresh request
      if (endpoint === '/auth/refresh') {
        const errorData = await res.json().catch(() => ({}));
        throw new ApiError(
          res.status,
          errorData.error?.message || errorData.detail || res.statusText,
          errorData.error?.code || 'UNAUTHORIZED'
        );
      }

      // Shared refresh lock
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            // Import lazily to avoid circular dependencies
            const { authApi } = await import('./authApi');
            const refreshRes = await authApi.refresh();
            setAccessToken(refreshRes.access_token);
            return refreshRes.access_token;
          } catch (err) {
            onAuthFailure();
            return null;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      const newToken = await refreshPromise;
      if (newToken) {
        // Retry original request once
        result = await makeRequest(newToken);
        if (result.failed401) {
           throw new ApiError(401, "Authentication failed after retry", "UNAUTHORIZED");
        }
      } else {
        throw new ApiError(401, "Session expired", "SESSION_EXPIRED");
      }
    }

    return result.response as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, (error as Error).message, 'NETWORK_ERROR');
  }
}
