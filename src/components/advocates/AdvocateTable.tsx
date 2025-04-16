/**
 * AdvocateTable component for displaying advocates in a table
 */
import { AdvocateTableProps } from './types';
import { Advocate } from '../../api/types/advocate';
import { AdvocateSortField } from '../../api/types/params';

/**
 * Table component for displaying advocates
 * @param props Component props
 * @returns Table component with advocate data
 */
export function AdvocateTable({ 
  advocates, 
  sortField, 
  sortDirection = 'asc',
  onSortChange 
}: AdvocateTableProps) {
  // Handle column header click for sorting
  const handleSortClick = (field: string) => {
    if (!onSortChange) return;
    
    // If clicking the same field, toggle direction
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newDirection);
  };
  
  // Render sort indicator with CSS classes instead of inline styles
  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return null;
    
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };
  
  // Define sortable columns
  const sortableColumns: {field: AdvocateSortField, label: string}[] = [
    { field: 'firstName', label: 'First Name' },
    { field: 'lastName', label: 'Last Name' },
    { field: 'degree', label: 'Degree' },
    { field: 'yearsOfExperience', label: 'Years of Experience' }
  ];
  
  return (
    <div className="overflow-x-auto">
      <table className="advocate-table w-full">
        <thead>
          <tr>
            {sortableColumns.map(column => {
              // Determine if this column should be hidden on mobile
              const isMobileHidden = column.field === 'yearsOfExperience';
              const columnClass = isMobileHidden ? 'hide-on-mobile' : '';
              
              return (
                <th 
                  key={column.field}
                  onClick={() => handleSortClick(column.field)}
                  className={`text-left p-3 border-b-2 ${sortField === column.field ? 'bg-gray-50 font-bold' : ''} ${onSortChange ? 'cursor-pointer' : ''} ${columnClass}`}
                  aria-sort={sortField === column.field ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {column.label}
                  {renderSortIndicator(column.field)}
                </th>
              );
            })}
            <th className="text-left p-3 border-b-2">City</th>
            <th className="text-left p-3 border-b-2 hide-on-mobile">Specialties</th>
            <th className="text-left p-3 border-b-2">Phone</th>
          </tr>
        </thead>
        <tbody>
          {advocates.map((advocate: Advocate) => (
            <tr key={advocate.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-3 border-b">{advocate.firstName}</td>
              <td className="p-3 border-b">{advocate.lastName}</td>
              <td className="p-3 border-b">{advocate.degree}</td>
              <td className="p-3 border-b hide-on-mobile">{advocate.yearsOfExperience}</td>
              <td className="p-3 border-b">{advocate.city}</td>
              <td className="p-3 border-b hide-on-mobile">
                <div className="flex flex-wrap gap-1">
                  {advocate.specialties.map((specialty, index) => (
                    <span 
                      key={`${advocate.id}-specialty-${index}`}
                      className="inline-block bg-gray-100 text-xs px-2 py-1 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-3 border-b">
                <a 
                  href={`tel:${advocate.phoneNumber.toString().replace(/[^0-9]/g, '')}`}
                  className="text-primary hover:underline"
                >
                  {advocate.phoneNumber}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
