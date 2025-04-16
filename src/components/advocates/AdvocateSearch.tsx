/**
 * AdvocateSearch component for searching advocates
 */
import { ChangeEvent, useState, useEffect } from 'react';
import { AdvocateSearchProps } from './types';

/**
 * Search component for filtering advocates
 * @param props Component props
 * @returns Search component with input and reset button
 */
export function AdvocateSearch({ searchTerm, onSearchChange, onReset, resultCount }: AdvocateSearchProps) {
  // Local state for the search input to provide immediate feedback
  const [inputValue, setInputValue] = useState(searchTerm);
  // State to track if the search is active
  const [isSearching, setIsSearching] = useState(false);
  
  // Update local state when the searchTerm prop changes
  useEffect(() => {
    setInputValue(searchTerm);
    // If search term is empty, we're not searching
    setIsSearching(searchTerm.trim() !== '');
  }, [searchTerm]);
  
  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsSearching(value.trim() !== '');
    onSearchChange(value);
  };
  
  // Handle key press events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Clear search on Escape key
    if (e.key === 'Escape') {
      onReset();
    }
  };

  return (
    <div className="advocate-search" style={{ 
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div className="search-header" style={{ marginBottom: '10px' }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>Search Advocates</h2>
        {isSearching && (
          <div className="search-feedback" style={{ 
            display: 'flex', 
            alignItems: 'center',
            marginBottom: '10px',
            color: '#555'
          }}>
            <p className="search-term" style={{ margin: 0 }}>
              Searching for: <span style={{ fontWeight: 'bold' }}>{searchTerm}</span>
            </p>
            {resultCount !== undefined && (
              <p style={{ margin: '0 0 0 15px', fontSize: '0.9em' }}>
                {resultCount} {resultCount === 1 ? 'result' : 'results'} found
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="search-controls" style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <input
            type="text"
            placeholder="Search by name, phone, degree, location, or specialty..."
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="search-input"
            aria-label="Search advocates"
            style={{ 
              width: '100%',
              padding: '10px 15px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              transition: 'border-color 0.2s'
            }}
          />
          {isSearching && (
            <button 
              onClick={onReset}
              aria-label="Clear search"
              style={{ 
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#999'
              }}
            >
              ×
            </button>
          )}
        </div>
        <button 
          onClick={onReset}
          className="reset-button"
          disabled={!isSearching}
          style={{ 
            marginLeft: '10px',
            padding: '10px 15px',
            backgroundColor: isSearching ? '#6c757d' : '#e9ecef',
            color: isSearching ? 'white' : '#adb5bd',
            border: 'none',
            borderRadius: '4px',
            cursor: isSearching ? 'pointer' : 'default',
            transition: 'background-color 0.2s'
          }}
        >
          Reset
        </button>
      </div>
      
      {isSearching && (
        <div style={{ marginTop: '10px', fontSize: '0.85em', color: '#6c757d' }}>
          <p style={{ margin: 0 }}>
            Tip: Search across names, phone numbers, degrees, locations, and specialties. Press ESC to clear.
          </p>
        </div>
      )}
    </div>
  );
}
