"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { AddCarrierDialog } from "@/components/fleetflow/AddCarrierDialog";
import { CarrierListTable } from "@/components/fleetflow/CarrierListTable";
import { useAppData } from '@/contexts/AppDataContext';

export default function CarriersPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { carriers, addCarrier, updateCarrier, removeCarrier } = useAppData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Carriers</h1>
          <p className="text-muted-foreground">View, add, edit, or remove carriers.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Carrier
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Carrier List</CardTitle>
          <CardDescription>A list of all registered carriers.</CardDescription>
        </CardHeader>
        <CardContent>
          <CarrierListTable 
            carriers={carriers}
            onEdit={(carrier) => { /* Placeholder for edit */ console.log("Edit carrier:", carrier); }}
            onDelete={removeCarrier}
          />
        </CardContent>
      </Card>

      <AddCarrierDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddCarrier={addCarrier}
      />
    </div>
  );
}
