"use client";

type SortValue = "highestRated" | "mostReviewed" | "nearest" | "";

export type RestaurantFilters = {
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  district?: "Kathmandu" | "Lalitpur" | "Bhaktapur" | "";
  address?: string;
  sort?: SortValue;
};

type FilterSidebarProps = {
  filters: RestaurantFilters;
  onChange: (next: RestaurantFilters) => void;
  onReset: () => void;
};

export default function FilterSidebar({ filters, onChange, onReset }: FilterSidebarProps) {
  const handleNumberChange = (key: keyof RestaurantFilters, value: string) => {
    const num = value ? Number(value) : undefined;
    onChange({ ...filters, [key]: Number.isNaN(num) ? undefined : num });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-orange-500 hover:text-orange-700"
        >
          Clear
        </button>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
          Minimum rating
        </label>
        <select
          value={filters.minRating?.toString() ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              minRating: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="w-full rounded-xl border border-orange-200 bg-orange-50 py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">Any</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r}+ stars
            </option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
          Price range
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice?.toString() ?? ""}
            onChange={(e) => handleNumberChange("minPrice", e.target.value)}
            className="w-1/2 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice?.toString() ?? ""}
            onChange={(e) => handleNumberChange("maxPrice", e.target.value)}
            className="w-1/2 rounded-xl border border-orange-200 bg-white px-3 py-2 text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* District */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
          District
        </label>
        <select
          value={filters.district ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              district: (e.target.value || "") as RestaurantFilters["district"],
            })
          }
          className="w-full rounded-xl border border-orange-200 bg-orange-50 py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">Any</option>
          <option value="Kathmandu">Kathmandu</option>
          <option value="Lalitpur">Lalitpur</option>
          <option value="Bhaktapur">Bhaktapur</option>
        </select>
      </div>

      {/* Address */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
          Address
        </label>
        <input
          type="text"
          placeholder="e.g. Thamel, Jawalakhel"
          value={filters.address ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              address: e.target.value || undefined,
            })
          }
          className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
          Sort by
        </label>
        <select
          value={filters.sort ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              sort: e.target.value as SortValue,
            })
          }
          className="w-full rounded-xl border border-orange-200 bg-orange-50 py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">Default</option>
          <option value="highestRated">Highest Rated</option>
          <option value="mostReviewed">Most Reviewed</option>
          <option value="nearest">Nearest</option>
        </select>
      </div>
    </div>
  );
}

