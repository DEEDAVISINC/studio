
"use client";
import type { Invoice, Carrier, DispatchFeeRecord, ScheduleEntry } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Printer, Send, CheckCircle, XCircle, DollarSign } from "lucide-react"; // Added DollarSign

interface ViewInvoiceDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  invoice: Invoice;
  carrier?: Carrier;
  feeRecords: DispatchFeeRecord[];
  getScheduleEntryById: (scheduleEntryId: string) => ScheduleEntry | undefined;
  onUpdateInvoiceStatus: (invoiceId: string, newStatus: Invoice['status']) => void;
}

export function ViewInvoiceDialog({
  isOpen,
  onOpenChange,
  invoice,
  carrier,
  feeRecords,
  getScheduleEntryById,
  onUpdateInvoiceStatus,
}: ViewInvoiceDialogProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    // Basic print functionality
    const printableContent = document.getElementById("invoice-content");
    if (printableContent) {
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow?.document.write('<html><head><title>Invoice</title>');
      // You might want to link to your app's stylesheet or embed critical styles
      printWindow?.document.write('<link rel="stylesheet" href="/globals.css" type="text/css" />'); // Example
      printWindow?.document.write('<style>body { margin: 20px; font-family: sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left;} .total-row td { font-weight: bold; } .header-section { margin-bottom: 20px; } .text-right { text-align: right; } .text-lg { font-size: 1.125rem; } .font-bold { font-weight: bold; }</style>');
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
        
        <div id="invoice-content" className="flex-grow overflow-y-auto space-y-4 p-1 pr-3">
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

          <div className="rounded-md border mt-4">
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
                <TableRow className="total-row bg-muted/50">
                  <TableCell colSpan={2} className="text-right font-bold text-foreground">Total Dispatch Fees Due</TableCell>
                  <TableCell className="text-right font-bold text-foreground text-lg">
                    {invoice.totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t sticky bottom-0 bg-card pb-2">
          <div className="flex-grow space-x-2">
            {invoice.status === 'Draft' && (
                <Button variant="outline" onClick={() => onUpdateInvoiceStatus(invoice.id, 'Sent')}>
                    <Send className="mr-2 h-4 w-4" /> Mark as Sent
                </Button>
            )}
             {(invoice.status === 'Sent' || invoice.status === 'Draft') && (
                <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => onUpdateInvoiceStatus(invoice.id, 'Paid')}>
                    <DollarSign className="mr-2 h-4 w-4" /> Mark as Paid
                </Button>
            )}
            {invoice.status !== 'Void' && invoice.status !== 'Paid' && (
                 <Button variant="destructive" onClick={() => onUpdateInvoiceStatus(invoice.id, 'Void')}>
                    <XCircle className="mr-2 h-4 w-4" /> Void Invoice
                </Button>
            )}
          </div>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print Invoice
          </Button>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
