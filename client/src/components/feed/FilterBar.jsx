/**
 * components/feed/FilterBar.jsx
 * Horizontal scrollable filter bar for the feed page.
 */

import { useState } from 'react';

const PROPERTY_TYPES = ['all', 'apartment', 'house', 'villa', 'plot', 'commercial', 'farmland'];

export default function FilterBar({ filters, onFilterChange }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-black border-b border-zinc-800 px-4 py-3 sticky top-0 z-30">
      {/* Property type tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {PROPERTY_TYPES.map(type => (
          <button
            key={type}
            onClick={() => onFilterChange({ propertyType: type === 'all' ? '' : type })}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize
              ${(filters.propertyType === type || (!filters.propertyType && type === 'all'))
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
          >
            {type}
          </button>
        ))}

        {/* Advanced filter toggle */}
        <button
          onClick={() => setShowAdvanced(s => !s)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 hover:text-white flex items-center gap-1"
        >
          ⚙️ Filters {showAdvanced ? '▲' : '▼'}
        </button>
      </div>

      {/* Advanced filters — location + price */}
      {showAdvanced && (
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          <input
            value={filters.state || ''}
            onChange={e => onFilterChange({ state: e.target.value })}
            placeholder="State"
            className="input-field text-xs py-2"
          />
          <input
            value={filters.district || ''}
            onChange={e => onFilterChange({ district: e.target.value })}
            placeholder="District"
            className="input-field text-xs py-2"
          />
          <input
            value={filters.taluk || ''}
            onChange={e => onFilterChange({ taluk: e.target.value })}
            placeholder="Taluk"
            className="input-field text-xs py-2"
          />
          <div className="flex gap-1">
            <input
              type="number"
              value={filters.minPrice || ''}
              onChange={e => onFilterChange({ minPrice: e.target.value })}
              placeholder="Min ₹"
              className="input-field text-xs py-2 w-1/2"
            />
            <input
              type="number"
              value={filters.maxPrice || ''}
              onChange={e => onFilterChange({ maxPrice: e.target.value })}
              placeholder="Max ₹"
              className="input-field text-xs py-2 w-1/2"
            />
          </div>

          <button
            onClick={() => onFilterChange({ state: '', district: '', taluk: '', minPrice: '', maxPrice: '', propertyType: '' })}
            className="col-span-2 md:col-span-1 text-xs text-zinc-400 hover:text-white py-2"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
