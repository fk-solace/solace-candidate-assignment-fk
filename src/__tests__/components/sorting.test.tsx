/**
 * Tests for sorting functionality in the advocate components
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvocateTable } from '../../components/advocates/AdvocateTable';
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
    city: 'New York',
    country: 'USA',
    specialties: ['Cardiology', 'Internal Medicine'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    firstName: 'Alice',
    lastName: 'Smith',
    degree: 'PhD',
    yearsOfExperience: 15,
    phoneNumber: 987654321,
    city: 'Boston',
    country: 'USA',
    specialties: ['Neurology', 'Research'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    firstName: 'Bob',
    lastName: 'Johnson',
    degree: 'RN',
    yearsOfExperience: 5,
    phoneNumber: 5551234567,
    city: 'Chicago',
    country: 'USA',
    specialties: ['Pediatrics'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock sort change handler
const mockSortChange = jest.fn();

describe('AdvocateTable sorting', () => {
  beforeEach(() => {
    mockSortChange.mockClear();
  });
  
  it('renders sortable column headers', () => {
    render(
      <AdvocateTable 
        advocates={mockAdvocates} 
        onSortChange={mockSortChange}
      />
    );
    
    // Check for sortable columns
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Degree')).toBeInTheDocument();
    expect(screen.getByText('Years of Experience')).toBeInTheDocument();
  });
  
  it('calls onSortChange when clicking a sortable column header', () => {
    render(
      <AdvocateTable 
        advocates={mockAdvocates} 
        onSortChange={mockSortChange}
      />
    );
    
    // Click on the First Name column header
    fireEvent.click(screen.getByText('First Name'));
    
    // Check if onSortChange was called with the correct parameters
    expect(mockSortChange).toHaveBeenCalledWith('firstName', 'asc');
  });
  
  it('toggles sort direction when clicking the same column header twice', () => {
    render(
      <AdvocateTable 
        advocates={mockAdvocates} 
        sortField="firstName"
        sortDirection="asc"
        onSortChange={mockSortChange}
      />
    );
    
    // Click on the First Name column header
    fireEvent.click(screen.getByText('First Name'));
    
    // Check if onSortChange was called with the correct parameters
    expect(mockSortChange).toHaveBeenCalledWith('firstName', 'desc');
  });
  
  it('displays ascending sort indicator', () => {
    render(
      <AdvocateTable 
        advocates={mockAdvocates} 
        sortField="firstName"
        sortDirection="asc"
        onSortChange={mockSortChange}
      />
    );
    
    // Check for the sort indicator
    const firstNameHeader = screen.getByText('First Name').closest('th');
    expect(firstNameHeader).toHaveAttribute('aria-sort', 'ascending');
  });
  
  it('displays descending sort indicator', () => {
    render(
      <AdvocateTable 
        advocates={mockAdvocates} 
        sortField="firstName"
        sortDirection="desc"
        onSortChange={mockSortChange}
      />
    );
    
    // Check for the sort indicator
    const firstNameHeader = screen.getByText('First Name').closest('th');
    expect(firstNameHeader).toHaveAttribute('aria-sort', 'descending');
  });
});
