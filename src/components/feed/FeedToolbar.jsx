import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { CATEGORIES } from "../../constants/categories";

/** Underlined category tabs: All + every category, from the constants file. */
export function CategoryTabs({ value, onChange, label = "Filter by category" }) {
  const tabs = [{ key: null, label: "All" }, ...CATEGORIES];

  return (
    <div
      role="group"
      aria-label={label}
      className="flex h-14 min-w-0 gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => {
        const selected = (value ?? null) === tab.key;
        return (
          <button
            key={tab.key ?? "all"}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(tab.key)}
            className={`flex h-full shrink-0 items-center px-1 text-[13px] transition-colors ${
              selected
                ? "border-b-2 border-ink-brand font-extrabold text-ink-brand"
                : "font-semibold text-ink-muted hover:text-ink-text"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/** A small sort dropdown: `options` is [{ value, label }]. */
export function SortMenu({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) =>
      ref.current?.contains(event.target) || setOpen(false);
    const onKeyDown = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 items-center gap-3 rounded-[3px] border border-ink-border bg-ink-surface px-3 text-xs font-semibold text-ink-text"
      >
        {current.label}
        <ChevronDown
          size={14}
          strokeWidth={2}
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Sort"
          className="absolute right-0 z-20 mt-2 flex w-48 flex-col gap-2 rounded-[2px] border border-ink-border bg-ink-surface p-4"
        >
          <li className="font-mono text-[10px] tracking-[0.3px] text-ink-muted">
            SORT BY
          </li>
          {options.map((option) => {
            const selected = option.value === current.value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between text-left text-xs ${
                    selected ? "font-bold text-ink-brand" : "text-ink-text-2 hover:text-ink-text"
                  }`}
                >
                  {option.label}
                  {selected && <Check size={14} strokeWidth={2} aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** The bar under a page hero: category tabs on the left, sort on the right. */
export function FeedToolbar({ category, onCategory, sort, sortOptions, onSort }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink-border">
      <CategoryTabs value={category} onChange={onCategory} />
      {sortOptions && (
        <SortMenu value={sort} options={sortOptions} onChange={onSort} />
      )}
    </div>
  );
}
