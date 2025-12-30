/**
 * Centralized API utility for the glamcart frontend.
 * This module handles all HTTP requests to the backend API.
 *
 * Environment Variable: NEXT_PUBLIC_API_BASE_URL
 * - Prefixed with NEXT_PUBLIC_ to be accessible in client components and during Vercel builds
 * - This is critical for frontend-only deployment on Vercel while backend runs on DigitalOcean VM
 * - Set in .env.local (local development) or .env.production (Vercel via build settings)
 *
 * Backend endpoints are defined as placeholder paths like /api/products, /api/tryon/models
 * These should be implemented by the backend service independently.
 */

/**
 * API response type for consistent error handling across all endpoints.
 */
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Get the API base URL from environment variables.
 * Ensures NEXT_PUBLIC_API_BASE_URL is properly configured for Vercel deployment.
 */
function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    console.error(
      'NEXT_PUBLIC_API_BASE_URL is not configured. ' +
      'Please set it in .env.local or Vercel environment settings.'
    );
    // Fallback to localhost for development
    return 'http://localhost:3001';
  }

  return baseUrl;
}

/**
 * Generic fetch wrapper with error handling and JSON response parsing.
 *
 * @param endpoint - The API endpoint path (e.g., /api/products)
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Promise with parsed response or error
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const baseUrl = getApiBaseUrl();
    const url = new URL(endpoint, baseUrl).toString();

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // Handle non-JSON responses gracefully
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      const errorData = isJson ? await response.json() : { message: response.statusText };
      return {
        error: errorData.message || `API error: ${response.status}`,
        status: response.status,
      };
    }

    const data = isJson ? await response.json() : null;

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`API request failed for endpoint ${endpoint}:`, error);

    return {
      error: `Failed to fetch from API: ${errorMessage}`,
      status: 0,
    };
  }
}

/**
 * GET request helper.
 *
 * @param endpoint - The API endpoint path
 * @returns Promise with parsed response or error
 */
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'GET',
  });
}

/**
 * POST request helper.
 *
 * @param endpoint - The API endpoint path
 * @param body - Request body (will be JSON-stringified)
 * @returns Promise with parsed response or error
 */
export async function apiPost<T>(
  endpoint: string,
  body?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request helper.
 *
 * @param endpoint - The API endpoint path
 * @param body - Request body (will be JSON-stringified)
 * @returns Promise with parsed response or error
 */
export async function apiPut<T>(
  endpoint: string,
  body?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper.
 *
 * @param endpoint - The API endpoint path
 * @returns Promise with parsed response or error
 */
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'DELETE',
  });
}

/**
 * PATCH request helper.
 *
 * @param endpoint - The API endpoint path
 * @param body - Request body (will be JSON-stringified)
 * @returns Promise with parsed response or error
 */
export async function apiPatch<T>(
  endpoint: string,
  body?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  patch: apiPatch,
};
