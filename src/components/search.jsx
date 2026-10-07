import { Search } from "lucide-react";

/**
 * The in-page search box. Controlled: the page owns the value (and its
 * debouncing); this only draws the INK input. `size="lg"` is the full-width
 * field from the Explore design.
 */
const SearchBar = ({
  value = "",
  onChange,
  placeholder = "Search...",
  size = "md",
}) => {
  const large = size === "lg";

  return (
    <div className={`relative w-full ${large ? "" : "max-w-[492px]"}`}>
      <Search
        size={large ? 20 : 17}
        strokeWidth={1.5}
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-text-2 ${
          large ? "left-5" : "left-4"
        }`}
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className={`w-full rounded-lg border border-ink-border bg-ink-surface text-ink-text outline-none transition-colors placeholder:text-ink-text-2 focus:border-ink-border-strong [&::-webkit-search-cancel-button]:hidden ${
          large
            ? "h-[52px] pl-14 pr-5 font-serif text-[17px]"
            : "h-11 pl-11 pr-4 font-mono tracking-[0.96px] text-base sm:text-xs"
        }`}
      />
    </div>
  );
};

export default SearchBar;
