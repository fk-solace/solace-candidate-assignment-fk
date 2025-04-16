import { NextRequest } from 'next/server';
import { SQL, and, eq, gt, gte, ilike, inArray, lt, lte, or, sql } from 'drizzle-orm';

/**
 * Filter types for different field types
 */
export enum FilterType {
  TEXT = 'text',
  EXACT = 'exact',
  RANGE = 'range',
  ARRAY = 'array',
  LOCATION = 'location'
}

/**
 * Filter operation types
 */
export enum FilterOperation {
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  BETWEEN = 'between',
  IN = 'in',
  ANY = 'any',
  ALL = 'all'
}

/**
 * Filter definition for a field
 */
export interface FilterDefinition {
  field: string;
  type: FilterType;
  operations: FilterOperation[];
  paramName?: string;
}

/**
 * Filter value from request
 */
export interface FilterValue {
  field: string;
  operation: FilterOperation;
  value: string | string[] | number | number[] | boolean;
}

/**
 * Allowed filter fields for advocates
 */
export const ADVOCATE_FILTERS: FilterDefinition[] = [
  {
    field: 'firstName',
    type: FilterType.TEXT,
    operations: [
      FilterOperation.EQUALS,
      FilterOperation.CONTAINS,
      FilterOperation.STARTS_WITH,
      FilterOperation.ENDS_WITH
    ],
    paramName: 'firstName'
  },
  {
    field: 'lastName',
    type: FilterType.TEXT,
    operations: [
      FilterOperation.EQUALS,
      FilterOperation.CONTAINS,
      FilterOperation.STARTS_WITH,
      FilterOperation.ENDS_WITH
    ],
    paramName: 'lastName'
  },
  {
    field: 'degree',
    type: FilterType.EXACT,
    operations: [
      FilterOperation.EQUALS,
      FilterOperation.IN
    ],
    paramName: 'degree'
  },
  {
    field: 'yearsOfExperience',
    type: FilterType.RANGE,
    operations: [
      FilterOperation.EQUALS,
      FilterOperation.GREATER_THAN,
      FilterOperation.GREATER_THAN_OR_EQUAL,
      FilterOperation.LESS_THAN,
      FilterOperation.LESS_THAN_OR_EQUAL,
      FilterOperation.BETWEEN
    ],
    paramName: 'experience'
  },
  {
    field: 'specialties',
    type: FilterType.ARRAY,
    operations: [
      FilterOperation.ANY,
      FilterOperation.ALL
    ],
    paramName: 'specialty'
  },
  {
    field: 'city',
    type: FilterType.TEXT,
    operations: [
      FilterOperation.EQUALS,
      FilterOperation.CONTAINS
    ],
    paramName: 'city'
  },
  {
    field: 'createdAt',
    type: FilterType.RANGE,
    operations: [
      FilterOperation.GREATER_THAN,
      FilterOperation.GREATER_THAN_OR_EQUAL,
      FilterOperation.LESS_THAN,
      FilterOperation.LESS_THAN_OR_EQUAL,
      FilterOperation.BETWEEN
    ],
    paramName: 'createdAt'
  }
];

/**
 * Parse filter parameters from request
 * 
 * @param request NextRequest object
 * @returns Array of parsed filter values
 */
