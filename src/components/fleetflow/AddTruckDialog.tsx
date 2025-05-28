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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Truck, Driver, Carrier } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const truckSchema = z.object({
  name: z.string().min(2, { message: "Truck name must be at least 2 characters." }),
  licensePlate: z.string().min(3, { message: "License plate must be at least 3 characters." }),
  model: z.string().min(2, "Model is required."),
  year: z.coerce.number().min(1980, "Year must be 1980 or newer.").max(new Date().getFullYear() + 1, `Year cannot be in the future.`),
  carrierId: z.string({ required_error: "Carrier is required." }),
  driverId: z.string().optional(),
  maintenanceStatus: z.enum(['Good', 'Needs Service', 'In Service']),
});

type TruckFormData = z.infer<typeof truckSchema>;

interface AddTruckDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddTruck: (truck: Omit<Truck, 'id'>) => void;
  truckToEdit?: Truck | null; // Optional: for editing
  drivers: Driver[];
  carriers: Carrier[];
}

export function AddTruckDialog({ isOpen, onOpenChange, onAddTruck, truckToEdit, drivers, carriers }: AddTruckDialogProps) {
  const { toast } = useToast();
  const form = useForm<TruckFormData>({
    resolver: zodResolver(truckSchema),
    defaultValues: {
      name: '',
      licensePlate: '',
      model: '',
      year: new Date().getFullYear(),
      carrierId: '',
      driverId: undefined,
      maintenanceStatus: 'Good',
    },
  });

  useEffect(() => {
    if (truckToEdit) {
      form.reset(truckToEdit);
    } else {
      form.reset({ // Reset to default for adding new
        name: '',
        licensePlate: '',
        model: '',
        year: new Date().getFullYear(),
        carrierId: '',
        driverId: undefined,
        maintenanceStatus: 'Good',
      });
    }
  }, [truckToEdit, form, isOpen]); // Reset form when dialog opens or truckToEdit changes

  const onSubmit = (data: TruckFormData) => {
    // If editing, onUpdateTruck would be called
    // For now, only adding new
    onAddTruck(data);
    toast({
      title: "Truck Added",
      description: `Truck "${data.name}" has been successfully added.`,
      variant: "default", // 'default' uses primary color for accent
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">{truckToEdit ? "Edit Truck" : "Add New Truck"}</DialogTitle>
          <DialogDescription>
            Fill in the details below to {truckToEdit ? "update the" : "add a new"} truck to the fleet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="name" className="text-foreground">Truck Name</Label>
            <Input id="name" {...form.register("name")} className="mt-1 bg-background border-border focus:ring-primary" />
            {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="licensePlate" className="text-foreground">License Plate</Label>
            <Input id="licensePlate" {...form.register("licensePlate")} className="mt-1 bg-background border-border focus:ring-primary" />
            {form.formState.errors.licensePlate && <p className="text-sm text-destructive mt-1">{form.formState.errors.licensePlate.message}</p>}
          </div>
           <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="model" className="text-foreground">Model</Label>
              <Input id="model" {...form.register("model")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.model && <p className="text-sm text-destructive mt-1">{form.formState.errors.model.message}</p>}
            </div>
            <div>
              <Label htmlFor="year" className="text-foreground">Year</Label>
              <Input id="year" type="number" {...form.register("year")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.year && <p className="text-sm text-destructive mt-1">{form.formState.errors.year.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="carrierId" className="text-foreground">Carrier</Label>
            <Select onValueChange={(value) => form.setValue("carrierId", value)} defaultValue={form.getValues("carrierId")}>
              <SelectTrigger id="carrierId" className="mt-1 bg-background border-border focus:ring-primary">
                <SelectValue placeholder="Select a carrier" />
              </SelectTrigger>
              <SelectContent>
                {carriers.map(carrier => (
                  <SelectItem key={carrier.id} value={carrier.id}>{carrier.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.carrierId && <p className="text-sm text-destructive mt-1">{form.formState.errors.carrierId.message}</p>}
          </div>
          <div>
            <Label htmlFor="driverId" className="text-foreground">Driver (Optional)</Label>
            <Select onValueChange={(value) => form.setValue("driverId", value)} defaultValue={form.getValues("driverId")}>
              <SelectTrigger id="driverId" className="mt-1 bg-background border-border focus:ring-primary">
                <SelectValue placeholder="Assign a driver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {drivers.map(driver => (
                  <SelectItem key={driver.id} value={driver.id}>{driver.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="maintenanceStatus" className="text-foreground">Maintenance Status</Label>
            <Select onValueChange={(value: Truck['maintenanceStatus']) => form.setValue("maintenanceStatus", value)} defaultValue={form.getValues("maintenanceStatus")}>
              <SelectTrigger id="maintenanceStatus" className="mt-1 bg-background border-border focus:ring-primary">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Needs Service">Needs Service</SelectItem>
                <SelectItem value="In Service">In Service</SelectItem>
              </SelectContent>
            </Select>
             {form.formState.errors.maintenanceStatus && <p className="text-sm text-destructive mt-1">{form.formState.errors.maintenanceStatus.message}</p>}
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {truckToEdit ? "Save Changes" : "Add Truck"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
