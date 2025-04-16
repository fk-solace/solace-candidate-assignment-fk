/**
 * Custom hook for fetching and managing advocate data
 */
import { useState, useEffect, useCallback } from 'react';
import { advocateService } from '../api';
import { Advocate, PaginationMeta } from '../api/types/advocate';

interface UseAdvocatesResult {
  advocates: Advocate[];
  filteredAdvocates: Advocate[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  resetSearch: () => void;
}

/**
 * Custom hook for fetching and managing advocate data
 * @returns Advocate data and methods for managing it
 */
export function useAdvocates(): UseAdvocatesResult {
  // State for advocates data
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  // State for filtered advocates
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  // State for pagination metadata
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  // State for loading status
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // State for error message
  const [error, setError] = useState<string | null>(null);
  // State for search term
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch advocates data
  useEffect(() => {
    async function fetchAdvocates() {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, pagination } = await advocateService.getAdvocates();
        
        setAdvocates(data);
        setFilteredAdvocates(data);
        setPagination(pagination);
      } catch (error) {
        console.error('Error fetching advocates:', error);
        setError('Failed to fetch advocates. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAdvocates();
  }, []);

  // Filter advocates when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAdvocates(advocates);
      return;
    }
    
    const filtered = advocates.filter((advocate) => {
      const term = searchTerm.toLowerCase();
      
      // Check if any of the advocate's fields include the search term
      return (
        advocate.firstName.toLowerCase().includes(term) ||
        advocate.lastName.toLowerCase().includes(term) ||
        advocate.city.toLowerCase().includes(term) ||
        advocate.degree.toLowerCase().includes(term) ||
        // Check if any specialty includes the search term
        advocate.specialties.some(specialty => 
          specialty.toLowerCase().includes(term)
        ) ||
        // Convert yearsOfExperience to string for searching
        String(advocate.yearsOfExperience).includes(term)
      );
    });
    
    setFilteredAdvocates(filtered);
  }, [searchTerm, advocates]);

  // Reset search term
  const resetSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  return {
    advocates,
    filteredAdvocates,
    pagination,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    resetSearch,
  };
}
