/**
 * AdvocatePage component that combines all advocate-related components
 */
import { AdvocatePageProps } from './types';
import { AdvocateSearch } from './AdvocateSearch';
import { AdvocateList } from './AdvocateList';
import { useAdvocates } from '../../hooks/useAdvocates';

/**
 * Main page component for advocates that combines search and list components
 * @param props Component props
 * @returns Complete advocate page with search and list
 */
export function AdvocatePage({ initialData }: AdvocatePageProps) {
  // Use our custom hook to manage advocates data and search functionality
  const {
    filteredAdvocates,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    resetSearch
  } = useAdvocates();

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
      </div>
    </div>
  );
}
