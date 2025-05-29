
"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter } from "lucide-react";
import { AddScheduleEntryDialog } from "@/components/fleetflow/AddScheduleEntryDialog";
import { ScheduleCalendarView } from "@/components/fleetflow/ScheduleCalendarView"; // Renamed to reflect its new nature
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
import { useToast } from '@/hooks/use-toast';

export default function SchedulesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const { scheduleEntries, addScheduleEntry, updateScheduleEntry, removeScheduleEntry, trucks, drivers } = useAppData();
  const { toast } = useToast();
  const [typeFilters, setTypeFilters] = useState<Record<ScheduleType, boolean>>({
    Delivery: true,
    Maintenance: true,
    Pickup: true,
    Other: true,
  });

  const handleAddOrUpdateEntry = (entryData: Omit<ScheduleEntry, 'id'> | ScheduleEntry): ScheduleEntry | null => {
    let result: ScheduleEntry | null = null;
    if (editingEntry && 'id' in entryData) {
      result = updateScheduleEntry(entryData as ScheduleEntry);
    } else {
      result = addScheduleEntry(entryData as Omit<ScheduleEntry, 'id'>);
    }
    
    if (result) {
        setEditingEntry(null);
    }
    return result;
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
    typeFilters[entry.scheduleType || 'Other']
  );
  
  const handleFilterChange = (type: ScheduleType) => {
    setTypeFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Truck Scheduler</h1>
          <p className="text-muted-foreground">Weekly timeline view. Overlaps are prevented unless marked as partial load.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-grow sm:flex-grow-0">
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
          <Button onClick={openAddDialog} className="bg-primary hover:bg-primary/90 flex-grow sm:flex-grow-0">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Schedule
          </Button>
        </div>
      </div>

      {/* The ScheduleCalendarView will now manage its own height and scrolling */}
      <div className="flex-grow min-h-[600px] md:min-h-0"> {/* Ensure it has enough space or can grow */}
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
