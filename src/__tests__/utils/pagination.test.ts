import { 
  getPaginationParams, 
  decodeCursor, 
  encodeCursor, 
  getLinkHeader,
  DEFAULT_PAGE_SIZE,
  ALLOWED_PAGE_SIZES
} from '../../utils/pagination';
import { NextRequest } from 'next/server';

// Mock NextRequest
const createMockRequest = (params: Record<string, string>) => {
  const url = new URL('https://example.com');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  return {
    nextUrl: url,
    url: url.toString(),
    headers: {
      get: jest.fn().mockReturnValue(null)
    }
  } as unknown as NextRequest;
};

describe('Pagination Utilities', () => {
  describe('getPaginationParams', () => {
    it('should return default pagination parameters when none are provided', () => {
      const request = createMockRequest({});
      const params = getPaginationParams(request);
      
      expect(params.page).toBe(1);
      expect(params.limit).toBe(DEFAULT_PAGE_SIZE);
      expect(params.cursor).toBeUndefined();
      expect(params.cursorField).toBeUndefined();
    });
    
    it('should parse page and limit parameters correctly', () => {
      const request = createMockRequest({ page: '2', limit: '25' });
      const params = getPaginationParams(request);
      
      expect(params.page).toBe(2);
      expect(params.limit).toBe(25);
    });
    
    it('should enforce allowed page sizes', () => {
      const request = createMockRequest({ limit: '30' });
      const params = getPaginationParams(request);
      
      expect(params.limit).toBe(DEFAULT_PAGE_SIZE);
      expect(ALLOWED_PAGE_SIZES).not.toContain(30);
    });
    
    it('should handle cursor parameters', () => {
      const cursor = 'test-cursor';
      const cursorField = 'id';
      const request = createMockRequest({ cursor, cursorField });
      const params = getPaginationParams(request);
      
      expect(params.cursor).toBe(cursor);
      expect(params.cursorField).toBe(cursorField);
    });
    
    it('should handle invalid page numbers', () => {
      const request = createMockRequest({ page: 'invalid' });
      const params = getPaginationParams(request);
      
      expect(params.page).toBe(1);
    });
  });
  
  describe('encodeCursor and decodeCursor', () => {
    it('should encode and decode cursor data correctly', () => {
      const field = 'id';
      const value = '123';
      const direction = 'forward';
      
      const encoded = encodeCursor(field, value, direction);
      expect(typeof encoded).toBe('string');
      
      const decoded = decodeCursor(encoded);
      expect(decoded).toEqual({
        field,
        value,
        direction
      });
    });
    

    it('should handle date values in cursors', () => {
      const field = 'createdAt';
      const value = new Date('2023-01-01');
      const direction = 'backward';
      
      const encoded = encodeCursor(field, value, direction);
      const decoded = decodeCursor(encoded);
      
      expect(decoded?.field).toBe(field);
      expect(decoded?.direction).toBe(direction);
      // Date will be stored as string in the cursor
      expect(typeof decoded?.value).toBe('string');
    });
    
    it('should return undefined for invalid cursor', () => {
      const decoded = decodeCursor('invalid-cursor');
      expect(decoded).toBeUndefined();
    });
  });
  
  describe('getLinkHeader', () => {
    it('should generate link headers with page-based pagination', () => {
      const request = createMockRequest({ page: '2', limit: '10' });
      const pagination = {
        totalCount: 50,
        pageSize: 10,
        currentPage: 2,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: true
      };
      
      const linkHeader = getLinkHeader(request, pagination);
      
      expect(linkHeader).toContain('rel="first"');
      expect(linkHeader).toContain('rel="prev"');
      expect(linkHeader).toContain('rel="next"');
      expect(linkHeader).toContain('rel="last"');
      expect(linkHeader).toContain('page=1');
      expect(linkHeader).toContain('page=3');
      expect(linkHeader).toContain('page=5');
    });
    
    it('should generate link headers with cursor-based pagination', () => {
      const request = createMockRequest({ limit: '10' });
      const pagination = {
        totalCount: 50,
        pageSize: 10,
        hasNextPage: true,
        hasPreviousPage: true,
        nextCursor: 'next-cursor',
        prevCursor: 'prev-cursor',
        cursorField: 'id'
      };
      
      const linkHeader = getLinkHeader(request, pagination);
      
      expect(linkHeader).toContain('rel="next"');
      expect(linkHeader).toContain('rel="prev"');
      expect(linkHeader).toContain('cursor=next-cursor');
      expect(linkHeader).toContain('cursor=prev-cursor');
    });
    
    it('should omit links for unavailable pages', () => {
      const request = createMockRequest({ page: '1', limit: '10' });
      const pagination = {
        totalCount: 10,
        pageSize: 10,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      };
      
      const linkHeader = getLinkHeader(request, pagination);
      
      expect(linkHeader).not.toContain('rel="prev"');
      expect(linkHeader).not.toContain('rel="next"');
      expect(linkHeader).toContain('rel="first"');
      expect(linkHeader).toContain('rel="last"');
    });
  });
});
