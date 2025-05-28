"use client";
import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Carrier } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const carrierSchema = z.object({
  name: z.string().min(2, { message: "Carrier name must be at least 2 characters." }),
  contactPerson: z.string().min(2, { message: "Contact person name must be at least 2 characters." }),
  contactEmail: z.string().email({ message: "Invalid email address." }),
  contactPhone: z.string().min(10, { message: "Phone number must be at least 10 digits." }).regex(/^\S*$/, "Phone number should not contain spaces."),
  contractDetails: z.string().min(10, { message: "Contract details must be at least 10 characters." }),
});

type CarrierFormData = z.infer<typeof carrierSchema>;

interface AddCarrierDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddCarrier: (carrier: Omit<Carrier, 'id'>) => void;
  carrierToEdit?: Carrier | null;
}

export function AddCarrierDialog({ isOpen, onOpenChange, onAddCarrier, carrierToEdit }: AddCarrierDialogProps) {
  const { toast } = useToast();
  const form = useForm<CarrierFormData>({
    resolver: zodResolver(carrierSchema),
    defaultValues: {
      name: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      contractDetails: '',
    },
  });

  useEffect(() => {
    if (carrierToEdit) {
      form.reset(carrierToEdit);
    } else {
      form.reset({
        name: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        contractDetails: '',
      });
    }
  }, [carrierToEdit, form, isOpen]);

  const onSubmit = (data: CarrierFormData) => {
    onAddCarrier(data);
    toast({
      title: "Carrier Added",
      description: `Carrier "${data.name}" has been successfully added.`,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">{carrierToEdit ? "Edit Carrier" : "Add New Carrier"}</DialogTitle>
          <DialogDescription>
            Fill in the details for the {carrierToEdit ? "carrier." : "new carrier."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <Label htmlFor="name" className="text-foreground">Carrier Name</Label>
            <Input id="name" {...form.register("name")} className="mt-1 bg-background border-border focus:ring-primary" />
            {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="contactPerson" className="text-foreground">Contact Person</Label>
            <Input id="contactPerson" {...form.register("contactPerson")} className="mt-1 bg-background border-border focus:ring-primary" />
            {form.formState.errors.contactPerson && <p className="text-sm text-destructive mt-1">{form.formState.errors.contactPerson.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactEmail" className="text-foreground">Contact Email</Label>
              <Input id="contactEmail" type="email" {...form.register("contactEmail")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.contactEmail && <p className="text-sm text-destructive mt-1">{form.formState.errors.contactEmail.message}</p>}
            </div>
            <div>
              <Label htmlFor="contactPhone" className="text-foreground">Contact Phone</Label>
              <Input id="contactPhone" {...form.register("contactPhone")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.contactPhone && <p className="text-sm text-destructive mt-1">{form.formState.errors.contactPhone.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="contractDetails" className="text-foreground">Contract Details</Label>
            <Textarea id="contractDetails" {...form.register("contractDetails")} className="mt-1 bg-background border-border focus:ring-primary" rows={3} />
            {form.formState.errors.contractDetails && <p className="text-sm text-destructive mt-1">{form.formState.errors.contractDetails.message}</p>}
          </div>
          <DialogFooter className="pt-4 sticky bottom-0 bg-card pb-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {carrierToEdit ? "Save Changes" : "Add Carrier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
