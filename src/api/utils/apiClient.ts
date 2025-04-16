/**
 * Base API client for making HTTP requests
 */

/**
 * HTTP methods supported by the API client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Request options for the API client
 */
export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  cache?: RequestCache;
  signal?: AbortSignal;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  ok: boolean;
}

/**
 * Error thrown by the API client
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Base API client class
 */
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  /**
   * Create a new API client
   * @param baseUrl Base URL for API requests
   * @param defaultHeaders Default headers to include with every request
   */
  constructor(
    baseUrl: string = '',
    defaultHeaders: Record<string, string> = {}
  ) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  /**
   * Build a URL with query parameters
   * @param path API endpoint path
   * @param params Query parameters
   * @returns Full URL with query parameters
   */
  buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(path, this.baseUrl || window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Handle array parameters
            value.forEach(item => {
              url.searchParams.append(`${key}[]`, String(item));
            });
          } else if (typeof value === 'object') {
            // Handle object parameters (like filter operations)
            Object.entries(value).forEach(([subKey, subValue]) => {
              if (subValue !== undefined && subValue !== null) {
                url.searchParams.append(`${key}[${subKey}]`, String(subValue));
              }
            });
          } else {
            // Handle simple parameters
            url.searchParams.append(key, String(value));
          }
        }
      });
    }
    
    return url.toString();
  }

  /**
   * Make an HTTP request
   * @param path API endpoint path
   * @param options Request options
   * @returns Promise resolving to the API response
   * @throws ApiError if the request fails
   */
  async request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', headers = {}, body, ...restOptions } = options;
    
    const requestOptions: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      ...restOptions,
    };

    // Add body for non-GET requests
    if (method !== 'GET' && body !== undefined) {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(this.buildUrl(path), requestOptions);
      
      // Parse the response body
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as unknown as T;
      }

      // Handle error responses
      if (!response.ok) {
        throw new ApiError(
          `API request failed with status ${response.status}`,
          response.status,
          data
        );
      }

      return {
        data,
        status: response.status,
        headers: response.headers,
        ok: response.ok,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle network errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network request failed',
        0
      );
    }
  }

  /**
   * Make a GET request
   * @param path API endpoint path
   * @param params Query parameters
   * @param options Additional request options
   * @returns Promise resolving to the API response
   */
  async get<T>(
    path: string,
    params?: Record<string, any>,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(params ? this.buildUrl(path, params) : path, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * Make a POST request
   * @param path API endpoint path
   * @param body Request body
   * @param options Additional request options
   * @returns Promise resolving to the API response
   */
  async post<T>(
    path: string,
    body?: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body,
    });
  }

  /**
   * Make a PUT request
   * @param path API endpoint path
   * @param body Request body
   * @param options Additional request options
   * @returns Promise resolving to the API response
   */
  async put<T>(
    path: string,
    body?: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body,
    });
  }

  /**
   * Make a DELETE request
   * @param path API endpoint path
   * @param options Additional request options
   * @returns Promise resolving to the API response
   */
  async delete<T>(
    path: string,
    options: Omit<RequestOptions, 'method'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Make a PATCH request
   * @param path API endpoint path
   * @param body Request body
   * @param options Additional request options
   * @returns Promise resolving to the API response
   */
  async patch<T>(
    path: string,
    body?: any,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body,
    });
  }
}
