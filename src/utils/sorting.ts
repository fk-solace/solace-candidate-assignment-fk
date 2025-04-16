import { NextRequest } from 'next/server';
import { SQL, asc, desc, sql } from 'drizzle-orm';

/**
 * Allowed sort fields for advocates
 */
export const ALLOWED_ADVOCATE_SORT_FIELDS = [
  'firstName',
  'lastName',
  'degree',
  'yearsOfExperience',
  'createdAt',
  'updatedAt',
] as const;

/**
 * Type for allowed sort fields
 */
export type AllowedAdvocateSortField = typeof ALLOWED_ADVOCATE_SORT_FIELDS[number];

/**
 * Sort direction type
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Interface for sort parameters
 */
export interface SortParams {
  field: AllowedAdvocateSortField;
  direction: SortDirection;
  secondaryField?: AllowedAdvocateSortField;
  secondaryDirection?: SortDirection;
}

/**
 * Default sort parameters
 */
export const DEFAULT_SORT: SortParams = {
  field: 'createdAt',
  direction: 'desc'
};

/**
 * Parse sort parameters from request
 * 
 * @param request NextRequest object
 * @returns Parsed sort parameters
 */
export function getSortParams(request: NextRequest): SortParams {
  const searchParams = request.nextUrl.searchParams;
  
  // Get sort field and direction
  const sortField = searchParams.get('sort') || DEFAULT_SORT.field;
  const sortDirection = searchParams.get('order') || DEFAULT_SORT.direction;
  
  // Get secondary sort field and direction
  const secondarySortField = searchParams.get('secondarySort') || undefined;
  const secondarySortDirection = searchParams.get('secondaryOrder') || 'asc';
  
  // Validate sort field
  const field = ALLOWED_ADVOCATE_SORT_FIELDS.includes(sortField as AllowedAdvocateSortField)
    ? sortField as AllowedAdvocateSortField
    : DEFAULT_SORT.field;
  
  // Validate sort direction
  const direction = ['asc', 'desc'].includes(sortDirection as SortDirection)
    ? sortDirection as SortDirection
    : DEFAULT_SORT.direction;
  
  // Validate secondary sort field
  const secondaryField = secondarySortField && 
    ALLOWED_ADVOCATE_SORT_FIELDS.includes(secondarySortField as AllowedAdvocateSortField)
    ? secondarySortField as AllowedAdvocateSortField
    : undefined;
  
  // Validate secondary sort direction
  const secondaryDirection = ['asc', 'desc'].includes(secondarySortDirection as SortDirection)
    ? secondarySortDirection as SortDirection
    : 'asc';
  
  return {
    field,
    direction,
    secondaryField,
    secondaryDirection: secondaryField ? secondaryDirection : undefined
  };
}

/**
 * Generate SQL sort expressions for the given sort parameters
 * 
 * @param table Table object from schema
 * @param params Sort parameters
 * @returns Array of SQL expressions for ORDER BY clause
 */
export function getSortExpressions<T extends Record<string, any>>(
  table: T,
  params: SortParams
): SQL[] {
  const expressions: SQL[] = [];
  
  // Add primary sort expression
  if (params.field in table) {
    expressions.push(
      params.direction === 'asc'
        ? asc(table[params.field])
        : desc(table[params.field])
    );
  }
  
  // Add secondary sort expression if provided
  if (params.secondaryField && params.secondaryField in table) {
    expressions.push(
      params.secondaryDirection === 'asc'
        ? asc(table[params.secondaryField])
        : desc(table[params.secondaryField])
    );
  }
  
  return expressions;
}

/**
 * Apply case-insensitive sorting for text fields
 * 
 * @param table Table object from schema
 * @param field Field name
 * @param direction Sort direction
 * @returns SQL expression for case-insensitive sorting
 */
export function getCaseInsensitiveSort<T extends Record<string, any>>(
  table: T,
  field: string,
  direction: SortDirection
): SQL {
  return direction === 'asc'
    ? asc(sql`LOWER(${table[field as keyof T]})`)
    : desc(sql`LOWER(${table[field as keyof T]})`);
}

/**
 * Generate SQL sort expressions with case-insensitive sorting for text fields
 * 
 * @param table Table object from schema
 * @param params Sort parameters
 * @param textFields Array of field names that should use case-insensitive sorting
 * @returns Array of SQL expressions for ORDER BY clause
 */
export function getSortExpressionsWithCaseInsensitive<T extends Record<string, any>>(
  table: T,
  params: SortParams,
  textFields: string[] = []
): SQL[] {
  const expressions: SQL[] = [];
  
  // Add primary sort expression
  if (params.field in table) {
    if (textFields.includes(params.field)) {
      expressions.push(getCaseInsensitiveSort(table, params.field, params.direction));
    } else {
      expressions.push(
        params.direction === 'asc'
          ? asc(table[params.field])
          : desc(table[params.field])
      );
    }
  }
  
  // Add secondary sort expression if provided
  if (params.secondaryField && params.secondaryField in table) {
    if (textFields.includes(params.secondaryField)) {
      expressions.push(getCaseInsensitiveSort(table, params.secondaryField, params.secondaryDirection || 'asc'));
    } else {
      expressions.push(
        params.secondaryDirection === 'asc'
          ? asc(table[params.secondaryField])
          : desc(table[params.secondaryField])
      );
    }
  }
  
  return expressions;
}
