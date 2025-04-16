/**
 * TypeScript interfaces for Advocate API models
 */

/**
 * Base Advocate interface
 */
export interface Advocate {
  id: string;
  firstName: string;
  lastName: string;
  degree: string;
  yearsOfExperience: number;
  phoneNumber: number;
  specialties: string[];
  city: string;
  state?: string;
  country: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Specialty interface
 */
export interface Specialty {
  id: string;
  name: string;
  description?: string;
}

/**
 * Location interface
 */
export interface Location {
  id: string;
  advocateId: string;
  city: string;
  state?: string;
  country: string;
}

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * API Response interface for Advocates
 */
export interface AdvocateResponse {
  success: boolean;
  data: Advocate[];
  pagination: PaginationMeta;
}

/**
 * API Error Response interface
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}
