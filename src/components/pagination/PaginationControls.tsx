/**
 * PaginationControls component for navigating between pages
 */
import { PaginationControlsProps } from './types';

/**
 * Pagination controls component for navigating between pages
 * @param props Component props
 * @returns Pagination controls with buttons for first, previous, next, and last pages
 */
export function PaginationControls({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  useCursorPagination = false,
  onCursorChange
}: PaginationControlsProps) {
  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    // If we have 7 or fewer pages, show all of them
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }
    
    // Always include first page
    pageNumbers.push(1);
    
    // Calculate start and end of page range around current page
    let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(2, endPage - maxPagesToShow + 1);
    }
    
    // Add ellipsis if needed before startPage
    if (startPage > 2) {
      pageNumbers.push('...');
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis if needed after endPage
    if (endPage < totalPages - 1) {
      pageNumbers.push('...');
    }
    
    // Always include last page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  const pageNumbers = getPageNumbers();
  
  // We'll use CSS classes instead of inline styles
  
  // Handle navigation based on pagination type
  const handlePrevious = () => {
    if (useCursorPagination && onCursorChange) {
      onCursorChange('prev');
    } else {
      onPageChange(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (useCursorPagination && onCursorChange) {
      onCursorChange('next');
    } else {
      onPageChange(currentPage + 1);
    }
  };
  
  return (
    <nav aria-label="Pagination" className="pagination-controls">
      <div className="inline-flex items-center">
        {/* Page info for cursor pagination */}
        {useCursorPagination && (
          <div className="mr-2 text-sm text-gray-500">
            {currentPage} / {totalPages}
          </div>
        )}
        
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={!hasPreviousPage}
          className={`flex items-center justify-center w-10 h-10 rounded text-xl ${hasPreviousPage ? 'text-primary hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
          aria-label="Previous page"
        >
          ←
        </button>
        
        {/* Page dropdown or display */}
        {!useCursorPagination && (
          <div className="inline-flex items-center mx-2">
            <span className="text-base text-gray-600 font-medium whitespace-nowrap">
              {currentPage} / {totalPages}
            </span>
          </div>
        )}
        
        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={!hasNextPage}
          className={`flex items-center justify-center w-10 h-10 rounded text-xl ${hasNextPage ? 'text-primary hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
          aria-label="Next page"
        >
          →
        </button>
      </div>
    </nav>
  );
}
