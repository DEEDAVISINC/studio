
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { Truck, Driver, Carrier } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, addYears } from "date-fns";

const truckSchema = z.object({
  name: z.string().min(2, { message: "Truck name must be at least 2 characters." }),
  licensePlate: z.string().min(3, { message: "License plate must be at least 3 characters." }),
  model: z.string().min(2, "Model is required."),
  year: z.coerce.number().min(1980, "Year must be 1980 or newer.").max(new Date().getFullYear() + 1, `Year cannot be in the future.`),
  carrierId: z.string({ required_error: "Carrier is required." }),
  driverId: z.string().optional(),
  maintenanceStatus: z.enum(['Good', 'Needs Service', 'In Service']),
  mc150DueDate: z.date().optional().nullable(),
  permitExpiryDate: z.date().optional().nullable(),
  taxDueDate: z.date().optional().nullable(),
});

type TruckFormData = z.infer<typeof truckSchema>;

interface AddTruckDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddTruck: (truck: Omit<Truck, 'id'> | Truck) => void; // Modified to accept Truck for updates
  truckToEdit?: Truck | null; 
  drivers: Driver[];
  carriers: Carrier[];
}

const UNASSIGNED_DRIVER_VALUE = "__UNASSIGNED_DRIVER__";

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
      mc150DueDate: null,
      permitExpiryDate: null,
      taxDueDate: null,
    },
  });

  const watchedDriverId = form.watch("driverId");
  const watchedCarrierId = form.watch("carrierId");

  useEffect(() => {
    if (!isOpen) return; // Don't run effects if dialog is closed

    if (truckToEdit) {
      const initialMc150DueDate = truckToEdit.mc150DueDate 
        ? (typeof truckToEdit.mc150DueDate === 'string' ? parseISO(truckToEdit.mc150DueDate) : truckToEdit.mc150DueDate) 
        : null;
      
      let derivedMc150DueDate = initialMc150DueDate;
      if (!initialMc150DueDate && truckToEdit.carrierId) {
        const carrier = carriers.find(c => c.id === truckToEdit.carrierId);
        if (carrier && carrier.mcs150FormDate) {
          try {
            let baseDate: Date;
            if (typeof carrier.mcs150FormDate === 'string') {
              baseDate = parseISO(carrier.mcs150FormDate);
            } else {
              baseDate = carrier.mcs150FormDate; // It's already a Date object
            }
            derivedMc150DueDate = addYears(baseDate, 2);
          } catch (e) { console.error("Error parsing carrier mcs150FormDate for prefill", e); }
        }
      }

      form.reset({
        ...truckToEdit,
        driverId: truckToEdit.driverId || undefined, // Ensure undefined for UNASSIGNED_DRIVER_VALUE
        mc150DueDate: derivedMc150DueDate,
        permitExpiryDate: truckToEdit.permitExpiryDate ? (typeof truckToEdit.permitExpiryDate === 'string' ? parseISO(truckToEdit.permitExpiryDate) : truckToEdit.permitExpiryDate) : null,
        taxDueDate: truckToEdit.taxDueDate ? (typeof truckToEdit.taxDueDate === 'string' ? parseISO(truckToEdit.taxDueDate) : truckToEdit.taxDueDate) : null,
      });
    } else {
      form.reset({
        name: '',
        licensePlate: '',
        model: '',
        year: new Date().getFullYear(),
        carrierId: '',
        driverId: undefined, // Ensure undefined for UNASSIGNED_DRIVER_VALUE
        maintenanceStatus: 'Good',
        mc150DueDate: null,
        permitExpiryDate: null,
        taxDueDate: null,
      });
    }
  }, [truckToEdit, form, isOpen, carriers]);


  useEffect(() => {
    if (!isOpen || !watchedCarrierId) return;

    const selectedCarrier = carriers.find(c => c.id === watchedCarrierId);
    if (selectedCarrier && selectedCarrier.mcs150FormDate) {
      try {
        let baseDate: Date;
        if (typeof selectedCarrier.mcs150FormDate === 'string') {
          baseDate = parseISO(selectedCarrier.mcs150FormDate);
        } else {
          baseDate = selectedCarrier.mcs150FormDate; // It's already a Date object
        }
        const newDueDate = addYears(baseDate, 2);
        form.setValue("mc150DueDate", newDueDate, { shouldValidate: true, shouldDirty: true });
      } catch (e) {
        console.error("Error calculating due date from carrier's MCS-150 date:", e);
        // Optionally clear or handle error: form.setValue("mc150DueDate", null);
      }
    } else if (selectedCarrier && !selectedCarrier.mcs150FormDate) {
      // If carrier has no MCS-150 date, you might want to clear mc150DueDate
      // or leave it for manual input. For now, it only pre-fills if carrier has the date.
      // form.setValue("mc150DueDate", null, { shouldValidate: true, shouldDirty: true }); // Example to clear if desired
    }
  }, [watchedCarrierId, carriers, form, isOpen]);


  const onSubmit = (data: TruckFormData) => {
    const submissionData = {
        ...data,
        driverId: data.driverId === UNASSIGNED_DRIVER_VALUE ? undefined : data.driverId,
        mc150DueDate: data.mc150DueDate ? data.mc150DueDate : undefined, // Already a Date object or null
        permitExpiryDate: data.permitExpiryDate ? data.permitExpiryDate : undefined,
        taxDueDate: data.taxDueDate ? data.taxDueDate : undefined,
    };
    
    if (truckToEdit) {
        onAddTruck({ ...truckToEdit, ...submissionData } as Truck);
    } else {
        onAddTruck(submissionData as Omit<Truck, 'id'>);
    }
    
    toast({
      title: truckToEdit ? "Truck Updated" : "Truck Added",
      description: `Truck "${data.name}" has been successfully ${truckToEdit ? 'updated' : 'added'}.`,
    });
    // form.reset(); // No need to reset here if onOpenChange(false) closes and re-initializes
    onOpenChange(false);
  };

  const DatePickerField = ({ name, label }: { name: "mc150DueDate" | "permitExpiryDate" | "taxDueDate"; label: string }) => (
    <div>
      <Label htmlFor={name} className="text-foreground">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal mt-1 bg-background border-border focus:ring-primary", !form.watch(name) && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {form.watch(name) ? format(form.watch(name)!, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={form.watch(name) || undefined}
            onSelect={(date) => form.setValue(name, date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">{truckToEdit ? "Edit Truck" : "Add New Truck"}</DialogTitle>
          <DialogDescription>
            Fill in the details to {truckToEdit ? "update the" : "add a new"} truck.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <Label htmlFor="name" className="text-foreground">Truck Name</Label>
            <Input id="name" {...form.register("name")} className="mt-1 bg-background border-border focus:ring-primary" />
            {form.formState.errors.name && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
                <Label htmlFor="licensePlate" className="text-foreground">License Plate</Label>
                <Input id="licensePlate" {...form.register("licensePlate")} className="mt-1 bg-background border-border focus:ring-primary" />
                {form.formState.errors.licensePlate && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.licensePlate.message}</p>}
            </div>
            <div>
                <Label htmlFor="model" className="text-foreground">Model</Label>
                <Input id="model" {...form.register("model")} className="mt-1 bg-background border-border focus:ring-primary" />
                {form.formState.errors.model && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.model.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
                <Label htmlFor="year" className="text-foreground">Year</Label>
                <Input id="year" type="number" {...form.register("year")} className="mt-1 bg-background border-border focus:ring-primary" />
                {form.formState.errors.year && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.year.message}</p>}
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
                {form.formState.errors.maintenanceStatus && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.maintenanceStatus.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div>
                <Label htmlFor="carrierId" className="text-foreground">Carrier</Label>
                <Select 
                    onValueChange={(value) => form.setValue("carrierId", value)} 
                    value={form.watch("carrierId") || ""}
                >
                <SelectTrigger id="carrierId" className="mt-1 bg-background border-border focus:ring-primary">
                    <SelectValue placeholder="Select a carrier" />
                </SelectTrigger>
                <SelectContent>
                    {carriers.map(carrier => (
                    <SelectItem key={carrier.id} value={carrier.id}>{carrier.name}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
                {form.formState.errors.carrierId && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.carrierId.message}</p>}
            </div>
            <div>
                <Label htmlFor="driverId" className="text-foreground">Driver (Optional)</Label>
                <Select
                  onValueChange={(value) => {
                    form.setValue("driverId", value === UNASSIGNED_DRIVER_VALUE ? undefined : value);
                  }}
                  value={watchedDriverId === undefined ? UNASSIGNED_DRIVER_VALUE : watchedDriverId}
                >
                <SelectTrigger id="driverId" className="mt-1 bg-background border-border focus:ring-primary">
                    <SelectValue placeholder="Assign a driver" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={UNASSIGNED_DRIVER_VALUE}>Unassigned</SelectItem>
                    {drivers.map(driver => (
                    <SelectItem key={driver.id} value={driver.id}>{driver.name}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
          </div>
          
          <h3 className="text-md font-semibold text-foreground pt-2 border-t mt-4">Compliance Dates</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <DatePickerField name="mc150DueDate" label="MC150 Due Date" />
            <DatePickerField name="permitExpiryDate" label="Permit Expiry" />
            <DatePickerField name="taxDueDate" label="Tax Due Date" />
          </div>


          <DialogFooter className="pt-4 sticky bottom-0 bg-card pb-1">
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

