/**
 * Advocate API service
 */
import { ApiClient } from '../utils/apiClient';
import { buildQueryParams } from '../utils/paramBuilders';
import { 
  Advocate, 
  AdvocateResponse, 
  PaginationMeta 
} from '../types/advocate';
import {
  PaginationParams,
  SortParams,
  Filter
} from '../types/params';

/**
 * Service for interacting with the Advocates API
 */
export class AdvocateService {
  private apiClient: ApiClient;
  private baseEndpoint: string;

  /**
   * Create a new AdvocateService
   * @param apiClient API client instance
   * @param baseEndpoint Base endpoint for advocate API
   */
  constructor(apiClient: ApiClient, baseEndpoint: string = '/api/advocates') {
    this.apiClient = apiClient;
    this.baseEndpoint = baseEndpoint;
  }

  /**
   * Get a list of advocates with pagination, sorting, and filtering
   * @param pagination Pagination parameters
   * @param sorting Sorting parameters
   * @param filters Array of filter objects
   * @returns Promise resolving to advocate data and pagination metadata
   */
  async getAdvocates(
    pagination?: PaginationParams,
    sorting?: SortParams,
    filters?: Filter[]
  ): Promise<{ data: Advocate[], pagination: PaginationMeta }> {
    const params = buildQueryParams(pagination, sorting, filters);
    
    const response = await this.apiClient.get<AdvocateResponse>(
      this.baseEndpoint,
      params
    );
    
    return {
      data: response.data.data,
      pagination: response.data.pagination
    };
  }

  /**
   * Get advocates using cursor-based pagination
   * @param cursor Cursor for pagination
   * @param direction Direction for cursor-based pagination
   * @param limit Number of items per page
   * @param sorting Sorting parameters
   * @param filters Array of filter objects
   * @returns Promise resolving to advocate data and pagination metadata
   */
  async getAdvocatesByCursor(
    cursor?: string,
    direction: 'next' | 'prev' = 'next',
    limit: number = 10,
    sorting?: SortParams,
    filters?: Filter[]
  ): Promise<{ data: Advocate[], pagination: PaginationMeta }> {
    const pagination: PaginationParams = {
      cursor,
      direction,
      limit
    };
    
    return this.getAdvocates(pagination, sorting, filters);
  }

  /**
   * Get a single advocate by ID
   * @param id Advocate ID
   * @returns Promise resolving to advocate data
   */
  async getAdvocateById(id: string): Promise<Advocate> {
    const response = await this.apiClient.get<{ success: boolean, data: Advocate }>(
      `${this.baseEndpoint}/${id}`
    );
    
    return response.data.data;
  }

  /**
   * Search advocates by query string
   * @param query Search query
   * @param pagination Pagination parameters
   * @returns Promise resolving to advocate data and pagination metadata
   */
  async searchAdvocates(
    query: string,
    pagination?: PaginationParams
  ): Promise<{ data: Advocate[], pagination: PaginationMeta }> {
    try {
      // First try to get all advocates
      const allAdvocates = await this.getAdvocates(pagination);
      
      if (!allAdvocates || !allAdvocates.data) {
        throw new Error('Failed to fetch advocates data');
      }
      
      // Perform client-side filtering for more reliable results
      const searchLower = query.toLowerCase();
      
      // Filter the advocates based on the search query
      const filteredData = allAdvocates.data.filter(advocate => {
        // Convert phone number to string for searching
        const phoneStr = advocate.phoneNumber.toString();
        
        // Remove non-numeric characters from search query for phone number comparison
        const numericSearch = searchLower.replace(/\D/g, '');
        
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
          // Phone number search (both formatted and numeric)
          phoneStr.includes(numericSearch) ||
          // Also try to match partial phone numbers
          (numericSearch.length >= 3 && phoneStr.includes(numericSearch))
        );
      });
      
      // Create pagination metadata for the filtered results
      const totalCount = filteredData.length;
      const pageSize = pagination?.limit || 10;
      const currentPage = pagination?.page || 1;
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // Paginate the filtered results
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      return {
        data: paginatedData,
        pagination: {
          totalCount,
          pageSize,
          currentPage,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1
        }
      };
    } catch (error) {
      console.error('Error in searchAdvocates:', error);
      throw error;
    }
  }

  /**
   * Filter advocates by years of experience range
   * @param min Minimum years of experience
   * @param max Maximum years of experience
   * @param pagination Pagination parameters
   * @param sorting Sorting parameters
   * @returns Promise resolving to advocate data and pagination metadata
   */
  async filterByExperience(
    min: number,
    max: number,
    pagination?: PaginationParams,
    sorting?: SortParams
  ): Promise<{ data: Advocate[], pagination: PaginationMeta }> {
    const filters: Filter[] = [
      {
        field: 'yearsOfExperience',
        operation: 'between',
        value: [min, max]
      }
    ];
    
    return this.getAdvocates(pagination, sorting, filters);
  }

  /**
   * Filter advocates by specialties
   * @param specialties Array of specialties
   * @param matchAll If true, advocates must have all specialties; if false, any specialty matches
   * @param pagination Pagination parameters
   * @param sorting Sorting parameters
   * @returns Promise resolving to advocate data and pagination metadata
   */
  async filterBySpecialties(
    specialties: string[],
    matchAll: boolean = false,
    pagination?: PaginationParams,
    sorting?: SortParams
  ): Promise<{ data: Advocate[], pagination: PaginationMeta }> {
    const filters: Filter[] = [
      {
        field: 'specialty',
        operation: matchAll ? 'all' : 'any',
        value: specialties
      }
    ];
    
    return this.getAdvocates(pagination, sorting, filters);
  }

  /**
   * Filter advocates by location
   * @param city City name
   * @param pagination Pagination parameters
   * @param sorting Sorting parameters
   * @returns Promise resolving to advocate data and pagination metadata
   */
  async filterByLocation(
    city: string,
    pagination?: PaginationParams,
    sorting?: SortParams
  ): Promise<{ data: Advocate[], pagination: PaginationMeta }> {
    const filters: Filter[] = [
      {
        field: 'city',
        operation: 'contains',
        value: city
      }
    ];
    
    return this.getAdvocates(pagination, sorting, filters);
  }
}
