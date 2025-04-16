/**
 * AdvocateSearch component for searching advocates
 */
import { ChangeEvent } from 'react';
import { AdvocateSearchProps } from './types';

/**
 * Search component for filtering advocates
 * @param props Component props
 * @returns Search component with input and reset button
 */
export function AdvocateSearch({ searchTerm, onSearchChange, onReset }: AdvocateSearchProps) {
  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="advocate-search">
      <div className="search-header">
        <h2>Search</h2>
        {searchTerm && (
          <p className="search-term">
            Searching for: <span>{searchTerm}</span>
          </p>
        )}
      </div>
      
      <div className="search-controls">
        <input
          type="text"
          placeholder="Search advocates..."
          value={searchTerm}
          onChange={handleChange}
          className="search-input"
          style={{ border: "1px solid black", padding: "8px", marginRight: "8px" }}
        />
        <button 
          onClick={onReset}
          className="reset-button"
          style={{ padding: "8px 16px" }}
        >
          Reset Search
        </button>
      </div>
    </div>
  );
}
