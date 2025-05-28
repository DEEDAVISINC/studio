"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { AddDriverDialog } from "@/components/fleetflow/AddDriverDialog";
import { DriverListTable } from "@/components/fleetflow/DriverListTable";
import { useAppData } from '@/contexts/AppDataContext';

export default function DriversPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { drivers, addDriver, updateDriver, removeDriver } = useAppData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Drivers</h1>
          <p className="text-muted-foreground">View, add, edit, or remove drivers.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Driver
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Driver Roster</CardTitle>
          <CardDescription>A list of all registered drivers.</CardDescription>
        </CardHeader>
        <CardContent>
          <DriverListTable 
            drivers={drivers}
            onEdit={(driver) => { /* Placeholder for edit */ console.log("Edit driver:", driver); }}
            onDelete={removeDriver}
          />
        </CardContent>
      </Card>

      <AddDriverDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddDriver={addDriver}
      />
    </div>
  );
}
