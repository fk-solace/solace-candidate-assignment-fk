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
    <div className="page-info">
      <div className="text-base text-gray-500">
        {totalCount > 0 ? `${start}-${end} of ${totalCount}` : '0'} results
      </div>
    </div>
  );
}
