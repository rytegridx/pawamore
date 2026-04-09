export interface Appliance {
  id: string;
  name: string;
  watts: number;
  hoursPerDay: number;
  quantity: number;
}

export interface PresetAppliance {
  name: string;
  watts: number;
  defaultHours: number;
  icon: string;
  category: string;
}

export const PRESET_APPLIANCES: PresetAppliance[] = [
  { name: "LED Light", watts: 15, defaultHours: 6, icon: "💡", category: "Lighting" },
  { name: "CFL Bulb", watts: 25, defaultHours: 6, icon: "💡", category: "Lighting" },
  { name: "Fluorescent Tube", watts: 40, defaultHours: 8, icon: "💡", category: "Lighting" },
  { name: 'TV (LED 32")', watts: 50, defaultHours: 5, icon: "📺", category: "Entertainment" },
  { name: 'TV (LED 55")', watts: 80, defaultHours: 4, icon: "📺", category: "Entertainment" },
  { name: "Sound System", watts: 100, defaultHours: 3, icon: "🔊", category: "Entertainment" },
  { name: "Decoder/DSTV", watts: 30, defaultHours: 6, icon: "📡", category: "Entertainment" },
  { name: "Laptop", watts: 65, defaultHours: 6, icon: "💻", category: "Computing" },
  { name: "Desktop Computer", watts: 200, defaultHours: 8, icon: "🖥️", category: "Computing" },
  { name: "WiFi Router", watts: 12, defaultHours: 24, icon: "📶", category: "Computing" },
  { name: "Phone Charger", watts: 10, defaultHours: 3, icon: "📱", category: "Computing" },
  { name: "Ceiling Fan", watts: 75, defaultHours: 10, icon: "🌀", category: "Cooling" },
  { name: "Standing Fan", watts: 55, defaultHours: 8, icon: "🌀", category: "Cooling" },
  { name: "AC (1HP)", watts: 900, defaultHours: 8, icon: "❄️", category: "Cooling" },
  { name: "AC (1.5HP)", watts: 1350, defaultHours: 8, icon: "❄️", category: "Cooling" },
  { name: "AC (2HP)", watts: 1800, defaultHours: 6, icon: "❄️", category: "Cooling" },
  { name: "Refrigerator", watts: 150, defaultHours: 24, icon: "🧊", category: "Kitchen" },
  { name: "Freezer", watts: 200, defaultHours: 24, icon: "🧊", category: "Kitchen" },
  { name: "Microwave", watts: 1000, defaultHours: 0.5, icon: "🍽️", category: "Kitchen" },
  { name: "Blender", watts: 350, defaultHours: 0.5, icon: "🍹", category: "Kitchen" },
  { name: "Electric Kettle", watts: 1500, defaultHours: 0.5, icon: "☕", category: "Kitchen" },
  { name: "Water Pump", watts: 750, defaultHours: 2, icon: "💧", category: "Other" },
  { name: "Washing Machine", watts: 500, defaultHours: 1, icon: "👕", category: "Other" },
  { name: "Iron", watts: 1200, defaultHours: 0.5, icon: "👔", category: "Other" },
  { name: "Security Camera", watts: 15, defaultHours: 24, icon: "📷", category: "Other" },
];

export const SOLAR_PANEL_WATT = 410;
export const BATTERY_PRICE_PER_KWH = 204000;
export const INVERTER_PRICE_PER_KW = 300000;
export const PANEL_PRICE = 150000;
export const INSTALLATION_COST = 150000;
export const SUN_HOURS_NIGERIA = 5;

export function calculateSolarNeeds(appliances: Appliance[]) {
  const peakLoad = appliances.reduce((sum, a) => sum + a.watts * a.quantity, 0);
  const dailyConsumption = appliances.reduce(
    (sum, a) => sum + (a.watts * a.hoursPerDay * a.quantity) / 1000,
    0
  );

  const batteryCapacity = Math.ceil(((dailyConsumption * 1.2) / 0.8) * 10) / 10;
  const inverterSize = Math.ceil((peakLoad * 1.3) / 100) * 100;
  const panelsNeeded = Math.max(
    1,
    Math.ceil((dailyConsumption / SUN_HOURS_NIGERIA) * 1000 / SOLAR_PANEL_WATT)
  );

  const batteryCost = Math.round(batteryCapacity * BATTERY_PRICE_PER_KWH);
  const inverterCost = Math.round((inverterSize / 1000) * INVERTER_PRICE_PER_KW);
  const panelCost = Math.round(panelsNeeded * PANEL_PRICE);
  const installationCost = INSTALLATION_COST + (panelsNeeded > 4 ? (panelsNeeded - 4) * 20000 : 0);
  const totalCost = batteryCost + inverterCost + panelCost + installationCost;

  const annualCO2Saved = dailyConsumption * 365 * 0.5;
  const treesEquivalent = Math.round(annualCO2Saved / 21);
  const monthlyFuelSaved = Math.round((dailyConsumption * 30) / 3.5);
  const monthlySavings = Math.round(dailyConsumption * 30 * 150);
  const paybackYears =
    totalCost > 0 ? Math.round((totalCost / (monthlySavings * 12)) * 10) / 10 : 0;

  return {
    peakLoad,
    dailyConsumption: Math.round(dailyConsumption * 100) / 100,
    batteryCapacity,
    inverterSize,
    panelsNeeded,
    batteryCost,
    inverterCost,
    panelCost,
    installationCost,
    totalCost,
    annualCO2Saved: Math.round(annualCO2Saved),
    treesEquivalent,
    monthlyFuelSaved,
    monthlySavings,
    paybackYears,
  };
}
