
"use client";
import { useState, useEffect } from 'react';
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
import type { Carrier } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Checkbox } from '@/components/ui/checkbox';

const carrierSchema = z.object({
  name: z.string().min(2, "Legal company name must be at least 2 characters."),
  dba: z.string().optional(),
  mcNumber: z.string().optional(),
  usDotNumber: z.string().optional(),
  taxIdEin: z.string().optional(),

  companyPhone: z.string().optional().refine(val => !val || val.length === 0 || /^\S*$/.test(val), { message: "Company phone should not contain spaces."}),
  faxNumber: z.string().optional().refine(val => !val || val.length === 0 || /^\S*$/.test(val), { message: "Fax number should not contain spaces."}),
  companyEmail: z.string().email({ message: "Invalid company email address." }).optional().or(z.literal("")),
  
  physicalAddress: z.string().min(5, "Physical address is required."),
  isMailingSameAsPhysical: z.boolean().optional(),
  mailingAddress: z.string().optional(),

  contactPerson: z.string().min(2, "Preferred contact person name must be at least 2 characters."),
  contactEmail: z.string().email({ message: "Invalid preferred contact email address." }),
  contactPhone: z.string().min(10, "Preferred contact phone must be at least 10 digits.").regex(/^\S*$/, "Phone number should not contain spaces."),

  equipmentTypes: z.string().optional(),
  
  insuranceCompanyName: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insurancePolicyExpirationDate: z.date().optional().nullable(),
  insuranceAgentName: z.string().optional(),
  insuranceAgentPhone: z.string().optional().refine(val => !val || val.length === 0 || /^\S*$/.test(val), { message: "Agent phone should not contain spaces."}),
  insuranceAgentEmail: z.string().email({ message: "Invalid agent email address." }).optional().or(z.literal("")),

  factoringCompanyName: z.string().optional(),
  factoringCompanyContact: z.string().optional(),
  factoringCompanyPhone: z.string().optional().refine(val => !val || val.length === 0 || /^\S*$/.test(val), { message: "Factoring phone should not contain spaces."}),
  
  paymentTerms: z.string().optional(),
  preferredLanes: z.string().optional(),
  
  contractDetails: z.string().min(5, "Contract details must be at least 5 characters."),
  availabilityNotes: z.string().optional(),

  // New FMCSA fields
  powerUnits: z.coerce.number().int().positive().optional().nullable(),
  driverCount: z.coerce.number().int().positive().optional().nullable(),
  mcs150FormDate: z.date().optional().nullable(),
  operationClassification: z.string().optional(),
  carrierOperationType: z.string().optional(),

}).refine(data => data.isMailingSameAsPhysical || (data.mailingAddress && data.mailingAddress.length >= 5), {
  message: "Mailing address is required if not same as physical.",
  path: ["mailingAddress"],
});


type CarrierFormData = z.infer<typeof carrierSchema>;

interface AddCarrierDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddCarrier: (carrier: Omit<Carrier, 'id'> | Carrier) => void;
  carrierToEdit?: Carrier | null;
}

