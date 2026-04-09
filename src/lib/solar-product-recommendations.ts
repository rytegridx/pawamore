import { Appliance } from "@/lib/solar-data";

export interface SolarResults {
  peakLoad: number;
  dailyConsumption: number;
  batteryCapacity: number;
  inverterSize: number;
  panelsNeeded: number;
}

export interface ShopProductForRecommendation {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  ideal_for: string | null;
  powers: string | null;
  price: number;
  discount_price: number | null;
  is_featured: boolean | null;
  is_popular: boolean | null;
  stock_quantity: number | null;
  specs: unknown;
  product_images: { image_url: string; is_primary: boolean }[] | null;
  product_categories: { name: string; slug: string } | null;
  brands: { name: string; slug: string } | null;
}

export interface RecommendedShopProduct extends ShopProductForRecommendation {
  recommendationReason: string;
  recommendationScore: number;
  recommendationType: "all-in-one" | "inverter" | "battery" | "panel" | "general";
}

const includesAny = (text: string, terms: string[]) => terms.some((term) => text.includes(term));

const getRecommendationType = (text: string): RecommendedShopProduct["recommendationType"] => {
  if (includesAny(text, ["solar generator", "power station", "iess", "all-in-one"])) return "all-in-one";
  if (includesAny(text, ["inverter", "kva", "kw", "hybrid"])) return "inverter";
  if (includesAny(text, ["battery", "lifepo4", "kwh", "ah", "power tank", "powertank"])) return "battery";
  if (includesAny(text, ["panel", "pv", "mono"])) return "panel";
  return "general";
};

const normalizeText = (product: ShopProductForRecommendation): string => {
  return [
    product.name,
    product.short_description ?? "",
    product.description ?? "",
    product.ideal_for ?? "",
    product.powers ?? "",
    product.product_categories?.name ?? "",
    product.product_categories?.slug ?? "",
    product.brands?.name ?? "",
    JSON.stringify(product.specs ?? {}),
  ]
    .join(" ")
    .toLowerCase();
};

const buildReason = (
  product: ShopProductForRecommendation,
  recommendationType: RecommendedShopProduct["recommendationType"],
  results: SolarResults
) => {
  const typeReason: Record<RecommendedShopProduct["recommendationType"], string> = {
    "all-in-one": `Good fit for compact backup setups around ${results.dailyConsumption} kWh/day and simpler installation.`,
    inverter: `Aligned with your inverter need (~${results.inverterSize}W peak allowance).`,
    battery: `Supports battery-side planning for your ${results.batteryCapacity} kWh estimate.`,
    panel: `Useful for meeting your estimated panel requirement (${results.panelsNeeded} panel${results.panelsNeeded > 1 ? "s" : ""}).`,
    general: "Relevant to your current load profile and expansion path.",
  };

  const brand = product.brands?.name ? `${product.brands.name} model` : "This model";
  return `${brand}: ${typeReason[recommendationType]}`;
};

export const recommendSolarProducts = (
  products: ShopProductForRecommendation[],
  appliances: Appliance[],
  results: SolarResults,
  limit = 3
): RecommendedShopProduct[] => {
  if (products.length === 0) return [];

  const hasMotorLoads = appliances.some((appliance) => {
    const name = appliance.name.toLowerCase();
    return (
      name.includes("ac") ||
      name.includes("pump") ||
      name.includes("fridge") ||
      name.includes("freezer") ||
      appliance.watts >= 700
    );
  });

  const scored = products
    .map((product) => {
      const text = normalizeText(product);
      const recommendationType = getRecommendationType(text);
      let score = 0;

      if (product.stock_quantity === null || product.stock_quantity > 0) score += 1.2;
      if (product.is_featured) score += 1.1;
      if (product.is_popular) score += 0.9;

      if (includesAny(text, ["itel", "ecoflow"])) score += 0.8;

      if (recommendationType === "inverter") score += 2.4;
      if (recommendationType === "battery") score += 2.2;
      if (recommendationType === "panel") score += 2.0;
      if (recommendationType === "all-in-one") score += 2.0;

      if (results.inverterSize >= 2500 && includesAny(text, ["3k", "3.5k", "4k", "5k", "6k", "10k", "12k"])) {
        score += 1.4;
      }
      if (results.batteryCapacity >= 4 && includesAny(text, ["5kwh", "8kwh", "10kwh", "16kwh", "200ah", "300ah"])) {
        score += 1.4;
      }
      if (results.panelsNeeded >= 3 && includesAny(text, ["410w", "550w", "panel", "pv"])) {
        score += 1.2;
      }
      if (results.dailyConsumption <= 2.5 && includesAny(text, ["500w", "1000wh", "portable", "power station"])) {
        score += 1.5;
      }
      if (hasMotorLoads && includesAny(text, ["pure sine", "hybrid inverter", "high surge"])) {
        score += 1.1;
      }

      return {
        ...product,
        recommendationScore: score,
        recommendationType,
        recommendationReason: buildReason(product, recommendationType, results),
      } satisfies RecommendedShopProduct;
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore);

  const diversified: RecommendedShopProduct[] = [];
  const seenTypes = new Set<RecommendedShopProduct["recommendationType"]>();

  for (const candidate of scored) {
    if (!seenTypes.has(candidate.recommendationType)) {
      diversified.push(candidate);
      seenTypes.add(candidate.recommendationType);
    }
    if (diversified.length >= limit) break;
  }

  if (diversified.length < limit) {
    for (const candidate of scored) {
      if (!diversified.find((entry) => entry.id === candidate.id)) {
        diversified.push(candidate);
      }
      if (diversified.length >= limit) break;
    }
  }

  return diversified.slice(0, limit);
};
