interface FilterOption {
  label: string;
  value: string;
}

interface FilterChipsProps {
  options: FilterOption[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

/**
 * FilterChips — horizontal scrollable row of pill filter buttons.
 * active chip = accent fill, inactive = gray border.
 */
export default function FilterChips({
  options,
  value,
  onChange,
  className = '',
}: FilterChipsProps) {
  return (
    <div className={`filter-chips ${className}`}>
      {options.map(opt => (
        <button
          key={opt.value}
          className={`filter-chip${value === opt.value ? ' active' : ''}`}
          onClick={() => onChange(opt.value)}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
