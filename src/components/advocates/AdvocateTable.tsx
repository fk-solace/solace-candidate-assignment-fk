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
  
  // Render sort indicator
  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return null;
    
    return (
      <span style={{ marginLeft: '4px' }}>
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };
  
  // Style for sortable headers
  const getSortableHeaderStyle = (field: string) => {
    const baseStyle = { 
      textAlign: 'left' as const, 
      padding: '8px', 
      borderBottom: '1px solid #ddd',
      cursor: onSortChange ? 'pointer' : 'default'
    };
    
    // Highlight the current sort field
    if (sortField === field) {
      return {
        ...baseStyle,
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold' as const
      };
    }
    
    return baseStyle;
  };
  
  // Define sortable columns
  const sortableColumns: {field: AdvocateSortField, label: string}[] = [
    { field: 'firstName', label: 'First Name' },
    { field: 'lastName', label: 'Last Name' },
    { field: 'degree', label: 'Degree' },
    { field: 'yearsOfExperience', label: 'Years of Experience' }
  ];
  
  return (
    <table className="advocate-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          {sortableColumns.map(column => (
            <th 
              key={column.field}
              onClick={() => handleSortClick(column.field)}
              style={getSortableHeaderStyle(column.field)}
              aria-sort={sortField === column.field ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
            >
              {column.label}
              {renderSortIndicator(column.field)}
            </th>
          ))}
          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>City</th>
          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Specialties</th>
          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Phone Number</th>
        </tr>
      </thead>
      <tbody>
        {advocates.map((advocate: Advocate) => (
          <tr key={advocate.id}>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{advocate.firstName}</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{advocate.lastName}</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{advocate.degree}</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{advocate.yearsOfExperience}</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{advocate.city}</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
              {advocate.specialties.map((specialty, index) => (
                <div key={`${advocate.id}-specialty-${index}`}>{specialty}</div>
              ))}
            </td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{advocate.phoneNumber}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
