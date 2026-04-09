import { useState } from "react";
import { PRESET_APPLIANCES, PresetAppliance } from "@/lib/solar-data";

interface PresetSelectorProps {
  onSelect: (preset: PresetAppliance) => void;
}

const categories = [...new Set(PRESET_APPLIANCES.map((preset) => preset.category))];

const PresetSelector = ({ onSelect }: PresetSelectorProps) => {
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const filtered = PRESET_APPLIANCES.filter((preset) => preset.category === activeCategory);

  return (
    <div>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              activeCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {filtered.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onSelect(preset)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5 text-left transition-all hover:border-primary/30 hover:bg-secondary/40"
          >
            <span className="text-lg" aria-hidden="true">
              {preset.icon}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">{preset.name}</p>
              <p className="text-[10px] text-muted-foreground">{preset.watts}W</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PresetSelector;