export function getFilterParams(request: NextRequest): FilterValue[] {
  const searchParams = request.nextUrl.searchParams;
  const filters: FilterValue[] = [];
  
  // Process each filter definition
  for (const filterDef of ADVOCATE_FILTERS) {
    const { field, operations, paramName } = filterDef;
    const paramKey = paramName || field;
    
    // Check for basic equality filter (e.g., firstName=John)
    const basicValue = searchParams.get(paramKey);
    if (basicValue && operations.includes(FilterOperation.EQUALS)) {
      filters.push({
        field,
        operation: FilterOperation.EQUALS,
        value: basicValue
      });
      continue; // Skip other operations for this field
    }
    
    // Check for operation-specific filters (e.g., firstName[contains]=John)
    for (const operation of operations) {
      const operationValue = searchParams.get(`${paramKey}[${operation}]`);
      
      if (operationValue) {
        // Handle array values for IN, ANY, ALL operations
        if ([FilterOperation.IN, FilterOperation.ANY, FilterOperation.ALL].includes(operation)) {
          const arrayValue = operationValue.split(',').map(v => v.trim());
          filters.push({
            field,
            operation,
            value: arrayValue
          });
        } 
        // Handle range values for BETWEEN operation
        else if (operation === FilterOperation.BETWEEN) {
          const [min, max] = operationValue.split(',').map(v => parseFloat(v.trim()));
          if (!isNaN(min) && !isNaN(max)) {
            filters.push({
              field,
              operation,
              value: [min, max]
            });
          }
        } 
        // Handle numeric values for comparison operations
        else if ([
          FilterOperation.GREATER_THAN,
          FilterOperation.GREATER_THAN_OR_EQUAL,
          FilterOperation.LESS_THAN,
          FilterOperation.LESS_THAN_OR_EQUAL
        ].includes(operation)) {
          const numValue = parseFloat(operationValue);
          if (!isNaN(numValue)) {
            filters.push({
              field,
              operation,
              value: numValue
            });
          }
        } 
        // Handle string values for text operations
        else {
          filters.push({
            field,
            operation,
            value: operationValue
          });
        }
      }
    }
  }
  
  return filters;
}

/**
 * Build SQL conditions for text search
 * 
 * @param table Table object from schema
 * @param field Field name
 * @param operation Filter operation
 * @param value Filter value
 * @returns SQL condition
 */
export function buildTextCondition<T extends Record<string, any>>(
  table: T,
  field: string,
  operation: FilterOperation,
  value: string
): SQL {
  const columnRef = table[field as keyof T];
  
  switch (operation) {
    case FilterOperation.EQUALS:
      return eq(columnRef, value);
    case FilterOperation.CONTAINS:
      return ilike(columnRef, `%${value}%`);
    case FilterOperation.STARTS_WITH:
      return ilike(columnRef, `${value}%`);
    case FilterOperation.ENDS_WITH:
      return ilike(columnRef, `%${value}`);
    default:
      throw new Error(`Unsupported operation ${operation} for text field ${field}`);
  }
}

/**
 * Build SQL conditions for exact match
 * 
 * @param table Table object from schema
 * @param field Field name
 * @param operation Filter operation
 * @param value Filter value
 * @returns SQL condition
 */
export function buildExactCondition<T extends Record<string, any>>(
  table: T,
  field: string,
  operation: FilterOperation,
  value: string | string[]
): SQL {
  const columnRef = table[field as keyof T];
  
  switch (operation) {
    case FilterOperation.EQUALS:
      return eq(columnRef, value as string);
    case FilterOperation.IN:
      return inArray(columnRef, value as string[]);
    default:
      throw new Error(`Unsupported operation ${operation} for exact field ${field}`);
  }
}

/**
 * Build SQL conditions for range filter
 * 
 * @param table Table object from schema
 * @param field Field name
 * @param operation Filter operation
 * @param value Filter value
 * @returns SQL condition
 */
export function buildRangeCondition<T extends Record<string, any>>(
  table: T,
  field: string,
  operation: FilterOperation,
  value: number | number[]
): SQL {
  const columnRef = table[field as keyof T];
  
  switch (operation) {
    case FilterOperation.EQUALS:
      return eq(columnRef, value as number);
    case FilterOperation.GREATER_THAN:
      return gt(columnRef, value as number);
    case FilterOperation.GREATER_THAN_OR_EQUAL:
      return gte(columnRef, value as number);
    case FilterOperation.LESS_THAN:
      return lt(columnRef, value as number);
    case FilterOperation.LESS_THAN_OR_EQUAL:
      return lte(columnRef, value as number);
    case FilterOperation.BETWEEN:
      const [min, max] = value as number[];
      return and(
        gte(columnRef, min),
        lte(columnRef, max)
      );
    default:
      throw new Error(`Unsupported operation ${operation} for range field ${field}`);
  }
}

