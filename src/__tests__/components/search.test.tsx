/**
 * Tests for the advocate search functionality
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvocateSearch } from '../../components/advocates/AdvocateSearch';

describe('AdvocateSearch component', () => {
  const mockOnSearchChange = jest.fn();
  const mockOnReset = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the search input and reset button', () => {
    render(
      <AdvocateSearch
        searchTerm=""
        onSearchChange={mockOnSearchChange}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.getByPlaceholderText(/search by name, degree, location, or specialty/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });
  
  it('displays the search term when provided', () => {
    render(
      <AdvocateSearch
        searchTerm="cardiology"
        onSearchChange={mockOnSearchChange}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.getByText(/searching for:/i)).toBeInTheDocument();
    expect(screen.getByText('cardiology')).toBeInTheDocument();
  });
  
  it('calls onSearchChange when input changes', () => {
    render(
      <AdvocateSearch
        searchTerm=""
        onSearchChange={mockOnSearchChange}
        onReset={mockOnReset}
      />
    );
    
    const input = screen.getByPlaceholderText(/search by name, degree, location, or specialty/i);
    fireEvent.change(input, { target: { value: 'test search' } });
    
    expect(mockOnSearchChange).toHaveBeenCalledWith('test search');
  });
  
  it('calls onReset when reset button is clicked', () => {
    render(
      <AdvocateSearch
        searchTerm="test"
        onSearchChange={mockOnSearchChange}
        onReset={mockOnReset}
      />
    );
    
    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);
    
    expect(mockOnReset).toHaveBeenCalled();
  });
  
  it('calls onReset when escape key is pressed', () => {
    render(
      <AdvocateSearch
        searchTerm="test"
        onSearchChange={mockOnSearchChange}
        onReset={mockOnReset}
      />
    );
    
    const input = screen.getByPlaceholderText(/search by name, degree, location, or specialty/i);
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    
    expect(mockOnReset).toHaveBeenCalled();
  });
  
  it('displays result count when provided', () => {
    render(
      <AdvocateSearch
        searchTerm="test"
        onSearchChange={mockOnSearchChange}
        onReset={mockOnReset}
        resultCount={5}
      />
    );
    
    expect(screen.getByText(/5 results found/i)).toBeInTheDocument();
  });
  
  it('shows singular result text when only one result', () => {
    render(
      <AdvocateSearch
        searchTerm="test"
        onSearchChange={mockOnSearchChange}
        onReset={mockOnReset}
        resultCount={1}
      />
    );
    
    expect(screen.getByText(/1 result found/i)).toBeInTheDocument();
  });
});
