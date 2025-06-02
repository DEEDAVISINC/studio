
"use client";
import type { Carrier, FmcsaAuthorityStatus } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit3, Eye, Phone, Mail, ShieldCheck, ShieldAlert, ShieldQuestion, Loader2, CheckCircle, AlertCircleIcon, Copy, FileText } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/contexts/AppDataContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback, useEffect } from 'react';
import { format, parseISO, isValid } from "date-fns";
import { ManageCarrierDocumentsDialog } from "./ManageCarrierDocumentsDialog";

interface CarrierListTableProps {
  carriers: Carrier[];
  onEdit: (carrier: Carrier) => void;
  onDelete: (carrierId: string) => void;
}

export function CarrierListTable({ carriers, onEdit, onDelete }: CarrierListTableProps) {
  const { verifyCarrierFmcsa, carrierDocuments, addCarrierDocument, removeCarrierDocument } = useAppData();
  const { toast } = useToast();
  const [verifyingCarrierId, setVerifyingCarrierId] = useState<string | null>(null);
  const [managingDocsCarrier, setManagingDocsCarrier] = useState<Carrier | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleVerifyFmcsa = useCallback(async (carrier: Carrier) => {
    if (!carrier.mcNumber && !carrier.usDotNumber) {
        toast({ title: "Verification Skipped", description: `Carrier ${carrier.name} has no MC or USDOT number to verify.`, variant: "default" });
        return;
    }
    setVerifyingCarrierId(carrier.id);
    try {
        const status = await verifyCarrierFmcsa(carrier.id);
        toast({
            title: "FMCSA Verification Update",
            description: `Carrier ${carrier.name} status: ${status}.`,
        });
    } catch (error) {
        toast({
            title: "FMCSA Verification Error",
            description: "Could not complete FMCSA verification simulation.",
            variant: "destructive",
        });
    } finally {
        setVerifyingCarrierId(null);
    }
  }, [verifyCarrierFmcsa, toast]);

  const handleCopyContactCard = (carrier: Carrier) => {
    const contactInfo = `
Carrier Name: ${carrier.name}
${carrier.dba ? `DBA: ${carrier.dba}\n` : ''}MC #: ${carrier.mcNumber || 'N/A'}
US DOT #: ${carrier.usDotNumber || 'N/A'}

Contact Person: ${carrier.contactPerson}
Phone: ${carrier.contactPhone}
Email: ${carrier.contactEmail}
    `.trim();

    navigator.clipboard.writeText(contactInfo)
      .then(() => {
        toast({ title: "Contact Card Copied!", description: `${carrier.name}'s contact info copied to clipboard.` });
      })
      .catch(err => {
        console.error("Failed to copy contact card: ", err);
        toast({ title: "Copy Failed", description: "Could not copy contact info.", variant: "destructive" });
      });
  };

  const getFmcsaStatusBadge = (status?: FmcsaAuthorityStatus) => {
    switch (status) {
      case 'Verified Active':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white"><ShieldCheck className="mr-1 h-3 w-3" />Active</Badge>;
      case 'Verified Inactive':
        return <Badge variant="destructive"><ShieldAlert className="mr-1 h-3 w-3" />Inactive</Badge>;
      case 'Verification Failed':
        return <Badge variant="destructive"><ShieldAlert className="mr-1 h-3 w-3" />Failed</Badge>;
      case 'Pending Verification':
         return <Badge variant="secondary"><Loader2 className="mr-1 h-3 w-3 animate-spin" />Pending</Badge>;
      case 'Not Verified':
      default:
        return <Badge variant="outline"><ShieldQuestion className="mr-1 h-3 w-3" />Not Verified</Badge>;
    }
  };

  const getBookableStatusBadge = (isBookable: boolean) => {
    if (isBookable) {
      return <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle className="mr-1 h-3 w-3" />Bookable</Badge>;
    } else {
      return <Badge variant="destructive"><AlertCircleIcon className="mr-1 h-3 w-3" />Payments Overdue</Badge>;
    }
  };

  const formatDateChecked = (dateInput?: Date | string): string => {
    if (!hasMounted || !dateInput) return '...';
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (!isValid(date)) return 'Invalid Date';
    return format(date, 'P p');
  };


  if (carriers.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No carriers found. Add a new carrier to get started.</p>;
  }

  return (
    <>
    <div className="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Legal Name / DBA</TableHead>
          <TableHead>MC# / DOT#</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>FMCSA Status</TableHead>
          <TableHead>Bookable Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {carriers.map((carrier) => (
          <TableRow key={carrier.id} className={!carrier.isBookable ? 'bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40' : ''}>
            <TableCell className="font-medium">
              <div>{carrier.name}</div>
              {carrier.dba && <div className="text-xs text-muted-foreground">DBA: {carrier.dba}</div>}
            </TableCell>
            <TableCell>
              <div>MC: {carrier.mcNumber || 'N/A'}</div>
              <div className="text-xs text-muted-foreground">DOT: {carrier.usDotNumber || 'N/A'}</div>
            </TableCell>
            <TableCell>
              <div>{carrier.contactPerson}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3"/> {carrier.contactPhone}
              </div>
               <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3"/> {carrier.contactEmail}
              </div>
            </TableCell>
            <TableCell>
                {getFmcsaStatusBadge(carrier.fmcsaAuthorityStatus)}
                {carrier.fmcsaLastChecked && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                        Last: {formatDateChecked(carrier.fmcsaLastChecked)}
                    </div>
                )}
            </TableCell>
            <TableCell>
                {getBookableStatusBadge(carrier.isBookable)}
            </TableCell>
            <TableCell className="text-right">
              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(carrier)}>
                       <Edit3 className="mr-2 h-4 w-4" /> Edit Carrier
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleCopyContactCard(carrier)}>
                       <Copy className="mr-2 h-4 w-4" /> Copy Contact Card
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setManagingDocsCarrier(carrier)}>
                       <FileText className="mr-2 h-4 w-4" /> Manage Documents
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleVerifyFmcsa(carrier)} disabled={verifyingCarrierId === carrier.id}>
                        {verifyingCarrierId === carrier.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />} 
                        Verify FMCSA
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Carrier
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the carrier "{carrier.name}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(carrier.id)} className="bg-destructive hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
    {managingDocsCarrier && (
        <ManageCarrierDocumentsDialog
          isOpen={!!managingDocsCarrier}
          onOpenChange={(isOpen) => {
            if (!isOpen) setManagingDocsCarrier(null);
          }}
          carrier={managingDocsCarrier}
          documents={carrierDocuments.filter(doc => doc.carrierId === managingDocsCarrier.id)}
          onAddDocument={addCarrierDocument}
          onRemoveDocument={removeCarrierDocument}
        />
      )}
    </>
  );
}
