
"use client";
import { useState } from 'react';
import type { Shipper } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit3, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


const shipperSchema = z.object({
  name: z.string().min(2, "Shipper name is required."),
  contactPerson: z.string().min(2, "Contact person is required."),
  contactEmail: z.string().email("Invalid email address."),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits.").regex(/^\S*$/, "Phone number should not contain spaces."),
  address: z.string().min(5, "Address is required."),
  notes: z.string().optional(),
});
type ShipperFormData = z.infer<typeof shipperSchema>;

interface ManageShippersProps {
  shippers: Shipper[];
  onAddShipper: (shipper: Omit<Shipper, 'id'>) => void;
  onUpdateShipper: (shipper: Shipper) => void;
  onRemoveShipper: (shipperId: string) => void;
}

export function ManageShippers({ shippers, onAddShipper, onUpdateShipper, onRemoveShipper }: ManageShippersProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShipper, setEditingShipper] = useState<Shipper | null>(null);
  const { toast } = useToast();

  const form = useForm<ShipperFormData>({
    resolver: zodResolver(shipperSchema),
    defaultValues: {
      name: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      notes: '',
    }
  });

  const handleOpenDialog = (shipper?: Shipper) => {
    if (shipper) {
      setEditingShipper(shipper);
      form.reset(shipper);
    } else {
      setEditingShipper(null);
      form.reset({ name: '', contactPerson: '', contactEmail: '', contactPhone: '', address: '', notes: '' });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: ShipperFormData) => {
    if (editingShipper) {
      onUpdateShipper({ ...editingShipper, ...data });
      toast({ title: "Shipper Updated", description: `Shipper "${data.name}" has been updated.` });
    } else {
      onAddShipper(data);
      toast({ title: "Shipper Added", description: `Shipper "${data.name}" has been added.` });
    }
    setIsDialogOpen(false);
    setEditingShipper(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Shipper
        </Button>
      </div>

      {shippers.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No shippers found. Add a new shipper to get started.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shippers.map((shipper) => (
                <TableRow key={shipper.id}>
                  <TableCell className="font-medium">{shipper.name}</TableCell>
                  <TableCell>{shipper.contactPerson}</TableCell>
                  <TableCell>{shipper.contactEmail}</TableCell>
                  <TableCell>{shipper.contactPhone}</TableCell>
                  <TableCell>{shipper.address}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(shipper)}>
                            <Edit3 className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the shipper "{shipper.name}".
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onRemoveShipper(shipper.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">{editingShipper ? "Edit Shipper" : "Add New Shipper"}</DialogTitle>
            <DialogDescription>
              Fill in the details for the shipper.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="name" className="text-foreground">Shipper Name</Label>
              <Input id="name" {...form.register("name")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.name && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="contactPerson" className="text-foreground">Contact Person</Label>
              <Input id="contactPerson" {...form.register("contactPerson")} className="mt-1 bg-background border-border focus:ring-primary" />
              {form.formState.errors.contactPerson && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.contactPerson.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail" className="text-foreground">Contact Email</Label>
                <Input id="contactEmail" type="email" {...form.register("contactEmail")} className="mt-1 bg-background border-border focus:ring-primary" />
                {form.formState.errors.contactEmail && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.contactEmail.message}</p>}
              </div>
              <div>
                <Label htmlFor="contactPhone" className="text-foreground">Contact Phone</Label>
                <Input id="contactPhone" {...form.register("contactPhone")} className="mt-1 bg-background border-border focus:ring-primary" />
                {form.formState.errors.contactPhone && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.contactPhone.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="address" className="text-foreground">Full Address</Label>
              <Textarea id="address" {...form.register("address")} className="mt-1 bg-background border-border focus:ring-primary" rows={2}/>
              {form.formState.errors.address && <p className="text-xs text-destructive mt-0.5">{form.formState.errors.address.message}</p>}
            </div>
            <div>
              <Label htmlFor="notes" className="text-foreground">Notes (Optional)</Label>
              <Textarea id="notes" {...form.register("notes")} className="mt-1 bg-background border-border focus:ring-primary" rows={2} placeholder="e.g., Preferred pickup times, special instructions"/>
            </div>
            <DialogFooter className="pt-4 sticky bottom-0 bg-card pb-1">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {editingShipper ? "Save Changes" : "Add Shipper"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
