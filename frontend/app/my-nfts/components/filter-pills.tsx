import { FilterType } from "@/types/property";

interface FilterPillsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FILTER_OPTIONS = [
  { value: "all" as const, label: "All NFTs" },
  { value: "listed" as const, label: "Listed" },
  { value: "unlisted" as const, label: "Unlisted" },
  { value: "sold" as const, label: "Sold" },
  { value: "purchased" as const, label: "Purchased" },
] as const;

export function FilterPills({ activeFilter, onFilterChange }: FilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {FILTER_OPTIONS.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 capitalize ${
            activeFilter === filter.value
              ? "bg-primary text-primary-foreground shadow-lg"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border hover:border-primary/50"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}