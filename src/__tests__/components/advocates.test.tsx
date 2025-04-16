/**
 * Tests for advocate components
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvocateSearch, AdvocateTable, AdvocateList } from '../../components/advocates';
import { Advocate } from '../../api/types/advocate';

// Mock data for testing
const mockAdvocates: Advocate[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    degree: 'MD',
    yearsOfExperience: 10,
    phoneNumber: 1234567890,
    specialties: ['Trauma', 'Anxiety'],
    city: 'New York',
    state: 'NY',
    country: 'United States'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    degree: 'PhD',
    yearsOfExperience: 5,
    phoneNumber: 9876543210,
    specialties: ['Depression', 'PTSD'],
    city: 'Los Angeles',
    state: 'CA',
    country: 'United States'
  }
];

// Mock functions
const mockOnSearchChange = jest.fn();
const mockOnReset = jest.fn();

describe('AdvocateSearch', () => {
  it('renders search input with correct placeholder', () => {
    render(
      <AdvocateSearch
        searchTerm="test"
        onSearchChange={mockOnSearchChange}
        onReset={mockOnReset}
      />
    );
    
    // Check for the search input with correct placeholder
    expect(screen.getByPlaceholderText('Search advocates by name and phone number...')).toBeInTheDocument();
  });

  it('shows clear button when search term is provided', () => {
    render(
      <AdvocateSearch
        searchTerm="test"
        onSearchChange={mockOnSearchChange}
        onReset={mockOnReset}
      />
    );
    
    // Check for the clear button (which is an icon button with aria-label)
    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
  });

  it('does not show clear button when search term is empty', () => {
    render(
      <AdvocateSearch
        searchTerm=""
        onSearchChange={mockOnSearchChange}
        onReset={mockOnReset}
      />
    );
    
    // Clear button should not be present
    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
  });

  it('calls onSearchChange when input value changes', () => {
    render(
      <AdvocateSearch
        searchTerm=""
        onSearchChange={mockOnSearchChange}
        onReset={mockOnReset}
      />
    );
    
    // Get the search input
    const searchInput = screen.getByPlaceholderText('Search advocates by name and phone number...');
    
    // Simulate typing in the search input
    fireEvent.change(searchInput, { target: { value: 'new search' } });
    
    // Check if onSearchChange was called with the new value
    expect(mockOnSearchChange).toHaveBeenCalledWith('new search');
  });

  it('calls onReset when clear button is clicked', () => {
    render(
      <AdvocateSearch
        searchTerm="test"
        onSearchChange={mockOnSearchChange}
        onReset={mockOnReset}
      />
    );
    
    // Get the clear button
    const clearButton = screen.getByRole('button', { name: /clear search/i });
    
    // Click the clear button
    fireEvent.click(clearButton);
    
    // Check if onReset was called
    expect(mockOnReset).toHaveBeenCalled();
  });
});

describe('AdvocateTable', () => {
  it('renders table with advocate data', () => {
    render(<AdvocateTable advocates={mockAdvocates} />);
    
    // Check table headers
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Degree')).toBeInTheDocument();
    expect(screen.getByText('Years of Experience')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('Specialties')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    
    // Check advocate data
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('MD')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('Trauma')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('Smith')).toBeInTheDocument();
    expect(screen.getByText('PhD')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles')).toBeInTheDocument();
    expect(screen.getByText('Depression')).toBeInTheDocument();
    expect(screen.getByText('9876543210')).toBeInTheDocument();
  });
  
  it('renders phone numbers as clickable links', () => {
    render(<AdvocateTable advocates={mockAdvocates} />);
    
    // Check that phone numbers are rendered as links with tel: protocol
    const phoneLinks = screen.getAllByRole('link');
    expect(phoneLinks).toHaveLength(2);
    
    expect(phoneLinks[0]).toHaveAttribute('href', 'tel:1234567890');
    expect(phoneLinks[1]).toHaveAttribute('href', 'tel:9876543210');
  });
  
  it('handles sorting when sort props are provided', () => {
    const mockOnSortChange = jest.fn();
    
    render(
      <AdvocateTable 
        advocates={mockAdvocates} 
        sortField="firstName" 
        sortDirection="asc" 
        onSortChange={mockOnSortChange} 
      />
    );
    
    // First Name header should have sort indicator
    const firstNameHeader = screen.getByText('First Name');
    const firstNameCell = firstNameHeader.closest('th');
    expect(firstNameCell).toHaveAttribute('aria-sort', 'ascending');
    
    // Click on Last Name header to sort by it
    const lastNameHeader = screen.getByText('Last Name');
    const lastNameCell = lastNameHeader.closest('th');
    if (lastNameCell) {
      fireEvent.click(lastNameCell);
    }
    
    // onSortChange should be called with the new sort field and direction
    expect(mockOnSortChange).toHaveBeenCalledWith('lastName', 'asc');
  });
});

describe('AdvocateList', () => {
  it('renders loading state', () => {
    render(<AdvocateList advocates={[]} isLoading={true} />);
    
    expect(screen.getByText('Loading advocates...')).toBeInTheDocument();
  });
  
  it('renders error state', () => {
    render(<AdvocateList advocates={[]} error="Test error" />);
    
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();
  });
  
  it('renders empty state', () => {
    render(<AdvocateList advocates={[]} />);
    
    expect(screen.getByText('No advocates found.')).toBeInTheDocument();
  });
  
  it('renders advocate table when data is available', () => {
    render(<AdvocateList advocates={mockAdvocates} />);
    
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  });
});
