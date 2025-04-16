/**
 * Custom hook for fetching and managing advocate data with pagination
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { advocateService } from '../api';
import { Advocate, PaginationMeta } from '../api/types/advocate';
import { PaginationParams, SortParams } from '../api/types/params';

interface UseAdvocatesResult {
  advocates: Advocate[];
  filteredAdvocates: Advocate[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  resetSearch: () => void;
  // Pagination methods
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  // Cursor-based pagination
  handleCursorNavigation: (direction: 'next' | 'prev') => void;
  // Sorting
  handleSortChange: (field: string, direction?: 'asc' | 'desc') => void;
  sortParams: SortParams;
  // Flags
  useCursorPagination: boolean;
}

interface UseAdvocatesOptions {
  initialPage?: number;
  initialPageSize?: number;
  initialSortField?: string;
  initialSortDirection?: 'asc' | 'desc';
  useCursorPagination?: boolean;
  syncWithUrl?: boolean;
}

/**
 * Custom hook for fetching and managing advocate data with pagination
 * @param options Hook options
 * @returns Advocate data and methods for managing it
 */
export function useAdvocates(options: UseAdvocatesOptions = {}): UseAdvocatesResult {
  const {
    initialPage = 1,
    initialPageSize = 10,
    initialSortField = 'createdAt',
    initialSortDirection = 'desc',
    useCursorPagination = false,
    syncWithUrl = true
  } = options;
  
  // Next.js router and search params
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for advocates data
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  // State for filtered advocates
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  // State for pagination metadata
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  // State for loading and error
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // State for search term
  const [searchTerm, setSearchTerm] = useState<string>('');
  // State for sorting parameters
  const [sortParams, setSortParams] = useState<SortParams>({
    sort: initialSortField as any,
    order: initialSortDirection
  });

  // We're using the advocateService imported at the top of the file
  
  /**
   * Sync URL parameters with state
   */
  useEffect(() => {
    if (syncWithUrl) {
      // Get parameters from URL
      const pageParam = searchParams.get('page');
      const limitParam = searchParams.get('limit');
      const cursorParam = searchParams.get('cursor');
      const directionParam = searchParams.get('direction');
      const sortParam = searchParams.get('sort');
      const orderParam = searchParams.get('order');
      const searchParam = searchParams.get('search');
      
      // Update state based on URL parameters
      if (pageParam) setCurrentPage(parseInt(pageParam, 10));
      if (limitParam) setPageSize(parseInt(limitParam, 10));
      if (cursorParam) setCursor(cursorParam);
      if (searchParam) setSearchTerm(searchParam);
      
      // Update sort params
      if (sortParam) {
        setSortParams({
          sort: sortParam as any,
          order: orderParam as any || 'asc'
        });
      }
    }
  }, [searchParams, syncWithUrl]);
  
  /**
   * Update URL with current state
   */
  const updateUrl = useCallback(() => {
    if (!syncWithUrl) return;
    
    const params = new URLSearchParams();
    
    // Add pagination params
    if (useCursorPagination && cursor) {
      params.set('cursor', cursor);
    } else {
      params.set('page', currentPage.toString());
    }
    
    params.set('limit', pageSize.toString());
    
    // Add sort params
    if (sortParams.sort) {
      params.set('sort', sortParams.sort);
      if (sortParams.order) params.set('order', sortParams.order);
    }
    
    // Add search term
    if (searchTerm) params.set('search', searchTerm);
    
    // Update URL without refreshing the page
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, currentPage, pageSize, cursor, sortParams, searchTerm, syncWithUrl, useCursorPagination]);
  
  /**
   * Fetch advocates data
   */
  const fetchAdvocates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (useCursorPagination && cursor) {
        // Use cursor-based pagination
        result = await advocateService.getAdvocatesByCursor(
          cursor,
          'next',
          pageSize,
          sortParams
        );
      } else if (searchTerm.trim() !== '') {
        // Use search with pagination
        result = await advocateService.searchAdvocates(
          searchTerm,
          { page: currentPage, limit: pageSize }
        );
      } else {
        // Use regular pagination
        result = await advocateService.getAdvocates(
          { page: currentPage, limit: pageSize },
          sortParams
        );
      }
      
      // Verify that we have valid data before updating state
      if (result && Array.isArray(result.data)) {
        setAdvocates(result.data);
        setFilteredAdvocates(result.data);
        
        if (result.pagination) {
          setPagination(result.pagination);
          
          // Update cursor if available
          if (result.pagination.nextCursor) {
            setCursor(result.pagination.nextCursor);
          }
        }
        
        // Update URL params
        updateUrl();
      } else {
        console.error('Invalid response format:', result);
        setError('Received invalid data format from the server.');
      }
    } catch (error: any) {
      console.error('Error fetching advocates:', error);
      
      // Provide more specific error messages based on the error type
      if (error.status === 404) {
        setError('The requested resource was not found.');
      } else if (error.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error.message) {
        setError(`Error: ${error.message}`);
      } else {
        setError('Failed to fetch advocates. Please try again later.');
      }
      
      // Set empty data to prevent displaying stale data
      setAdvocates([]);
      setFilteredAdvocates([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, cursor, sortParams, searchTerm, useCursorPagination, updateUrl]);
  
  /**
   * Handle page change
   */
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);
  
  /**
   * Handle page size change
   */
  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);
  
  /**
   * Handle cursor-based navigation
   */
  const handleCursorNavigation = useCallback((direction: 'next' | 'prev') => {
    if (!pagination) return;
    
    if (direction === 'next' && pagination.nextCursor) {
      setCursor(pagination.nextCursor);
    } else if (direction === 'prev' && pagination.prevCursor) {
      setCursor(pagination.prevCursor);
    }
  }, [pagination]);
  
  /**
   * Handle sort change
   */
  const handleSortChange = useCallback((field: string, direction?: 'asc' | 'desc') => {
    // Update sort params state
    setSortParams({
      sort: field as any,
      order: direction || 'asc'
    });
    
    // Immediately update URL if sync is enabled
    if (syncWithUrl) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('sort', field);
      params.set('order', direction || 'asc');
      
      // Keep other params intact
      if (!useCursorPagination) {
        params.set('page', currentPage.toString());
      }
      params.set('limit', pageSize.toString());
      
      // Update URL without refreshing the page
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [router, searchParams, syncWithUrl, useCursorPagination, currentPage, pageSize]);
  
  /**
   * Reset search
   */
  const resetSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1); // Reset to first page when clearing search
    
    if (syncWithUrl) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('search');
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [router, searchParams, syncWithUrl]);
  
  // Fetch advocates on mount and when pagination or sort changes
  useEffect(() => {
    fetchAdvocates();
  }, [fetchAdvocates]);
  
  // Debounce search term changes to improve performance
  useEffect(() => {
    // Skip if search term is empty
    if (searchTerm.trim() === '') {
      setFilteredAdvocates(advocates);
      return;
    }
    
    // Set a debounce timer to avoid filtering on every keystroke
    const debounceTimer = setTimeout(() => {
      const searchLower = searchTerm.toLowerCase();
      
      const filtered = advocates.filter(advocate => {
        // Search across multiple fields for better results
        return (
          // Name fields
          `${advocate.firstName} ${advocate.lastName}`.toLowerCase().includes(searchLower) ||
          advocate.firstName.toLowerCase().includes(searchLower) ||
          advocate.lastName.toLowerCase().includes(searchLower) ||
          // Professional fields
          advocate.degree.toLowerCase().includes(searchLower) ||
          // Location fields
          advocate.city.toLowerCase().includes(searchLower) ||
          (advocate.state && advocate.state.toLowerCase().includes(searchLower)) ||
          advocate.country.toLowerCase().includes(searchLower) ||
          // Specialty fields (search within array)
          advocate.specialties.some(specialty => 
            specialty.toLowerCase().includes(searchLower)
          ) ||
          // Phone number search
          String(advocate.phoneNumber).includes(searchLower.replace(/[^0-9]/g, ''))
        );
      });
      
      setFilteredAdvocates(filtered);
      
      // Update URL with search term if URL sync is enabled
      if (syncWithUrl) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('search', searchTerm);
        router.push(`?${params.toString()}`, { scroll: false });
      }
    }, 300); // 300ms debounce delay
    
    // Clean up the timer on component unmount or when search term changes
    return () => clearTimeout(debounceTimer);
  }, [advocates, searchTerm, syncWithUrl, router, searchParams]);

  // Custom setSearchTerm function that also resets to the first page
  const handleSearchTermChange = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when search term changes
    
    if (syncWithUrl) {
      const params = new URLSearchParams(searchParams.toString());
      if (term) {
        params.set('search', term);
      } else {
        params.delete('search');
      }
      params.set('page', '1'); // Reset page parameter to 1
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [router, searchParams, syncWithUrl]);

  // Return the hook result
  return {
    advocates,
    filteredAdvocates,
    pagination,
    isLoading,
    error,
    searchTerm,
    setSearchTerm: handleSearchTermChange,
    resetSearch,
    handlePageChange,
    handlePageSizeChange,
    handleCursorNavigation,
    useCursorPagination,
    handleSortChange,
    sortParams
  };
}
