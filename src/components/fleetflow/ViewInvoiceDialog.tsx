
"use client";
import { useState } from 'react';
import type { Invoice, Carrier, DispatchFeeRecord, ScheduleEntry, ManualLineItem } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose, // Added DialogClose for nested dialog
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as UiTableFooter } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Printer, Send, CheckCircle, XCircle, DollarSign, PlusCircle, Trash2 } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import { useAppData } from '@/contexts/AppDataContext'; // To call addManualLineItemToInvoice

interface ViewInvoiceDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  invoice: Invoice;
  carrier?: Carrier;
  feeRecords: DispatchFeeRecord[]; // These are only the dispatch fee records, not manual items
  getScheduleEntryById: (scheduleEntryId: string) => ScheduleEntry | undefined;
  onUpdateInvoiceStatus: (invoiceId: string, newStatus: Invoice['status']) => void;
}

export function ViewInvoiceDialog({
  isOpen,
  onOpenChange,
  invoice,
  carrier,
  feeRecords, // original dispatch fee records
  getScheduleEntryById,
  onUpdateInvoiceStatus,
}: ViewInvoiceDialogProps) {
  const { addManualLineItemToInvoice, removeManualLineItemFromInvoice } = useAppData();
  const { toast } = useToast();
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [adjustmentDescription, setAdjustmentDescription] = useState('');
  const [adjustmentAmount, setAdjustmentAmount] = useState<number | ''>('');
  const [adjustmentType, setAdjustmentType] = useState<'charge' | 'credit'>('charge');

  if (!invoice) return null;

  const handlePrint = () => {
    const printableContent = document.getElementById(`invoice-content-${invoice.id}`);
    if (printableContent) {
      const printWindow = window.open('', '', 'height=800,width=1000');
      printWindow?.document.write('<html><head><title>Invoice</title>');
      printWindow?.document.write('<style>body { margin: 20px; font-family: sans-serif; color: #333; } table { width: 100%; border-collapse: collapse; margin-bottom: 15px; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 0.9rem; } th { background-color: #f9f9f9; } .header-section, .totals-section { margin-bottom: 20px; } .text-right { text-align: right; } .text-lg { font-size: 1.125rem; } .font-semibold { font-weight: 600; } .font-bold { font-weight: bold; } .grid { display: grid; } .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr));} .gap-4 { gap: 1rem; } .mt-4 { margin-top: 1rem; } .mb-1 { margin-bottom: 0.25rem; } .mb-2 { margin-bottom: 0.5rem; } .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; } .italic { font-style: italic; } .text-xs { font-size: 0.75rem; } .text-muted-foreground { color: #777; } </style>');
      printWindow?.document.write('</head><body>');
      printWindow?.document.write(printableContent.innerHTML);
      printWindow?.document.write('</body></html>');
      printWindow?.document.close();
      printWindow?.focus();
      printWindow?.print();
    }
  };
  
  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'Paid': return 'text-green-600';
      case 'Sent': return 'text-blue-600';
      case 'Draft': return 'text-yellow-600';
      case 'Void': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const handleAddAdjustment = () => {
    if (!adjustmentDescription || adjustmentAmount === '' || adjustmentAmount <= 0) {
      toast({ title: "Invalid Adjustment", description: "Please provide a description and a positive amount.", variant: "destructive" });
      return;
    }
    addManualLineItemToInvoice(invoice.id, {
      description: adjustmentDescription,
      amount: Number(adjustmentAmount),
      type: adjustmentType,
    });
    toast({ title: "Adjustment Added", description: `${adjustmentType === 'charge' ? 'Charge' : 'Credit'} of $${adjustmentAmount} added.` });
    setIsAdjustmentDialogOpen(false);
    setAdjustmentDescription('');
    setAdjustmentAmount('');
    setAdjustmentType('charge');
  };

  const handleRemoveAdjustment = (lineItemId: string) => {
    removeManualLineItemFromInvoice(invoice.id, lineItemId);
    toast({ title: "Adjustment Removed" });
  };
  
  const canModifyInvoice = invoice.status === 'Sent' || invoice.status === 'Draft';

  const dispatchFeesSubtotal = feeRecords.reduce((sum, fee) => sum + fee.feeAmount, 0);
  const manualAdjustmentsSubtotal = (invoice.manualLineItems || []).reduce((sum, item) => {
    return sum + (item.type === 'charge' ? item.amount : -item.amount);
  }, 0);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-card max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-foreground text-2xl">Invoice {invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>
            Details for invoice to {carrier?.name || 'N/A'}. 
            Status: <span className={`font-semibold ${getStatusColor(invoice.status)}`}>{invoice.status}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div id={`invoice-content-${invoice.id}`} className="flex-grow overflow-y-auto space-y-4 p-1 pr-3">
          <div className="grid grid-cols-2 gap-4 header-section">
            <div>
              <h3 className="font-semibold text-lg text-foreground">Billed To:</h3>
              <p className="text-muted-foreground">{carrier?.name}</p>
              <p className="text-muted-foreground">{carrier?.contactPerson}</p>
              <p className="text-muted-foreground">{carrier?.contactEmail}</p>
              <p className="text-muted-foreground">{carrier?.contactPhone}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-lg text-foreground">Invoice Details:</h3>
              <p className="text-muted-foreground">Invoice #: {invoice.invoiceNumber}</p>
              <p className="text-muted-foreground">Date: {format(new Date(invoice.invoiceDate), "PPP")}</p>
              <p className="text-muted-foreground">Due Date: {format(new Date(invoice.dueDate), "PPP")}</p>
            </div>
          </div>

          <Separator />

          <h4 className="font-semibold text-md text-foreground mt-4">Dispatch Fees</h4>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Load Description</TableHead>
                  <TableHead>Original Load Value</TableHead>
                  <TableHead className="text-right">Dispatch Fee (10%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeRecords.map(fee => {
                  const scheduleEntry = getScheduleEntryById(fee.scheduleEntryId);
                  return (
                    <TableRow key={fee.id}>
                      <TableCell>
                        {scheduleEntry?.title || 'N/A'}
                        <span className="block text-xs text-muted-foreground">
                          {scheduleEntry ? `${scheduleEntry.origin} to ${scheduleEntry.destination}` : ''}
                        </span>
                      </TableCell>
                      <TableCell>{fee.originalLoadAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                      <TableCell className="text-right">{fee.feeAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                    </TableRow>
                  );
                })}
                {feeRecords.length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-3">No dispatch fees for this invoice.</TableCell></TableRow>
                )}
              </TableBody>
               {feeRecords.length > 0 && (
                <UiTableFooter>
                    <TableRow>
                        <TableCell colSpan={2} className="text-right font-semibold">Dispatch Fees Subtotal:</TableCell>
                        <TableCell className="text-right font-semibold">{dispatchFeesSubtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                    </TableRow>
                </UiTableFooter>
               )}
            </Table>
          </div>

          <Separator className="my-4" />
           <div className="flex justify-between items-center">
            <h4 className="font-semibold text-md text-foreground">Manual Adjustments</h4>
            {canModifyInvoice && (
                <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => {
                             setAdjustmentDescription(''); setAdjustmentAmount(''); setAdjustmentType('charge');
                             setIsAdjustmentDialogOpen(true);
                        }}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Adjustment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add Manual Adjustment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 py-2">
                            <div>
                                <Label htmlFor="adjDesc">Description</Label>
                                <Input id="adjDesc" value={adjustmentDescription} onChange={(e) => setAdjustmentDescription(e.target.value)} className="mt-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="adjAmount">Amount</Label>
                                    <Input id="adjAmount" type="number" value={adjustmentAmount} onChange={(e) => setAdjustmentAmount(parseFloat(e.target.value) || '')} className="mt-1" placeholder="0.00" />
                                </div>
                                <div>
                                    <Label htmlFor="adjType">Type</Label>
                                    <Select value={adjustmentType} onValueChange={(v: 'charge' | 'credit') => setAdjustmentType(v)}>
                                        <SelectTrigger id="adjType" className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="charge">Charge (Add to total)</SelectItem>
                                            <SelectItem value="credit">Credit (Subtract from total)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAdjustmentDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddAdjustment}>Add Adjustment</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
           </div>
          {(invoice.manualLineItems && invoice.manualLineItems.length > 0) ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    {canModifyInvoice && <TableHead className="text-right w-[80px]">Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.manualLineItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description} <span className="text-xs italic text-muted-foreground">({item.type})</span></TableCell>
                      <TableCell className="text-right">
                        {(item.type === 'charge' ? item.amount : -item.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </TableCell>
                      {canModifyInvoice && (
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={() => handleRemoveAdjustment(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
                 <UiTableFooter>
                    <TableRow>
                        <TableCell className="text-right font-semibold">{canModifyInvoice ? '' : 'Manual Adjustments Subtotal:'}</TableCell>
                        <TableCell className="text-right font-semibold">{manualAdjustmentsSubtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                        {canModifyInvoice && <TableCell></TableCell>}
                    </TableRow>
                </UiTableFooter>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-1">No manual adjustments for this invoice.</p>
          )}
          
          <Separator className="my-4" />
          <div className="totals-section text-right">
            <p className="text-lg font-semibold text-foreground">
                Grand Total: {invoice.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t sticky bottom-0 bg-card pb-2 flex flex-wrap justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {invoice.status === 'Draft' && (
                <Button variant="outline" size="sm" onClick={() => onUpdateInvoiceStatus(invoice.id, 'Sent')}>
                    <Send className="mr-2 h-4 w-4" /> Mark as Sent
                </Button>
            )}
             {(invoice.status === 'Sent' || invoice.status === 'Draft') && (
                <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onUpdateInvoiceStatus(invoice.id, 'Paid')}>
                    <DollarSign className="mr-2 h-4 w-4" /> Mark as Paid
                </Button>
            )}
            {invoice.status !== 'Void' && invoice.status !== 'Paid' && (
                 <Button variant="destructive" size="sm" onClick={() => onUpdateInvoiceStatus(invoice.id, 'Void')}>
                    <XCircle className="mr-2 h-4 w-4" /> Void Invoice
                </Button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <DialogClose asChild>
                <Button variant="secondary" size="sm">Close</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

