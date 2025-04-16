import { NextRequest } from 'next/server';
import { 
  getSortParams, 
  getSortExpressions,
  getSortExpressionsWithCaseInsensitive,
  getCaseInsensitiveSort,
  ALLOWED_ADVOCATE_SORT_FIELDS,
  SortDirection
} from '../../utils/sorting';
import { sql, asc, desc } from 'drizzle-orm';

// Mock NextRequest
const createMockRequest = (params: Record<string, string>) => {
  const url = new URL('https://example.com/api/advocates');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  return {
    nextUrl: url
  } as unknown as NextRequest;
};

// Mock table for testing
const mockTable = {
  firstName: { name: 'first_name' },
  lastName: { name: 'last_name' },
  degree: { name: 'degree' },
  yearsOfExperience: { name: 'years_of_experience' },
  createdAt: { name: 'created_at' },
  updatedAt: { name: 'updated_at' }
};

describe('Sorting Utilities', () => {
  describe('getSortParams', () => {
    it('should return default sort params when no parameters are provided', () => {
      const request = createMockRequest({});
      const sortParams = getSortParams(request);
      
      expect(sortParams.field).toBe('createdAt');
      expect(sortParams.direction).toBe('desc');
      expect(sortParams.secondaryField).toBeUndefined();
      expect(sortParams.secondaryDirection).toBeUndefined();
    });
    
    it('should parse sort field and direction from request', () => {
      const request = createMockRequest({
        sort: 'firstName',
        order: 'asc'
      });
      const sortParams = getSortParams(request);
      
      expect(sortParams.field).toBe('firstName');
      expect(sortParams.direction).toBe('asc');
    });
    
    it('should parse secondary sort field and direction from request', () => {
      const request = createMockRequest({
        sort: 'yearsOfExperience',
        order: 'desc',
        secondarySort: 'lastName',
        secondaryOrder: 'asc'
      });
      const sortParams = getSortParams(request);
      
      expect(sortParams.field).toBe('yearsOfExperience');
      expect(sortParams.direction).toBe('desc');
      expect(sortParams.secondaryField).toBe('lastName');
      expect(sortParams.secondaryDirection).toBe('asc');
    });
    
    it('should use default values for invalid sort fields', () => {
      const request = createMockRequest({
        sort: 'invalidField',
        order: 'invalid'
      });
      const sortParams = getSortParams(request);
      
      expect(sortParams.field).toBe('createdAt');
      expect(sortParams.direction).toBe('desc');
    });
    
    it('should validate secondary sort field and direction', () => {
      const request = createMockRequest({
        sort: 'firstName',
        order: 'asc',
        secondarySort: 'invalidField',
        secondaryOrder: 'invalid'
      });
      const sortParams = getSortParams(request);
      
      expect(sortParams.field).toBe('firstName');
      expect(sortParams.direction).toBe('asc');
      expect(sortParams.secondaryField).toBeUndefined();
      expect(sortParams.secondaryDirection).toBeUndefined();
    });
  });
  
  describe('getSortExpressions', () => {
    it('should generate sort expressions for primary field', () => {
      const sortParams = {
        field: 'firstName' as typeof ALLOWED_ADVOCATE_SORT_FIELDS[number],
        direction: 'asc' as SortDirection
      };
      
      const expressions = getSortExpressions(mockTable, sortParams);
      
      expect(expressions).toHaveLength(1);
      // We can't directly compare SQL expressions, so we'll just check that it exists
      expect(expressions[0]).toBeDefined();
    });
    
    it('should generate sort expressions for primary and secondary fields', () => {
      const sortParams = {
        field: 'yearsOfExperience' as typeof ALLOWED_ADVOCATE_SORT_FIELDS[number],
        direction: 'desc' as SortDirection,
        secondaryField: 'lastName' as typeof ALLOWED_ADVOCATE_SORT_FIELDS[number],
        secondaryDirection: 'asc' as SortDirection
      };
      
      const expressions = getSortExpressions(mockTable, sortParams);
      
      expect(expressions).toHaveLength(2);
      expect(expressions[0]).toBeDefined();
      expect(expressions[1]).toBeDefined();
    });
  });
  
  describe('getCaseInsensitiveSort', () => {
    it('should generate case-insensitive sort expression for ascending order', () => {
      const expression = getCaseInsensitiveSort(mockTable, 'firstName', 'asc');
      
      // We can't directly compare SQL expressions, so we'll just check that it exists
      expect(expression).toBeDefined();
    });
    
    it('should generate case-insensitive sort expression for descending order', () => {
      const expression = getCaseInsensitiveSort(mockTable, 'lastName', 'desc');
      
      expect(expression).toBeDefined();
    });
  });
  
  describe('getSortExpressionsWithCaseInsensitive', () => {
    it('should use case-insensitive sorting for text fields', () => {
      const sortParams = {
        field: 'firstName' as typeof ALLOWED_ADVOCATE_SORT_FIELDS[number],
        direction: 'asc' as SortDirection
      };
      
      const textFields = ['firstName', 'lastName', 'degree'];
      
      const expressions = getSortExpressionsWithCaseInsensitive(
        mockTable, 
        sortParams,
        textFields
      );
      
      expect(expressions).toHaveLength(1);
      expect(expressions[0]).toBeDefined();
    });
    
    it('should use regular sorting for non-text fields', () => {
      const sortParams = {
        field: 'yearsOfExperience' as typeof ALLOWED_ADVOCATE_SORT_FIELDS[number],
        direction: 'desc' as SortDirection
      };
      
      const textFields = ['firstName', 'lastName', 'degree'];
      
      const expressions = getSortExpressionsWithCaseInsensitive(
        mockTable, 
        sortParams,
        textFields
      );
      
      expect(expressions).toHaveLength(1);
      expect(expressions[0]).toBeDefined();
    });
    
    it('should handle both text and non-text fields in primary and secondary sort', () => {
      const sortParams = {
        field: 'yearsOfExperience' as typeof ALLOWED_ADVOCATE_SORT_FIELDS[number],
        direction: 'desc' as SortDirection,
        secondaryField: 'lastName' as typeof ALLOWED_ADVOCATE_SORT_FIELDS[number],
        secondaryDirection: 'asc' as SortDirection
      };
      
      const textFields = ['firstName', 'lastName', 'degree'];
      
      const expressions = getSortExpressionsWithCaseInsensitive(
        mockTable, 
        sortParams,
        textFields
      );
      
      expect(expressions).toHaveLength(2);
      expect(expressions[0]).toBeDefined();
      expect(expressions[1]).toBeDefined();
    });
  });
});
