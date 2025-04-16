/**
 * Utility functions for building API query parameters
 */
import { 
  PaginationParams, 
  SortParams, 
  Filter, 
  TextFilter, 
  NumberFilter, 
  ArrayFilter 
} from '../types/params';

/**
 * Build pagination parameters for API requests
 * @param params Pagination parameters
 * @returns Object with pagination parameters for the API
 */
export function buildPaginationParams(params: PaginationParams): Record<string, any> {
  const { page, limit, cursor, cursorField } = params;
  const result: Record<string, any> = {};

  if (page !== undefined && page > 0) {
    result.page = page;
  }

  if (limit !== undefined && limit > 0) {
    result.limit = limit;
  }

  if (cursor) {
    result.cursor = cursor;
  }

  if (cursorField) {
    result.cursorField = cursorField;
  }

  return result;
}

/**
 * Build sorting parameters for API requests
 * @param params Sorting parameters
 * @returns Object with sorting parameters for the API
 */
export function buildSortParams(params: SortParams): Record<string, any> {
  const { sort, order, secondarySort, secondaryOrder } = params;
  const result: Record<string, any> = {};

  if (sort) {
    result.sort = sort;
  }

  if (order) {
    result.order = order;
  }

  if (secondarySort) {
    result.secondarySort = secondarySort;
  }

  if (secondaryOrder) {
    result.secondaryOrder = secondaryOrder;
  }

  return result;
}

/**
 * Build filter parameters for API requests
 * @param filters Array of filter objects
 * @returns Object with filter parameters for the API
 */
export function buildFilterParams(filters: Filter[]): Record<string, any> {
  const result: Record<string, any> = {};

  filters.forEach(filter => {
    if (isTextFilter(filter)) {
      // Handle text filter
      if (filter.operation === 'eq') {
        // For exact matches, use simple parameter
        result[filter.field] = filter.value;
      } else {
        // For other operations, use operation-specific parameter
        result[`${filter.field}[${filter.operation}]`] = filter.value;
      }
    } else if (isNumberFilter(filter)) {
      // Handle number filter
      if (filter.operation === 'between' && Array.isArray(filter.value)) {
        // For between operation, use comma-separated values
        result[`${filter.field}[${filter.operation}]`] = filter.value.join(',');
      } else if (filter.operation === 'eq') {
        // For exact matches, use simple parameter
        result[filter.field] = filter.value;
      } else {
        // For other operations, use operation-specific parameter
        result[`${filter.field}[${filter.operation}]`] = filter.value;
      }
    } else if (isArrayFilter(filter)) {
      // Handle array filter
      result[`${filter.field}[${filter.operation}]`] = filter.value.join(',');
    }
  });

  return result;
}

/**
 * Build combined query parameters for API requests
 * @param pagination Pagination parameters
 * @param sorting Sorting parameters
 * @param filters Array of filter objects
 * @returns Combined object with all parameters for the API
 */
export function buildQueryParams(
  pagination?: PaginationParams,
  sorting?: SortParams,
  filters?: Filter[]
): Record<string, any> {
  return {
    ...(pagination ? buildPaginationParams(pagination) : {}),
    ...(sorting ? buildSortParams(sorting) : {}),
    ...(filters && filters.length > 0 ? buildFilterParams(filters) : {}),
  };
}

/**
 * Type guards for filter types
 */
function isTextFilter(filter: Filter): filter is TextFilter {
  return ['contains', 'startsWith', 'endsWith', 'eq'].includes(filter.operation);
}

function isNumberFilter(filter: Filter): filter is NumberFilter {
  return ['eq', 'gt', 'gte', 'lt', 'lte', 'between'].includes(filter.operation);
}

function isArrayFilter(filter: Filter): filter is ArrayFilter {
  return ['any', 'all'].includes(filter.operation);
}
