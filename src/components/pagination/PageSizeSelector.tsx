/**
 * PageSizeSelector component for selecting page size
 */
import { PageSizeSelectorProps } from './types';

/**
 * Component for selecting the number of items per page
 * @param props Component props
 * @returns Page size selector component
 */
export function PageSizeSelector({ pageSize, pageSizes, onPageSizeChange }: PageSizeSelectorProps) {
  return (
    <div className="page-size-selector">
      <div className="flex items-center">
        <span className="text-base text-gray-500 mr-1">Show</span>
        <div className="relative">
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="appearance-none bg-transparent text-base font-medium text-gray-700 pl-1 pr-5 py-1 focus:outline-none"
            aria-label="Select number of items per page"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
            <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <span className="text-base text-gray-500 ml-1">per page</span>
      </div>
    </div>
  );
}
