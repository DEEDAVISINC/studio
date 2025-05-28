"use client";
import type { ScheduleEntry, Truck, Driver } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useMemo } from "react";
import { format,isSameDay, parseISO } from 'date-fns';
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

interface ScheduleCalendarViewProps {
  events: ScheduleEntry[];
  onEventClick: (event: ScheduleEntry) => void;
  trucks: Truck[];
  drivers: Driver[];
}

export function ScheduleCalendarView({ events, onEventClick, trucks, drivers }: ScheduleCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const getTruckName = (truckId: string) => trucks.find(t => t.id === truckId)?.name || 'Unknown Truck';
  const getDriverName = (driverId?: string) => driverId ? (drivers.find(d => d.id === driverId)?.name || 'Unassigned') : 'Unassigned';

  const eventsByDate = useMemo(() => {
    const groupedEvents: Record<string, ScheduleEntry[]> = {};
    events.forEach(event => {
      const dateKey = format(event.start, 'yyyy-MM-dd');
      if (!groupedEvents[dateKey]) {
        groupedEvents[dateKey] = [];
      }
      groupedEvents[dateKey].push(event);
    });
    return groupedEvents;
  }, [events]);

  const selectedDayEvents = selectedDate ? eventsByDate[format(selectedDate, 'yyyy-MM-dd')] || [] : [];

  const DayCellContent = ({ date }: { date: Date }) => {
    const dayEvents = eventsByDate[format(date, 'yyyy-MM-dd')] || [];
    return (
      <div className="relative h-full w-full">
        <span className="absolute top-1 right-1 text-xs">{format(date, 'd')}</span>
        {dayEvents.length > 0 && (
          <div className="absolute bottom-1 left-1 flex space-x-1">
            {dayEvents.slice(0, 2).map(event => (
              <div key={event.id} className="h-2 w-2 rounded-full" style={{ backgroundColor: event.color || 'hsl(var(--primary))' }}></div>
            ))}
            {dayEvents.length > 2 && <div className="h-2 w-2 rounded-full bg-muted-foreground"></div>}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      <Card className="flex-grow shadow-lg md:w-2/3 h-full">
        <CardContent className="p-0 md:p-2 h-full">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="w-full"
            classNames={{
              day_cell: "h-16 text-sm", // Increased height for cells
              day: "h-full w-full rounded-md",
            }}
            components={{
              DayContent: DayCellContent,
            }}
            modifiers={{
                hasEvent: Object.keys(eventsByDate).map(dateStr => parseISO(dateStr))
            }}
            modifiersClassNames={{
                hasEvent: "relative" // Ensure positioning context for event indicators
            }}
          />
        </CardContent>
      </Card>
      <Card className="md:w-1/3 shadow-lg h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">
            Schedule for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
          </CardTitle>
          <CardDescription>Events scheduled for the selected day.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-3">
                {selectedDayEvents.length > 0 ? (
                <ul className="space-y-3">
                    {selectedDayEvents.map(event => (
                    <li key={event.id} 
                        className="p-3 rounded-lg border cursor-pointer hover:bg-muted/80 transition-colors"
                        style={{borderColor: event.color || 'hsl(var(--border))'}}
                        onClick={() => onEventClick(event)}>
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm text-foreground">{event.title}</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{backgroundColor: event.color || 'hsl(var(--primary))'}}>
                            {format(event.start, 'p')} - {format(event.end, 'p')}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Truck: {getTruckName(event.truckId)}</p>
                        <p className="text-xs text-muted-foreground">Driver: {getDriverName(event.driverId)}</p>
                        {event.notes && <p className="text-xs text-muted-foreground mt-1">Notes: {event.notes}</p>}
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-muted-foreground text-center py-6">No events for this day.</p>
                )}
            </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
