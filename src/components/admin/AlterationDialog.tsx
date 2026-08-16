"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const URGENCY_OPTIONS = [
  { value: "1", label: "1 · Immediate / Urgent" },
  { value: "2", label: "2 · Priority" },
  { value: "3", label: "3 · Normal" },
];

interface AlterationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMembersViaRole: any[];
  isSubmitting: boolean;
  onConfirm: (payload: { tailorId: string; urgency: "1" | "2" | "3" }) => void;
}

/**
 * "Returned for Alteration" flow: internal-only tailor assignment + urgency.
 * This priority (1/2/3) is INTERNAL ONLY — never render it anywhere
 * customer-facing.
 */
const AlterationDialog: React.FC<AlterationDialogProps> = ({
  open,
  onOpenChange,
  teamMembersViaRole,
  isSubmitting,
  onConfirm,
}) => {
  const [tailorId, setTailorId] = useState("");
  const [urgency, setUrgency] = useState<"1" | "2" | "3">("3");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="alteration-dialog">
        <DialogHeader>
          <DialogTitle>Return for Alteration</DialogTitle>
          <DialogDescription>
            The customer will be notified that their order is being taken back
            for alteration. Assign a tailor and set the internal urgency below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Assign Tailor</Label>
            <Select value={tailorId} onValueChange={setTailorId}>
              <SelectTrigger data-testid="alteration-tailor-select">
                <SelectValue placeholder="Select a tailor" />
              </SelectTrigger>
              <SelectContent>
                {teamMembersViaRole?.map((el: any) => (
                  <SelectItem key={el._id} value={el._id}>
                    {el.firstName} {el.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Urgency (internal only — never shown to customer)</Label>
            <RadioGroup
              value={urgency}
              onValueChange={(v) => setUrgency(v as "1" | "2" | "3")}
              data-testid="alteration-urgency-group"
            >
              {URGENCY_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value} id={`urgency-${opt.value}`} />
                  <Label htmlFor={`urgency-${opt.value}`} className="font-normal">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!tailorId || isSubmitting}
            onClick={() => onConfirm({ tailorId, urgency })}
            data-testid="alteration-confirm-btn"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Return for Alteration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlterationDialog;
