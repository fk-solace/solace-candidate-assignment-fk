/**
 * Tests for pagination components
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination, PaginationControls, PageSizeSelector, PageInfo } from '../../components/pagination';
import { PaginationMeta } from '../../api/types/advocate';

// Mock pagination metadata
const mockPagination: PaginationMeta = {
  totalCount: 100,
  pageSize: 10,
  currentPage: 2,
  totalPages: 10,
  hasNextPage: true,
  hasPreviousPage: true
};

// Mock callbacks
const mockOnPageChange = jest.fn();
const mockOnPageSizeChange = jest.fn();

describe('PageInfo', () => {
  it('renders pagination information correctly', () => {
    render(
      <PageInfo
        currentPage={2}
        totalPages={10}
        totalCount={100}
        pageSize={10}
      />
    );
    
    expect(screen.getByText(/Showing.*11-20 of 100.*items/)).toBeInTheDocument();
    expect(screen.getByText(/Page 2 of 10/)).toBeInTheDocument();
  });
  
  it('handles empty data correctly', () => {
    render(
      <PageInfo
        currentPage={1}
        totalPages={0}
        totalCount={0}
        pageSize={10}
      />
    );
    
    expect(screen.getByText('Showing 0 items')).toBeInTheDocument();
  });
});

describe('PageSizeSelector', () => {
  it('renders page size options correctly', () => {
    render(
      <PageSizeSelector
        pageSize={10}
        pageSizes={[10, 25, 50]}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    
    expect(screen.getByText('Items per page:')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getAllByRole('option').length).toBe(3);
  });
  
  it('calls onPageSizeChange when selection changes', () => {
    render(
      <PageSizeSelector
        pageSize={10}
        pageSizes={[10, 25, 50]}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '25' } });
    expect(mockOnPageSizeChange).toHaveBeenCalledWith(25);
  });
});

describe('PaginationControls', () => {
  it('renders pagination controls correctly', () => {
    render(
      <PaginationControls
        currentPage={2}
        totalPages={10}
        hasNextPage={true}
        hasPreviousPage={true}
        onPageChange={mockOnPageChange}
      />
    );
    
    // First, previous, next, and last buttons
    expect(screen.getByTitle('First page')).toBeInTheDocument();
    expect(screen.getByTitle('Previous page')).toBeInTheDocument();
    expect(screen.getByTitle('Next page')).toBeInTheDocument();
    expect(screen.getByTitle('Last page')).toBeInTheDocument();
    
    // Page numbers
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
  
  it('disables buttons appropriately when on first page', () => {
    render(
      <PaginationControls
        currentPage={1}
        totalPages={10}
        hasNextPage={true}
        hasPreviousPage={false}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByTitle('First page')).toBeDisabled();
    expect(screen.getByTitle('Previous page')).toBeDisabled();
    expect(screen.getByTitle('Next page')).not.toBeDisabled();
    expect(screen.getByTitle('Last page')).not.toBeDisabled();
  });
  
  it('disables buttons appropriately when on last page', () => {
    render(
      <PaginationControls
        currentPage={10}
        totalPages={10}
        hasNextPage={false}
        hasPreviousPage={true}
        onPageChange={mockOnPageChange}
      />
    );
    
    expect(screen.getByTitle('First page')).not.toBeDisabled();
    expect(screen.getByTitle('Previous page')).not.toBeDisabled();
    expect(screen.getByTitle('Next page')).toBeDisabled();
    expect(screen.getByTitle('Last page')).toBeDisabled();
  });
  
  it('calls onPageChange with correct page number when buttons are clicked', () => {
    render(
      <PaginationControls
        currentPage={5}
        totalPages={10}
        hasNextPage={true}
        hasPreviousPage={true}
        onPageChange={mockOnPageChange}
      />
    );
    
    fireEvent.click(screen.getByTitle('First page'));
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
    
    fireEvent.click(screen.getByTitle('Previous page'));
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
    
    fireEvent.click(screen.getByTitle('Next page'));
    expect(mockOnPageChange).toHaveBeenCalledWith(6);
    
    fireEvent.click(screen.getByTitle('Last page'));
    expect(mockOnPageChange).toHaveBeenCalledWith(10);
    
    // Since our test is rendering with currentPage=5, we need to click on a page number that's visible
    // Let's click on page 6 which should be visible in the pagination controls
    fireEvent.click(screen.getByRole('button', { name: 'Go to page 6' }));
    expect(mockOnPageChange).toHaveBeenCalledWith(6);
  });
});

describe('Pagination', () => {
  it('renders all pagination components correctly', () => {
    render(
      <Pagination
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        pageSizes={[10, 25, 50]}
        showPageSizeSelector={true}
      />
    );
    
    // Page info
    expect(screen.getByText(/Showing.*11-20 of 100.*items/)).toBeInTheDocument();
    
    // Page size selector
    expect(screen.getByText('Items per page:')).toBeInTheDocument();
    
    // Pagination controls
    expect(screen.getByTitle('First page')).toBeInTheDocument();
    expect(screen.getByTitle('Previous page')).toBeInTheDocument();
    expect(screen.getByTitle('Next page')).toBeInTheDocument();
    expect(screen.getByTitle('Last page')).toBeInTheDocument();
  });
  
  it('does not render page size selector when showPageSizeSelector is false', () => {
    render(
      <Pagination
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
        showPageSizeSelector={false}
      />
    );
    
    expect(screen.queryByText('Items per page:')).not.toBeInTheDocument();
  });
});
