import { NextRequest } from 'next/server';
import { 
  getFilterParams,
  buildFilterConditions,
  buildTextCondition,
  buildExactCondition,
  buildRangeCondition,
  FilterOperation,
  FilterType
} from '../../utils/filtering';
import { sql } from 'drizzle-orm';

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

// Mock tables for testing
const mockTables = {
  advocates: {
    firstName: { name: 'first_name' },
    lastName: { name: 'last_name' },
    degree: { name: 'degree' },
    yearsOfExperience: { name: 'years_of_experience' },
    createdAt: { name: 'created_at' },
    updatedAt: { name: 'updated_at' }
  },
  specialties: {
    id: { name: 'id' },
    name: { name: 'name' }
  },
  advocateSpecialties: {
    advocateId: { name: 'advocate_id' },
    specialtyId: { name: 'specialty_id' }
  },
  locations: {
    id: { name: 'id' },
    advocateId: { name: 'advocate_id' },
    city: { name: 'city' }
  }
};

describe('Filtering Utilities', () => {
  describe('getFilterParams', () => {
    it('should parse basic equality filters', () => {
      const request = createMockRequest({
        firstName: 'John',
        lastName: 'Doe'
      });
      
      const filterParams = getFilterParams(request);
      
      expect(filterParams).toHaveLength(2);
      expect(filterParams[0]).toEqual({
        field: 'firstName',
        operation: FilterOperation.EQUALS,
        value: 'John'
      });
      expect(filterParams[1]).toEqual({
        field: 'lastName',
        operation: FilterOperation.EQUALS,
        value: 'Doe'
      });
    });
    
    it('should parse text search filters', () => {
      const request = createMockRequest({
        'firstName[contains]': 'Jo',
        'lastName[startsWith]': 'D',
        'lastName[endsWith]': 'oe'
      });
      
      const filterParams = getFilterParams(request);
      
      expect(filterParams).toHaveLength(3);
      expect(filterParams).toContainEqual({
        field: 'firstName',
        operation: FilterOperation.CONTAINS,
        value: 'Jo'
      });
      expect(filterParams).toContainEqual({
        field: 'lastName',
        operation: FilterOperation.STARTS_WITH,
        value: 'D'
      });
      expect(filterParams).toContainEqual({
        field: 'lastName',
        operation: FilterOperation.ENDS_WITH,
        value: 'oe'
      });
    });
    
    it('should parse exact match filters', () => {
      const request = createMockRequest({
        'degree[eq]': 'MD',
        'degree[in]': 'MD,PhD,MSW'
      });
      
      const filterParams = getFilterParams(request);
      
      expect(filterParams).toHaveLength(2);
      expect(filterParams).toContainEqual({
        field: 'degree',
        operation: FilterOperation.EQUALS,
        value: 'MD'
      });
      expect(filterParams).toContainEqual({
        field: 'degree',
        operation: FilterOperation.IN,
        value: ['MD', 'PhD', 'MSW']
      });
    });
    
    it('should parse range filters', () => {
      const request = createMockRequest({
        'experience[gt]': '5',
        'experience[gte]': '5',
        'experience[lt]': '10',
        'experience[lte]': '10',
        'experience[between]': '5,10'
      });
      
      const filterParams = getFilterParams(request);
      
      expect(filterParams).toHaveLength(5);
      expect(filterParams).toContainEqual({
        field: 'yearsOfExperience',
        operation: FilterOperation.GREATER_THAN,
        value: 5
      });
      expect(filterParams).toContainEqual({
        field: 'yearsOfExperience',
        operation: FilterOperation.GREATER_THAN_OR_EQUAL,
        value: 5
      });
      expect(filterParams).toContainEqual({
        field: 'yearsOfExperience',
        operation: FilterOperation.LESS_THAN,
        value: 10
      });
      expect(filterParams).toContainEqual({
        field: 'yearsOfExperience',
        operation: FilterOperation.LESS_THAN_OR_EQUAL,
        value: 10
      });
      expect(filterParams).toContainEqual({
        field: 'yearsOfExperience',
        operation: FilterOperation.BETWEEN,
        value: [5, 10]
      });
    });
    
    it('should parse array filters', () => {
      const request = createMockRequest({
        'specialty[any]': 'Trauma,Anxiety',
        'specialty[all]': 'Trauma,Anxiety'
      });
      
      const filterParams = getFilterParams(request);
      
      expect(filterParams).toHaveLength(2);
      expect(filterParams).toContainEqual({
        field: 'specialties',
        operation: FilterOperation.ANY,
        value: ['Trauma', 'Anxiety']
      });
      expect(filterParams).toContainEqual({
        field: 'specialties',
        operation: FilterOperation.ALL,
        value: ['Trauma', 'Anxiety']
      });
    });
    
    it('should parse location filters', () => {
      const request = createMockRequest({
        'city[eq]': 'New York',
        'city[contains]': 'New'
      });
      
      const filterParams = getFilterParams(request);
      
      expect(filterParams).toHaveLength(2);
      expect(filterParams).toContainEqual({
        field: 'city',
        operation: FilterOperation.EQUALS,
        value: 'New York'
      });
      expect(filterParams).toContainEqual({
        field: 'city',
        operation: FilterOperation.CONTAINS,
        value: 'New'
      });
    });
    
    it('should handle multiple filters of different types', () => {
      const request = createMockRequest({
        'firstName[contains]': 'Jo',
        'experience[gte]': '5',
        'specialty[any]': 'Trauma,Anxiety',
        'city': 'New York'
      });
      
      const filterParams = getFilterParams(request);
      
      expect(filterParams).toHaveLength(4);
    });
  });
  
  describe('buildTextCondition', () => {
    it('should build SQL condition for EQUALS operation', () => {
      const condition = buildTextCondition(
        mockTables.advocates,
        'firstName',
        FilterOperation.EQUALS,
        'John'
      );
      
      // We can't directly compare SQL expressions, so we'll just check that it exists
      expect(condition).toBeDefined();
    });
    
    it('should build SQL condition for CONTAINS operation', () => {
      const condition = buildTextCondition(
        mockTables.advocates,
        'firstName',
        FilterOperation.CONTAINS,
        'Jo'
      );
      
      expect(condition).toBeDefined();
    });
    
    it('should build SQL condition for STARTS_WITH operation', () => {
      const condition = buildTextCondition(
        mockTables.advocates,
        'firstName',
        FilterOperation.STARTS_WITH,
        'Jo'
      );
      
      expect(condition).toBeDefined();
    });
    
    it('should build SQL condition for ENDS_WITH operation', () => {
      const condition = buildTextCondition(
        mockTables.advocates,
        'firstName',
        FilterOperation.ENDS_WITH,
        'hn'
      );
      
      expect(condition).toBeDefined();
    });
    
    it('should throw error for unsupported operation', () => {
      expect(() => {
        buildTextCondition(
          mockTables.advocates,
          'firstName',
          FilterOperation.GREATER_THAN as any,
          'John'
        );
      }).toThrow();
    });
  });
  
  describe('buildExactCondition', () => {
    it('should build SQL condition for EQUALS operation', () => {
      const condition = buildExactCondition(
        mockTables.advocates,
        'degree',
        FilterOperation.EQUALS,
        'MD'
      );
      
      expect(condition).toBeDefined();
    });
    
    it('should build SQL condition for IN operation', () => {
      const condition = buildExactCondition(
        mockTables.advocates,
        'degree',
        FilterOperation.IN,
        ['MD', 'PhD', 'MSW']
      );
      
      expect(condition).toBeDefined();
    });
    
    it('should throw error for unsupported operation', () => {
      expect(() => {
        buildExactCondition(
          mockTables.advocates,
          'degree',
          FilterOperation.CONTAINS as any,
          'MD'
        );
      }).toThrow();
    });
  });
  
  describe('buildRangeCondition', () => {
    it('should build SQL condition for EQUALS operation', () => {
      const condition = buildRangeCondition(
        mockTables.advocates,
        'yearsOfExperience',
        FilterOperation.EQUALS,
        5
      );
      
      expect(condition).toBeDefined();
    });
    
    it('should build SQL condition for GREATER_THAN operation', () => {
      const condition = buildRangeCondition(
        mockTables.advocates,
        'yearsOfExperience',
        FilterOperation.GREATER_THAN,
        5
      );
      
      expect(condition).toBeDefined();
    });
    
    it('should build SQL condition for LESS_THAN operation', () => {
      const condition = buildRangeCondition(
        mockTables.advocates,
        'yearsOfExperience',
        FilterOperation.LESS_THAN,
        10
      );
      
      expect(condition).toBeDefined();
    });
    
    it('should build SQL condition for BETWEEN operation', () => {
      const condition = buildRangeCondition(
        mockTables.advocates,
        'yearsOfExperience',
        FilterOperation.BETWEEN,
        [5, 10]
      );
      
      expect(condition).toBeDefined();
    });
    
    it('should throw error for unsupported operation', () => {
      expect(() => {
        buildRangeCondition(
          mockTables.advocates,
          'yearsOfExperience',
          FilterOperation.CONTAINS as any,
          5
        );
      }).toThrow();
    });
  });
  
  describe('buildFilterConditions', () => {
    it('should build SQL conditions for multiple filters', () => {
      const filters = [
        {
          field: 'firstName',
          operation: FilterOperation.CONTAINS,
          value: 'Jo'
        },
        {
          field: 'yearsOfExperience',
          operation: FilterOperation.GREATER_THAN_OR_EQUAL,
          value: 5
        },
        {
          field: 'degree',
          operation: FilterOperation.EQUALS,
          value: 'MD'
        }
      ];
      
      const conditions = buildFilterConditions(mockTables, filters);
      
      expect(conditions).toHaveLength(3);
    });
    
    it('should handle empty filters array', () => {
      const conditions = buildFilterConditions(mockTables, []);
      
      expect(conditions).toHaveLength(0);
    });
    
    it('should skip filters with unknown fields', () => {
      const filters = [
        {
          field: 'unknownField',
          operation: FilterOperation.EQUALS,
          value: 'value'
        },
        {
          field: 'firstName',
          operation: FilterOperation.CONTAINS,
          value: 'Jo'
        }
      ];
      
      const conditions = buildFilterConditions(mockTables, filters);
      
      expect(conditions).toHaveLength(1);
    });
  });
});
