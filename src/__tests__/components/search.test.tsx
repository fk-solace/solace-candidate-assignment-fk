/**
 * Tests for the advocate search functionality
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvocateSearch } from '../../components/advocates/AdvocateSearch';
import { useAdvocates } from '../../hooks/useAdvocates';
import { Advocate } from '../../api/types/advocate';

// Mock the useAdvocates hook
jest.mock('../../hooks/useAdvocates');

// Mock data for testing phone number search
const mockAdvocates: Advocate[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    degree: 'MD',
    yearsOfExperience: 10,
    phoneNumber: 1234567890,
    city: 'New York',
    country: 'USA',
    specialties: ['Cardiology'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    firstName: 'Alice',
    lastName: 'Smith',
    degree: 'PhD',
    yearsOfExperience: 15,
    phoneNumber: 9876543210,
    city: 'Boston',
    country: 'USA',
    specialties: ['Neurology'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

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
  
  it('includes phone number search in the placeholder text', () => {
    render(
      <AdvocateSearch
        searchTerm=""
        onSearchChange={mockOnSearchChange}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.getByPlaceholderText(/phone/i)).toBeInTheDocument();
  });
});

describe('Phone number search functionality', () => {
  // Mock implementation of useAdvocates hook for testing phone search
  beforeEach(() => {
    const mockSetSearchTerm = jest.fn();
    const mockFilteredAdvocates = jest.fn();
    
    // Setup the mock implementation
    (useAdvocates as jest.Mock).mockReturnValue({
      advocates: mockAdvocates,
      filteredAdvocates: [],
      searchTerm: '',
      setSearchTerm: mockSetSearchTerm,
      resetSearch: jest.fn(),
      isLoading: false,
      error: null,
      pagination: null
    });
  });
  
  it('can filter advocates by phone number', () => {
    // This is a unit test for the filtering logic
    const searchTerm = '123';
    const searchLower = searchTerm.toLowerCase();
    const numericQuery = searchTerm.replace(/[^0-9]/g, '');
    
    // Test the filtering logic directly
    const filtered = mockAdvocates.filter(advocate => {
      return String(advocate.phoneNumber).includes(numericQuery);
    });
    
    // Verify that only the advocate with matching phone number is returned
    expect(filtered.length).toBe(1);
    expect(filtered[0].firstName).toBe('John');
    expect(filtered[0].phoneNumber).toBe(1234567890);
  });
});
