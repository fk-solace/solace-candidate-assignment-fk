# Advocate Component Architecture

## Overview

This document outlines the component architecture for the Solace Advocates application. The architecture follows a container/presentational pattern with clear separation of concerns and reusable components.

## Component Structure

```
src/
├── api/                      # API client and services
├── components/
│   └── advocates/            # Advocate-related components
│       ├── AdvocateSearch.tsx    # Search input and controls
│       ├── AdvocateTable.tsx     # Table for displaying advocates
│       ├── AdvocateList.tsx      # List with loading/error states
│       ├── AdvocatePage.tsx      # Main container component
│       ├── index.ts              # Exports all components
│       └── types.ts              # TypeScript interfaces
└── hooks/
    └── useAdvocates.ts       # Custom hook for advocate data
```

## Component Responsibilities

### AdvocateSearch

- Renders search input and reset button
- Manages search term display
- Forwards user input to parent component

### AdvocateTable

- Renders advocate data in a table format
- Handles proper key props for mapped elements
- Will be extended to support sorting functionality

### AdvocateList

- Manages different states (loading, error, empty, data)
- Renders the appropriate UI based on the current state
- Will be extended to support pagination

### AdvocatePage

- Acts as a container component
- Composes all advocate-related components
- Uses the useAdvocates hook for data fetching and state management

## Custom Hooks

### useAdvocates

- Fetches advocate data from the API
- Manages loading and error states
- Handles client-side filtering based on search term
- Will be extended to support server-side pagination, sorting, and filtering

## Design Decisions

1. **Component Separation**
   - Separated UI components from data fetching logic
   - Each component has a single responsibility
   - Makes it easier to test and maintain

2. **TypeScript Interfaces**
   - Created clear interfaces for all component props
   - Improves type safety and developer experience
   - Makes it easier to understand component requirements

3. **Custom Hooks**
   - Extracted data fetching and state management into custom hooks
   - Keeps components focused on rendering
   - Makes it easier to reuse logic across components

4. **Container/Presentational Pattern**
   - AdvocatePage acts as a container component
   - Other components are presentational and receive data via props
   - Improves testability and separation of concerns

## Future Extensions

This architecture is designed to be extended with:

1. **Pagination**
   - Add pagination controls to AdvocateList
   - Update useAdvocates to support server-side pagination

2. **Sorting**
   - Add sortable headers to AdvocateTable
   - Update useAdvocates to support server-side sorting

3. **Filtering**
   - Add filter controls to AdvocateSearch or a new AdvocateFilter component
   - Update useAdvocates to support server-side filtering

4. **Advocate Details**
   - Add AdvocateDetails component for displaying detailed information
   - Implement routing to navigate between list and details views
