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
    <div className="page-size-selector" style={{ display: 'flex', alignItems: 'center' }}>
      <label htmlFor="page-size-select" style={{ marginRight: '8px' }}>
        Items per page:
      </label>
      <select
        id="page-size-select"
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #ccc'
        }}
        aria-label="Select number of items per page"
      >
        {pageSizes.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
}
