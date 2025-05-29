
"use client";
import { useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import type { AvailableEquipmentPost, Carrier } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { cn } from '@/lib/utils';

const equipmentPostSchema = z.object({
  carrierId: z.string().min(1, "Carrier is required."),
  equipmentType: z.string().min(3, "Equipment type is required (e.g., 53ft Dry Van)."),
  currentLocation: z.string().min(3, "Current location is required (e.g., City, ST)."),
  availableFromDate: z.date({ required_error: "Available from date is required." }),
  availableToDate: z.date().optional().nullable(),
  preferredDestinations: z.string().optional(),
  rateExpectation: z.string().optional(),
  contactName: z.string().min(2, "Contact name is required."),
  contactPhone: z.string().min(10, "Contact phone is required.").regex(/^\S*$/, "Phone number should not contain spaces."),
  contactEmail: z.string().email("Invalid email address.").optional().or(z.literal("")),
  notes: z.string().optional(),
  status: z.enum(['Available', 'Booked', 'Expired']).optional(),
}).refine(data => !data.availableToDate || data.availableToDate >= data.availableFromDate, {
  message: "Available 'To Date' cannot be before 'From Date'.",
  path: ["availableToDate"],
});

type EquipmentPostFormData = z.infer<typeof equipmentPostSchema>;

interface PostAvailableEquipmentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (post: Omit<AvailableEquipmentPost, 'id' | 'postedDate' | 'status'> | AvailableEquipmentPost) => void;
  postToEdit?: AvailableEquipmentPost | null;
  carriers: Carrier[];
}

