
"use client";
import { useState } from 'react';
import type { BrokerLoad, Shipper, Carrier, Truck, Driver } from "@/lib/types";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { ThumbsUp, MapPin, CalendarDays, TruckIcon as EqIcon, DollarSign, ClipboardList, UserCheck, AlertTriangle, XCircle, StickyNote } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
// Removed Tooltip imports

const UNASSIGNED_DRIVER_BROKER_BOX_VALUE = "__UNASSIGNED_DRIVER_BB__";

interface AvailableBrokerLoadsProps {
  brokerLoads: BrokerLoad[];
  carriers: Carrier[];
  trucks: Truck[];
  drivers: Driver[];
  onAcceptLoad: (loadId: string, carrierId: string, truckId: string, driverId?: string) => BrokerLoad | undefined;
  getShipperById: (id: string) => Shipper | undefined;
}

export function AvailableBrokerLoads({
  brokerLoads,
  carriers,
  trucks,
  drivers,
  onAcceptLoad,
  getShipperById
}: AvailableBrokerLoadsProps) {
  const { toast } = useToast();
  const [selectedLoadToAccept, setSelectedLoadToAccept] = useState<BrokerLoad | null>(null);
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>('');
  const [selectedTruckId, setSelectedTruckId] = useState<string>('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(UNASSIGNED_DRIVER_BROKER_BOX_VALUE); 
  const [viewingNotesLoad, setViewingNotesLoad] = useState<BrokerLoad | null>(null);


  const availableTrucksForSelectedCarrier = trucks.filter(t => t.carrierId === selectedCarrierId && t.maintenanceStatus === 'Good');
  const availableDriversForSelectedCarrier = drivers.filter(d => {
    const truckTheyDrive = trucks.find(t => t.driverId === d.id);
    return !truckTheyDrive || truckTheyDrive.carrierId === selectedCarrierId;
  });

  const selectedCarrierObject = carriers.find(c => c.id === selectedCarrierId);
  const isSelectedCarrierBookable = selectedCarrierObject?.isBookable ?? false;


  const handleAcceptLoad = () => {
    if (!selectedLoadToAccept || !selectedCarrierId || !selectedTruckId) {
      toast({ title: "Missing Information", description: "Please select a carrier and a truck.", variant: "destructive" });
      return;
    }
    if (!isSelectedCarrierBookable) {
      toast({ title: "Carrier Unbookable", description: `${selectedCarrierObject?.name || 'Selected carrier'} is not bookable due to overdue payments.`, variant: "destructive" });
      return;
    }

    const driverToAssign = selectedDriverId === UNASSIGNED_DRIVER_BROKER_BOX_VALUE ? undefined : selectedDriverId;

    const acceptedLoad = onAcceptLoad(selectedLoadToAccept.id, selectedCarrierId, selectedTruckId, driverToAssign);
    if (acceptedLoad) {
        toast({ title: "Load Accepted!", description: `Load ${acceptedLoad.commodity} assigned to ${selectedCarrierObject?.name}. A schedule entry has been created.` });
        setSelectedLoadToAccept(null); 
        setSelectedCarrierId('');
        setSelectedTruckId('');
        setSelectedDriverId(UNASSIGNED_DRIVER_BROKER_BOX_VALUE);
    } else {
        toast({
            title: "Assignment Failed",
            description: "Could not assign the load. This may be due to a schedule conflict or carrier restrictions. Please review the schedule or carrier status and try again.",
            variant: "destructive",
            duration: 7000, 
        });
    }
  };
  
  const copyLoadInfoToClipboard = (load: BrokerLoad) => {
    const shipper = getShipperById(load.shipperId);
    const loadDetails = `
AVAILABLE LOAD:
Commodity: ${load.commodity}
Origin: ${load.originAddress}
Destination: ${load.destinationAddress}
Pickup: ${format(new Date(load.pickupDate), 'PPP p')}
Delivery: ${format(new Date(load.deliveryDate), 'PPP p')}
Equipment: ${load.equipmentType}
Rate: $${load.offeredRate.toLocaleString()}
${load.weight ? `Weight: ${load.weight} lbs\n` : ''}${load.dims ? `Dims: ${load.dims}\n` : ''}
Shipper: ${shipper?.name || 'N/A'}
Broker Notes: ${load.notes || 'N/A'}
Load ID: ${load.id}
    `.trim();
    navigator.clipboard.writeText(loadDetails)
      .then(() => toast({ title: "Load Info Copied!" }))
      .catch(err => toast({ title: "Copy Failed", variant: "destructive" }));
  };


  if (brokerLoads.length === 0) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-lg font-medium text-muted-foreground">No available loads at the moment.</p>
        <p className="text-sm text-muted-foreground">Check back later or contact brokers directly.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {brokerLoads.map(load => {
        const shipper = getShipperById(load.shipperId);
        return (
          <Card key={load.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg text-primary">{load.commodity}</CardTitle>
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
                <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">Available</Badge>
              </div>
              <CardDescription>Shipper: {shipper?.name || 'N/A'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm flex-grow">
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> <span>{load.originAddress} to {load.destinationAddress}</span></div>
              <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" /> PU: {format(new Date(load.pickupDate), 'MMM d, p')} / DEL: {format(new Date(load.deliveryDate), 'MMM d, p')}</div>
              <div className="flex items-center gap-2"><EqIcon className="h-4 w-4 text-muted-foreground" /> {load.equipmentType}</div>
              <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /> <span className="font-semibold text-lg">${load.offeredRate.toLocaleString()}</span></div>
              {load.weight && <p className="text-xs text-muted-foreground">Weight: {load.weight} lbs</p>}
            </CardContent>
            <CardFooter className="border-t pt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => copyLoadInfoToClipboard(load)}>
                <ClipboardList className="mr-2 h-4 w-4" /> Copy Info
              </Button>
              <Dialog open={selectedLoadToAccept?.id === load.id} onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setSelectedLoadToAccept(null);
                    setSelectedCarrierId('');
                    setSelectedTruckId('');
                    setSelectedDriverId(UNASSIGNED_DRIVER_BROKER_BOX_VALUE);
                } else {
                    setSelectedLoadToAccept(load);
                }
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground flex-grow" onClick={() => setSelectedLoadToAccept(load)}>
                    <ThumbsUp className="mr-2 h-4 w-4" /> Accept Load
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Accept Load: {load.commodity}</DialogTitle>
                    <DialogDescription>Assign this load to one of your carriers/trucks.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div>
                      <Label htmlFor="carrierSelect">Your Carrier Company</Label>
                      <Select value={selectedCarrierId} onValueChange={setSelectedCarrierId}>
                        <SelectTrigger id="carrierSelect" className={cn("mt-1 bg-background border-border", !isSelectedCarrierBookable && selectedCarrierId ? "border-red-500 ring-2 ring-red-500/50" : "")}>
                          <SelectValue placeholder="Select your carrier company" />
                        </SelectTrigger>
                        <SelectContent>
                          {carriers.map(c => (
                            <SelectItem key={c.id} value={c.id} disabled={!c.isBookable}>
                              <div className="flex items-center justify-between w-full">
                                <span>{c.name}</span>
                                {!c.isBookable && <XCircle className="h-4 w-4 text-destructive ml-2" />}
                              </div>
                               {!c.isBookable && <span className="text-xs text-destructive block">Payments Overdue</span>}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!isSelectedCarrierBookable && selectedCarrierId && (
                        <p className="text-xs text-destructive mt-1">This carrier is not bookable due to overdue payments.</p>
                      )}
                    </div>
                    {selectedCarrierId && isSelectedCarrierBookable && (
                    <>
                        <div>
                            <Label htmlFor="truckSelect">Assign Truck</Label>
                            <Select value={selectedTruckId} onValueChange={setSelectedTruckId} disabled={availableTrucksForSelectedCarrier.length === 0}>
                            <SelectTrigger id="truckSelect" className="mt-1 bg-background border-border">
                                <SelectValue placeholder={availableTrucksForSelectedCarrier.length > 0 ? "Select available truck" : "No trucks available for this carrier"} />
                            </SelectTrigger>
                            <SelectContent>
                                {availableTrucksForSelectedCarrier.map(t => <SelectItem key={t.id} value={t.id}>{t.name} ({t.licensePlate})</SelectItem>)}
                            </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="driverSelect">Assign Driver (Optional)</Label>
                            <Select value={selectedDriverId} onValueChange={setSelectedDriverId} disabled={availableDriversForSelectedCarrier.length === 0}>
                            <SelectTrigger id="driverSelect" className="mt-1 bg-background border-border">
                                <SelectValue placeholder={availableDriversForSelectedCarrier.length > 0 ? "Select available driver" : "No drivers available"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={UNASSIGNED_DRIVER_BROKER_BOX_VALUE}>Unassigned</SelectItem>
                                {availableDriversForSelectedCarrier.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                            </SelectContent>
                            </Select>
                        </div>
                    </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setSelectedLoadToAccept(null)}>Cancel</Button>
                    <Button 
                        type="button" 
                        onClick={handleAcceptLoad} 
                        disabled={!selectedCarrierId || !selectedTruckId || !selectedLoadToAccept || !isSelectedCarrierBookable}
                        className="bg-primary hover:bg-primary/90"
                    >
                      <UserCheck className="mr-2 h-4 w-4" /> Confirm & Assign
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        );
      })}
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

    