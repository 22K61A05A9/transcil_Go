interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="search-container">
      <div className="search-box">

        <span
          className="search-icon"
          aria-hidden="true"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line
              x1="16.65"
              y1="16.65"
              x2="21"
              y2="21"
            />
          </svg>
        </span>

        <input
          type="text"
          aria-label="Search players"
          placeholder="Search players by name or ID..."
          value={value}
          autoComplete="off"
          onChange={(event) =>
            onChange(event.target.value)
          }
        />

        {value.trim() && (
          <button
            type="button"
            className="clear-search"
            onClick={handleClear}
            aria-label="Clear player search"
            title="Clear search"
          >
            ×
          </button>
        )}

      </div>
    </div>
  );
}

export default SearchBar;