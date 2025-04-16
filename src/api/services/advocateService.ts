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
   * Search advocates by text query
   * @param query Search query
   * @param pagination Pagination parameters
   * @returns Promise resolving to advocate data and pagination metadata
   */
  async searchAdvocates(
    query: string,
    pagination?: PaginationParams
  ): Promise<{ data: Advocate[], pagination: PaginationMeta }> {
    // Create filters for searching by name, degree, and specialties
    const filters: Filter[] = [
      {
        field: 'firstName',
        operation: 'contains',
        value: query
      },
      {
        field: 'lastName',
        operation: 'contains',
        value: query
      },
      {
        field: 'degree',
        operation: 'contains',
        value: query
      },
      {
        field: 'specialty',
        operation: 'any',
        value: [query]
      },
      {
        field: 'city',
        operation: 'contains',
        value: query
      }
    ];
    
    return this.getAdvocates(pagination, undefined, filters);
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
