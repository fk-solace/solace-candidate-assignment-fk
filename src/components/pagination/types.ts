/**
 * TypeScript interfaces for pagination components
 */
import { PaginationMeta } from '../../api/types/advocate';

/**
 * Props for the Pagination component
 */
export interface PaginationProps {
  /** Pagination metadata */
  pagination: PaginationMeta;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
  /** Callback for cursor-based navigation */
  onCursorChange?: (direction: 'next' | 'prev') => void;
  /** Available page sizes */
  pageSizes?: number[];
  /** Whether to show the page size selector */
  showPageSizeSelector?: boolean;
  /** Whether to show the page number input */
  showPageNumberInput?: boolean;
  /** Whether to use cursor-based pagination */
  useCursorPagination?: boolean;
}

/**
 * Props for the PaginationControls component
 */
export interface PaginationControlsProps {
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Whether to use cursor-based pagination */
  useCursorPagination?: boolean;
  /** Callback for cursor-based navigation */
  onCursorChange?: (direction: 'next' | 'prev') => void;
}

/**
 * Props for the PageSizeSelector component
 */
export interface PageSizeSelectorProps {
  /** Current page size */
  pageSize: number;
  /** Available page sizes */
  pageSizes: number[];
  /** Callback when page size changes */
  onPageSizeChange: (pageSize: number) => void;
}

/**
 * Props for the PageInfo component
 */
export interface PageInfoProps {
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  totalCount: number;
  /** Current page size */
  pageSize: number;
}
