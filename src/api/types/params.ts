/**
 * API parameter interfaces for pagination, sorting, and filtering
 */

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  cursorField?: string;
}

/**
 * Sort direction type
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Allowed advocate sort fields
 */
export type AdvocateSortField = 
  | 'firstName'
  | 'lastName'
  | 'degree'
  | 'yearsOfExperience'
  | 'createdAt'
  | 'updatedAt';

/**
 * Sorting parameters
 */
export interface SortParams {
  sort?: AdvocateSortField;
  order?: SortDirection;
  secondarySort?: AdvocateSortField;
  secondaryOrder?: SortDirection;
}

/**
 * Filter operation types
 */
export type TextFilterOperation = 'contains' | 'startsWith' | 'endsWith' | 'eq';
export type NumberFilterOperation = 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';
export type ArrayFilterOperation = 'any' | 'all';

/**
 * Text filter parameters
 */
export interface TextFilter {
  field: string;
  operation: TextFilterOperation;
  value: string;
}

/**
 * Number filter parameters
 */
export interface NumberFilter {
  field: string;
  operation: NumberFilterOperation;
  value: number | [number, number]; // For 'between' operation, we use a tuple
}

/**
 * Array filter parameters
 */
export interface ArrayFilter {
  field: string;
  operation: ArrayFilterOperation;
  value: string[];
}

/**
 * Combined filter type
 */
export type Filter = TextFilter | NumberFilter | ArrayFilter;

/**
 * Complete API query parameters
 */
export interface AdvocateQueryParams extends PaginationParams, SortParams {
  filters?: Filter[];
}
