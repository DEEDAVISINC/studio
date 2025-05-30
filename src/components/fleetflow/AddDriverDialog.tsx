
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
import type { Driver } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const driverSchema = z.object({
  name: z.string().min(2, { message: "Driver name must be at least 2 characters." }),
  contactPhone: z.string().min(10, { message: "Phone number must be at least 10 digits." }).regex(/^\S*$/, "Phone number should not contain spaces."),
  contactEmail: z.string().email({ message: "Invalid email address." }),
  licenseNumber: z.string().min(5, { message: "License number must be at least 5 characters." }),
});

export type DriverFormData = z.infer<typeof driverSchema>;

interface AddDriverDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSaveDriver: (data: DriverFormData) => void;
  driverToEdit?: Driver | null;
}

export function AddDriverDialog({ isOpen, onOpenChange, onSaveDriver, driverToEdit }: AddDriverDialogProps) {
  const { toast } = useToast();
  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: '',
      contactPhone: '',
      contactEmail: '',
      licenseNumber: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (driverToEdit) {
        form.reset(driverToEdit);
      } else {
        form.reset({
          name: '',
          contactPhone: '',
          contactEmail: '',
          licenseNumber: '',
        });
      }
    }
  }, [driverToEdit, form, isOpen]);

  const onSubmit = (data: DriverFormData) => {
    onSaveDriver(data);
    toast({
      title: driverToEdit ? "Driver Updated" : "Driver Added",
      description: `Driver "${data.name}" has been successfully ${driverToEdit ? 'updated' : 'added'}.`,
    });
    // No need to call onOpenChange(false) here as it's handled by the page
    // No need to call form.reset() here if the page handles closing and re-initializing
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">{driverToEdit ? "Edit Driver" : "Add New Driver"}</DialogTitle>
          <DialogDescription>
            Fill in the details for the {driverToEdit ? "driver." : "new driver."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="name" className="text-foreground">Full Name</Label>
            <Input id="name" {...form.register("name")} className="mt-1 bg-background border-border focus:ring-primary" />
            {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="contactPhone" className="text-foreground">Contact Phone</Label>
            <Input id="contactPhone" {...form.register("contactPhone")} className="mt-1 bg-background border-border focus:ring-primary" />
            {form.formState.errors.contactPhone && <p className="text-sm text-destructive mt-1">{form.formState.errors.contactPhone.message}</p>}
          </div>
          <div>
            <Label htmlFor="contactEmail" className="text-foreground">Contact Email</Label>
            <Input id="contactEmail" type="email" {...form.register("contactEmail")} className="mt-1 bg-background border-border focus:ring-primary" />
            {form.formState.errors.contactEmail && <p className="text-sm text-destructive mt-1">{form.formState.errors.contactEmail.message}</p>}
          </div>
          <div>
            <Label htmlFor="licenseNumber" className="text-foreground">License Number</Label>
            <Input id="licenseNumber" {...form.register("licenseNumber")} className="mt-1 bg-background border-border focus:ring-primary" />
            {form.formState.errors.licenseNumber && <p className="text-sm text-destructive mt-1">{form.formState.errors.licenseNumber.message}</p>}
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {driverToEdit ? "Save Changes" : "Add Driver"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