export function PostAvailableEquipmentDialog({ isOpen, onOpenChange, onSave, postToEdit, carriers }: PostAvailableEquipmentDialogProps) {
  const { toast } = useToast();
  const form = useForm<EquipmentPostFormData>({
    resolver: zodResolver(equipmentPostSchema),
    defaultValues: {
      carrierId: '',
      equipmentType: '',
      currentLocation: '',
      availableFromDate: new Date(),
      availableToDate: null,
      preferredDestinations: '',
      rateExpectation: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      notes: '',
      status: 'Available',
    }
  });

  useEffect(() => {
    if (isOpen && postToEdit) {
      form.reset({
        ...postToEdit,
        availableFromDate: typeof postToEdit.availableFromDate === 'string' ? parseISO(postToEdit.availableFromDate) : postToEdit.availableFromDate,
        availableToDate: postToEdit.availableToDate ? (typeof postToEdit.availableToDate === 'string' ? parseISO(postToEdit.availableToDate) : postToEdit.availableToDate) : null,
      });
    } else if (isOpen && !postToEdit) {
      form.reset({
        carrierId: '', equipmentType: '', currentLocation: '',
        availableFromDate: new Date(), availableToDate: null,
        preferredDestinations: '', rateExpectation: '',
        contactName: '', contactPhone: '', contactEmail: '', notes: '', status: 'Available'
      });
    }
  }, [isOpen, postToEdit, form]);

  const onSubmit = (data: EquipmentPostFormData) => {
    const submissionData = {
        ...data,
        availableFromDate: data.availableFromDate, // Already Date object
        availableToDate: data.availableToDate ? data.availableToDate : undefined, // Ensure undefined if null
    };

    if (postToEdit) {
      onSave({ ...postToEdit, ...submissionData });
      toast({ title: "Posting Updated", description: `Equipment posting for ${data.equipmentType} updated.` });
    } else {
      // For new posts, status is set by the context
      const { status, ...newPostData } = submissionData;
      onSave(newPostData as Omit<AvailableEquipmentPost, 'id' | 'postedDate' | 'status'>);
      toast({ title: "Equipment Posted", description: `${data.equipmentType} available for hire has been posted.` });
    }
    onOpenChange(false);
  };

  const DatePickerField = ({ name, label }: { name: "availableFromDate" | "availableToDate"; label: string }) => (
    <div>
      <Label htmlFor={name} className="text-foreground">{label}</Label>
      <Controller
        name={name}
        control={form.control}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-start text-left font-normal mt-1 bg-background border-border", !field.value && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus />
            </PopoverContent>
          </Popover>
        )}
      />
      { (name === "availableFromDate" && form.formState.errors.availableFromDate) && 
        <p className="text-xs text-destructive mt-0.5">{form.formState.errors.availableFromDate.message}</p> }
      { (name === "availableToDate" && form.formState.errors.availableToDate) && 
        <p className="text-xs text-destructive mt-0.5">{form.formState.errors.availableToDate.message}</p> }
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">{postToEdit ? "Edit Equipment Posting" : "Post Available Equipment"}</DialogTitle>
          <DialogDescription>
            Advertise your available truck and services to brokers and shippers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2 max-h-[75vh] overflow-y-auto pr-3">
          <div>
            <Label htmlFor="carrierId">Your Carrier Company</Label>
            <Controller
              name="carrierId"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                  <SelectTrigger id="carrierId" className="mt-1 bg-background border-border">
                    <SelectValue placeholder="Select your carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    {carriers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.carrierId && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.carrierId.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="equipmentType">Equipment Type</Label>
              <Input id="equipmentType" {...form.register("equipmentType")} className="mt-1 bg-background border-border" placeholder="e.g., 53ft Dry Van, Reefer"/>
              {form.formState.errors.equipmentType && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.equipmentType.message}</p>}
            </div>
            <div>
              <Label htmlFor="currentLocation">Current Location (City, ST)</Label>
              <Input id="currentLocation" {...form.register("currentLocation")} className="mt-1 bg-background border-border" placeholder="e.g., Dallas, TX"/>
              {form.formState.errors.currentLocation && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.currentLocation.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <DatePickerField name="availableFromDate" label="Available From Date" />
            <DatePickerField name="availableToDate" label="Available Until Date (Optional)" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="preferredDestinations">Preferred Destinations (Optional)</Label>
              <Input id="preferredDestinations" {...form.register("preferredDestinations")} className="mt-1 bg-background border-border" placeholder="e.g., Southeast, West Coast"/>
            </div>
            <div>
              <Label htmlFor="rateExpectation">Rate Expectation (Optional)</Label>
              <Input id="rateExpectation" {...form.register("rateExpectation")} className="mt-1 bg-background border-border" placeholder="e.g., $3/mile, Market Rate"/>
            </div>
          </div>
          
          <hr className="my-3 border-border"/>
          <h3 className="text-sm font-medium text-muted-foreground">Contact for this Posting</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             <div>
              <Label htmlFor="contactName">Contact Full Name</Label>
              <Input id="contactName" {...form.register("contactName")} className="mt-1 bg-background border-border"/>
              {form.formState.errors.contactName && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.contactName.message}</p>}
            </div>
            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input id="contactPhone" {...form.register("contactPhone")} className="mt-1 bg-background border-border"/>
              {form.formState.errors.contactPhone && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.contactPhone.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="contactEmail">Contact Email (Optional)</Label>
            <Input id="contactEmail" type="email" {...form.register("contactEmail")} className="mt-1 bg-background border-border"/>
            {form.formState.errors.contactEmail && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.contactEmail.message}</p>}
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea id="notes" {...form.register("notes")} className="mt-1 bg-background border-border" rows={2} placeholder="e.g., Team drivers, specific capabilities"/>
          </div>
           {postToEdit && (
            <div>
                <Label htmlFor="status">Status</Label>
                 <Controller
                    name="status"
                    control={form.control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || 'Available'}>
                        <SelectTrigger id="status" className="mt-1 bg-background border-border">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Booked">Booked</SelectItem>
                            <SelectItem value="Expired">Expired</SelectItem>
                        </SelectContent>
                        </Select>
                    )}
                />
            </div>
           )}

          <DialogFooter className="pt-4 sticky bottom-0 bg-card pb-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {postToEdit ? "Save Changes" : "Post Equipment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
