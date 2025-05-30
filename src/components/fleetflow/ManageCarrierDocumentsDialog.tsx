
"use client";
import { useState } from 'react';
import type { Carrier, CarrierDocument, CarrierDocumentType } from '@/lib/types';
import { CARRIER_DOCUMENT_TYPES } from '@/lib/types';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ManageCarrierDocumentsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  carrier: Carrier;
  documents: CarrierDocument[];
  onAddDocument: (doc: Omit<CarrierDocument, 'id' | 'uploadDate'>) => CarrierDocument;
  onRemoveDocument: (docId: string) => void;
}

export function ManageCarrierDocumentsDialog({
  isOpen,
  onOpenChange,
  carrier,
  documents,
  onAddDocument,
  onRemoveDocument
}: ManageCarrierDocumentsDialogProps) {
  const { toast } = useToast();
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<CarrierDocumentType | ''>('');

  const handleAddDocument = () => {
    if (!documentName || !documentType) {
      toast({ title: "Missing Information", description: "Please provide document name and type.", variant: "destructive" });
      return;
    }
    const newDoc = onAddDocument({
      carrierId: carrier.id,
      documentName,
      documentType,
      // fileUrl will be simulated in context
    });
    toast({ title: "Document Recorded", description: `"${newDoc.documentName}" (${newDoc.documentType}) recorded for ${carrier.name}.` });
    setDocumentName('');
    setDocumentType('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">Manage Documents for: {carrier.name}</DialogTitle>
          <DialogDescription>
            Record and view documents associated with this carrier. Actual file uploads are simulated.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-b pb-4 mb-4">
            <div className="space-y-1 md:col-span-2">
                <Label htmlFor="newDocName">Document Name / Reference</Label>
                <Input 
                    id="newDocName" 
                    value={documentName} 
                    onChange={(e) => setDocumentName(e.target.value)} 
                    className="bg-background border-border"
                    placeholder="e.g., COI_2024.pdf, W9_Signed.pdf"
                />
            </div>
            <div className="space-y-1">
                <Label htmlFor="newDocType">Document Type</Label>
                <Select value={documentType} onValueChange={(value: CarrierDocumentType | '') => setDocumentType(value)}>
                    <SelectTrigger id="newDocType" className="bg-background border-border">
                    <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                    {CARRIER_DOCUMENT_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="md:col-span-3 flex justify-end">
                 <Button onClick={handleAddDocument} disabled={!documentName || !documentType} className="mt-2 bg-primary hover:bg-primary/90">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Document Record
                </Button>
            </div>
        </div>

        <h3 className="text-md font-semibold text-foreground mb-2">Recorded Documents:</h3>
        {documents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No documents recorded for this carrier yet.</p>
        ) : (
            <ScrollArea className="h-[300px] rounded-md border">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recorded Date</TableHead>
                    <TableHead>Simulated Path</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {documents.map(doc => (
                    <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.documentName}</TableCell>
                    <TableCell>{doc.documentType}</TableCell>
                    <TableCell>{format(new Date(doc.uploadDate), 'P p')}</TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]" title={doc.fileUrl}>{doc.fileUrl || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => onRemoveDocument(doc.id)} className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </ScrollArea>
        )}
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
