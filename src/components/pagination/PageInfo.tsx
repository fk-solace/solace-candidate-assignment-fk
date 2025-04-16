/**
 * PageInfo component for displaying pagination information
 */
import { PageInfoProps } from './types';

/**
 * Component for displaying pagination information
 * @param props Component props
 * @returns Page info component
 */
export function PageInfo({ currentPage, totalPages, totalCount, pageSize }: PageInfoProps) {
  // Calculate the range of items being displayed
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="page-info" style={{ fontSize: '0.9rem', color: '#666' }}>
      <p>
        Showing {totalCount > 0 ? `${start}-${end} of ${totalCount}` : '0'} items
        {totalPages > 0 && ` • Page ${currentPage} of ${totalPages}`}
      </p>
    </div>
  );
}
