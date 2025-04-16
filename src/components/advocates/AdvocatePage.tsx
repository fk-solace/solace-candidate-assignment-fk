/**
 * AdvocatePage component that combines all advocate-related components
 */
import { AdvocatePageProps } from './types';
import { AdvocateSearch } from './AdvocateSearch';
import { AdvocateList } from './AdvocateList';
import { useAdvocates } from '../../hooks/useAdvocates';
import { Pagination } from '../pagination';

/**
 * Main page component for advocates that combines search and list components
 * @param props Component props
 * @returns Complete advocate page with search and list
 */
export function AdvocatePage({ initialData }: AdvocatePageProps) {
  // Use our custom hook to manage advocates data and search functionality
  const {
    filteredAdvocates,
    pagination,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    resetSearch,
    handlePageChange,
    handlePageSizeChange,
    handleCursorNavigation,
    useCursorPagination,
    handleSortChange,
    sortParams
  } = useAdvocates({
    initialPage: 1,
    initialPageSize: 10,
    useCursorPagination: false, // Set to true to enable cursor-based pagination
    syncWithUrl: true // Sync pagination state with URL parameters
  });

  return (
    <div className="advocate-page">
      <h1>Solace Advocates</h1>
      
      {/* Search component */}
      <div className="search-container" style={{ marginBottom: '24px' }}>
        <AdvocateSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onReset={resetSearch}
        />
      </div>
      
      {/* List component */}
      <div className="list-container">
        <AdvocateList
          advocates={filteredAdvocates}
          isLoading={isLoading}
          error={error}
        />
        
        {/* Pagination component */}
        {pagination && !isLoading && !error && filteredAdvocates.length > 0 && (
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onCursorChange={handleCursorNavigation}
            pageSizes={[10, 25, 50]}
            showPageSizeSelector={true}
            useCursorPagination={useCursorPagination}
          />
        )}
      </div>
    </div>
  );
}
