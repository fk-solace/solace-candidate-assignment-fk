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
    <div className="pagination" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        {/* Page info */}
        <PageInfo
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
        />
        
        {/* Page size selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <PageSizeSelector
            pageSize={pageSize}
            pageSizes={pageSizes}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </div>
      
      {/* Pagination controls */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
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
    </div>
  );
}
