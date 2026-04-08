import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, Zap, Battery, Sun, Clock, Plus, Trash2, 
  Lightbulb, Tv, Fan, Monitor, Refrigerator, WashingMachine,
  AirVent, Microwave, ChefHat, Coffee, Sparkles, Bot,
  ArrowRight, CheckCircle2, AlertCircle, TrendingUp, PiggyBank,
  Phone, MessageCircle, ShoppingCart, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

// Common appliances with typical wattages for Nigeria
const COMMON_APPLIANCES = [
  { name: "LED Bulb (9W)", watts: 9, icon: Lightbulb, category: "Lighting" },
  { name: "LED Bulb (15W)", watts: 15, icon: Lightbulb, category: "Lighting" },
  { name: "Fluorescent Tube", watts: 40, icon: Lightbulb, category: "Lighting" },
  { name: "Ceiling Fan", watts: 65, icon: Fan, category: "Cooling" },
  { name: "Standing Fan", watts: 50, icon: Fan, category: "Cooling" },
  { name: "Table Fan", watts: 35, icon: Fan, category: "Cooling" },
  { name: "AC (1HP)", watts: 1000, icon: AirVent, category: "Cooling" },
  { name: "AC (1.5HP)", watts: 1500, icon: AirVent, category: "Cooling" },
  { name: "AC (2HP)", watts: 2000, icon: AirVent, category: "Cooling" },
  { name: "TV (32\" LED)", watts: 50, icon: Tv, category: "Entertainment" },
  { name: "TV (43\" LED)", watts: 65, icon: Tv, category: "Entertainment" },
  { name: "TV (55\" LED)", watts: 85, icon: Tv, category: "Entertainment" },
  { name: "Decoder/DSTV", watts: 20, icon: Tv, category: "Entertainment" },
  { name: "Sound System", watts: 100, icon: Tv, category: "Entertainment" },
  { name: "Laptop", watts: 65, icon: Monitor, category: "Computing" },
  { name: "Desktop PC", watts: 200, icon: Monitor, category: "Computing" },
  { name: "Phone Charger", watts: 10, icon: Monitor, category: "Computing" },
  { name: "Router/Modem", watts: 15, icon: Monitor, category: "Computing" },
  { name: "Printer", watts: 50, icon: Monitor, category: "Computing" },
  { name: "Fridge (Small)", watts: 80, icon: Refrigerator, category: "Kitchen" },
  { name: "Fridge (Medium)", watts: 120, icon: Refrigerator, category: "Kitchen" },
  { name: "Fridge (Large)", watts: 180, icon: Refrigerator, category: "Kitchen" },
  { name: "Freezer", watts: 150, icon: Refrigerator, category: "Kitchen" },
  { name: "Microwave", watts: 1200, icon: Microwave, category: "Kitchen" },
  { name: "Electric Kettle", watts: 1500, icon: Coffee, category: "Kitchen" },
  { name: "Blender", watts: 350, icon: ChefHat, category: "Kitchen" },
  { name: "Rice Cooker", watts: 500, icon: ChefHat, category: "Kitchen" },
  { name: "Washing Machine", watts: 500, icon: WashingMachine, category: "Appliances" },
  { name: "Iron", watts: 1000, icon: WashingMachine, category: "Appliances" },
  { name: "Water Pump", watts: 750, icon: WashingMachine, category: "Appliances" },
  { name: "Security Light", watts: 20, icon: Lightbulb, category: "Security" },
  { name: "CCTV System", watts: 50, icon: Monitor, category: "Security" },
];

// Nigerian locations with approximate peak sun hours
const NIGERIAN_LOCATIONS = [
  { name: "Lagos", sunHours: 4.5 },
  { name: "Abuja", sunHours: 5.2 },
  { name: "Kano", sunHours: 6.0 },
  { name: "Port Harcourt", sunHours: 4.2 },
  { name: "Ibadan", sunHours: 4.8 },
  { name: "Kaduna", sunHours: 5.5 },
  { name: "Enugu", sunHours: 4.6 },
  { name: "Benin City", sunHours: 4.4 },
  { name: "Jos", sunHours: 5.8 },
  { name: "Calabar", sunHours: 4.0 },
  { name: "Sokoto", sunHours: 6.2 },
  { name: "Maiduguri", sunHours: 6.3 },
  { name: "Warri", sunHours: 4.3 },
  { name: "Owerri", sunHours: 4.5 },
  { name: "Other", sunHours: 5.0 },
];

