import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdjustPriceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (percent: number) => void;
  disabled?: boolean;
}

const AdjustPriceModal = ({ open, onOpenChange, onConfirm, disabled }: AdjustPriceModalProps) => {
  const [percent, setPercent] = useState<number>(0);

  React.useEffect(() => {
    if (open) setPercent(0);
  }, [open]);

  const submit = () => {
    if (isNaN(percent)) return;
    onConfirm(percent);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust prices for selected products</DialogTitle>
          <DialogDescription>Enter a percentage to increase (positive) or decrease (negative) prices, e.g., 10 or -5.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label>Percentage</Label>
            <Input type="number" value={String(percent)} onChange={(e) => setPercent(Number(e.target.value))} className="mt-2" />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button disabled={disabled} onClick={submit}>Apply</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdjustPriceModal;
