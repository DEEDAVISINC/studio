
"use client";
import type { ScheduleEntry, Truck, Driver } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useMemo } from "react";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isWithinInterval, 
  isSameDay, 
  addWeeks, 
  subWeeks 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Users, StickyNote } from "lucide-react";
import { Badge } from '@/components/ui/badge'; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// Removed Tooltip imports

interface ScheduleCalendarViewProps {
  events: ScheduleEntry[];
  onEventClick: (event: ScheduleEntry) => void;
  trucks: Truck[];
  drivers: Driver[];
}

export function ScheduleCalendarView({ events, onEventClick, trucks, drivers }: ScheduleCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewingNotesEvent, setViewingNotesEvent] = useState<ScheduleEntry | null>(null);

  const weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1; // Monday

  const currentWeekStart = startOfWeek(currentDate, { weekStartsOn });
  const currentWeekEnd = endOfWeek(currentDate, { weekStartsOn });
  const daysInWeek = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

  const getDriverName = (driverId?: string) => driverId ? (drivers.find(d => d.id === driverId)?.name || 'Unassigned') : 'Unassigned';

  const eventsByTruckAndDay = useMemo(() => {
    const grouped: Record<string, Record<string, ScheduleEntry[]>> = {};
    trucks.forEach(truck => {
      grouped[truck.id] = {};
      daysInWeek.forEach(day => {
        const dayKey = format(day, 'yyyy-MM-dd');
        grouped[truck.id][dayKey] = events.filter(event => {
          if (event.truckId !== truck.id) return false;
          const eventStart = new Date(event.start);
          const eventEnd = new Date(event.end);
          return isSameDay(eventStart, day) || isSameDay(eventEnd, day) || 
                 (eventStart < day && eventEnd > day) || 
                 isWithinInterval(day, { start: eventStart, end: eventEnd });
        }).sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      });
    });
    return grouped;
  }, [events, trucks, daysInWeek]);

  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  return (
    <>
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl text-center">
            Week of {format(currentWeekStart, 'MMM d, yyyy')} - {format(currentWeekEnd, 'MMM d, yyyy')}
          </CardTitle>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-center">
          Timeline view of truck schedules for the week. Click an entry to edit. Overlaps only allowed for partial loads. HOS rules apply.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0 md:p-2">
        <ScrollArea className="h-full w-full">
          <Table className="min-w-full border-collapse">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="sticky left-0 z-10 bg-muted/80 backdrop-blur-sm w-1/6 min-w-[150px] border-r">Truck</TableHead>
                {daysInWeek.map(day => (
                  <TableHead key={day.toISOString()} className="text-center border-l min-w-[150px]">
                    {format(day, 'EEE')} <br />
                    <span className="text-xs font-normal">{format(day, 'MMM d')}</span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {trucks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={daysInWeek.length + 1} className="text-center text-muted-foreground py-10">
                    No trucks available. Add trucks to see the schedule.
                  </TableCell>
                </TableRow>
              ) : trucks.map(truck => (
                <TableRow key={truck.id} className="hover:bg-muted/20">
                  <TableCell className="sticky left-0 z-10 font-medium bg-card hover:bg-muted/20 border-r min-h-[80px]">
                    {truck.name}
                    <p className="text-xs text-muted-foreground">{truck.licensePlate}</p>
                  </TableCell>
                  {daysInWeek.map(day => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const truckDayEvents = eventsByTruckAndDay[truck.id]?.[dayKey] || [];
                    return (
                      <TableCell key={day.toISOString()} className="align-top p-1.5 border-l min-h-[80px] h-auto">
                        {truckDayEvents.length > 0 ? (
                          <div className="space-y-1">
                            {truckDayEvents.map(event => (
                              <div
                                key={event.id}
                                onClick={(e) => {
                                  // Prevent dialog from opening if note icon is clicked
                                  if ((e.target as HTMLElement).closest('.note-icon-trigger')) return;
                                  onEventClick(event);
                                }}
                                className="p-1.5 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity text-white"
                                style={{ backgroundColor: event.color || 'hsl(var(--primary))' }}
                                title={`Driver: ${getDriverName(event.driverId)}\n${event.origin} to ${event.destination}\n${format(new Date(event.start), 'p')} - ${format(new Date(event.end), 'p')}${event.notes ? `\nNotes: ${event.notes}` : ''}${event.isTeamDriven ? '\n(Team Driven)' : ''}${event.isPartialLoad ? '\n(Partial Load)' : ''}`}
                              >
                                <div className="flex justify-between items-start">
                                  <p className="font-semibold truncate flex items-center gap-1">
                                    {event.title}
                                    {event.notes && (
                                      <Dialog open={viewingNotesEvent?.id === event.id && viewingNotesEvent.notes === event.notes} onOpenChange={(isOpen) => { if(!isOpen) setViewingNotesEvent(null); }}>
                                        <DialogTrigger asChild>
                                          <Button variant="ghost" size="icon" className="note-icon-trigger h-4 w-4 p-0 text-yellow-300 hover:text-yellow-400 shrink-0" onClick={(e) => { e.stopPropagation(); setViewingNotesEvent(event); }}>
                                            <StickyNote className="h-3 w-3" />
                                          </Button>
                                        </DialogTrigger>
                                      </Dialog>
                                    )}
                                  </p>
                                  <div className="flex items-center shrink-0 ml-1">
                                    {event.isTeamDriven && <Users className="h-3 w-3 text-white/80" title="Team Driven"/>}
                                  </div>
                                </div>
                                <p className="truncate">{format(new Date(event.start), 'p')} - {format(new Date(event.end), 'p')}</p>
                                {event.isPartialLoad && <Badge variant="secondary" className="mt-0.5 text-xs py-0 px-1 h-auto bg-black/20 text-white">Partial</Badge>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full w-full"></div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>

    {/* Dialog for Viewing Event Notes */}
    {viewingNotesEvent && viewingNotesEvent.notes && (
      <Dialog open={!!viewingNotesEvent} onOpenChange={(isOpen) => { if (!isOpen) setViewingNotesEvent(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notes for: {viewingNotesEvent.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
              {viewingNotesEvent.notes}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingNotesEvent(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
}

    