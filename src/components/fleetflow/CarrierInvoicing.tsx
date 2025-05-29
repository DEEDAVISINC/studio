
"use client";
import { useState } from 'react';
import type { Carrier, DispatchFeeRecord, Invoice, ScheduleEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ViewInvoiceDialog } from './ViewInvoiceDialog'; // Create this component

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
  const { toast } = useToast();

  const pendingFeesForSelectedCarrier = selectedCarrierId
    ? dispatchFeeRecords.filter(fee => fee.carrierId === selectedCarrierId && fee.status === 'Pending')
    : [];

  const handleGenerateInvoice = () => {
    if (!selectedCarrierId || pendingFeesForSelectedCarrier.length === 0) {
      toast({
        title: "Cannot Generate Invoice",
        description: "Please select a carrier with pending fees.",
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
            <FileText className="mr-2 h-4 w-4" /> Generate Invoice for Pending Fees
          </Button>
        )}
      </div>

      {selectedCarrierId && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Pending Dispatch Fees for {getCarrierById(selectedCarrierId)?.name || 'Selected Carrier'}</CardTitle>
              <CardDescription>These fees are ready to be invoiced.</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingFeesForSelectedCarrier.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Load</TableHead>
                        <TableHead>Calculated Date</TableHead>
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
                            <TableCell>{format(new Date(fee.calculatedDate), 'P p')}</TableCell>
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
                  No pending dispatch fees for this carrier.
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
                                        <TableCell>{format(new Date(invoice.invoiceDate), 'P')}</TableCell>
                                        <TableCell>{format(new Date(invoice.dueDate), 'P')}</TableCell>
                                        <TableCell>{invoice.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                                        <TableCell>{invoice.status}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => { setSelectedInvoice(invoice); setIsInvoiceDialogOpen(true); }}>View</Button>
                                            {/* Add more actions like Mark as Paid, Send, etc. */}
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
