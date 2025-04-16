/**
 * API Client exports
 */

// Export types
export * from './types/advocate';
export * from './types/params';

// Export utilities
export { ApiClient, ApiError, type ApiResponse } from './utils/apiClient';
export * from './utils/paramBuilders';

// Export services
export { AdvocateService } from './services/advocateService';

// Create and export a default API client instance
import { ApiClient } from './utils/apiClient';

// Create a singleton instance of the API client
const apiClient = new ApiClient();

export { apiClient };

// Create and export a default advocate service instance
import { AdvocateService } from './services/advocateService';

const advocateService = new AdvocateService(apiClient);

export { advocateService };
