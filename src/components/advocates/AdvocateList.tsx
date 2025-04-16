/**
 * AdvocateList component for displaying a list of advocates
 */
import { AdvocateListProps } from './types';
import { AdvocateTable } from './AdvocateTable';

/**
 * List component for displaying advocates with loading and error states
 * @param props Component props
 * @returns List component with advocate data
 */
export function AdvocateList({ advocates, isLoading, error }: AdvocateListProps) {
  // Render loading state
  if (isLoading) {
    return <div className="loading-state">Loading advocates...</div>;
  }
  
  // Render error state
  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }
  
  // Render empty state
  if (advocates.length === 0) {
    return <div className="empty-state">No advocates found.</div>;
  }
  
  // Render advocates table
  return (
    <div className="advocate-list">
      <AdvocateTable advocates={advocates} />
    </div>
  );
}
