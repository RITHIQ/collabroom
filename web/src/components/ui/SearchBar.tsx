import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SearchBar — 40px height, search icon left, clear button right.
 * Uses .search-bar CSS class for consistent styling.
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
  style,
}: SearchBarProps) {
  return (
    <div className={`search-bar ${className}`} style={style}>
      <span className="search-icon">
        <Search size={15} />
      </span>
      <input
        className="search-input"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')} type="button" aria-label="Clear search">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
