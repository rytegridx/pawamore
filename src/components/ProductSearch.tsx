import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

export interface SearchFilters {
  query: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  features: string[];
}

interface ProductSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  categories: Array<{ id: string; name: string; slug: string }>;
}

const AVAILABLE_FEATURES = [
  "Solar Panels",
  "Battery Storage", 
  "Hybrid Inverter",
  "Grid Backup",
  "Silent Operation",
  "Remote Monitoring",
  "Mobile App",
  "Warranty Included",
];

const ProductSearch = ({ filters, onFiltersChange, categories }: ProductSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleFeature = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    updateFilters({ features: newFeatures });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      query: "",
      category: "",
      minPrice: 0,
      maxPrice: 5000000,
      features: []
    });
  };

  const hasActiveFilters = filters.query || filters.category || filters.features.length > 0 || 
    filters.minPrice > 0 || filters.maxPrice < 5000000;

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products..."
          value={filters.query}
          onChange={(e) => updateFilters({ query: e.target.value })}
          className="pl-10 pr-4 min-h-[44px]"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between gap-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {(filters.features.length || 0) + (filters.category ? 1 : 0) + 
                   (filters.minPrice > 0 || filters.maxPrice < 5000000 ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Products</SheetTitle>
              <SheetDescription>
                Refine your search to find the perfect energy solution
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="font-semibold mb-3">Category</h3>
                <div className="space-y-2">
                  <Button
                    variant={filters.category === "" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => updateFilters({ category: "" })}
                    className="w-full justify-start"
                  >
                    All Categories
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={filters.category === category.slug ? "default" : "ghost"}
                      size="sm"
                      onClick={() => updateFilters({ category: category.slug })}
                      className="w-full justify-start"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-3">Price Range</h3>
                <div className="space-y-4">
                  <div className="px-2">
                    <Slider
                      value={[filters.minPrice, filters.maxPrice]}
                      onValueChange={([min, max]) => updateFilters({ minPrice: min, maxPrice: max })}
                      max={5000000}
                      min={0}
                      step={50000}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>₦{filters.minPrice.toLocaleString()}</span>
                    <span>-</span>
                    <span>₦{filters.maxPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-3">Features</h3>
                <div className="space-y-2">
                  {AVAILABLE_FEATURES.map((feature) => (
                    <Button
                      key={feature}
                      variant={filters.features.includes(feature) ? "default" : "ghost"}
                      size="sm"
                      onClick={() => toggleFeature(feature)}
                      className="w-full justify-start text-xs"
                    >
                      {feature}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="w-full gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex-1 flex flex-wrap gap-2">
            {filters.query && (
              <Badge variant="secondary" className="gap-1">
                "{filters.query}"
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => updateFilters({ query: "" })}
                />
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                {categories.find(c => c.slug === filters.category)?.name}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => updateFilters({ category: "" })}
                />
              </Badge>
            )}
            {filters.features.map((feature) => (
              <Badge key={feature} variant="secondary" className="gap-1">
                {feature}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => toggleFeature(feature)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;