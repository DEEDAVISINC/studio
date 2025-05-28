
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { AddTruckDialog } from "@/components/fleetflow/AddTruckDialog";
import { TruckListTable } from "@/components/fleetflow/TruckListTable";
import { useAppData } from '@/contexts/AppDataContext';
import type { Truck } from '@/lib/types';


export default function TrucksPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const { trucks, drivers, carriers, addTruck, updateTruck, removeTruck } = useAppData();

  const handleAddOrUpdateTruck = (truckData: Omit<Truck, 'id'> | Truck) => {
    if (editingTruck && 'id' in truckData) {
      updateTruck(truckData as Truck);
    } else {
      addTruck(truckData as Omit<Truck, 'id'>);
    }
    setEditingTruck(null);
  };

  const openEditDialog = (truck: Truck) => {
    setEditingTruck(truck);
    setIsAddDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingTruck(null);
    setIsAddDialogOpen(true);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Trucks</h1>
          <p className="text-muted-foreground">View, add, edit, or remove trucks from your fleet.</p>
        </div>
        <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Truck
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Truck Fleet</CardTitle>
          <CardDescription>A list of all trucks in your fleet with compliance dates.</CardDescription>
        </CardHeader>
        <CardContent>
          <TruckListTable 
            trucks={trucks} 
            drivers={drivers}
            carriers={carriers}
            onEdit={openEditDialog} 
            onDelete={removeTruck} 
          />
        </CardContent>
      </Card>

      <AddTruckDialog
        isOpen={isAddDialogOpen}
        onOpenChange={(isOpen) => {
            setIsAddDialogOpen(isOpen);
            if (!isOpen) setEditingTruck(null); 
        }}
        onAddTruck={handleAddOrUpdateTruck}
        truckToEdit={editingTruck}
        drivers={drivers}
        carriers={carriers}
      />
    </div>
  );
}
