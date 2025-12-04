import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Unified Search and Filter Component
 * Provides consistent search bar and filter tags across all pages
 */
export default function SearchFilter({
    searchTerm,
    onSearchChange,
    searchPlaceholder = "Cerca...",
    filters = [],
    activeFilter,
    onFilterChange,
    children
}) {
    return (
        <div className="unified-search-filter">
            {/* Search Input */}
            <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="search-input"
                />
                {searchTerm && (
                    <button
                        className="search-clear"
                        onClick={() => onSearchChange('')}
                        aria-label="Clear search"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Filter Tags */}
            {filters.length > 0 && (
                <div className="filter-tags">
                    {filters.map(filter => (
                        <button
                            key={filter.value}
                            onClick={() => onFilterChange(filter.value)}
                            className={`filter-tag ${activeFilter === filter.value ? 'active' : ''}`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Additional controls */}
            {children}
        </div>
    );
}
