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
  
  // Common button styles
  const buttonStyle = {
    padding: '4px 8px',
    margin: '0 4px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    background: 'white',
    cursor: 'pointer',
    minWidth: '32px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };
  
  // Active page button styles
  const activeButtonStyle = {
    ...buttonStyle,
    background: '#f0f0f0',
    borderColor: '#999',
    fontWeight: 'bold'
  };
  
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
    <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center' }}>
      {/* First page button - only show for page-based pagination */}
      {!useCursorPagination && (
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPreviousPage}
          style={buttonStyle}
          aria-label="Go to first page"
          title="First page"
        >
          &laquo;
        </button>
      )}
      
      {/* Previous page/cursor button */}
      <button
        onClick={handlePrevious}
        disabled={!hasPreviousPage}
        style={buttonStyle}
        aria-label="Go to previous page"
        title="Previous page"
      >
        &lsaquo;
      </button>
      
      {/* Page number buttons - only show for page-based pagination */}
      {!useCursorPagination && pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} style={{ margin: '0 4px' }} aria-hidden="true">
              &hellip;
            </span>
          );
        }
        
        return (
          <button
            key={`page-${page}`}
            onClick={() => onPageChange(page as number)}
            style={currentPage === page ? activeButtonStyle : buttonStyle}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}
      
      {/* Next page/cursor button */}
      <button
        onClick={handleNext}
        disabled={!hasNextPage}
        style={buttonStyle}
        aria-label="Go to next page"
        title="Next page"
      >
        &rsaquo;
      </button>
      
      {/* Last page button - only show for page-based pagination */}
      {!useCursorPagination && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          style={buttonStyle}
          aria-label="Go to last page"
          title="Last page"
        >
          &raquo;
        </button>
      )}
    </div>
  );
}
