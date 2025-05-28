"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { AddTruckDialog } from "@/components/fleetflow/AddTruckDialog";
import { TruckListTable } from "@/components/fleetflow/TruckListTable";
import { useAppData } from '@/contexts/AppDataContext';

export default function TrucksPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { trucks, drivers, carriers, addTruck, updateTruck, removeTruck } = useAppData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Trucks</h1>
          <p className="text-muted-foreground">View, add, edit, or remove trucks from your fleet.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Truck
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Truck Fleet</CardTitle>
          <CardDescription>A list of all trucks in your fleet.</CardDescription>
        </CardHeader>
        <CardContent>
          <TruckListTable 
            trucks={trucks} 
            drivers={drivers}
            carriers={carriers}
            onEdit={(truck) => { /* Placeholder for edit functionality */ console.log('Edit truck:', truck);}} 
            onDelete={removeTruck} 
          />
        </CardContent>
      </Card>

      <AddTruckDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddTruck={addTruck}
        drivers={drivers}
        carriers={carriers}
      />
    </div>
  );
}
