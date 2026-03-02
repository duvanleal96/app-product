import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import type { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

let requestInterceptor: {
  onFulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
  onRejected: (error: any) => any;
};

let responseInterceptor: {
  onFulfilled: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
  onRejected: (error: any) => any;
};

vi.mock('axios', () => {
  const mockAxiosInstance = {
    interceptors: {
      request: {
        use: vi.fn((fulfilled, rejected) => {
          requestInterceptor = { onFulfilled: fulfilled, onRejected: rejected };
        }),
      },
      response: {
        use: vi.fn((fulfilled, rejected) => {
          responseInterceptor = { onFulfilled: fulfilled, onRejected: rejected };
        }),
      },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe('api service', () => {
  beforeAll(async () => {
    // Silence console output during tests
    console.log = vi.fn();
    console.error = vi.fn();
    
    // Import the module to trigger initialization
    await import('./api');
  });

  describe('configuration', () => {
    it('should create axios instance with correct config', () => {
      const mockCreate = vi.mocked(axios.create);

      expect(mockCreate).toHaveBeenCalled();
      const config = mockCreate.mock.calls[0]?.[0];
      
      expect(config).toBeDefined();
      expect(config?.baseURL).toBeDefined();
      expect(config?.timeout).toBe(45000);
    });

    it('should have Content-Type header configured', () => {
      const mockCreate = vi.mocked(axios.create);
      const config = mockCreate.mock.calls[0]?.[0];

      expect(config?.headers).toEqual({
        'Content-Type': 'application/json',
      });
    });

    it('should have 45 second timeout for long operations', () => {
      const mockCreate = vi.mocked(axios.create);
      const config = mockCreate.mock.calls[0]?.[0];

      expect(config?.timeout).toBe(45000);
    });

    it('should setup request interceptor', () => {
      const mockCreate = vi.mocked(axios.create);
      const axiosInstance = mockCreate.mock.results[0]?.value;

      expect(axiosInstance?.interceptors.request.use).toHaveBeenCalled();
    });

    it('should setup response interceptor', () => {
      const mockCreate = vi.mocked(axios.create);
      const axiosInstance = mockCreate.mock.results[0]?.value;

      expect(axiosInstance?.interceptors.response.use).toHaveBeenCalled();
    });

    it('should log initialization', () => {
      expect(console.log).toHaveBeenCalledWith('=== API SERVICE INIT ===');
      expect(console.log).toHaveBeenCalledWith('API_URL resolved to:', expect.any(String));
    });
  });

  describe('request interceptor', () => {
    beforeEach(() => {
      // Clear only console mocks for each test
      vi.mocked(console.log).mockClear();
      vi.mocked(console.error).mockClear();
    });

    it('should log request details on fulfilled request', async () => {
      const mockConfig: InternalAxiosRequestConfig = {
        baseURL: 'http://localhost:3000/api',
        url: '/products',
        headers: {} as any,
      };

      const result = await requestInterceptor.onFulfilled(mockConfig);

      expect(console.log).toHaveBeenCalledWith(
        '🔵 Making request to:',
        'http://localhost:3000/api/products'
      );
      expect(result).toBe(mockConfig);
    });

    it('should handle request without baseURL', async () => {
      const mockConfig: InternalAxiosRequestConfig = {
        url: '/products',
        headers: {} as any,
      };

      const result = await requestInterceptor.onFulfilled(mockConfig);

      expect(console.log).toHaveBeenCalledWith(
        '🔵 Making request to:',
        '/products'
      );
      expect(result).toBe(mockConfig);
    });

    it('should log and reject on request error', async () => {
      const error = new Error('Request setup failed');

      await expect(requestInterceptor.onRejected(error)).rejects.toThrow('Request setup failed');
      expect(console.error).toHaveBeenCalledWith('🔴 Request error:', error);
    });
  });

  describe('response interceptor', () => {
    beforeEach(() => {
      // Clear only console mocks for each test
      vi.mocked(console.log).mockClear();
      vi.mocked(console.error).mockClear();
    });

    it('should log response details on successful response', async () => {
      const mockResponse: AxiosResponse = {
        data: { id: '1', name: 'Product' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '/products' } as InternalAxiosRequestConfig,
      };

      const result = await responseInterceptor.onFulfilled(mockResponse);

      expect(console.log).toHaveBeenCalledWith(
        '🟢 Response received:',
        200,
        'from',
        '/products'
      );
      expect(result).toBe(mockResponse);
    });

    it('should handle response error with backend message', async () => {
      const axiosError: AxiosError = {
        message: 'Request failed',
        name: 'AxiosError',
        code: 'ERR_BAD_REQUEST',
        config: {} as InternalAxiosRequestConfig,
        response: {
          status: 400,
          statusText: 'Bad Request',
          data: {
            message: 'Product not found',
            error: 'Not Found',
          },
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        isAxiosError: true,
        toJSON: () => ({}),
      };

      await expect(responseInterceptor.onRejected(axiosError)).rejects.toEqual({
        message: 'Product not found',
        statusCode: 400,
        error: 'Not Found',
      });

      expect(console.error).toHaveBeenCalledWith('🔴 Response error:', axiosError);
      expect(console.error).toHaveBeenCalledWith('Error details:', {
        message: 'Request failed',
        code: 'ERR_BAD_REQUEST',
        status: 400,
        data: {
          message: 'Product not found',
          error: 'Not Found',
        },
      });
    });

    it('should handle response error without backend data', async () => {
      const axiosError: AxiosError = {
        message: 'Network Error',
        name: 'AxiosError',
        code: 'ERR_NETWORK',
        config: {} as InternalAxiosRequestConfig,
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: null,
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        isAxiosError: true,
        toJSON: () => ({}),
      };

      await expect(responseInterceptor.onRejected(axiosError)).rejects.toEqual({
        message: 'Network Error',
        statusCode: 500,
        error: 'Internal Server Error',
      });
    });

    it('should handle response error without response object', async () => {
      const axiosError: AxiosError = {
        message: 'Connection timeout',
        name: 'AxiosError',
        code: 'ECONNABORTED',
        config: {} as InternalAxiosRequestConfig,
        isAxiosError: true,
        toJSON: () => ({}),
      };

      await expect(responseInterceptor.onRejected(axiosError)).rejects.toEqual({
        message: 'Connection timeout',
        statusCode: undefined,
        error: 'Connection timeout',
      });

      expect(console.error).toHaveBeenCalledWith('🔴 Response error:', axiosError);
      expect(console.error).toHaveBeenCalledWith('Error details:', {
        message: 'Connection timeout',
        code: 'ECONNABORTED',
        status: undefined,
        data: undefined,
      });
    });

    it('should handle non-string error messages', async () => {
      const axiosError: AxiosError = {
        message: 'Request failed',
        name: 'AxiosError',
        code: 'ERR_BAD_REQUEST',
        config: {} as InternalAxiosRequestConfig,
        response: {
          status: 422,
          statusText: 'Unprocessable Entity',
          data: {
            message: ['Field 1 error', 'Field 2 error'],
            error: 'Validation Error',
          },
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        isAxiosError: true,
        toJSON: () => ({}),
      };

      await expect(responseInterceptor.onRejected(axiosError)).rejects.toEqual({
        message: 'Field 1 error,Field 2 error',
        statusCode: 422,
        error: 'Validation Error',
      });
    });

    it('should use default message when no message available', async () => {
      const axiosError: AxiosError = {
        message: '',
        name: 'AxiosError',
        code: 'UNKNOWN',
        config: {} as InternalAxiosRequestConfig,
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: {},
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        isAxiosError: true,
        toJSON: () => ({}),
      };

      await expect(responseInterceptor.onRejected(axiosError)).rejects.toEqual({
        message: 'An error occurred',
        statusCode: 500,
        error: 'Internal Server Error',
      });
    });
  });
});

