
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { AddCarrierDialog } from "@/components/fleetflow/AddCarrierDialog";
import { CarrierListTable } from "@/components/fleetflow/CarrierListTable";
import { useAppData } from '@/contexts/AppDataContext';
import type { Carrier } from '@/lib/types';

export default function CarriersPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const { carriers, addCarrier, updateCarrier, removeCarrier } = useAppData();

  const handleAddOrUpdateCarrier = (carrierData: Omit<Carrier, 'id' | 'fmcsaAuthorityStatus' | 'fmcsaLastChecked'> | Carrier) => {
    if (editingCarrier && 'id' in carrierData) {
      updateCarrier(carrierData as Carrier);
    } else {
      const newCarrierData = carrierData as Omit<Carrier, 'id'>;
      if (!newCarrierData.contractDetails) {
        newCarrierData.contractDetails = "Awaiting details"; 
      }
      addCarrier(newCarrierData);
    }
    setEditingCarrier(null); 
  };

  const openEditDialog = (carrier: Carrier) => {
    setEditingCarrier(carrier);
    setIsAddDialogOpen(true);
  };
  
  const openAddDialog = () => {
    setEditingCarrier(null);
    setIsAddDialogOpen(true);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Carriers</h1>
          <p className="text-muted-foreground">View, add, edit, or remove carriers. Simulated FMCSA verification available.</p>
        </div>
        <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Carrier
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Carrier List</CardTitle>
          <CardDescription>A list of all registered carriers with their details and FMCSA status.</CardDescription>
        </CardHeader>
        <CardContent>
          <CarrierListTable 
            carriers={carriers}
            onEdit={openEditDialog}
            onDelete={removeCarrier}
          />
        </CardContent>
      </Card>

      <AddCarrierDialog
        isOpen={isAddDialogOpen}
        onOpenChange={(isOpen) => {
            setIsAddDialogOpen(isOpen);
            if (!isOpen) setEditingCarrier(null); 
        }}
        onAddCarrier={handleAddOrUpdateCarrier}
        carrierToEdit={editingCarrier}
      />
    </div>
  );
}
