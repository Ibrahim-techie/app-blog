import { Search } from "lucide-react";

/**
 * The in-page search box. Controlled: the page owns the value (and its
 * debouncing); this only draws the INK input. `size="lg"` is the full-width
 * 64px field from the Explore design.
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
        size={large ? 22 : 17}
        strokeWidth={1.75}
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-ink-muted ${
          large ? "left-5" : "left-4"
        }`}
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className={`w-full rounded-[3px] border border-ink-border bg-ink-surface text-ink-text outline-none transition-colors placeholder:text-ink-muted focus:border-ink-border-strong ${
          large
            ? "h-16 pl-[58px] pr-5 text-base"
            : "h-11 pl-11 pr-4 font-mono text-[11px]"
        }`}
      />
    </div>
  );
};

export default SearchBar;