/**
 * Build SQL conditions for array field filtering
 * 
 * @param specialtyTable Specialty table object from schema
 * @param advocateSpecialtyTable Advocate-specialty junction table object from schema
 * @param operation Filter operation
 * @param value Filter value
 * @returns SQL condition
 */
export function buildArrayCondition<T extends Record<string, any>, J extends Record<string, any>>(
  specialtyTable: T,
  advocateSpecialtyTable: J,
  operation: FilterOperation,
  value: string[]
): SQL {
  // For specialty filtering, we need to use subqueries
  // This is a simplified version - in a real app, this would be more complex
  
  switch (operation) {
    case FilterOperation.ANY:
      // At least one of the specialties matches
      return sql`EXISTS (
        SELECT 1 FROM ${advocateSpecialtyTable} AS as_junction
        JOIN ${specialtyTable} AS s ON as_junction.specialty_id = s.id
        WHERE as_junction.advocate_id = ${advocateSpecialtyTable}.advocate_id
        AND s.name IN (${value.join(',')})
      )`;
    case FilterOperation.ALL:
      // All of the specified specialties match
      return sql`(
        SELECT COUNT(DISTINCT s.name)
        FROM ${advocateSpecialtyTable} AS as_junction
        JOIN ${specialtyTable} AS s ON as_junction.specialty_id = s.id
        WHERE as_junction.advocate_id = ${advocateSpecialtyTable}.advocate_id
        AND s.name IN (${value.join(',')})
      ) = ${value.length}`;
    default:
      throw new Error(`Unsupported operation ${operation} for array field specialties`);
  }
}

/**
 * Build SQL conditions for location-based filtering
 * 
 * @param locationTable Location table object from schema
 * @param operation Filter operation
 * @param value Filter value
 * @returns SQL condition
 */
export function buildLocationCondition<T extends Record<string, any>>(
  locationTable: T,
  operation: FilterOperation,
  value: string
): SQL {
  const cityColumn = locationTable['city' as keyof T];
  
  switch (operation) {
    case FilterOperation.EQUALS:
      return eq(cityColumn, value);
    case FilterOperation.CONTAINS:
      return ilike(cityColumn, `%${value}%`);
    default:
      throw new Error(`Unsupported operation ${operation} for location field`);
  }
}

/**
 * Generate SQL conditions for all filters
 * 
 * @param tables Object containing all required tables
 * @param filters Array of filter values
 * @returns Array of SQL conditions
 */
export function buildFilterConditions(
  tables: {
    advocates: Record<string, any>;
    specialties: Record<string, any>;
    advocateSpecialties: Record<string, any>;
    locations: Record<string, any>;
  },
  filters: FilterValue[]
): SQL[] {
  const conditions: SQL[] = [];
  
  for (const filter of filters) {
    const { field, operation, value } = filter;
    
    // Find the filter definition for this field
    const filterDef = ADVOCATE_FILTERS.find(def => def.field === field);
    if (!filterDef) continue;
    
    try {
      let condition: SQL | undefined;
      
      switch (filterDef.type) {
        case FilterType.TEXT:
          if (field === 'city') {
            condition = buildLocationCondition(
              tables.locations,
              operation,
              value as string
            );
          } else {
            condition = buildTextCondition(
              tables.advocates,
              field,
              operation,
              value as string
            );
          }
          break;
        case FilterType.EXACT:
          condition = buildExactCondition(
            tables.advocates,
            field,
            operation,
            value as string | string[]
          );
          break;
        case FilterType.RANGE:
          condition = buildRangeCondition(
            tables.advocates,
            field,
            operation,
            value as number | number[]
          );
          break;
        case FilterType.ARRAY:
          if (field === 'specialties') {
            condition = buildArrayCondition(
              tables.specialties,
              tables.advocateSpecialties,
              operation,
              value as string[]
            );
          }
          break;
      }
      
      if (condition) {
        conditions.push(condition);
      }
    } catch (error) {
      console.error(`Error building condition for ${field} with operation ${operation}:`, error);
      // Skip this filter if there's an error
    }
  }
  
  return conditions;
}
