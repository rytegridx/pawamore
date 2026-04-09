import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddApplianceFormProps {
  onAdd: (name: string, watts: number, hours: number, qty: number) => void;
}

const AddApplianceForm = ({ onAdd }: AddApplianceFormProps) => {
  const [name, setName] = useState("");
  const [watts, setWatts] = useState("");
  const [hours, setHours] = useState("");
  const [qty, setQty] = useState("1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !watts || !hours) return;

    onAdd(name, Number(watts), Number(hours), Number(qty) || 1);
    setName("");
    setWatts("");
    setHours("");
    setQty("1");
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-dashed border-border bg-card p-4">
      <h4 className="mb-3 text-sm font-semibold">Add Custom Appliance</h4>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Appliance Name</label>
          <Input
            placeholder="e.g., Refrigerator"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 bg-background text-sm"
          />
        </div>
        <div className="grid grid-cols-1 gap-2 xs:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Watts</label>
            <Input
              type="number"
              placeholder="150"
              value={watts}
              onChange={(e) => setWatts(e.target.value)}
              className="h-9 bg-background text-sm"
              min={0}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Hours/day</label>
            <Input
              type="number"
              placeholder="8"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="h-9 bg-background text-sm"
              min={0}
              max={24}
              step={0.5}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Quantity</label>
            <Input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="h-9 bg-background text-sm"
              min={1}
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-primary text-xs font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Appliance
        </Button>
      </div>
    </form>
  );
};

export default AddApplianceForm;
