/**
 * TypeScript interfaces for Advocate components
 */
import { Advocate, PaginationMeta } from '../../api/types/advocate';

/**
 * Props for the AdvocateSearch component
 */
export interface AdvocateSearchProps {
  /** Search term */
  searchTerm: string;
  /** Callback when search term changes */
  onSearchChange: (searchTerm: string) => void;
  /** Callback when reset button is clicked */
  onReset: () => void;
}

/**
 * Props for the AdvocateList component
 */
export interface AdvocateListProps {
  /** List of advocates to display */
  advocates: Advocate[];
  /** Loading state */
  isLoading?: boolean;
  /** Error message if any */
  error?: string | null;
  /** Current sort field */
  sortField?: string;
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Callback when sort changes */
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
}

/**
 * Props for the AdvocateTable component
 */
export interface AdvocateTableProps {
  /** List of advocates to display */
  advocates: Advocate[];
  /** Current sort field */
  sortField?: string;
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Callback when sort changes */
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
}

/**
 * Props for the AdvocateDetails component
 */
export interface AdvocateDetailsProps {
  /** Advocate to display details for */
  advocate: Advocate;
}

/**
 * Props for the AdvocatePage component
 */
export interface AdvocatePageProps {
  /** Initial advocates data (optional) */
  initialData?: {
    advocates: Advocate[];
    pagination?: PaginationMeta;
  };
}
