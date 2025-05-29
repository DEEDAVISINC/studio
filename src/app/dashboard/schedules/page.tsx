
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter } from "lucide-react";
import { AddScheduleEntryDialog } from "@/components/fleetflow/AddScheduleEntryDialog";
import { ScheduleCalendarView } from "@/components/fleetflow/ScheduleCalendarView";
import { useAppData } from '@/contexts/AppDataContext';
import type { ScheduleEntry, ScheduleType } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SCHEDULE_TYPES } from "@/lib/types";

export default function SchedulesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const { scheduleEntries, addScheduleEntry, updateScheduleEntry, removeScheduleEntry, trucks, drivers } = useAppData();
  const [typeFilters, setTypeFilters] = useState<Record<ScheduleType, boolean>>({
    Delivery: true,
    Maintenance: true,
    Pickup: true,
    Other: true,
  });

  const handleAddOrUpdateEntry = (entryData: Omit<ScheduleEntry, 'id'> | ScheduleEntry) => {
    if (editingEntry && 'id' in entryData) {
      updateScheduleEntry(entryData as ScheduleEntry);
    } else {
      addScheduleEntry(entryData as Omit<ScheduleEntry, 'id'>);
    }
    setEditingEntry(null);
  };

  const openEditDialog = (entry: ScheduleEntry) => {
    setEditingEntry(entry);
    setIsAddDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingEntry(null);
    setIsAddDialogOpen(true);
  };

  const filteredScheduleEntries = scheduleEntries.filter(entry => 
    typeFilters[entry.scheduleType || 'Other'] // Default to 'Other' if type is undefined
  );
  
  const handleFilterChange = (type: ScheduleType) => {
    setTypeFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Truck Scheduler</h1>
          <p className="text-muted-foreground">View and manage truck schedules in the calendar.</p>
        </div>
        <div className="flex items-center gap-2">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Filter by Type
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Schedule Types</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SCHEDULE_TYPES.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={typeFilters[type]}
                  onCheckedChange={() => handleFilterChange(type)}
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Schedule
          </Button>
        </div>
      </div>

      <div className="flex-grow min-h-0">
        <ScheduleCalendarView 
          events={filteredScheduleEntries} 
          onEventClick={openEditDialog}
          trucks={trucks}
          drivers={drivers}
        />
      </div>
      
      <AddScheduleEntryDialog
        isOpen={isAddDialogOpen}
        onOpenChange={(isOpen) => {
            setIsAddDialogOpen(isOpen);
            if (!isOpen) setEditingEntry(null);
        }}
        onAddScheduleEntry={handleAddOrUpdateEntry}
        entryToEdit={editingEntry}
        trucks={trucks}
        drivers={drivers}
      />
    </div>
  );
}