interface Appliance {
  name: string;
  watts: number;
  hours: number;
  quantity: number;
}

interface AIAdvice {
  advice: string;
  generatedAt: string;
}

const SolarCalculator = () => {
  const { toast } = useToast();
  
  // Appliances state
  const [appliances, setAppliances] = useState<Appliance[]>([
    { name: "LED Bulb (9W)", watts: 9, hours: 6, quantity: 8 },
    { name: "Ceiling Fan", watts: 65, hours: 8, quantity: 3 },
    { name: "TV (43\" LED)", watts: 65, hours: 5, quantity: 1 },
    { name: "Decoder/DSTV", watts: 20, hours: 5, quantity: 1 },
    { name: "Fridge (Medium)", watts: 120, hours: 24, quantity: 1 },
    { name: "Laptop", watts: 65, hours: 4, quantity: 2 },
    { name: "Phone Charger", watts: 10, hours: 3, quantity: 3 },
    { name: "Router/Modem", watts: 15, hours: 24, quantity: 1 },
  ]);

  // System configuration state
  const [location, setLocation] = useState("Lagos");
  const [customSunHours, setCustomSunHours] = useState(4.5);
  const [autonomyDays, setAutonomyDays] = useState(1);
  const [systemVoltage, setSystemVoltage] = useState(48);
  const [batteryType, setBatteryType] = useState("lithium");
  const [systemLosses, setSystemLosses] = useState(20);

  // UI state
  const [selectedAppliance, setSelectedAppliance] = useState("");
  const [customApplianceName, setCustomApplianceName] = useState("");
  const [customApplianceWatts, setCustomApplianceWatts] = useState(0);
  const [showQuickAdd, setShowQuickAdd] = useState(true);
  
  // AI Advice state
  const [aiAdvice, setAiAdvice] = useState<AIAdvice | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  // Get peak sun hours based on location
  const peakSunHours = useMemo(() => {
    const loc = NIGERIAN_LOCATIONS.find(l => l.name === location);
    return loc ? loc.sunHours : customSunHours;
  }, [location, customSunHours]);

  // Battery configuration based on type
  const batteryConfig = useMemo(() => {
    return batteryType === "lithium" 
      ? { dod: 0.9, efficiency: 0.95, cycleLife: 4000, costPerKwh: 350000 }
      : { dod: 0.5, efficiency: 0.85, cycleLife: 400, costPerKwh: 150000 };
  }, [batteryType]);

  // Core calculations
  const calculations = useMemo(() => {
    const totalDailyConsumption = appliances.reduce(
      (sum, app) => sum + app.watts * app.hours * app.quantity, 0
    );

    const totalPeakLoad = appliances.reduce(
      (sum, app) => sum + app.watts * app.quantity, 0
    );

    // Account for system losses
    const lossAdjustedConsumption = totalDailyConsumption * (1 + systemLosses / 100);

    // Battery sizing: Daily consumption × Autonomy days / Depth of Discharge
    const requiredBatteryWh = (lossAdjustedConsumption * autonomyDays) / batteryConfig.dod;
    const recommendedBatteryCapacity = requiredBatteryWh / 1000; // Convert to kWh

    // Inverter sizing: Peak load × 1.3 safety factor (for startup surges)
    const recommendedInverterSize = Math.ceil(totalPeakLoad * 1.3 / 100) * 100; // Round to nearest 100W

    // Solar panel sizing: Loss-adjusted daily consumption / (Peak sun hours × Panel efficiency)
    const panelEfficiency = 0.85; // Account for real-world losses
    const requiredSolarWatts = lossAdjustedConsumption / (peakSunHours * panelEfficiency);
    const panelWattage = 410; // Standard panel size
    const recommendedSolarPanels = Math.ceil(requiredSolarWatts / panelWattage);

    // Cost estimates (Nigerian market prices 2024-2026)
    const estimatedCost = {
      battery: Math.round(recommendedBatteryCapacity * batteryConfig.costPerKwh),
      inverter: Math.round(recommendedInverterSize * 350), // ₦350/W for quality inverters
      panels: Math.round(recommendedSolarPanels * 160000), // ₦160,000 per 410W panel
      chargeController: Math.round(recommendedSolarPanels * 25000), // MPPT controller
      installation: Math.round((recommendedBatteryCapacity * 50000) + 100000), // Variable + base
      accessories: 75000, // Cables, breakers, mounting
    };
    
    const totalCost = Object.values(estimatedCost).reduce((sum, cost) => sum + cost, 0);

    // ROI calculations
    const monthlyGridCost = (totalDailyConsumption / 1000) * 30 * 150; // Assuming ₦150/kWh effective cost
    const monthlyGeneratorCost = (totalDailyConsumption / 1000) * 30 * 400; // Diesel generator cost
    const monthlySavings = monthlyGeneratorCost; // Assuming replacing generator
    const paybackMonths = Math.ceil(totalCost / monthlySavings);

    return {
      totalDailyConsumption,
      totalPeakLoad,
      lossAdjustedConsumption,
      recommendedBatteryCapacity,
      recommendedInverterSize,
      recommendedSolarPanels,
      requiredSolarWatts: Math.round(requiredSolarWatts),
      estimatedCost: { ...estimatedCost, total: totalCost },
      monthlyGridCost,
      monthlyGeneratorCost,
      monthlySavings,
      paybackMonths,
    };
  }, [appliances, autonomyDays, batteryConfig, peakSunHours, systemLosses]);

  // Add appliance from quick select
  const addApplianceFromSelect = () => {
    const selected = COMMON_APPLIANCES.find(a => a.name === selectedAppliance);
    if (selected) {
      const existing = appliances.find(a => a.name === selected.name);
      if (existing) {
        setAppliances(appliances.map(a => 
          a.name === selected.name ? { ...a, quantity: a.quantity + 1 } : a
        ));
      } else {
        setAppliances([...appliances, { 
          name: selected.name, 
          watts: selected.watts, 
          hours: 4, 
          quantity: 1 
        }]);
      }
      setSelectedAppliance("");
    }
  };

  // Add custom appliance
  const addCustomAppliance = () => {
    if (customApplianceName && customApplianceWatts > 0) {
      setAppliances([...appliances, {
        name: customApplianceName,
        watts: customApplianceWatts,
        hours: 4,
        quantity: 1,
      }]);
      setCustomApplianceName("");
      setCustomApplianceWatts(0);
    }
  };

  // Quick add appliance
  const quickAddAppliance = (appliance: typeof COMMON_APPLIANCES[0]) => {
    const existing = appliances.find(a => a.name === appliance.name);
    if (existing) {
      setAppliances(appliances.map(a => 
        a.name === appliance.name ? { ...a, quantity: a.quantity + 1 } : a
      ));
    } else {
      setAppliances([...appliances, { 
        name: appliance.name, 
        watts: appliance.watts, 
        hours: 4, 
        quantity: 1 
      }]);
    }
  };

  // Remove appliance
  const removeAppliance = (index: number) => {
    setAppliances(appliances.filter((_, i) => i !== index));
  };

  // Update appliance
  const updateAppliance = (index: number, field: keyof Appliance, value: number) => {
    const updated = [...appliances];
    updated[index] = { ...updated[index], [field]: value };
    setAppliances(updated);
  };

  // Format currency
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get AI advice
  const getAIAdvice = async () => {
    setIsLoadingAdvice(true);
    setAiAdvice(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('solar-advisor', {
        body: {
          calculation: {
            appliances,
            location,
            peakSunHours,
            autonomyDays,
            systemVoltage,
            depthOfDischarge: batteryConfig.dod,
            batteryType,
            totalDailyConsumption: calculations.totalDailyConsumption,
            totalPeakLoad: calculations.totalPeakLoad,
            recommendedBatteryCapacity: calculations.recommendedBatteryCapacity,
            recommendedInverterSize: calculations.recommendedInverterSize,
            recommendedSolarPanels: calculations.recommendedSolarPanels,
            estimatedCost: calculations.estimatedCost,
          },
        },
      });

      if (error) throw error;
      
      setAiAdvice(data);
      toast({
        title: "Analysis Complete",
        description: "Our AI solar expert has analyzed your system requirements.",
      });
    } catch (error) {
      console.error("Error getting AI advice:", error);
      toast({
        title: "Error",
        description: "Failed to get AI advice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  // Render AI advice with markdown-like formatting
  const renderAdvice = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h3 key={i} className="text-lg font-bold mt-4 mb-2 text-foreground">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('### ')) {
        return <h4 key={i} className="text-base font-semibold mt-3 mb-1 text-foreground">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold my-1">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <li key={i} className="ml-4 my-0.5 text-muted-foreground">{line.replace(/^[-•] /, '')}</li>;
      }
      if (line.match(/^\d+\./)) {
        return <li key={i} className="ml-4 my-0.5 list-decimal text-muted-foreground">{line.replace(/^\d+\.\s*/, '')}</li>;
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return <p key={i} className="my-1 text-muted-foreground">{line}</p>;
    });
  };

  // Group appliances by category for quick add
  const appliancesByCategory = COMMON_APPLIANCES.reduce((acc, app) => {
    if (!acc[app.category]) acc[app.category] = [];
    acc[app.category].push(app);
    return acc;
  }, {} as Record<string, typeof COMMON_APPLIANCES>);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl md:text-3xl">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calculator className="h-6 w-6" />
                </div>
                Solar Power Calculator
              </CardTitle>
              <CardDescription className="text-primary-foreground/80 mt-2 text-base">
                Calculate your exact solar needs with our advanced calculator. Get AI-powered recommendations tailored for Nigerian conditions.
              </CardDescription>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <Sun className="h-3 w-3 mr-1" /> Nigeria Optimized
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                <Bot className="h-3 w-3 mr-1" /> AI Powered
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Appliance Input */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="appliances" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appliances">Your Appliances</TabsTrigger>
              <TabsTrigger value="settings">System Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="appliances" className="space-y-4">
              {/* Quick Add Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Quick Add Appliances</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowQuickAdd(!showQuickAdd)}
                    >
                      {showQuickAdd ? "Hide" : "Show"}
                    </Button>
                  </div>
                </CardHeader>
                {showQuickAdd && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {Object.entries(appliancesByCategory).map(([category, apps]) => (
                        <div key={category}>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
                          <div className="flex flex-wrap gap-2">
                            {apps.map((app) => {
                              const Icon = app.icon;
                              const count = appliances.find(a => a.name === app.name)?.quantity || 0;
                              return (
                                <Button
                                  key={app.name}
                                  variant={count > 0 ? "default" : "outline"}
                                  size="sm"
                                  className="h-auto py-1.5 px-2.5"
                                  onClick={() => quickAddAppliance(app)}
                                >
                                  <Icon className="h-3.5 w-3.5 mr-1.5" />
                                  <span className="text-xs">{app.name}</span>
                                  {count > 0 && (
                                    <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-xs">
                                      {count}
                                    </Badge>
                                  )}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Custom Appliance */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Add Custom Appliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Appliance name"
                        value={customApplianceName}
                        onChange={(e) => setCustomApplianceName(e.target.value)}
                      />
                    </div>
                    <div className="w-full sm:w-32">
                      <Input
                        type="number"
                        placeholder="Watts"
                        value={customApplianceWatts || ""}
                        onChange={(e) => setCustomApplianceWatts(Number(e.target.value))}
                      />
                    </div>
                    <Button onClick={addCustomAppliance} className="shrink-0">
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Current Appliances List */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Your Load Profile</CardTitle>
                    <Badge variant="outline">
                      {appliances.length} items
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {appliances.map((appliance, index) => (
                      <div 
                        key={index} 
                        className="p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{appliance.name}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAppliance(index)}
                            className="text-destructive hover:text-destructive h-7 w-7 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Watts</Label>
                            <Input
                              type="number"
                              value={appliance.watts}
                              onChange={(e) => updateAppliance(index, "watts", Number(e.target.value))}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Hours/day</Label>
                            <Input
                              type="number"
                              value={appliance.hours}
                              onChange={(e) => updateAppliance(index, "hours", Number(e.target.value))}
                              className="h-8 text-sm"
                              max={24}
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Quantity</Label>
                            <Input
                              type="number"
                              value={appliance.quantity}
                              onChange={(e) => updateAppliance(index, "quantity", Number(e.target.value))}
                              className="h-8 text-sm"
                              min={1}
                            />
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground text-right">
                          Daily: {((appliance.watts * appliance.hours * appliance.quantity) / 1000).toFixed(2)} kWh
                        </div>
                      </div>
                    ))}
                    {appliances.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Zap className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>No appliances added yet.</p>
                        <p className="text-sm">Use Quick Add above or add custom appliances.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Location & Sun Hours</CardTitle>
                  <CardDescription>Select your location for accurate solar calculations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Your Location</Label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NIGERIAN_LOCATIONS.map((loc) => (
                          <SelectItem key={loc.name} value={loc.name}>
                            {loc.name} ({loc.sunHours} sun hours)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {location === "Other" && (
                    <div>
                      <Label>Custom Peak Sun Hours</Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[customSunHours]}
                          onValueChange={([v]) => setCustomSunHours(v)}
                          min={3}
                          max={7}
                          step={0.1}
                          className="flex-1"
                        />
                        <span className="w-12 text-right font-medium">{customSunHours}h</span>
                      </div>
                    </div>
                  )}
                  <div className="p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Sun className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">Peak Sun Hours: {peakSunHours}h/day</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This is the equivalent hours of full sunlight your panels will receive daily.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Battery Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Battery Type</Label>
                    <Select value={batteryType} onValueChange={setBatteryType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lithium">LiFePO4 (Lithium) - Recommended</SelectItem>
                        <SelectItem value="lead-acid">Lead-Acid (Budget)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {batteryType === "lithium" 
                        ? "90% DoD, 4000+ cycles, 10-15 year lifespan" 
                        : "50% DoD, 400 cycles, 2-3 year lifespan"}
                    </p>
                  </div>
                  
                  <div>
                    <Label>System Voltage</Label>
                    <Select 
                      value={systemVoltage.toString()} 
                      onValueChange={(v) => setSystemVoltage(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12V (Small systems)</SelectItem>
                        <SelectItem value="24">24V (Medium systems)</SelectItem>
                        <SelectItem value="48">48V (Large systems - Recommended)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Autonomy Days (Backup without sun)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[autonomyDays]}
                        onValueChange={([v]) => setAutonomyDays(v)}
                        min={0.5}
                        max={3}
                        step={0.5}
                        className="flex-1"
                      />
                      <span className="w-16 text-right font-medium">{autonomyDays} day{autonomyDays !== 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      How many days of backup power without any solar charging.
                    </p>
                  </div>

                  <div>
                    <Label>System Losses (%)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[systemLosses]}
                        onValueChange={([v]) => setSystemLosses(v)}
                        min={10}
                        max={30}
                        step={5}
                        className="flex-1"
                      />
                      <span className="w-12 text-right font-medium">{systemLosses}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Accounts for inverter efficiency, wiring losses, and temperature derating.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-4">
          {/* Power Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Power Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Daily Consumption</span>
                </div>
                <span className="font-bold text-primary">
                  {(calculations.totalDailyConsumption / 1000).toFixed(2)} kWh
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Peak Load</span>
                </div>
                <span className="font-bold text-blue-500">{calculations.totalPeakLoad}W</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-500/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Required Solar</span>
                </div>
                <span className="font-bold text-amber-500">{calculations.requiredSolarWatts}W</span>
              </div>
            </CardContent>
          </Card>

          {/* Recommended System */}
          <Card className="border-primary/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Recommended System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Battery Capacity</span>
                </div>
                <span className="font-semibold">
                  {calculations.recommendedBatteryCapacity.toFixed(1)} kWh
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Inverter Size</span>
                </div>
                <span className="font-semibold">{calculations.recommendedInverterSize}W</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Solar Panels (410W)</span>
                </div>
                <span className="font-semibold">{calculations.recommendedSolarPanels} panels</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">System Voltage</span>
                </div>
                <Badge variant="outline">{systemVoltage}V</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Cost Estimate */}
          <Card className="bg-gradient-to-br from-card to-accent/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-primary" />
                Investment Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Battery System ({batteryType})</span>
                <span>{formatNaira(calculations.estimatedCost.battery)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Inverter ({calculations.recommendedInverterSize}W)</span>
                <span>{formatNaira(calculations.estimatedCost.inverter)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Solar Panels ({calculations.recommendedSolarPanels}x 410W)</span>
                <span>{formatNaira(calculations.estimatedCost.panels)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Charge Controller (MPPT)</span>
                <span>{formatNaira(calculations.estimatedCost.chargeController)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Installation</span>
                <span>{formatNaira(calculations.estimatedCost.installation)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Accessories</span>
                <span>{formatNaira(calculations.estimatedCost.accessories)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Investment</span>
                <span className="text-primary">{formatNaira(calculations.estimatedCost.total)}</span>
              </div>
            </CardContent>
          </Card>

          {/* ROI Card */}
          <Card className="bg-green-500/10 border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Return on Investment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Monthly generator cost saved</span>
                <span className="font-semibold text-green-600">{formatNaira(calculations.monthlyGeneratorCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Payback period</span>
                <span className="font-semibold">{calculations.paybackMonths} months</span>
              </div>
              <Progress 
                value={Math.min((36 - calculations.paybackMonths) / 36 * 100, 100)} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                After payback, you save {formatNaira(calculations.monthlyGeneratorCost * 12)}/year
              </p>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="space-y-2">
            <Button 
              className="w-full" 
              size="lg"
              onClick={getAIAdvice}
              disabled={isLoadingAdvice || appliances.length === 0}
            >
              {isLoadingAdvice ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get AI Expert Analysis
                </>
              )}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <Link to="/shop">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Shop Products
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/contact">
                  <Phone className="h-4 w-4 mr-2" />
                  Get Quote
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Advice Section */}
      {(aiAdvice || isLoadingAdvice) && (
        <Card className="border-primary/50 bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="text-xl">AI Solar Expert Analysis</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  Personalized recommendations for your solar investment
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAdvice ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Analyzing your power needs...</p>
                <p className="text-sm text-muted-foreground">Our AI expert is reviewing your calculations</p>
              </div>
            ) : aiAdvice ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {renderAdvice(aiAdvice.advice)}
                
                <Separator className="my-6" />
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-primary/10 rounded-lg not-prose">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">Ready to get started?</p>
                      <p className="text-sm text-muted-foreground">Our team is here to help you make the switch to solar.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild>
                      <Link to="/contact">
                        Get Free Consultation <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="https://wa.me/2348012345678" target="_blank" rel="noopener noreferrer">
                        WhatsApp Us
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Why Solar in Nigeria?</h4>
                <p className="text-sm text-muted-foreground">
                  With electricity costs rising and frequent outages, solar provides reliable, cost-effective power. 
                  Most systems pay for themselves in 2-3 years.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Quality Guaranteed</h4>
                <p className="text-sm text-muted-foreground">
                  We only sell tier-1 solar equipment with manufacturer warranties. 
                  LiFePO4 batteries last 10-15 years with proper care.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
                <Sun className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Expert Installation</h4>
                <p className="text-sm text-muted-foreground">
                  Our certified technicians ensure optimal system performance. 
                  We provide ongoing support and maintenance services.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SolarCalculator;
