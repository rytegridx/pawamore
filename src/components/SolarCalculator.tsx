import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calculator, Zap, Battery, Sun, Clock } from "lucide-react";

interface Appliance {
  name: string;
  watts: number;
  hours: number;
  quantity: number;
}

const SolarCalculator = () => {
  const [appliances, setAppliances] = useState<Appliance[]>([
    { name: "LED Light", watts: 15, hours: 6, quantity: 5 },
    { name: "TV", watts: 65, hours: 4, quantity: 1 },
    { name: "Fan", watts: 35, hours: 8, quantity: 2 },
    { name: "Laptop", watts: 65, hours: 4, quantity: 1 },
  ]);

  const [customAppliance, setCustomAppliance] = useState({
    name: "",
    watts: 0,
    hours: 0,
    quantity: 1,
  });

  const addAppliance = () => {
    if (customAppliance.name && customAppliance.watts > 0) {
      setAppliances([...appliances, { ...customAppliance }]);
      setCustomAppliance({ name: "", watts: 0, hours: 0, quantity: 1 });
    }
  };

  const removeAppliance = (index: number) => {
    setAppliances(appliances.filter((_, i) => i !== index));
  };

  const updateAppliance = (index: number, field: keyof Appliance, value: number) => {
    const updated = [...appliances];
    updated[index] = { ...updated[index], [field]: value };
    setAppliances(updated);
  };

  // Calculations
  const totalDailyConsumption = appliances.reduce(
    (sum, app) => sum + app.watts * app.hours * app.quantity,
    0
  );

  const totalPeakLoad = appliances.reduce(
    (sum, app) => sum + app.watts * app.quantity,
    0
  );

  const recommendedBatteryCapacity = (totalDailyConsumption * 1.2) / 1000; // 20% buffer, convert to kWh
  const recommendedInverterSize = Math.ceil(totalPeakLoad * 1.3); // 30% overhead
  const recommendedSolarPanels = Math.ceil((totalDailyConsumption / 1000) / 4); // Assuming 4 peak sun hours

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Rough cost estimates (in Naira)
  const estimatedCost = {
    battery: recommendedBatteryCapacity * 200000,
    inverter: recommendedInverterSize * 300,
    panels: recommendedSolarPanels * 150000,
    installation: 150000,
  };

  const totalCost = Object.values(estimatedCost).reduce((sum, cost) => sum + cost, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Calculator className="h-6 w-6" />
            Solar Power Calculator
          </CardTitle>
          <CardDescription className="text-orange-50">
            Calculate your solar power needs and get instant recommendations
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Current Appliances */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Appliances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {appliances.map((appliance, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">{appliance.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAppliance(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Watts</Label>
                      <Input
                        type="number"
                        value={appliance.watts}
                        onChange={(e) =>
                          updateAppliance(index, "watts", Number(e.target.value))
                        }
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Hours/day</Label>
                      <Input
                        type="number"
                        value={appliance.hours}
                        onChange={(e) =>
                          updateAppliance(index, "hours", Number(e.target.value))
                        }
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        value={appliance.quantity}
                        onChange={(e) =>
                          updateAppliance(index, "quantity", Number(e.target.value))
                        }
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Add New Appliance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Appliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Appliance Name</Label>
                <Input
                  value={customAppliance.name}
                  onChange={(e) =>
                    setCustomAppliance({ ...customAppliance, name: e.target.value })
                  }
                  placeholder="e.g., Refrigerator"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Watts</Label>
                  <Input
                    type="number"
                    value={customAppliance.watts || ""}
                    onChange={(e) =>
                      setCustomAppliance({ ...customAppliance, watts: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>Hours/day</Label>
                  <Input
                    type="number"
                    value={customAppliance.hours || ""}
                    onChange={(e) =>
                      setCustomAppliance({ ...customAppliance, hours: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={customAppliance.quantity}
                    onChange={(e) =>
                      setCustomAppliance({ ...customAppliance, quantity: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <Button onClick={addAppliance} className="w-full">
                Add Appliance
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Power Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                Power Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Daily Consumption</span>
                </div>
                <span className="font-bold text-orange-600">
                  {(totalDailyConsumption / 1000).toFixed(2)} kWh
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Peak Load</span>
                </div>
                <span className="font-bold text-blue-600">{totalPeakLoad}W</span>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-500" />
                Recommended System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Battery className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Battery Capacity</span>
                  </div>
                  <span className="font-semibold">
                    {recommendedBatteryCapacity.toFixed(1)} kWh
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Inverter Size</span>
                  </div>
                  <span className="font-semibold">{recommendedInverterSize}W</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Solar Panels (410W)</span>
                  </div>
                  <span className="font-semibold">{recommendedSolarPanels} panels</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Estimate */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-lg">Estimated Cost</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Battery System</span>
                <span>{formatNaira(estimatedCost.battery)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Inverter</span>
                <span>{formatNaira(estimatedCost.inverter)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Solar Panels</span>
                <span>{formatNaira(estimatedCost.panels)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Installation</span>
                <span>{formatNaira(estimatedCost.installation)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg text-orange-600">
                <span>Total Estimate</span>
                <span>{formatNaira(totalCost)}</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                * Prices are estimates. Contact us for exact quote.
              </p>
            </CardContent>
          </Card>

          {/* CTA */}
          <Button className="w-full bg-orange-600 hover:bg-orange-700" size="lg">
            Get Free Consultation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SolarCalculator;
