
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { AddDriverDialog, type DriverFormData } from "@/components/fleetflow/AddDriverDialog";
import { DriverListTable } from "@/components/fleetflow/DriverListTable";
import { useAppData } from '@/contexts/AppDataContext';
import type { Driver } from '@/lib/types';

export default function DriversPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const { drivers, addDriver, updateDriver, removeDriver } = useAppData();

  const openAddDialog = () => {
    setEditingDriver(null);
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (driver: Driver) => {
    setEditingDriver(driver);
    setIsAddDialogOpen(true);
  };

  const handleSaveDriver = (driverData: DriverFormData) => {
    if (editingDriver) {
      updateDriver({ ...editingDriver, ...driverData });
    } else {
      addDriver(driverData);
    }
    setEditingDriver(null);
    setIsAddDialogOpen(false); // Close dialog after save
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Drivers</h1>
          <p className="text-muted-foreground">View, add, edit, or remove drivers.</p>
        </div>
        <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90">
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
            onEdit={openEditDialog}
            onDelete={removeDriver}
          />
        </CardContent>
      </Card>

      <AddDriverDialog
        isOpen={isAddDialogOpen}
        onOpenChange={(isOpen) => {
          setIsAddDialogOpen(isOpen);
          if (!isOpen) setEditingDriver(null); // Clear editingDriver if dialog is closed
        }}
        onSaveDriver={handleSaveDriver}
        driverToEdit={editingDriver}
      />
    </div>
  );
}
