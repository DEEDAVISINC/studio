
"use client";
import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ScheduleEntry, Truck, Driver, ScheduleType } from "@/lib/types";
import { SCHEDULE_TYPES } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, DollarSign, Package, Users } from 'lucide-react'; // Added Users icon
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

const scheduleEntrySchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  truckId: z.string({ required_error: "Truck is required." }),
  driverId: z.string().optional(),
  start: z.date({ required_error: "Start date is required." }),
  end: z.date({ required_error: "End date is required." }),
  origin: z.string().min(2, "Origin is required."),
  destination: z.string().min(2, "Destination is required."),
  loadValue: z.coerce.number().positive({ message: "Load value must be a positive amount." }).optional(),
  notes: z.string().optional(),
  color: z.string().optional(),
  scheduleType: z.enum(SCHEDULE_TYPES).default('Delivery'),
  isPartialLoad: z.boolean().optional().default(false),
  isTeamDriven: z.boolean().optional().default(false), // Added isTeamDriven
}).refine(data => data.end >= data.start, {
  message: "End date cannot be before start date.",
  path: ["end"],
});

type ScheduleEntryFormData = z.infer<typeof scheduleEntrySchema>;

interface AddScheduleEntryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddScheduleEntry: (entry: Omit<ScheduleEntry, 'id'> | ScheduleEntry) => ScheduleEntry | null;
  entryToEdit?: ScheduleEntry | null;
  trucks: Truck[];
  drivers: Driver[];
}

const UNASSIGNED_DRIVER_VALUE = "__UNASSIGNED_DRIVER_SCHEDULE__";

const colorOptions = [
  { label: "Primary", value: "hsl(var(--primary))" },
  { label: "Accent", value: "hsl(var(--accent))" },
  { label: "Destructive", value: "hsl(var(--destructive))" },
  { label: "Blue", value: "hsl(221.2 83.2% 53.3%)" },
  { label: "Green", value: "hsl(142.1 76.2% 36.3%)" },
  { label: "Yellow", value: "hsl(47.9 95.8% 53.1%)" },
  { label: "Orange", value: "hsl(24.6 95% 53.1%)" },
];

