/**
 * Pagination component that combines all pagination subcomponents
 */
import { PaginationProps } from './types';
import { PaginationControls } from './PaginationControls';
import { PageSizeSelector } from './PageSizeSelector';
import { PageInfo } from './PageInfo';

/**
 * Default page sizes
 */
const DEFAULT_PAGE_SIZES = [10, 25, 50];

/**
 * Main pagination component that combines controls, page size selector, and info
 * @param props Component props
 * @returns Pagination component with controls and info
 */
export function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  onCursorChange,
  pageSizes = DEFAULT_PAGE_SIZES,
  showPageSizeSelector = true,
  useCursorPagination = false
}: PaginationProps) {
  if (!pagination) return null;
  
  const {
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    hasNextPage,
    hasPreviousPage
  } = pagination;
  
  return (
    <div className="pagination py-4 px-4 bg-white border-t border-gray-100 -mt-px">
      <div className="flex items-center justify-end gap-6">
        {/* Page info */}
        <PageInfo
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
        />
        
        {/* Pagination controls */}
        <div className="flex items-center">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onPageChange={onPageChange}
            useCursorPagination={useCursorPagination}
            onCursorChange={onCursorChange}
          />
        </div>
        
        {/* Page size selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <PageSizeSelector
            pageSize={pageSize}
            pageSizes={pageSizes}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </div>
    </div>
  );
}
