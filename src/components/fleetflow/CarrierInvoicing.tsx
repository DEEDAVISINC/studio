
"use client";
import { useState, useEffect, useMemo } from 'react';
import type { Carrier, DispatchFeeRecord, Invoice, ScheduleEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertTriangle } from "lucide-react";
import { format, isPast, startOfWeek, endOfWeek, subWeeks, addDays, getDay, isWithinInterval } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ViewInvoiceDialog } from './ViewInvoiceDialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CarrierInvoicingProps {
  carriers: Carrier[];
  dispatchFeeRecords: DispatchFeeRecord[];
  invoices: Invoice[];
  onCreateInvoice: (carrierId: string, feeRecordIds: string[]) => Invoice | undefined;
  getScheduleEntryById: (scheduleEntryId: string) => ScheduleEntry | undefined;
  getCarrierById: (carrierId: string) => Carrier | undefined;
  updateInvoiceStatus: (invoiceId: string, newStatus: Invoice['status']) => void;
}

export function CarrierInvoicing({
  carriers,
  dispatchFeeRecords,
  invoices,
  onCreateInvoice,
  getScheduleEntryById,
  getCarrierById,
  updateInvoiceStatus,
}: CarrierInvoicingProps) {
  const [selectedCarrierId, setSelectedCarrierId] = useState<string | undefined>(undefined);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [hasCriticallyOverduePayments, setHasCriticallyOverduePayments] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const { previousWeekStart, previousWeekEnd } = useMemo(() => {
    if (!hasMounted) return { previousWeekStart: null, previousWeekEnd: null };
    const today = new Date();
    const startOfCurrentWeekSunday = startOfWeek(today, { weekStartsOn: 0 }); // Current week's Sunday
    const pWeekStart = subWeeks(startOfCurrentWeekSunday, 1); // Previous week's Sunday
    const pWeekEnd = endOfWeek(pWeekStart, { weekStartsOn: 0 }); // Previous week's Saturday
    return { previousWeekStart: pWeekStart, previousWeekEnd: pWeekEnd };
  }, [hasMounted]);


  useEffect(() => {
    if (!hasMounted || !selectedCarrierId) {
      setHasCriticallyOverduePayments(false);
      return;
    }

    const carrierSentInvoices = invoices.filter(
      (inv) => inv.carrierId === selectedCarrierId && inv.status === 'Sent'
    );

    let isOverdue = false;
    const today = new Date();

    for (const inv of carrierSentInvoices) {
      const dueDate = new Date(inv.dueDate);
      const mondayOfDueDateWeek = startOfWeek(dueDate, { weekStartsOn: 1 });
      const wednesdayOfDueDateWeek = addDays(mondayOfDueDateWeek, 2); 
      const endOfPaymentWednesday = new Date(
        wednesdayOfDueDateWeek.getFullYear(),
        wednesdayOfDueDateWeek.getMonth(),
        wednesdayOfDueDateWeek.getDate(),
        23, 59, 59, 999
      );

      if (today > endOfPaymentWednesday) {
        isOverdue = true;
        break;
      }
    }
    setHasCriticallyOverduePayments(isOverdue);

  }, [selectedCarrierId, invoices, hasMounted]);


  const pendingFeesForSelectedCarrier = useMemo(() => {
    if (!selectedCarrierId || !hasMounted || !previousWeekStart || !previousWeekEnd) return [];

    return dispatchFeeRecords.filter(fee => {
      if (fee.carrierId !== selectedCarrierId || fee.status !== 'Pending') return false;
      
      const scheduleEntry = getScheduleEntryById(fee.scheduleEntryId);
      if (!scheduleEntry) return false;

      const scheduleEndDate = new Date(scheduleEntry.end);
      return isWithinInterval(scheduleEndDate, { start: previousWeekStart, end: previousWeekEnd });
    });
  }, [selectedCarrierId, dispatchFeeRecords, getScheduleEntryById, hasMounted, previousWeekStart, previousWeekEnd]);


  const handleGenerateInvoice = () => {
    if (!selectedCarrierId || pendingFeesForSelectedCarrier.length === 0) {
      toast({
        title: "Cannot Generate Invoice",
        description: "Please select a carrier with pending fees from the previous week.",
        variant: "destructive",
      });
      return;
    }
    const feeRecordIdsToInvoice = pendingFeesForSelectedCarrier.map(fee => fee.id);
    const newInvoice = onCreateInvoice(selectedCarrierId, feeRecordIdsToInvoice);

    if (newInvoice) {
      setSelectedInvoice(newInvoice);
      setIsInvoiceDialogOpen(true);
      toast({
        title: "Invoice Generated",
        description: `Invoice ${newInvoice.invoiceNumber} created for ${getCarrierById(selectedCarrierId)?.name}.`,
      });
    } else {
      toast({
        title: "Invoice Generation Failed",
        description: "Could not generate the invoice. Please check records.",
        variant: "destructive",
      });
    }
  };
  
  const carrierInvoices = selectedCarrierId ? invoices.filter(inv => inv.carrierId === selectedCarrierId).sort((a,b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()) : [];


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-grow">
          <label htmlFor="carrierSelect" className="block text-sm font-medium text-foreground mb-1">
            Select Carrier
          </label>
          <Select onValueChange={setSelectedCarrierId} value={selectedCarrierId}>
            <SelectTrigger id="carrierSelect" className="w-full md:w-[300px] bg-background border-border">
              <SelectValue placeholder="Choose a carrier..." />
            </SelectTrigger>
            <SelectContent>
              {carriers.map(carrier => (
                <SelectItem key={carrier.id} value={carrier.id}>
                  {carrier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedCarrierId && pendingFeesForSelectedCarrier.length > 0 && (
           <Button onClick={handleGenerateInvoice} className="w-full md:w-auto bg-primary hover:bg-primary/90">
            <FileText className="mr-2 h-4 w-4" /> Generate Invoice for Previous Week
          </Button>
        )}
      </div>

      {hasMounted && hasCriticallyOverduePayments && selectedCarrierId && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Overdue Payments Detected</AlertTitle>
          <AlertDescription>
            This carrier has 'Sent' invoices where payment was due by Wednesday of a previous week. 
            Their eligibility for new bookable loads may be impacted until payments are settled.
          </AlertDescription>
        </Alert>
      )}

      {selectedCarrierId && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Pending Fees for {getCarrierById(selectedCarrierId)?.name || 'Selected Carrier'} (Previous Week)</CardTitle>
              <CardDescription>
                {hasMounted && previousWeekStart && previousWeekEnd 
                  ? `Showing fees for loads completed between ${format(previousWeekStart, 'P')} and ${format(previousWeekEnd, 'P')}.`
                  : "Calculating previous week's loads..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!hasMounted ? (
                <p className="text-muted-foreground text-center py-4">Loading eligible fees...</p>
              ) : pendingFeesForSelectedCarrier.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Load</TableHead>
                        <TableHead>Completion Date</TableHead>
                        <TableHead>Original Load Amount</TableHead>
                        <TableHead className="text-right">Fee (10%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingFeesForSelectedCarrier.map(fee => {
                        const scheduleEntry = getScheduleEntryById(fee.scheduleEntryId);
                        return (
                          <TableRow key={fee.id}>
                            <TableCell className="font-medium">{scheduleEntry?.title || 'N/A'}</TableCell>
                            <TableCell>{scheduleEntry ? format(new Date(scheduleEntry.end), 'P') : '...'}</TableCell>
                            <TableCell>{fee.originalLoadAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                            <TableCell className="text-right">{fee.feeAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertTriangle className="mx-auto h-10 w-10 mb-2 text-yellow-500" />
                  No pending dispatch fees for this carrier from the previous week.
                </div>
              )}
            </CardContent>
          </Card>

          {carrierInvoices.length > 0 && (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Invoice History for {getCarrierById(selectedCarrierId)?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {carrierInvoices.map(invoice => (
                                    <TableRow key={invoice.id}>
                                        <TableCell>{invoice.invoiceNumber}</TableCell>
                                        <TableCell>{hasMounted ? format(new Date(invoice.invoiceDate), 'P') : '...'}</TableCell>
                                        <TableCell>{hasMounted ? format(new Date(invoice.dueDate), 'P') : '...'}</TableCell>
                                        <TableCell>{invoice.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                                        <TableCell>{invoice.status}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => { setSelectedInvoice(invoice); setIsInvoiceDialogOpen(true); }}>View</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
          )}
        </>
      )}
      {!selectedCarrierId && (
        <p className="text-muted-foreground text-center py-8">Please select a carrier to view their dispatch fees and invoices.</p>
      )}

      {selectedInvoice && getCarrierById && getScheduleEntryById && (
        <ViewInvoiceDialog
          isOpen={isInvoiceDialogOpen}
          onOpenChange={setIsInvoiceDialogOpen}
          invoice={selectedInvoice}
          carrier={getCarrierById(selectedInvoice.carrierId)}
          feeRecords={dispatchFeeRecords.filter(fee => selectedInvoice.dispatchFeeRecordIds.includes(fee.id))}
          getScheduleEntryById={getScheduleEntryById}
          onUpdateInvoiceStatus={updateInvoiceStatus}
        />
      )}
    </div>
  );
}


    