export function AddScheduleEntryDialog({ isOpen, onOpenChange, onAddScheduleEntry, entryToEdit, trucks, drivers }: AddScheduleEntryDialogProps) {
  const { toast } = useToast();
  const form = useForm<ScheduleEntryFormData>({
    resolver: zodResolver(scheduleEntrySchema),
    defaultValues: {
      title: '',
      truckId: '',
      driverId: undefined,
      start: new Date(),
      end: new Date(new Date().setDate(new Date().getDate() + 1)),
      origin: '',
      destination: '',
      loadValue: undefined,
      notes: '',
      color: colorOptions[0].value,
      scheduleType: 'Delivery',
      isPartialLoad: false,
      isTeamDriven: false, // Added default
    },
  });

  const watchedDriverId = form.watch("driverId");

  useEffect(() => {
    if (entryToEdit) {
      form.reset({
        ...entryToEdit,
        start: new Date(entryToEdit.start),
        end: new Date(entryToEdit.end),
        driverId: entryToEdit.driverId || undefined,
        loadValue: entryToEdit.loadValue ?? undefined, 
        scheduleType: entryToEdit.scheduleType || 'Delivery',
        isPartialLoad: entryToEdit.isPartialLoad || false,
        isTeamDriven: entryToEdit.isTeamDriven || false, // Reset isTeamDriven
      });
    } else {
      form.reset({
        title: '',
        truckId: '',
        driverId: undefined,
        start: new Date(),
        end: new Date(new Date().setDate(new Date().getDate() + 1)),
        origin: '',
        destination: '',
        loadValue: undefined,
        notes: '',
        color: colorOptions[0].value,
        scheduleType: 'Delivery',
        isPartialLoad: false,
        isTeamDriven: false, // Reset isTeamDriven
      });
    }
  }, [entryToEdit, form, isOpen]);

  const onSubmit = (data: ScheduleEntryFormData) => {
    const submissionData = {
      ...data,
      driverId: data.driverId === UNASSIGNED_DRIVER_VALUE ? undefined : data.driverId,
    };
    
    const result = onAddScheduleEntry(submissionData);

    if (result) {
      toast({
        title: entryToEdit ? "Schedule Entry Updated" : "Schedule Entry Added",
        description: `Entry "${data.title}" has been successfully ${entryToEdit ? 'updated' : 'added'}.`,
      });
      form.reset();
      onOpenChange(false);
    } 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">{entryToEdit ? "Edit Schedule Entry" : "Add New Schedule Entry"}</DialogTitle>
          <DialogDescription>
            Fill in the details for the schedule entry.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <Label htmlFor="title" className="text-foreground">Title</Label>
            <Input id="title" {...form.register("title")} className="mt-1 bg-background border-border focus:ring-primary" />
            {form.formState.errors.title && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div>
                <Label htmlFor="scheduleType" className="text-foreground">Schedule Type</Label>
                <Select onValueChange={(value: ScheduleType) => form.setValue("scheduleType", value)} value={form.watch("scheduleType") || 'Delivery'}>
                <SelectTrigger id="scheduleType" className="mt-1 bg-background border-border focus:ring-primary">
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Select type" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {SCHEDULE_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
                </Select>
                {form.formState.errors.scheduleType && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.scheduleType.message}</p>}
            </div>
            <div>
              <Label htmlFor="truckId" className="text-foreground">Truck</Label>
              <Select onValueChange={(value) => form.setValue("truckId", value)} value={form.watch("truckId") || ""}>
                <SelectTrigger id="truckId" className="mt-1 bg-background border-border focus:ring-primary">
                  <SelectValue placeholder="Select truck" />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map(truck => <SelectItem key={truck.id} value={truck.id}>{truck.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {form.formState.errors.truckId && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.truckId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="driverId" className="text-foreground">Driver (Optional)</Label>
              <Select
                onValueChange={(value) => {
                  form.setValue("driverId", value === UNASSIGNED_DRIVER_VALUE ? undefined : value);
                }}
                value={watchedDriverId === undefined ? UNASSIGNED_DRIVER_VALUE : watchedDriverId}
              >
                <SelectTrigger id="driverId" className="mt-1 bg-background border-border focus:ring-primary">
                  <SelectValue placeholder="Assign driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED_DRIVER_VALUE}>Unassigned</SelectItem>
                  {drivers.map(driver => <SelectItem key={driver.id} value={driver.id}>{driver.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
                <Label htmlFor="color" className="text-foreground">Event Color</Label>
                <Select onValueChange={(value) => form.setValue("color", value)} value={form.watch("color") || colorOptions[0].value}>
                <SelectTrigger id="color" className="mt-1 bg-background border-border focus:ring-primary">
                    <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                    {colorOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: opt.value }}></div>
                        {opt.label}
                        </div>
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
          </div>


          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start" className="text-foreground">Start Date &amp; Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal mt-1 bg-background border-border focus:ring-primary", !form.watch("start") && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("start") ? format(form.watch("start"), "PPP HH:mm") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={form.watch("start")} onSelect={(date) => form.setValue("start", date || new Date())} initialFocus />
                  <Input type="time" className="mt-1 p-2 border-t" 
                    defaultValue={format(form.watch("start"), "HH:mm")}
                    onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':').map(Number);
                        const newDate = new Date(form.watch("start"));
                        newDate.setHours(hours, minutes);
                        form.setValue("start", newDate);
                    }}
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.start && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.start.message}</p>}
            </div>
            <div>
              <Label htmlFor="end" className="text-foreground">End Date &amp; Time</Label>
               <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal mt-1 bg-background border-border focus:ring-primary", !form.watch("end") && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("end") ? format(form.watch("end"), "PPP HH:mm") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={form.watch("end")} onSelect={(date) => form.setValue("end", date || new Date())} initialFocus />
                   <Input type="time" className="mt-1 p-2 border-t" 
                    defaultValue={format(form.watch("end"), "HH:mm")}
                    onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':').map(Number);
                        const newDate = new Date(form.watch("end"));
                        newDate.setHours(hours, minutes);
                        form.setValue("end", newDate);
                    }}
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.end && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.end.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="origin" className="text-foreground">Origin</Label>
              <Input id="origin" {...form.register("origin")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.origin && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.origin.message}</p>}
            </div>
            <div>
              <Label htmlFor="destination" className="text-foreground">Destination</Label>
              <Input id="destination" {...form.register("destination")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.destination && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.destination.message}</p>}
            </div>
          </div>
          
          <div>
            <Label htmlFor="loadValue" className="text-foreground">Load Value (Optional)</Label>
            <div className="relative mt-1">
                <DollarSign className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="loadValue" type="number" step="0.01" {...form.register("loadValue")} className="pl-7 bg-background border-border focus:ring-primary" placeholder="e.g., 1500.00"/>
            </div>
            {form.formState.errors.loadValue && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.loadValue.message}</p>}
          </div>

          <div>
            <Label htmlFor="notes" className="text-foreground">Notes (Optional)</Label>
            <Textarea id="notes" {...form.register("notes")} className="mt-1 bg-background border-border focus:ring-primary" rows={2}/>
          </div>
          
          <div className="flex items-center space-x-2 pt-1">
            <Checkbox
              id="isPartialLoad"
              checked={form.watch("isPartialLoad")}
              onCheckedChange={(checked) => form.setValue("isPartialLoad", !!checked)}
            />
            <Label htmlFor="isPartialLoad" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              This is a partial load (allows overlap with other partial loads)
            </Label>
          </div>
          {form.formState.errors.isPartialLoad && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.isPartialLoad.message}</p>}

          <div className="flex items-center space-x-2 pt-1">
            <Checkbox
              id="isTeamDriven"
              checked={form.watch("isTeamDriven")}
              onCheckedChange={(checked) => form.setValue("isTeamDriven", !!checked)}
            />
            <Label htmlFor="isTeamDriven" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Team Driven (allows extended hours beyond 14-hour limit)
            </Label>
             <Users className="h-4 w-4 text-muted-foreground ml-1" />
          </div>
          {form.formState.errors.isTeamDriven && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.isTeamDriven.message}</p>}


          <DialogFooter className="pt-4 sticky bottom-0 bg-card pb-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {entryToEdit ? "Save Changes" : "Add Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
