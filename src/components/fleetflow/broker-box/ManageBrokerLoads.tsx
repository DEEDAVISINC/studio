
"use client";
import { useState, useEffect } from 'react';
import type { BrokerLoad, Shipper, Carrier, Truck, Driver, BrokerLoadStatus } from "@/lib/types";
import { BROKER_LOAD_STATUSES } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Copy, Filter, MoreVertical, StickyNote } from "lucide-react"; // Added StickyNote
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const brokerLoadSchema = z.object({
  shipperId: z.string().min(1, "Shipper is required."),
  originAddress: z.string().min(5, "Origin address is required."),
  destinationAddress: z.string().min(5, "Destination address is required."),
  pickupDate: z.date({ required_error: "Pickup date is required."}),
  deliveryDate: z.date({ required_error: "Delivery date is required." }),
  commodity: z.string().min(3, "Commodity is required."),
  weight: z.coerce.number().positive("Weight must be positive.").optional(),
  dims: z.string().optional(),
  equipmentType: z.string().min(3, "Equipment type is required."),
  offeredRate: z.coerce.number().positive("Offered rate must be a positive number."),
  notes: z.string().optional(),
  status: z.enum(BROKER_LOAD_STATUSES).optional(), // Status updated separately by system/carrier
}).refine(data => data.deliveryDate >= data.pickupDate, {
    message: "Delivery date cannot be before pickup date.",
    path: ["deliveryDate"],
});

type BrokerLoadFormData = z.infer<typeof brokerLoadSchema>;

interface ManageBrokerLoadsProps {
  brokerLoads: BrokerLoad[];
  shippers: Shipper[];
  carriers: Carrier[];
  trucks: Truck[];
  drivers: Driver[];
  onAddBrokerLoad: (load: Omit<BrokerLoad, 'id' | 'postedDate' | 'status' | 'postedByBrokerId'>) => BrokerLoad;
  onUpdateBrokerLoad: (load: BrokerLoad) => void; // For full edits by broker
  getShipperById: (id: string) => Shipper | undefined;
}

