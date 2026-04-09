import { Input } from "@/components/ui/input";
import { Appliance } from "@/lib/solar-data";

interface ApplianceCardProps {
  appliance: Appliance;
  onUpdate: (id: string, field: keyof Appliance, value: string | number) => void;
  onRemove: (id: string) => void;
}

const ApplianceCard = ({ appliance, onUpdate, onRemove }: ApplianceCardProps) => {
  return (
    <div className="relative rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-foreground">{appliance.name}</h4>
        <button
          onClick={() => onRemove(appliance.id)}
          className="text-xs font-bold uppercase tracking-wide text-destructive transition-colors hover:text-destructive/80"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 xs:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Watts</label>
          <Input
            type="number"
            value={appliance.watts}
            onChange={(e) => onUpdate(appliance.id, "watts", Number(e.target.value))}
            className="h-9 bg-background text-sm"
            min={0}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Hours/day</label>
          <Input
            type="number"
            value={appliance.hoursPerDay}
            onChange={(e) => onUpdate(appliance.id, "hoursPerDay", Number(e.target.value))}
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
            value={appliance.quantity}
            onChange={(e) => onUpdate(appliance.id, "quantity", Number(e.target.value))}
            className="h-9 bg-background text-sm"
            min={1}
          />
        </div>
      </div>
    </div>
  );
};

export default ApplianceCard;
