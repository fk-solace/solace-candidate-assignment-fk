import { NextRequest } from 'next/server';

/**
 * Default pagination values
 */
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;
export const ALLOWED_PAGE_SIZES = [5, 10, 25, 50];

/**
 * Interface for pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  cursorField?: string;
}

/**
 * Interface for cursor data
 */
export interface CursorData {
  field: string;
  value: string | number | Date;
  direction: 'forward' | 'backward';
}

/**
 * Interface for pagination metadata in response
 */
export interface PaginationMeta {
  totalCount: number;
  pageSize: number;
  currentPage?: number;
  totalPages?: number;
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
  nextCursor?: string;
  prevCursor?: string;
  cursorField?: string;
}

/**
 * Interface for paginated response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Parse pagination parameters from request
 * Supports both cursor-based and offset-based pagination
 * 
 * @param request NextRequest object
 * @returns Parsed pagination parameters
 */
export function getPaginationParams(request: NextRequest): PaginationParams {
  const searchParams = request.nextUrl.searchParams;
  
  // Get cursor for cursor-based pagination
  const cursor = searchParams.get('cursor') || undefined;
  const cursorField = searchParams.get('cursorField') || undefined;
  
  // Get page and limit for offset-based pagination
  let page = parseInt(searchParams.get('page') || '1');
  page = isNaN(page) || page < 1 ? 1 : page;
  
  let limit = parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE));
  
  // Validate limit against allowed values
  if (!ALLOWED_PAGE_SIZES.includes(limit)) {
    limit = DEFAULT_PAGE_SIZE;
  }
  
  // Ensure limit doesn't exceed maximum
  limit = Math.min(limit, MAX_PAGE_SIZE);
  
  return { page, limit, cursor, cursorField };
}

/**
 * Decode a cursor string into cursor data
 * 
 * @param cursor Encoded cursor string
 * @returns Decoded cursor data or undefined if invalid
 */
export function decodeCursor(cursor?: string): CursorData | undefined {
  if (!cursor) return undefined;
  
  try {
    // Base64 decode and parse the cursor
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const cursorData = JSON.parse(decoded) as CursorData;
    
    // Validate cursor data
    if (!cursorData.field || cursorData.direction === undefined) {
      return undefined;
    }
    
    return cursorData;
  } catch (error) {
    console.error('Error decoding cursor:', error);
    return undefined;
  }
}

/**
 * Encode cursor data into a cursor string
 * 
 * @param field Field name to use as cursor
 * @param value Field value
 * @param direction Pagination direction
 * @returns Encoded cursor string
 */
export function encodeCursor(field: string, value: string | number | Date, direction: 'forward' | 'backward'): string {
  const cursorData: CursorData = { field, value, direction };
  const encoded = Buffer.from(JSON.stringify(cursorData)).toString('base64');
  return encoded;
}

/**
 * Calculate offset for pagination
 * 
 * @param page Page number (1-based)
 * @param limit Items per page
 * @returns Offset value
 */
export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Generate pagination metadata for response
 * 
 * @param totalCount Total number of items
 * @param params Pagination parameters
 * @param currentItems Current page items
 * @param getItemCursorValue Function to extract cursor value from an item
 * @returns Pagination metadata
 */
export function getPaginationMeta<T>(
  totalCount: number,
  params: PaginationParams,
  currentItems: T[],
  getItemCursorValue?: (item: T) => string | number | Date
): PaginationMeta {
  const { page = 1, limit = DEFAULT_PAGE_SIZE, cursor, cursorField = 'id' } = params;
  
  // Calculate total pages for offset-based pagination
  const totalPages = Math.ceil(totalCount / limit);
  
  // Determine if there are more pages
  const hasNextPage = cursor 
    ? currentItems.length === limit 
    : page < totalPages;
  
  let nextCursor: string | undefined;
  let prevCursor: string | undefined;
  
  // Generate cursors if we have a function to extract cursor values
  if (getItemCursorValue && currentItems.length > 0) {
    // For next cursor, use the last item
    if (hasNextPage) {
      const lastItem = currentItems[currentItems.length - 1];
      const lastValue = getItemCursorValue(lastItem);
      nextCursor = encodeCursor(cursorField, lastValue, 'forward');
    }
    
    // For previous cursor, use the first item
    if (page > 1 || cursor) {
      const firstItem = currentItems[0];
      const firstValue = getItemCursorValue(firstItem);
      prevCursor = encodeCursor(cursorField, firstValue, 'backward');
    }
  }
  
  return {
    totalCount,
    pageSize: limit,
    currentPage: cursor ? undefined : page,
    totalPages: cursor ? undefined : totalPages,
    hasNextPage,
    hasPreviousPage: cursor ? !!prevCursor : page > 1,
    nextCursor,
    prevCursor,
    cursorField
  };
}

/**
 * Generate Link headers for pagination following RFC 5988
 * 
 * @param request NextRequest object
 * @param pagination Pagination metadata
 * @returns Link header string
 */
export function getLinkHeader(
  request: NextRequest,
  pagination: PaginationMeta
): string {
  const { currentPage, totalPages, nextCursor, prevCursor } = pagination;
  const links: string[] = [];
  
  // Base URL without pagination parameters
  const url = new URL(request.url);
  const baseUrl = `${url.origin}${url.pathname}`;
  
  // Helper to create a link with updated parameters
  const createLink = (rel: string, params: Record<string, string>) => {
    const linkUrl = new URL(baseUrl);
    
    // Copy existing query parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      if (!['page', 'limit', 'cursor'].includes(key)) {
        linkUrl.searchParams.set(key, value);
      }
    });
    
    // Add pagination parameters
    Object.entries(params).forEach(([key, value]) => {
      linkUrl.searchParams.set(key, value);
    });
    
    return `<${linkUrl.toString()}>; rel="${rel}"`;
  };
  
  // For cursor-based pagination
  if (nextCursor) {
    links.push(createLink('next', { cursor: nextCursor }));
  }
  
  if (prevCursor) {
    links.push(createLink('prev', { cursor: prevCursor }));
  }
  
  // For offset-based pagination
  if (currentPage !== undefined && totalPages !== undefined) {
    // First page
    links.push(createLink('first', { page: '1', limit: pagination.pageSize.toString() }));
    
    // Last page
    links.push(createLink('last', { page: totalPages.toString(), limit: pagination.pageSize.toString() }));
    
    // Next page
    if (currentPage < totalPages) {
      links.push(createLink('next', { 
        page: (currentPage + 1).toString(),
        limit: pagination.pageSize.toString()
      }));
    }
    
    // Previous page
    if (currentPage > 1) {
      links.push(createLink('prev', {
        page: (currentPage - 1).toString(),
        limit: pagination.pageSize.toString()
      }));
    }
  }
  
  return links.join(', ');
}

/**
 * Apply pagination to a SQL query
 * 
 * @param params Pagination parameters
 * @returns SQL conditions for pagination
 */
export function applyPagination(params: PaginationParams): {
  limit: number;
  offset?: number;
} {
  const { page = 1, limit = DEFAULT_PAGE_SIZE } = params;
  
  // For cursor-based pagination, we would add a WHERE condition here
  // but for now, we're implementing offset-based pagination
  
  return {
    limit,
    offset: getOffset(page, limit)
  };
}
