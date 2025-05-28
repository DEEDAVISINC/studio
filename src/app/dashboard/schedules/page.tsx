"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddScheduleEntryDialog } from "@/components/fleetflow/AddScheduleEntryDialog";
import { ScheduleCalendarView } from "@/components/fleetflow/ScheduleCalendarView";
import { useAppData } from '@/contexts/AppDataContext';

export default function SchedulesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { scheduleEntries, addScheduleEntry, updateScheduleEntry, removeScheduleEntry, trucks, drivers } = useAppData();

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Truck Schedules</h1>
          <p className="text-muted-foreground">View and manage truck schedules in the calendar.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Schedule
        </Button>
      </div>

      <div className="flex-grow min-h-0">
        <ScheduleCalendarView 
          events={scheduleEntries} 
          onEventClick={(event) => console.log("Event clicked", event) /* Placeholder for edit/view details */}
          trucks={trucks}
          drivers={drivers}
        />
      </div>
      
      <AddScheduleEntryDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddScheduleEntry={addScheduleEntry}
        trucks={trucks}
        drivers={drivers}
      />
    </div>
  );
}
