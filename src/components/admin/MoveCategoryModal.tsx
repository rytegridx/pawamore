import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MoveCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: { id: string; name: string }[];
  onConfirm: (categoryId: string) => void;
  disabled?: boolean;
}

const MoveCategoryModal = ({ open, onOpenChange, categories, onConfirm, disabled }: MoveCategoryModalProps) => {
  const [value, setValue] = useState<string>(categories?.[0]?.id || "");

  React.useEffect(() => {
    if (open) setValue(categories?.[0]?.id || "");
  }, [open, categories]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Move selected products to category</DialogTitle>
          <DialogDescription>Choose a category to move the currently selected products into.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label className="mb-2">Category</Label>
            <Select value={value} onValueChange={(v) => setValue(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button disabled={!value || disabled} onClick={() => { onConfirm(value); onOpenChange(false); }}>
              Move
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoveCategoryModal;