export function ManageBrokerLoads({ brokerLoads, shippers, onAddBrokerLoad, onUpdateBrokerLoad, getShipperById }: ManageBrokerLoadsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLoad, setEditingLoad] = useState<BrokerLoad | null>(null);
  const [statusFilter, setStatusFilter] = useState<BrokerLoadStatus | 'All'>('All');
  const { toast } = useToast();

  const form = useForm<BrokerLoadFormData>({
    resolver: zodResolver(brokerLoadSchema),
    defaultValues: {
      shipperId: '',
      originAddress: '',
      destinationAddress: '',
      pickupDate: new Date(),
      deliveryDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      commodity: '',
      equipmentType: '',
      offeredRate: 0,
      notes: '',
    }
  });
  
  useEffect(() => {
    if (isDialogOpen && editingLoad) {
        form.reset({
            ...editingLoad,
            pickupDate: typeof editingLoad.pickupDate === 'string' ? parseISO(editingLoad.pickupDate) : editingLoad.pickupDate,
            deliveryDate: typeof editingLoad.deliveryDate === 'string' ? parseISO(editingLoad.deliveryDate) : editingLoad.deliveryDate,
        });
    } else if (isDialogOpen && !editingLoad) {
        form.reset({
            shipperId: '', originAddress: '', destinationAddress: '',
            pickupDate: new Date(), deliveryDate: new Date(new Date().setDate(new Date().getDate() + 1)),
            commodity: '', equipmentType: '', offeredRate: 0, notes: '',
        });
    }
  }, [isDialogOpen, editingLoad, form]);


  const handleOpenDialog = (load?: BrokerLoad) => {
    setEditingLoad(load || null);
    setIsDialogOpen(true);
  };

  const onSubmit = (data: BrokerLoadFormData) => {
    try {
        if (editingLoad) {
            const updatedLoadData: BrokerLoad = {
                ...editingLoad, 
                ...data, 
                pickupDate: data.pickupDate, 
                deliveryDate: data.deliveryDate,
            };
            onUpdateBrokerLoad(updatedLoadData);
            toast({ title: "Load Updated", description: `Load for ${data.commodity} updated.` });
        } else {
            onAddBrokerLoad(data);
            toast({ title: "Load Posted", description: `New load for ${data.commodity} has been posted.` });
        }
        setIsDialogOpen(false);
        setEditingLoad(null);
    } catch (error) {
        console.error("Error submitting load: ", error);
        toast({ title: "Error", description: "Failed to save load.", variant: "destructive"})
    }
  };
  
  const copyLoadInfoToClipboard = (load: BrokerLoad) => {
    const loadDetails = `
LOAD DETAILS:
Commodity: ${load.commodity}
Origin: ${load.originAddress}
Destination: ${load.destinationAddress}
Pickup Date: ${format(new Date(load.pickupDate), 'PPP p')}
Delivery Date: ${format(new Date(load.deliveryDate), 'PPP p')}
Equipment: ${load.equipmentType}
Offered Rate: $${load.offeredRate.toLocaleString()}
${load.weight ? `Weight: ${load.weight} lbs\n` : ''}${load.dims ? `Dimensions: ${load.dims}\n` : ''}
Notes: ${load.notes || 'N/A'}
Status: ${load.status}
Load ID: ${load.id}
    `.trim();

    navigator.clipboard.writeText(loadDetails)
      .then(() => toast({ title: "Load Info Copied!", description: "Load details copied to clipboard." }))
      .catch(err => toast({ title: "Copy Failed", description: "Could not copy details.", variant: "destructive" }));
  };

  const getStatusColor = (status: BrokerLoadStatus) => {
    switch (status) {
      case 'Available': return 'bg-green-500 hover:bg-green-600';
      case 'Booked': return 'bg-blue-500 hover:bg-blue-600';
      case 'In Transit': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      case 'Delivered': return 'bg-gray-500 hover:bg-gray-600';
      case 'Cancelled': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-slate-400';
    }
  };

  const filteredLoads = brokerLoads.filter(load => statusFilter === 'All' || load.status === statusFilter);


  return (
    <TooltipProvider>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(value: BrokerLoadStatus | 'All') => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px] bg-background border-border">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    {BROKER_LOAD_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" /> Post New Load
        </Button>
      </div>

      {filteredLoads.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No loads found matching the criteria. Post a new load to get started.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commodity</TableHead>
                <TableHead>Shipper</TableHead>
                <TableHead>Origin / Destination</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoads.map((load) => {
                const shipper = getShipperById(load.shipperId);
                return (
                  <TableRow key={load.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {load.commodity}
                        {load.notes && (
                          <Tooltip>
                            <TooltipTrigger>
                              <StickyNote className="h-4 w-4 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs whitespace-pre-wrap break-words">{load.notes}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{shipper?.name || 'N/A'}</TableCell>
                    <TableCell>
                        <div className="text-xs">{load.originAddress}</div>
                        <div className="text-xs text-muted-foreground">to {load.destinationAddress}</div>
                    </TableCell>
                    <TableCell>${load.offeredRate.toLocaleString()}</TableCell>
                    <TableCell>
                        <Badge className={cn("text-white", getStatusColor(load.status))}>{load.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenDialog(load)}>
                                    <Edit3 className="mr-2 h-4 w-4" /> Edit Load
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => copyLoadInfoToClipboard(load)}>
                                    <Copy className="mr-2 h-4 w-4" /> Copy Info
                                </DropdownMenuItem>
                                {/* More actions like "Cancel Load", "Mark Delivered" could be added here based on status */}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingLoad ? "Edit Load Posting" : "Post New Load"}</DialogTitle>
            <DialogDescription>
              Fill in the details for the load.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 py-2 max-h-[75vh] overflow-y-auto pr-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="shipperId">Shipper</Label>
                    <Controller
                        name="shipperId"
                        control={form.control}
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <SelectTrigger id="shipperId" className="mt-1 bg-background border-border">
                            <SelectValue placeholder="Select a shipper" />
                            </SelectTrigger>
                            <SelectContent>
                            {shippers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {form.formState.errors.shipperId && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.shipperId.message}</p>}
                </div>
                <div>
                    <Label htmlFor="commodity">Commodity</Label>
                    <Input id="commodity" {...form.register("commodity")} className="mt-1 bg-background border-border" />
                    {form.formState.errors.commodity && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.commodity.message}</p>}
                </div>
            </div>
            <div>
                <Label htmlFor="originAddress">Origin Address</Label>
                <Input id="originAddress" {...form.register("originAddress")} className="mt-1 bg-background border-border" />
                {form.formState.errors.originAddress && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.originAddress.message}</p>}
            </div>
            <div>
                <Label htmlFor="destinationAddress">Destination Address</Label>
                <Input id="destinationAddress" {...form.register("destinationAddress")} className="mt-1 bg-background border-border" />
                {form.formState.errors.destinationAddress && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.destinationAddress.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="pickupDate">Pickup Date & Time</Label>
                     <Controller name="pickupDate" control={form.control} render={({ field }) => (
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal mt-1 bg-background border-border", !field.value && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP p") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                <Input type="time" className="p-2 border-t" defaultValue={field.value ? format(field.value, "HH:mm") : ""}
                                    onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':').map(Number);
                                        const newDate = new Date(field.value || new Date());
                                        newDate.setHours(hours, minutes);
                                        field.onChange(newDate);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                     )}/>
                    {form.formState.errors.pickupDate && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.pickupDate.message}</p>}
                </div>
                <div>
                    <Label htmlFor="deliveryDate">Delivery Date & Time</Label>
                    <Controller name="deliveryDate" control={form.control} render={({ field }) => (
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal mt-1 bg-background border-border", !field.value && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP p") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                 <Input type="time" className="p-2 border-t" defaultValue={field.value ? format(field.value, "HH:mm") : ""}
                                    onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':').map(Number);
                                        const newDate = new Date(field.value || new Date());
                                        newDate.setHours(hours, minutes);
                                        field.onChange(newDate);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    )}/>
                    {form.formState.errors.deliveryDate && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.deliveryDate.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <Label htmlFor="equipmentType">Equipment Type</Label>
                    <Input id="equipmentType" {...form.register("equipmentType")} className="mt-1 bg-background border-border" placeholder="e.g. Van, Reefer" />
                    {form.formState.errors.equipmentType && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.equipmentType.message}</p>}
                </div>
                <div>
                    <Label htmlFor="weight">Weight (lbs/kg)</Label>
                    <Input id="weight" type="number" {...form.register("weight")} className="mt-1 bg-background border-border" />
                    {form.formState.errors.weight && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.weight.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="offeredRate">Offered Rate ($)</Label>
                    <Input id="offeredRate" type="number" step="0.01" {...form.register("offeredRate")} className="mt-1 bg-background border-border" />
                    {form.formState.errors.offeredRate && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.offeredRate.message}</p>}
                </div>
            </div>
             <div>
                <Label htmlFor="dims">Dimensions (Optional)</Label>
                <Input id="dims" {...form.register("dims")} className="mt-1 bg-background border-border" placeholder="e.g. 40ft L x 8ft W x 8ft H"/>
            </div>
            <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" {...form.register("notes")} className="mt-1 bg-background border-border" rows={2} placeholder="Special instructions, appointment details, etc."/>
            </div>
            
            <DialogFooter className="pt-4 sticky bottom-0 bg-card pb-1">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {editingLoad ? "Save Changes" : "Post Load"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}

    