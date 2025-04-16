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
    <div className="advocate-search mb-8">
      <div className="relative max-w-3xl mx-auto">
        {/* Search icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        
        {/* Search input */}
        <input
          type="text"
          placeholder="Search advocates by name and phone number..."
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-12 py-4 bg-white border-0 rounded-full shadow-md text-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Search advocates"
        />
        
        {/* Clear button */}
        {isSearching && (
          <button 
            onClick={onReset}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Search results info */}
      {isSearching && resultCount !== undefined && (
        <div className="mt-3 text-center text-gray-500">
          <span className="font-medium">{resultCount}</span> {resultCount === 1 ? 'advocate' : 'advocates'} found for <span className="font-medium">"{searchTerm}"</span>
        </div>
      )}
    </div>
  );
}
