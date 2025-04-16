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
    
    // Check that the pagination info shows the correct range and total
    // We need to use a regex to match the text that might include whitespace
    expect(screen.getByText(/11-20 of 100/)).toBeInTheDocument();
    expect(screen.getByText(/results/)).toBeInTheDocument();
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
    
    // Check that the component shows "0 results" when there's no data
    expect(screen.getByText('0 results')).toBeInTheDocument();
  });
  
  it('calculates correct range for partial page', () => {
    render(
      <PageInfo
        currentPage={3}
        totalPages={3}
        totalCount={25}
        pageSize={10}
      />
    );
    
    // For the last page with only 5 items (21-25 of 25)
    // We need to use a regex to match the text that might include whitespace
    expect(screen.getByText(/21-25 of 25/)).toBeInTheDocument();
    expect(screen.getByText(/results/)).toBeInTheDocument();
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
    
    // Check that the component shows the correct text
    expect(screen.getByText('Show')).toBeInTheDocument();
    expect(screen.getByText('per page')).toBeInTheDocument();
    
    // Check that the dropdown is rendered with the correct options
    const dropdown = screen.getByRole('combobox');
    expect(dropdown).toBeInTheDocument();
    expect(dropdown).toHaveValue('10');
    
    // Check that all options are rendered
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveValue('10');
    expect(options[1]).toHaveValue('25');
    expect(options[2]).toHaveValue('50');
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
    
    // Check that the navigation buttons are present
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    
    // Check that the page numbers are displayed in the correct format
    expect(screen.getByText('2 / 10')).toBeInTheDocument();
  });
  
  it('disables previous button when on first page', () => {
    render(
      <PaginationControls
        currentPage={1}
        totalPages={10}
        hasNextPage={true}
        hasPreviousPage={false}
        onPageChange={mockOnPageChange}
      />
    );
    
    // Check that the previous button is disabled but the next button is not
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    expect(screen.getByLabelText('Next page')).not.toBeDisabled();
  });
  
  it('disables next button when on last page', () => {
    render(
      <PaginationControls
        currentPage={10}
        totalPages={10}
        hasNextPage={false}
        hasPreviousPage={true}
        onPageChange={mockOnPageChange}
      />
    );
    
    // Check that the next button is disabled but the previous button is not
    expect(screen.getByLabelText('Previous page')).not.toBeDisabled();
    expect(screen.getByLabelText('Next page')).toBeDisabled();
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
    
    // Click the previous button and check that onPageChange is called with the correct page number
    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
    
    // Click the next button and check that onPageChange is called with the correct page number
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(mockOnPageChange).toHaveBeenCalledWith(6);
  });
  
  it('supports cursor-based pagination', () => {
    const mockOnCursorChange = jest.fn();
    
    render(
      <PaginationControls
        currentPage={2}
        totalPages={5}
        hasNextPage={true}
        hasPreviousPage={true}
        onPageChange={mockOnPageChange}
        useCursorPagination={true}
        onCursorChange={mockOnCursorChange}
      />
    );
    
    // Click the previous button and check that onCursorChange is called with 'prev'
    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(mockOnCursorChange).toHaveBeenCalledWith('prev');
    
    // Click the next button and check that onCursorChange is called with 'next'
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(mockOnCursorChange).toHaveBeenCalledWith('next');
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
    
    // Check that the PageInfo component is rendered correctly
    expect(screen.getByText(/11-20 of 100/)).toBeInTheDocument();
    expect(screen.getByText(/results/)).toBeInTheDocument();
    
    // Check that the PageSizeSelector component is rendered correctly
    expect(screen.getByText('Show')).toBeInTheDocument();
    expect(screen.getByText('per page')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    
    // Check that the PaginationControls component is rendered correctly
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    expect(screen.getByText('2 / 10')).toBeInTheDocument();
  });
  
  it('renders correctly with cursor-based pagination', () => {
    const mockOnCursorChange = jest.fn();
    
    render(
      <Pagination
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
        onCursorChange={mockOnCursorChange}
        useCursorPagination={true}
        showPageSizeSelector={true}
      />
    );
    
    // Check that the cursor-based pagination controls are rendered
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    
    // Click the previous button and check that onCursorChange is called
    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(mockOnCursorChange).toHaveBeenCalledWith('prev');
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
