
"use client";
import type { ScheduleEntry, Truck, Carrier, DispatchFeeRecord } from "@/lib/types";
import { useAppData } from "@/contexts/AppDataContext"; // Assuming this exists and provides necessary data/functions
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface CreateDispatchFeeListProps {
  scheduleEntries: ScheduleEntry[];
  trucks: Truck[];
  carriers: Carrier[];
  dispatchFeeRecords: DispatchFeeRecord[];
  onAddDispatchFeeRecord: (record: Omit<DispatchFeeRecord, 'id' | 'calculatedDate' | 'status' | 'feeAmount'>) => void;
  getTruckById: (truckId: string) => Truck | undefined;
  getCarrierById: (carrierId: string) => Carrier | undefined;
}

export function CreateDispatchFeeList({
  scheduleEntries,
  // trucks, // Not directly needed if getTruckById is used
  // carriers, // Not directly needed if getCarrierById is used
  dispatchFeeRecords,
  onAddDispatchFeeRecord,
  getTruckById,
  getCarrierById,
}: CreateDispatchFeeListProps) {
  const { toast } = useToast();

  const eligibleScheduleEntries = scheduleEntries.filter(entry => {
    if (!entry.loadValue || entry.loadValue <= 0) return false;
    // Check if a dispatch fee record already exists for this schedule entry (Pending or Invoiced)
    const existingFee = dispatchFeeRecords.find(
      fee => fee.scheduleEntryId === entry.id && (fee.status === 'Pending' || fee.status === 'Invoiced')
    );
    return !existingFee;
  });

  const handleCreateFeeRecord = (scheduleEntry: ScheduleEntry) => {
    const truck = getTruckById(scheduleEntry.truckId);
    if (!truck) {
      toast({ title: "Error", description: "Truck not found for this schedule entry.", variant: "destructive" });
      return;
    }
    const carrier = getCarrierById(truck.carrierId);
    if (!carrier) {
      toast({ title: "Error", description: "Carrier not found for this truck.", variant: "destructive" });
      return;
    }

    if (scheduleEntry.loadValue && scheduleEntry.loadValue > 0) {
      onAddDispatchFeeRecord({
        scheduleEntryId: scheduleEntry.id,
        carrierId: carrier.id,
        originalLoadAmount: scheduleEntry.loadValue,
      });
      toast({
        title: "Fee Record Created",
        description: `10% dispatch fee record created for "${scheduleEntry.title}".`,
      });
    } else {
       toast({ title: "Error", description: "Load value must be greater than zero.", variant: "destructive" });
    }
  };

  if (eligibleScheduleEntries.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No schedule entries with a load value are currently eligible for fee record creation, or records already exist.</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Load Title</TableHead>
            <TableHead>Carrier</TableHead>
            <TableHead>Load Value</TableHead>
            <TableHead>Scheduled Dates</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {eligibleScheduleEntries.map((entry) => {
            const truck = getTruckById(entry.truckId);
            const carrier = truck ? getCarrierById(truck.carrierId) : undefined;
            return (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entry.title}</TableCell>
                <TableCell>{carrier?.name || 'N/A'}</TableCell>
                <TableCell>
                  {entry.loadValue?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || 'N/A'}
                </TableCell>
                <TableCell>
                  {format(new Date(entry.start), 'P')} - {format(new Date(entry.end), 'P')}
                </TableCell>
                <TableCell className="text-right">
                  {carrier && entry.loadValue && entry.loadValue > 0 ? (
                    <Button 
                      size="sm" 
                      onClick={() => handleCreateFeeRecord(entry)}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Create 10% Fee Record
                    </Button>
                  ) : (
                    <Badge variant="outline">N/A</Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
