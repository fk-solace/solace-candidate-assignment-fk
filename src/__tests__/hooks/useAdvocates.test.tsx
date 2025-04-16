/**
 * Tests for useAdvocates hook
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAdvocates } from '../../hooks/useAdvocates';
import { advocateService } from '../../api';

// Mock router push function
const mockRouterPush = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  useSearchParams: () => ({
    get: (param: string) => null,
    toString: () => '',
  }),
}));

// Mock advocate service
jest.mock('../../api', () => {
  const mockGetAdvocates = jest.fn();
  return {
    advocateService: {
      getAdvocates: mockGetAdvocates,
      searchAdvocates: jest.fn(),
      getAdvocatesByCursor: jest.fn(),
    },
  };
});

describe('useAdvocates hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API response
    (advocateService.getAdvocates as jest.Mock).mockResolvedValue({
      data: [
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
          updatedAt: new Date().toISOString(),
        },
      ],
      pagination: {
        totalCount: 1,
        pageSize: 10,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });

  it('should initialize with default values', async () => {
    // Define the mock data to be returned
    const mockData = [
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
        updatedAt: new Date().toISOString(),
      }
    ];
    
    const mockPaginationData = {
      totalCount: 1,
      pageSize: 10,
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
    
    // Mock the API response for initial load
    (advocateService.getAdvocates as jest.Mock).mockResolvedValue({
      data: mockData,
      pagination: mockPaginationData,
    });
    
    // Render the hook without any options to test defaults
    const { result } = renderHook(() => useAdvocates());
    
    // Initial state should show loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the initial fetch to complete
    await waitFor(() => {
      return result.current.isLoading === false;
    });
    
    // Assert default values
    expect(result.current.advocates).toEqual(mockData);
    expect(result.current.pagination).toEqual(mockPaginationData);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.sortParams.sort).toBe('createdAt');
    expect(result.current.sortParams.order).toBe('desc');
    expect(result.current.useCursorPagination).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle sort changes and update URL', async () => {
    // Arrange
    const { result, rerender } = renderHook(() => useAdvocates({
      initialSortField: 'lastName',
      initialSortDirection: 'desc',
      syncWithUrl: true
    }));
    
    // Act - change sort
    act(() => {
      result.current.handleSortChange('firstName', 'asc');
    });
    
    // Force re-render to update state
    rerender();
    
    // Assert - sort params should be updated
    expect(result.current.sortParams.sort).toBe('firstName');
    expect(result.current.sortParams.order).toBe('asc');
    
    // Assert - URL should be updated
    expect(mockRouterPush).toHaveBeenCalledWith(
      expect.stringContaining('sort=firstName'),
      expect.anything()
    );
    expect(mockRouterPush).toHaveBeenCalledWith(
      expect.stringContaining('order=asc'),
      expect.anything()
    );
  }, 10000);
  
  it('should toggle sort direction when clicking the same field', async () => {
    // Arrange
    const { result, rerender } = renderHook(() => useAdvocates({
      initialSortField: 'firstName',
      initialSortDirection: 'asc',
    }));
    
    // Act - change sort to same field but desc
    act(() => {
      result.current.handleSortChange('firstName', 'desc');
    });
    
    // Force re-render to update state
    rerender();
    
    // Assert - sort params should be updated
    expect(result.current.sortParams.sort).toBe('firstName');
    expect(result.current.sortParams.order).toBe('desc');
  }, 10000);
});
