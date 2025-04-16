/**
 * Tests for advocate components
 */
import { render, screen } from '@testing-library/react';
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
  it('renders search input and reset button', () => {
    render(
      <AdvocateSearch
        searchTerm="test"
        onSearchChange={mockOnSearchChange}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.getByPlaceholderText(/search by name, phone, degree, location, or specialty/i)).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('Searching for:')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});

describe('AdvocateTable', () => {
  it('renders table with advocate data', () => {
    render(<AdvocateTable advocates={mockAdvocates} />);
    
    // Check table headers
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('Degree')).toBeInTheDocument();
    expect(screen.getByText('Specialties')).toBeInTheDocument();
    expect(screen.getByText('Years of Experience')).toBeInTheDocument();
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
    
    // Check advocate data
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('MD')).toBeInTheDocument();
    expect(screen.getByText('Trauma')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('Smith')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles')).toBeInTheDocument();
    expect(screen.getByText('PhD')).toBeInTheDocument();
    expect(screen.getByText('Depression')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('9876543210')).toBeInTheDocument();
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
