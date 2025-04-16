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
      // If query is empty, just return all advocates
      if (!query || query.trim() === '') {
        return this.getAdvocates(pagination);
      }

      // Create an array to store all search promises
      const searchPromises = [];
      
      // Search by first name with contains (supported operation)
      const firstNameParams: Record<string, any> = { ...pagination };
      firstNameParams['firstName[contains]'] = query;
      searchPromises.push(
        this.apiClient.get<AdvocateResponse>(
          this.baseEndpoint,
          firstNameParams
        )
      );
      
      // Search by last name with contains (supported operation)
      const lastNameParams: Record<string, any> = { ...pagination };
      lastNameParams['lastName[contains]'] = query;
      searchPromises.push(
        this.apiClient.get<AdvocateResponse>(
          this.baseEndpoint,
          lastNameParams
        )
      );
      
      // Try to search by phone number (if query is numeric)
      if (/^\d+$/.test(query)) {
        const phoneParams: Record<string, any> = { ...pagination };
        phoneParams['phoneNumber'] = parseInt(query, 10); // Phone is likely a number
        searchPromises.push(
          this.apiClient.get<AdvocateResponse>(
            this.baseEndpoint,
            phoneParams
          )
        );
      }
      
      // Wait for all search requests to complete, handling any errors
      const results = await Promise.allSettled(searchPromises);
      
      // Combine all successful results
      const allAdvocates: Advocate[] = [];
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value?.data?.data) {
          allAdvocates.push(...result.value.data.data);
        }
      });
      
      // Remove duplicates by ID
      const uniqueAdvocates = Array.from(
        new Map(allAdvocates.map(advocate => [advocate.id, advocate])).values()
      );
      
      // Apply pagination to the combined results
      const pageSize = pagination?.limit || 10;
      const currentPage = pagination?.page || 1;
      const totalCount = uniqueAdvocates.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalCount);
      const paginatedData = uniqueAdvocates.slice(startIndex, endIndex);
      
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