export function AddCarrierDialog({ isOpen, onOpenChange, onAddCarrier, carrierToEdit }: AddCarrierDialogProps) {
  const { toast } = useToast();
  const form = useForm<CarrierFormData>({
    resolver: zodResolver(carrierSchema),
    defaultValues: {
      name: '', dba: '', mcNumber: '', usDotNumber: '', taxIdEin: '',
      companyPhone: '', faxNumber: '', companyEmail: '',
      physicalAddress: '', isMailingSameAsPhysical: false, mailingAddress: '',
      contactPerson: '', contactEmail: '', contactPhone: '',
      equipmentTypes: '',
      insuranceCompanyName: '', insurancePolicyNumber: '', insurancePolicyExpirationDate: null,
      insuranceAgentName: '', insuranceAgentPhone: '', insuranceAgentEmail: '',
      factoringCompanyName: '', factoringCompanyContact: '', factoringCompanyPhone: '',
      paymentTerms: '', preferredLanes: '',
      contractDetails: '', availabilityNotes: '',
      powerUnits: null, driverCount: null, mcs150FormDate: null,
      operationClassification: '', carrierOperationType: '',
    },
  });

  const isMailingSame = form.watch("isMailingSameAsPhysical");

  useEffect(() => {
    if (carrierToEdit) {
      form.reset({
        ...carrierToEdit,
        isMailingSameAsPhysical: carrierToEdit.isMailingSameAsPhysical ?? (!carrierToEdit.mailingAddress || carrierToEdit.physicalAddress === carrierToEdit.mailingAddress),
        insurancePolicyExpirationDate: carrierToEdit.insurancePolicyExpirationDate 
            ? (typeof carrierToEdit.insurancePolicyExpirationDate === 'string' 
                ? parseISO(carrierToEdit.insurancePolicyExpirationDate) 
                : carrierToEdit.insurancePolicyExpirationDate) 
            : null,
        mcs150FormDate: carrierToEdit.mcs150FormDate
            ? (typeof carrierToEdit.mcs150FormDate === 'string'
                ? parseISO(carrierToEdit.mcs150FormDate)
                : carrierToEdit.mcs150FormDate)
            : null,
        powerUnits: carrierToEdit.powerUnits ?? null,
        driverCount: carrierToEdit.driverCount ?? null,
      });
    } else {
      form.reset({
        name: '', dba: '', mcNumber: '', usDotNumber: '', taxIdEin: '',
        companyPhone: '', faxNumber: '', companyEmail: '',
        physicalAddress: '', isMailingSameAsPhysical: false, mailingAddress: '',
        contactPerson: '', contactEmail: '', contactPhone: '',
        equipmentTypes: '',
        insuranceCompanyName: '', insurancePolicyNumber: '', insurancePolicyExpirationDate: null,
        insuranceAgentName: '', insuranceAgentPhone: '', insuranceAgentEmail: '',
        factoringCompanyName: '', factoringCompanyContact: '', factoringCompanyPhone: '',
        paymentTerms: '', preferredLanes: '',
        contractDetails: '', availabilityNotes: '',
        powerUnits: null, driverCount: null, mcs150FormDate: null,
        operationClassification: '', carrierOperationType: '',
      });
    }
  }, [carrierToEdit, form, isOpen]);
  
   useEffect(() => {
    if (isMailingSame) {
      form.setValue("mailingAddress", form.getValues("physicalAddress"));
    }
  }, [isMailingSame, form]);


  const onSubmit = (data: CarrierFormData) => {
    const submissionData = {
      ...data,
      mailingAddress: data.isMailingSameAsPhysical ? data.physicalAddress : data.mailingAddress,
      insurancePolicyExpirationDate: data.insurancePolicyExpirationDate ? data.insurancePolicyExpirationDate.toISOString() : undefined,
      mcs150FormDate: data.mcs150FormDate ? data.mcs150FormDate.toISOString() : undefined,
      powerUnits: data.powerUnits || undefined, // Ensure undefined if null/empty for optional numbers
      driverCount: data.driverCount || undefined,
    };

    if (carrierToEdit) {
      onAddCarrier({ ...carrierToEdit, ...submissionData } as Carrier);
    } else {
      onAddCarrier(submissionData as Omit<Carrier, 'id'>);
    }
    
    toast({
      title: carrierToEdit ? "Carrier Updated" : "Carrier Added",
      description: `Carrier "${data.name}" has been successfully ${carrierToEdit ? 'updated' : 'added'}.`,
    });
    form.reset();
    onOpenChange(false);
  };

  const FormSectionTitle: React.FC<{title: string}> = ({title}) => (
    <>
      <Separator className="my-4" />
      <h3 className="text-md font-semibold mb-2 text-primary">{title}</h3>
    </>
  );


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">{carrierToEdit ? "Edit Carrier" : "Add New Carrier"}</DialogTitle>
          <DialogDescription>
            Fill in the details for the {carrierToEdit ? "carrier." : "new carrier."} Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2 max-h-[75vh] overflow-y-auto pr-3">
          
          <FormSectionTitle title="Company Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="name" className="text-foreground">Legal Company Name*</Label>
              <Input id="name" {...form.register("name")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.name && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="dba" className="text-foreground">DBA (Doing Business As)</Label>
              <Input id="dba" {...form.register("dba")} className="mt-1 bg-background border-border focus:ring-primary" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="mcNumber" className="text-foreground">MC Number</Label>
              <Input id="mcNumber" {...form.register("mcNumber")} className="mt-1 bg-background border-border focus:ring-primary" />
            </div>
            <div>
              <Label htmlFor="usDotNumber" className="text-foreground">US DOT Number</Label>
              <Input id="usDotNumber" {...form.register("usDotNumber")} className="mt-1 bg-background border-border focus:ring-primary" />
            </div>
            <div>
              <Label htmlFor="taxIdEin" className="text-foreground">Tax ID/EIN</Label>
              <Input id="taxIdEin" {...form.register("taxIdEin")} className="mt-1 bg-background border-border focus:ring-primary" />
            </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="companyPhone" className="text-foreground">Company Phone</Label>
              <Input id="companyPhone" {...form.register("companyPhone")} className="mt-1 bg-background border-border focus:ring-primary" />
               {form.formState.errors.companyPhone && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.companyPhone.message}</p>}
            </div>
            <div>
              <Label htmlFor="faxNumber" className="text-foreground">Fax Number</Label>
              <Input id="faxNumber" {...form.register("faxNumber")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.faxNumber && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.faxNumber.message}</p>}
            </div>
             <div>
              <Label htmlFor="companyEmail" className="text-foreground">Company Email</Label>
              <Input id="companyEmail" type="email" {...form.register("companyEmail")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.companyEmail && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.companyEmail.message}</p>}
            </div>
          </div>

          <FormSectionTitle title="Addresses" />
           <div>
              <Label htmlFor="physicalAddress" className="text-foreground">Physical Address*</Label>
              <Textarea id="physicalAddress" {...form.register("physicalAddress")} className="mt-1 bg-background border-border focus:ring-primary" rows={2} placeholder="Street, City, State, Zip"/>
              {form.formState.errors.physicalAddress && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.physicalAddress.message}</p>}
            </div>
            <div className="flex items-center space-x-2 mt-2">
               <Controller
                name="isMailingSameAsPhysical"
                control={form.control}
                render={({ field }) => (
                    <Checkbox
                        id="isMailingSameAsPhysical"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                )}
                />
              <Label htmlFor="isMailingSameAsPhysical" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Mailing address is the same as physical address
              </Label>
            </div>
            {!isMailingSame && (
              <div>
                <Label htmlFor="mailingAddress" className="text-foreground">Mailing Address*</Label>
                <Textarea id="mailingAddress" {...form.register("mailingAddress")} className="mt-1 bg-background border-border focus:ring-primary" rows={2} placeholder="Street, City, State, Zip"/>
                {form.formState.errors.mailingAddress && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.mailingAddress.message}</p>}
              </div>
            )}
            
          <FormSectionTitle title="Preferred Contact" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="contactPerson" className="text-foreground">Full Name*</Label>
              <Input id="contactPerson" {...form.register("contactPerson")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.contactPerson && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.contactPerson.message}</p>}
            </div>
            <div>
              <Label htmlFor="contactPhone" className="text-foreground">Phone*</Label>
              <Input id="contactPhone" {...form.register("contactPhone")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.contactPhone && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.contactPhone.message}</p>}
            </div>
            <div>
              <Label htmlFor="contactEmail" className="text-foreground">Email*</Label>
              <Input id="contactEmail" type="email" {...form.register("contactEmail")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.contactEmail && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.contactEmail.message}</p>}
            </div>
          </div>

          <FormSectionTitle title="FMCSA &amp; Operational Details" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="powerUnits" className="text-foreground">Power Units</Label>
              <Input id="powerUnits" type="number" {...form.register("powerUnits")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.powerUnits && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.powerUnits.message}</p>}
            </div>
            <div>
              <Label htmlFor="driverCount" className="text-foreground">Driver Count</Label>
              <Input id="driverCount" type="number" {...form.register("driverCount")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.driverCount && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.driverCount.message}</p>}
            </div>
             <div>
                <Label htmlFor="mcs150FormDate">MCS-150 Form Date</Label>
                <Controller name="mcs150FormDate" control={form.control} render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal mt-1 bg-background border-border", !field.value && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                    </Popover>
                )}/>
                 {form.formState.errors.mcs150FormDate && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.mcs150FormDate.message}</p>}
            </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="operationClassification" className="text-foreground">Operation Classification</Label>
              <Input id="operationClassification" {...form.register("operationClassification")} className="mt-1 bg-background border-border focus:ring-primary" placeholder="e.g., Auth. For Hire"/>
               {form.formState.errors.operationClassification && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.operationClassification.message}</p>}
            </div>
            <div>
              <Label htmlFor="carrierOperationType" className="text-foreground">Carrier Operation Type</Label>
              <Input id="carrierOperationType" {...form.register("carrierOperationType")} className="mt-1 bg-background border-border focus:ring-primary" placeholder="e.g., Interstate"/>
              {form.formState.errors.carrierOperationType && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.carrierOperationType.message}</p>}
            </div>
          </div>
          
          <FormSectionTitle title="Equipment & Insurance" />
           <div>
              <Label htmlFor="equipmentTypes" className="text-foreground">Equipment Types</Label>
              <Input id="equipmentTypes" {...form.register("equipmentTypes")} className="mt-1 bg-background border-border focus:ring-primary" placeholder="e.g., Van, Reefer, Flatbed" />
            </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="insuranceCompanyName" className="text-foreground">Insurance Company</Label>
              <Input id="insuranceCompanyName" {...form.register("insuranceCompanyName")} className="mt-1 bg-background border-border focus:ring-primary" />
            </div>
            <div>
              <Label htmlFor="insurancePolicyNumber" className="text-foreground">Policy Number</Label>
              <Input id="insurancePolicyNumber" {...form.register("insurancePolicyNumber")} className="mt-1 bg-background border-border focus:ring-primary" />
            </div>
            <div>
                <Label htmlFor="insurancePolicyExpirationDate">Policy Expiration Date</Label>
                <Controller name="insurancePolicyExpirationDate" control={form.control} render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal mt-1 bg-background border-border", !field.value && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                    </Popover>
                )}/>
            </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="insuranceAgentName" className="text-foreground">Insurance Agent Name</Label>
              <Input id="insuranceAgentName" {...form.register("insuranceAgentName")} className="mt-1 bg-background border-border focus:ring-primary" />
            </div>
            <div>
              <Label htmlFor="insuranceAgentPhone" className="text-foreground">Agent Phone</Label>
              <Input id="insuranceAgentPhone" {...form.register("insuranceAgentPhone")} className="mt-1 bg-background border-border focus:ring-primary" />
               {form.formState.errors.insuranceAgentPhone && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.insuranceAgentPhone.message}</p>}
            </div>
            <div>
              <Label htmlFor="insuranceAgentEmail" className="text-foreground">Agent Email</Label>
              <Input id="insuranceAgentEmail" type="email" {...form.register("insuranceAgentEmail")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.insuranceAgentEmail && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.insuranceAgentEmail.message}</p>}
            </div>
          </div>

          <FormSectionTitle title="Factoring & Payment" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="factoringCompanyName" className="text-foreground">Factoring Company</Label>
              <Input id="factoringCompanyName" {...form.register("factoringCompanyName")} className="mt-1 bg-background border-border focus:ring-primary" />
            </div>
            <div>
              <Label htmlFor="factoringCompanyContact" className="text-foreground">Factoring Contact</Label>
              <Input id="factoringCompanyContact" {...form.register("factoringCompanyContact")} className="mt-1 bg-background border-border focus:ring-primary" />
            </div>
            <div>
              <Label htmlFor="factoringCompanyPhone" className="text-foreground">Factoring Phone</Label>
              <Input id="factoringCompanyPhone" {...form.register("factoringCompanyPhone")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.factoringCompanyPhone && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.factoringCompanyPhone.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="paymentTerms" className="text-foreground">Payment Terms</Label>
            <Input id="paymentTerms" {...form.register("paymentTerms")} className="mt-1 bg-background border-border focus:ring-primary" placeholder="e.g., Net 30, Quick Pay 2%"/>
          </div>

          <FormSectionTitle title="Additional Details" />
           <div>
              <Label htmlFor="preferredLanes" className="text-foreground">Preferred Lanes/Regions</Label>
              <Textarea id="preferredLanes" {...form.register("preferredLanes")} className="mt-1 bg-background border-border focus:ring-primary" rows={2} placeholder="e.g., CA to TX, Midwest region"/>
            </div>
          <div>
            <Label htmlFor="contractDetails" className="text-foreground">Contract Details*</Label>
            <Textarea id="contractDetails" {...form.register("contractDetails")} className="mt-1 bg-background border-border focus:ring-primary" rows={2} />
            {form.formState.errors.contractDetails && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.contractDetails.message}</p>}
          </div>
          <div>
            <Label htmlFor="availabilityNotes" className="text-foreground">Availability/Special Notes</Label>
            <Textarea id="availabilityNotes" {...form.register("availabilityNotes")} className="mt-1 bg-background border-border focus:ring-primary" rows={2} placeholder="e.g., Operating hours, specific requirements" />
          </div>

          <DialogFooter className="pt-4 sticky bottom-0 bg-card pb-1 mt-6">
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
