
"use client";
import { useState } from 'react';
import type { BrokerLoad, LoadDocument, Shipper, LoadDocumentType, Truck, Driver } from "@/lib/types";
import { LOAD_DOCUMENT_TYPES } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUp, PackageCheck, ListOrdered, Eye, AlertTriangle, StickyNote, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert } from '@/components/ui/alert';

interface MyBookedLoadsProps {
  bookedLoads: BrokerLoad[];
  loadDocuments: LoadDocument[];
  onAddLoadDocument: (doc: Omit<LoadDocument, 'id' | 'uploadDate'>) => void;
  getShipperById: (id: string) => Shipper | undefined;
  getTruckById: (id: string) => Truck | undefined;
  getDriverById: (id: string) => Driver | undefined;
}

export function MyBookedLoads({
  bookedLoads,
  loadDocuments,
  onAddLoadDocument,
  getShipperById,
  getTruckById,
  getDriverById,
}: MyBookedLoadsProps) {
  const { toast } = useToast();
  const [selectedLoadForDocs, setSelectedLoadForDocs] = useState<BrokerLoad | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<LoadDocumentType | ''>('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isViewDocsDialogOpen, setIsViewDocsDialogOpen] = useState(false);
  const [viewingNotesLoad, setViewingNotesLoad] = useState<BrokerLoad | null>(null);


  const handleOpenUploadDialog = (load: BrokerLoad) => {
    setSelectedLoadForDocs(load);
    setDocumentName('');
    setDocumentType('');
    setIsUploadDialogOpen(true);
  };

  const handleOpenViewDocsDialog = (load: BrokerLoad) => {
    setSelectedLoadForDocs(load);
    setIsViewDocsDialogOpen(true);
  };

  const handleUploadDocument = () => {
    if (!selectedLoadForDocs || !documentName || !documentType) {
      toast({ title: "Missing Information", description: "Please provide document name and type.", variant: "destructive" });
      return;
    }
    onAddLoadDocument({
      brokerLoadId: selectedLoadForDocs.id,
      documentName,
      documentType,
      uploadedBy: selectedLoadForDocs.assignedCarrierId || 'carrierUser1', // Placeholder for actual user
    });
    toast({ title: "Document Recorded", description: `"${documentName}" (${documentType}) has been recorded for load ${selectedLoadForDocs.id}.` });
    setIsUploadDialogOpen(false);
    setSelectedLoadForDocs(null); // Clear selection after successful upload
  };
  
  const getStatusColor = (status: BrokerLoad['status']) => {
    switch (status) {
      case 'Booked': return 'bg-blue-500 hover:bg-blue-600';
      case 'In Transit': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      case 'Delivered': return 'bg-green-500 hover:bg-green-600';
      case 'Cancelled': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-slate-400';
    }
  };
  
  const documentsForSelectedLoad = selectedLoadForDocs 
    ? loadDocuments.filter(doc => doc.brokerLoadId === selectedLoadForDocs.id)
    : [];

  if (bookedLoads.length === 0) {
     return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-lg font-medium text-muted-foreground">You have no booked loads.</p>
        <p className="text-sm text-muted-foreground">Accept loads from the "Available Loads" tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {bookedLoads.map(load => {
        const shipper = getShipperById(load.shipperId);
        const truck = load.assignedTruckId ? getTruckById(load.assignedTruckId) : undefined;
        const driver = load.assignedDriverId ? getDriverById(load.assignedDriverId) : undefined;
        const docsForThisLoad = loadDocuments.filter(doc => doc.brokerLoadId === load.id);

        return (
          <Card key={load.id} className="shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{load.commodity}</CardTitle>
                    {load.notes && (
                       <Dialog open={viewingNotesLoad?.id === load.id && viewingNotesLoad.notes === load.notes} onOpenChange={(isOpen) => { if(!isOpen) setViewingNotesLoad(null)}}>
                         <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5 p-0 text-yellow-500 hover:text-yellow-600" onClick={() => setViewingNotesLoad(load)}>
                                <StickyNote className="h-4 w-4" />
                            </Button>
                         </DialogTrigger>
                       </Dialog>
                    )}
                </div>
                <Badge className={getStatusColor(load.status) + " text-white"}>{load.status}</Badge>
              </div>
              <CardDescription>
                Shipper: {shipper?.name || 'N/A'} | Rate: ${load.offeredRate.toLocaleString()} | Conf#: {load.confirmationNumber || 'N/A'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p><strong>Origin:</strong> {load.originAddress}</p>
              <p><strong>Destination:</strong> {load.destinationAddress}</p>
              <p><strong>Pickup:</strong> {format(new Date(load.pickupDate), 'MMM d, yyyy p')}</p>
              <p><strong>Delivery:</strong> {format(new Date(load.deliveryDate), 'MMM d, yyyy p')}</p>
              <p><strong>Equipment:</strong> {load.equipmentType}</p>
              {truck && <p><strong>Assigned Truck:</strong> {truck.name} ({truck.licensePlate})</p>}
              {driver && <p><strong>Assigned Driver:</strong> {driver.name}</p>}
              {load.notes && (
                <p className="text-xs italic text-muted-foreground pt-1">
                  <span className="font-semibold not-italic text-foreground">Broker Notes:</span> {load.notes}
                </p>
              )}
            </CardContent>
            <CardFooter className="border-t pt-3 flex justify-end gap-2">
                {docsForThisLoad.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => handleOpenViewDocsDialog(load)}>
                        <Eye className="mr-2 h-4 w-4" /> View Docs ({docsForThisLoad.length})
                    </Button>
                )}
                <Button size="sm" onClick={() => handleOpenUploadDialog(load)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <FileUp className="mr-2 h-4 w-4" /> Upload Document
                </Button>
            </CardFooter>
          </Card>
        );
      })}

      {/* Dialog for Uploading Documents */}
      <Dialog open={isUploadDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedLoadForDocs(null);
          setIsUploadDialogOpen(isOpen);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Document for Load: {selectedLoadForDocs?.commodity}</DialogTitle>
            <DialogDescription>Record a new document. Actual file upload is simulated.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {selectedLoadForDocs?.status === 'Delivered' && (
              <Alert variant="default" className="bg-green-50 border-green-300 text-green-700">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="ml-2">
                  <p className="font-medium">This load is marked as Delivered.</p>
                  <p className="text-xs">Consider uploading the Bill of Lading (BOL) and/or Proof of Delivery (POD).</p>
                </div>
              </Alert>
            )}
            {selectedLoadForDocs?.notes && (
              <div className="mt-2 mb-3 p-3 border border-yellow-300 bg-yellow-50 rounded-md">
                <h4 className="text-sm font-semibold text-yellow-700 flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-yellow-600" />
                  Important Load Notes:
                </h4>
                <p className="text-xs text-yellow-700 whitespace-pre-wrap mt-1">
                  {selectedLoadForDocs.notes}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="documentName">Document Name / Number</Label>
              <Input id="documentName" value={documentName} onChange={(e) => setDocumentName(e.target.value)} className="mt-1 bg-background border-border" placeholder="e.g., BOL #12345, POD Signature"/>
            </div>
            <div>
              <Label htmlFor="documentType">Document Type</Label>
              <Select value={documentType} onValueChange={(value: LoadDocumentType | '') => setDocumentType(value)}>
                <SelectTrigger id="documentType" className="mt-1 bg-background border-border">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {LOAD_DOCUMENT_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">Note: This feature simulates document recording. In a real application, you would upload a file.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUploadDocument} className="bg-primary hover:bg-primary/90" disabled={!documentName || !documentType}>Record Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* Dialog for Viewing Documents */}
      <Dialog open={isViewDocsDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedLoadForDocs(null);
          setIsViewDocsDialogOpen(isOpen);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Documents for Load: {selectedLoadForDocs?.commodity}</DialogTitle>
            <DialogDescription>Load ID: {selectedLoadForDocs?.id}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] py-2 pr-3">
            {documentsForSelectedLoad.length > 0 ? (
                <ul className="space-y-3">
                    {documentsForSelectedLoad.map(doc => (
                        <li key={doc.id} className="p-3 border rounded-md bg-muted/50">
                            <p className="font-semibold text-foreground">{doc.documentName}</p>
                            <p className="text-sm text-muted-foreground">Type: {doc.documentType}</p>
                            <p className="text-xs text-muted-foreground">Recorded: {format(new Date(doc.uploadDate), 'PPP p')}</p>
                            <p className="text-xs text-muted-foreground">Simulated File: {doc.fileUrl || 'N/A'}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground text-center py-4">No documents recorded for this load yet.</p>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDocsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Viewing Notes */}
      {viewingNotesLoad && viewingNotesLoad.notes && (
        <Dialog open={!!viewingNotesLoad} onOpenChange={(isOpen) => { if (!isOpen) setViewingNotesLoad(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Notes for: {viewingNotesLoad.commodity}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                {viewingNotesLoad.notes}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingNotesLoad(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
