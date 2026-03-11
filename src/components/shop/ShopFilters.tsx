import { useState } from "react";
import { Filter, X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface ShopFilterState {
  category: string;
  brands: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: string;
  inStock: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ShopFiltersProps {
  filters: ShopFilterState;
  onFiltersChange: (filters: ShopFilterState) => void;
  categories: Category[];
  availableBrands: string[];
  resultCount: number;
}

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low → High" },
  { value: "price-high", label: "Price: High → Low" },
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
];

const PRICE_MAX = 10000000;
const PRICE_STEP = 50000;

const FilterSection = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-display font-semibold text-sm">
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1 pb-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

const ShopFilters = ({ filters, onFiltersChange, categories, availableBrands, resultCount }: ShopFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const update = (changes: Partial<ShopFilterState>) => {
    onFiltersChange({ ...filters, ...changes });
  };

  const toggleBrand = (brand: string) => {
    const next = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    update({ brands: next });
  };

  const clearAll = () => {
    onFiltersChange({
      category: "all",
      brands: [],
      minPrice: 0,
      maxPrice: PRICE_MAX,
      sortBy: "featured",
      inStock: false,
    });
  };

  const activeCount =
    (filters.category !== "all" ? 1 : 0) +
    filters.brands.length +
    (filters.minPrice > 0 || filters.maxPrice < PRICE_MAX ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  const filterContent = (
    <div className="space-y-1 divide-y divide-border">
      {/* Categories */}
      <FilterSection title="Category">
        <div className="space-y-1.5">
          <button
            onClick={() => update({ category: "all" })}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors min-h-[40px] ${
              filters.category === "all" ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-secondary text-foreground"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => update({ category: cat.slug })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors min-h-[40px] ${
                filters.category === cat.slug ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-secondary text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Brands */}
      {availableBrands.length > 0 && (
        <FilterSection title="Brand">
          <div className="space-y-2">
            {availableBrands.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-3 px-1 py-1.5 cursor-pointer min-h-[36px]"
              >
                <Checkbox
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={() => toggleBrand(brand)}
                />
                <span className="text-sm">{brand}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-4 px-1">
          <Slider
            value={[filters.minPrice, filters.maxPrice]}
            onValueChange={([min, max]) => update({ minPrice: min, maxPrice: max })}
            max={PRICE_MAX}
            min={0}
            step={PRICE_STEP}
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>₦{filters.minPrice.toLocaleString()}</span>
            <span>₦{filters.maxPrice.toLocaleString()}</span>
          </div>
        </div>
      </FilterSection>

      {/* In Stock */}
      <FilterSection title="Availability" defaultOpen={false}>
        <label className="flex items-center gap-3 px-1 py-1.5 cursor-pointer min-h-[36px]">
          <Checkbox
            checked={filters.inStock}
            onCheckedChange={(checked) => update({ inStock: !!checked })}
          />
          <span className="text-sm">In Stock Only</span>
        </label>
      </FilterSection>

      {/* Clear */}
      {activeCount > 0 && (
        <div className="pt-4">
          <Button variant="outline" onClick={clearAll} className="w-full gap-2">
            <X className="w-4 h-4" /> Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Top bar: Filter trigger + Sort + Count */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Mobile filter trigger */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden gap-2 min-h-[40px]">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeCount > 0 && (
                <Badge variant="secondary" className="ml-0.5 px-1.5 text-[10px]">
                  {activeCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[340px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="font-display">Filter Products</SheetTitle>
            </SheetHeader>
            <div className="mt-4">{filterContent}</div>
          </SheetContent>
        </Sheet>

        {/* Sort */}
        <Select value={filters.sortBy} onValueChange={(v) => update({ sortBy: v })}>
          <SelectTrigger className="w-[180px] sm:w-[200px] min-h-[40px] text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground ml-auto">
          {resultCount} product{resultCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Active filter badges */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.category !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs">
              {categories.find((c) => c.slug === filters.category)?.name || filters.category}
              <X className="w-3 h-3 cursor-pointer" onClick={() => update({ category: "all" })} />
            </Badge>
          )}
          {filters.brands.map((brand) => (
            <Badge key={brand} variant="secondary" className="gap-1 text-xs">
              {brand}
              <X className="w-3 h-3 cursor-pointer" onClick={() => toggleBrand(brand)} />
            </Badge>
          ))}
          {(filters.minPrice > 0 || filters.maxPrice < PRICE_MAX) && (
            <Badge variant="secondary" className="gap-1 text-xs">
              ₦{filters.minPrice.toLocaleString()} – ₦{filters.maxPrice.toLocaleString()}
              <X className="w-3 h-3 cursor-pointer" onClick={() => update({ minPrice: 0, maxPrice: PRICE_MAX })} />
            </Badge>
          )}
          {filters.inStock && (
            <Badge variant="secondary" className="gap-1 text-xs">
              In Stock
              <X className="w-3 h-3 cursor-pointer" onClick={() => update({ inStock: false })} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

// Export the desktop sidebar version
export const ShopFiltersSidebar = ({ filters, onFiltersChange, categories, availableBrands }: Omit<ShopFiltersProps, "resultCount">) => {
  const update = (changes: Partial<ShopFilterState>) => {
    onFiltersChange({ ...filters, ...changes });
  };

  const toggleBrand = (brand: string) => {
    const next = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    update({ brands: next });
  };

  const clearAll = () => {
    onFiltersChange({
      category: "all",
      brands: [],
      minPrice: 0,
      maxPrice: PRICE_MAX,
      sortBy: filters.sortBy,
      inStock: false,
    });
  };

  const activeCount =
    (filters.category !== "all" ? 1 : 0) +
    filters.brands.length +
    (filters.minPrice > 0 || filters.maxPrice < PRICE_MAX ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  return (
    <div className="space-y-1 divide-y divide-border">
      <FilterSection title="Category">
        <div className="space-y-1">
          <button
            onClick={() => update({ category: "all" })}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors min-h-[36px] ${
              filters.category === "all" ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-secondary text-foreground"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => update({ category: cat.slug })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors min-h-[36px] ${
                filters.category === cat.slug ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-secondary text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </FilterSection>

      {availableBrands.length > 0 && (
        <FilterSection title="Brand">
          <div className="space-y-1.5">
            {availableBrands.map((brand) => (
              <label key={brand} className="flex items-center gap-3 px-1 py-1 cursor-pointer min-h-[32px]">
                <Checkbox
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={() => toggleBrand(brand)}
                />
                <span className="text-sm">{brand}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Price Range">
        <div className="space-y-4 px-1">
          <Slider
            value={[filters.minPrice, filters.maxPrice]}
            onValueChange={([min, max]) => update({ minPrice: min, maxPrice: max })}
            max={PRICE_MAX}
            min={0}
            step={PRICE_STEP}
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>₦{filters.minPrice.toLocaleString()}</span>
            <span>₦{filters.maxPrice.toLocaleString()}</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Availability" defaultOpen={false}>
        <label className="flex items-center gap-3 px-1 py-1 cursor-pointer min-h-[32px]">
          <Checkbox
            checked={filters.inStock}
            onCheckedChange={(checked) => update({ inStock: !!checked })}
          />
          <span className="text-sm">In Stock Only</span>
        </label>
      </FilterSection>

      {activeCount > 0 && (
        <div className="pt-3">
          <Button variant="outline" size="sm" onClick={clearAll} className="w-full gap-2">
            <X className="w-3.5 h-3.5" /> Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShopFilters;
