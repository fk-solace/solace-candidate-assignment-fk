/**
 * AdvocateTable component for displaying advocates in a table
 */
import { AdvocateTableProps } from './types';
import { Advocate } from '../../api/types/advocate';

/**
 * Table component for displaying advocates
 * @param props Component props
 * @returns Table component with advocate data
 */
export function AdvocateTable({ advocates }: AdvocateTableProps) {
  return (
    <table className="advocate-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>First Name</th>
          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Last Name</th>
          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>City</th>
          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Degree</th>
          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Specialties</th>
          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Years of Experience</th>
          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Phone Number</th>
        </tr>
      </thead>
      <tbody>
        {advocates.map((advocate: Advocate) => (
          <tr key={advocate.id}>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{advocate.firstName}</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{advocate.lastName}</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{advocate.city}</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{advocate.degree}</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
              {advocate.specialties.map((specialty, index) => (
                <div key={`${advocate.id}-specialty-${index}`}>{specialty}</div>
              ))}
            </td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{advocate.yearsOfExperience}</td>
            <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{advocate.phoneNumber}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
