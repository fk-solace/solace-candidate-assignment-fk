/**
 * Unit tests for the API client
 */
import { ApiClient, ApiError } from '../../api/utils/apiClient';
import { AdvocateService } from '../../api/services/advocateService';
import { buildQueryParams } from '../../api/utils/paramBuilders';

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiClient', () => {
  let apiClient: ApiClient;
  
  beforeEach(() => {
    apiClient = new ApiClient();
    jest.resetAllMocks();
  });
  
  describe('buildUrl', () => {
    it('should build a URL with query parameters', () => {
      const url = apiClient.buildUrl('/api/advocates', {
        page: 1,
        limit: 10,
        sort: 'lastName',
        order: 'asc'
      });
      
      expect(url).toContain('/api/advocates');
      expect(url).toContain('page=1');
      expect(url).toContain('limit=10');
      expect(url).toContain('sort=lastName');
      expect(url).toContain('order=asc');
    });
    
    it('should handle array parameters', () => {
      const url = apiClient.buildUrl('/api/advocates', {
        specialty: ['Trauma', 'Anxiety']
      });
      
      expect(url).toContain('/api/advocates');
      expect(url).toContain('specialty%5B%5D=Trauma');
      expect(url).toContain('specialty%5B%5D=Anxiety');
    });
    
    it('should handle object parameters', () => {
      const url = apiClient.buildUrl('/api/advocates', {
        firstName: { contains: 'John' }
      });
      
      expect(url).toContain('/api/advocates');
      expect(url).toContain('firstName%5Bcontains%5D=John');
    });
  });
  
  describe('request', () => {
    it('should make a successful request', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ success: true, data: [] }),
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const response = await apiClient.request('/api/advocates');
      
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/advocates'), expect.any(Object));
      expect(response.data).toEqual({ success: true, data: [] });
      expect(response.status).toBe(200);
      expect(response.ok).toBe(true);
    });
    
    it('should handle API errors', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ success: false, error: { message: 'Not found' } }),
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      await expect(apiClient.request('/api/advocates/invalid-id')).rejects.toThrow(ApiError);
      await expect(apiClient.request('/api/advocates/invalid-id')).rejects.toMatchObject({
        status: 404,
        data: { success: false, error: { message: 'Not found' } }
      });
    });
    
    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      await expect(apiClient.request('/api/advocates')).rejects.toThrow(ApiError);
      await expect(apiClient.request('/api/advocates')).rejects.toMatchObject({
        message: 'Network error',
        status: 0
      });
    });
  });
  
  describe('HTTP methods', () => {
    it('should make a GET request', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ success: true, data: [] }),
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      await apiClient.get('/api/advocates', { page: 1, limit: 10 });
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/advocates?page=1&limit=10'),
        expect.objectContaining({ method: 'GET' })
      );
    });
    
    it('should make a POST request with body', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ success: true, data: { id: '123' } }),
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const body = { firstName: 'John', lastName: 'Doe' };
      await apiClient.post('/api/advocates', body);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/advocates'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body)
        })
      );
    });
  });
});

describe('AdvocateService', () => {
  let apiClient: ApiClient;
  let advocateService: AdvocateService;
  
  beforeEach(() => {
    apiClient = new ApiClient();
    advocateService = new AdvocateService(apiClient);
    jest.resetAllMocks();
  });
  
  describe('getAdvocates', () => {
    it('should fetch advocates with pagination, sorting, and filtering', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          success: true,
          data: [
            {
              id: '123',
              firstName: 'John',
              lastName: 'Doe',
              degree: 'MD',
              yearsOfExperience: 10,
              phoneNumber: 1234567890,
              specialties: ['Trauma', 'Anxiety'],
              city: 'New York',
              state: 'NY',
              country: 'United States'
            }
          ],
          pagination: {
            totalCount: 1,
            pageSize: 10,
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false
          }
        }),
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const pagination = { page: 1, limit: 10 };
      const sorting = { sort: 'lastName' as const, order: 'asc' as const };
      const filters = [
        {
          field: 'yearsOfExperience',
          operation: 'gte' as const,
          value: 5
        }
      ];
      
      const result = await advocateService.getAdvocates(pagination, sorting, filters);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/advocates'),
        expect.any(Object)
      );
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].firstName).toBe('John');
      expect(result.pagination.totalCount).toBe(1);
    });
  });
  
  describe('searchAdvocates', () => {
    it('should search advocates by query', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          success: true,
          data: [
            {
              id: '123',
              firstName: 'John',
              lastName: 'Doe',
              degree: 'MD',
              yearsOfExperience: 10,
              phoneNumber: 1234567890,
              specialties: ['Trauma', 'Anxiety'],
              city: 'New York',
              state: 'NY',
              country: 'United States'
            }
          ],
          pagination: {
            totalCount: 1,
            pageSize: 10,
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false
          }
        }),
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const result = await advocateService.searchAdvocates('John');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/advocates'),
        expect.any(Object)
      );
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0].firstName).toBe('John');
    });
  });
});

describe('paramBuilders', () => {
  describe('buildQueryParams', () => {
    it('should build complete query parameters', () => {
      const pagination = { page: 2, limit: 25 };
      const sorting = { sort: 'yearsOfExperience' as const, order: 'desc' as const };
      const filters = [
        {
          field: 'firstName',
          operation: 'contains' as const,
          value: 'John'
        },
        {
          field: 'yearsOfExperience',
          operation: 'gte' as const,
          value: 5
        }
      ];
      
      const params = buildQueryParams(pagination, sorting, filters);
      
      expect(params).toEqual({
        page: 2,
        limit: 25,
        sort: 'yearsOfExperience',
        order: 'desc',
        'firstName[contains]': 'John',
        'yearsOfExperience[gte]': 5
      });
    });
    
    it('should handle empty parameters', () => {
      const params = buildQueryParams();
      
      expect(params).toEqual({});
    });
  });
});
