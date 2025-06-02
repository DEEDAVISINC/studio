
"use client";
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { Truck, Driver, Carrier, ScheduleEntry, DispatchFeeRecord, Invoice, Shipper, BrokerLoad, LoadDocument, BrokerLoadStatus, AvailableEquipmentPost, FmcsaAuthorityStatus, ScheduleType, ManualLineItem, CarrierDocument, CarrierDocumentType } from '@/lib/types';
import { addDays, parseISO, addYears, startOfWeek, isPast, endOfDay, format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

interface AppDataContextType {
  trucks: Truck[];
  drivers: Driver[];
  carriers: Carrier[];
  scheduleEntries: ScheduleEntry[];
  dispatchFeeRecords: DispatchFeeRecord[];
  invoices: Invoice[];
  shippers: Shipper[];
  brokerLoads: BrokerLoad[];
  loadDocuments: LoadDocument[];
  availableEquipmentPosts: AvailableEquipmentPost[];
  carrierDocuments: CarrierDocument[];
  
  addTruck: (truck: Omit<Truck, 'id'>) => void;
  updateTruck: (truck: Truck) => void;
  removeTruck: (truckId: string) => void;
  
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (driver: Driver) => void;
  removeDriver: (driverId: string) => void;
  
  addCarrier: (carrier: Omit<Carrier, 'id'>) => void;
  updateCarrier: (carrier: Carrier) => void;
  removeCarrier: (carrierId: string) => void;
  verifyCarrierFmcsa: (carrierId: string) => Promise<FmcsaAuthorityStatus>;
  
  addScheduleEntry: (entry: Omit<ScheduleEntry, 'id'>) => ScheduleEntry | null;
  updateScheduleEntry: (entry: ScheduleEntry) => ScheduleEntry | null;
  removeScheduleEntry: (entryId: string) => void;

  addDispatchFeeRecord: (record: Omit<DispatchFeeRecord, 'id' | 'calculatedDate' | 'status' | 'feeAmount'>) => void;
  updateDispatchFeeRecordStatus: (recordId: string, newStatus: DispatchFeeRecord['status'], invoiceId?: string) => void;
  
  createInvoiceForCarrier: (carrierId: string, feeRecordIds: string[]) => Invoice | undefined;
  updateInvoiceStatus: (invoiceId: string, newStatus: Invoice['status']) => void;
  addManualLineItemToInvoice: (invoiceId: string, itemData: Omit<ManualLineItem, 'id' | 'status'>) => void;
  removeManualLineItemFromInvoice: (invoiceId: string, lineItemId: string) => void;
  approveManualLineItem: (invoiceId: string, lineItemId: string) => void;
  rejectManualLineItem: (invoiceId: string, lineItemId: string) => void;


  addShipper: (shipper: Omit<Shipper, 'id'>) => void;
  updateShipper: (shipper: Shipper) => void;
  removeShipper: (shipperId: string) => void;

  addBrokerLoad: (load: Omit<BrokerLoad, 'id' | 'postedDate' | 'status' | 'postedByBrokerId'>) => BrokerLoad;
  updateBrokerLoad: (load: BrokerLoad) => void;
  updateBrokerLoadStatus: (loadId: string, status: BrokerLoadStatus, carrierId?: string, truckId?: string, driverId?: string) => void;
  assignLoadToCarrierAndCreateSchedule: (loadId: string, carrierId: string, truckId: string, driverId?: string) => BrokerLoad | undefined;


  addLoadDocument: (doc: Omit<LoadDocument, 'id' | 'uploadDate'>) => void;
  addCarrierDocument: (doc: Omit<CarrierDocument, 'id' | 'uploadDate'>) => CarrierDocument;
  removeCarrierDocument: (docId: string) => void;

  addAvailableEquipmentPost: (post: Omit<AvailableEquipmentPost, 'id' | 'postedDate' | 'status'>) => AvailableEquipmentPost;
  updateAvailableEquipmentPost: (post: AvailableEquipmentPost) => void;
  removeAvailableEquipmentPost: (postId: string) => void;

  getTruckById: (truckId: string) => Truck | undefined;
  getDriverById: (driverId: string) => Driver | undefined;
  getCarrierById: (carrierId: string) => Carrier | undefined;
  getScheduleEntryById: (scheduleEntryId: string) => ScheduleEntry | undefined;
  getShipperById: (shipperId: string) => Shipper | undefined;
  getBrokerLoadById: (loadId: string) => BrokerLoad | undefined;
  getAvailableEquipmentPostById: (postId: string) => AvailableEquipmentPost | undefined;
  getCarrierDocumentById: (docId: string) => CarrierDocument | undefined;
  checkAndSetCarrierBookableStatus: (carrierId: string) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const calculateMc150DueDate = (carrierMc150FormDate?: Date | string): Date | undefined => {
  if (!carrierMc150FormDate) return undefined;
  try {
    const parsedDate = typeof carrierMc150FormDate === 'string' ? parseISO(carrierMc150FormDate) : carrierMc150FormDate;
    return addYears(parsedDate, 2);
  } catch (e) {
    return undefined;
  }
};

const initialCarriers: Carrier[] = [
  { 
    id: 'carrier1', 
    name: 'Speedy Logistics', 
    dba: 'SpeedyLog',
    mcNumber: 'MC123456', 
    usDotNumber: 'USDOT987654', 
    taxIdEin: '12-3456789',
    companyPhone: '555-0001',
    companyEmail: 'info@speedylog.com',
    physicalAddress: '123 Main St, Anytown, USA 12345',
    mailingAddress: '123 Main St, Anytown, USA 12345',
    isMailingSameAsPhysical: true,
    contactPerson: 'Mike Ross', 
    contactEmail: 'mike.ross@speedylog.com', 
    contactPhone: '555-0011', 
    equipmentTypes: '53ft Dry Van, Reefer',
    insuranceCompanyName: 'SecureTruck Insurance',
    insurancePolicyNumber: 'POL98765',
    insurancePolicyExpirationDate: parseISO('2025-10-31T00:00:00.000Z'),
    insuranceAgentName: 'Agent Smith',
    insuranceAgentPhone: '555-AGENT1',
    insuranceAgentEmail: 'agent.smith@secure.com',
    factoringCompanyName: 'Funds Fast Inc.',
    factoringCompanyContact: 'Fiona Money',
    factoringCompanyPhone: '555-FACTOR',
    paymentTerms: 'Net 30',
    contractDetails: 'Primary Carrier Agreement, expires 2025-12-31', 
    availabilityNotes: 'Available Mon-Fri, national coverage.',
    preferredLanes: 'CA to TX, IL to FL',
    fmcsaAuthorityStatus: 'Not Verified',
    powerUnits: 50,
    driverCount: 60,
    mcs150FormDate: parseISO('2024-01-15T00:00:00.000Z'),
    operationClassification: 'Auth. For Hire',
    carrierOperationType: 'Interstate',
    isBookable: true,
  },
  { 
    id: 'carrier2', 
    name: 'Reliable Transport Inc.', 
    mcNumber: 'MC654321', 
    usDotNumber: 'USDOT123789', 
    taxIdEin: '98-7654321',
    companyPhone: '555-0002',
    companyEmail: 'contact@reliabletransport.com',
    physicalAddress: '456 Industrial Ave, Otherville, USA 67890',
    mailingAddress: 'PO Box 100, Otherville, USA 67890',
    isMailingSameAsPhysical: false,
    contactPerson: 'Sarah Connor', 
    contactEmail: 's.connor@reliabletransport.com', 
    contactPhone: '555-0022', 
    equipmentTypes: 'Flatbed, Power Only',
    insuranceCompanyName: 'Truckers United Assurance',
    insurancePolicyNumber: 'TUA001245',
    insurancePolicyExpirationDate: parseISO('2024-11-30T00:00:00.000Z'),
    paymentTerms: 'Net 15 (Quick Pay 2%)',
    contractDetails: 'Secondary Carrier, flexible terms', 
    availabilityNotes: 'Weekend availability, regional only.',
    preferredLanes: 'Midwest Region',
    fmcsaAuthorityStatus: 'Not Verified',
    powerUnits: 25,
    driverCount: 30,
    mcs150FormDate: parseISO('2023-11-20T00:00:00.000Z'),
    operationClassification: 'Auth. For Hire',
    carrierOperationType: 'Interstate, Intrastate Non-Hazmat',
    isBookable: true,
  },
];

const initialTrucks: Truck[] = [
  { id: 'truck1', name: 'Alpha Hauler', licensePlate: 'TRK-001', model: 'Volvo VNL', year: 2022, carrierId: 'carrier1', driverId: 'driver1', maintenanceStatus: 'Good', mc150DueDate: calculateMc150DueDate(initialCarriers[0]?.mcs150FormDate), permitExpiryDate: parseISO('2024-12-31T00:00:00.000Z'), taxDueDate: parseISO('2024-09-30T00:00:00.000Z') },
  { id: 'truck2', name: 'Beta Mover', licensePlate: 'TRK-002', model: 'Freightliner Cascadia', year: 2021, carrierId: 'carrier2', driverId: 'driver2', maintenanceStatus: 'Needs Service', mc150DueDate: calculateMc150DueDate(initialCarriers[1]?.mcs150FormDate) },
  { id: 'truck3', name: 'Gamma Transporter', licensePlate: 'TRK-003', model: 'Peterbilt 579', year: 2023, carrierId: 'carrier1', maintenanceStatus: 'In Service', permitExpiryDate: parseISO('2025-03-28T00:00:00.000Z'), mc150DueDate: calculateMc150DueDate(initialCarriers[0]?.mcs150FormDate) },
];

const initialDrivers: Driver[] = [
  { id: 'driver1', name: 'John Doe', contactPhone: '555-1234', contactEmail: 'john.doe@example.com', licenseNumber: 'DL12345' },
  { id: 'driver2', name: 'Jane Smith', contactPhone: '555-5678', contactEmail: 'jane.smith@example.com', licenseNumber: 'DL67890' },
];

const initialScheduleEntries: ScheduleEntry[] = [
  { id: 'sch1', truckId: 'truck1', driverId: 'driver1', title: 'Delivery to LA', start: parseISO('2025-07-20T10:00:00Z'), end: parseISO('2025-07-21T18:00:00Z'), origin: 'Phoenix, AZ', destination: 'Los Angeles, CA', loadValue: 2500.00, color: 'hsl(var(--primary))', scheduleType: 'Delivery', isPartialLoad: false, isTeamDriven: false },
  { id: 'sch2', truckId: 'truck2', driverId: 'driver2', title: 'Pickup from Dallas', start: parseISO('2025-07-22T09:00:00Z'), end: parseISO('2025-07-22T17:00:00Z'), origin: 'Houston, TX', destination: 'Dallas, TX', loadValue: 1800.50, notes: 'Handle with care', color: 'hsl(var(--accent))', scheduleType: 'Pickup', isPartialLoad: false, isTeamDriven: false },
  { id: 'sch3', truckId: 'truck1', title: 'Maintenance Check', start: parseISO('2025-07-24T14:00:00Z'), end: parseISO('2025-07-24T16:00:00Z'), origin: 'Base', destination: 'Garage', color: 'hsl(var(--destructive))', scheduleType: 'Maintenance', isPartialLoad: false, isTeamDriven: false },
  { id: 'sch4', truckId: 'truck1', driverId: 'driver1', title: 'Long Haul to NY', start: parseISO('2025-07-26T08:00:00Z'), end: parseISO('2025-07-29T17:00:00Z'), origin: 'Los Angeles, CA', destination: 'New York, NY', loadValue: 5500.75, notes: 'High value goods\nBroker Notes: Team driving preferred for quick delivery. Fragile items.', color: 'hsl(var(--primary))', scheduleType: 'Delivery', isPartialLoad: false, isTeamDriven: true }, // Example of team driven
  { id: 'sch5', truckId: 'truck3', driverId: 'driver1', title: 'Local Delivery', start: parseISO('2025-08-01T09:00:00Z'), end: parseISO('2025-08-01T15:00:00Z'), origin: 'Warehouse A', destination: 'Customer Site B', loadValue: 750.00, color: 'hsl(var(--primary))', scheduleType: 'Delivery', isPartialLoad: false, isTeamDriven: false },
];

const initialShippers: Shipper[] = [
    { id: 'shipper1', name: 'Global Goods Co.', contactPerson: 'Alice Wonderland', contactEmail: 'alice@ggc.com', contactPhone: '555-1111', address: '123 Commerce St, Anytown, USA', notes: 'Prefers morning pickups.'},
    { id: 'shipper2', name: 'Local Produce Inc.', contactPerson: 'Bob The Builder', contactEmail: 'bob@lpi.com', contactPhone: '555-2222', address: '456 Farm Rd, Countryside, USA', notes: 'Requires reefer trucks.'},
];

const initialBrokerLoads: BrokerLoad[] = [
    {
        id: 'bload1', shipperId: 'shipper1', postedByBrokerId: 'brokerUser1', postedDate: parseISO('2025-07-15T09:00:00Z'),
        originAddress: '123 Commerce St, Anytown, USA', destinationAddress: '789 Market Ave, Otherville, USA',
        pickupDate: parseISO('2025-07-20T10:00:00Z'), deliveryDate: parseISO('2025-07-21T17:00:00Z'),
        commodity: 'General Electronics', weight: 22000, equipmentType: '53ft Dry Van', offeredRate: 1800,
        status: 'Available', notes: 'Team driving preferred for quick delivery. Fragile items.'
    },
    {
        id: 'bload2', shipperId: 'shipper2', postedByBrokerId: 'brokerUser1', postedDate: parseISO('2025-07-16T11:00:00Z'),
        originAddress: '456 Farm Rd, Countryside, USA', destinationAddress: '321 Distribution Way, Bigcity, USA',
        pickupDate: parseISO('2025-07-22T08:00:00Z'), deliveryDate: parseISO('2025-07-22T14:00:00Z'),
        commodity: 'Fresh Strawberries', weight: 18000, equipmentType: 'Reefer (-10C)', offeredRate: 2200,
        status: 'Available', notes: 'Temperature must be monitored. Deliver to Dock 7.'
    }
];

const initialAvailableEquipmentPosts: AvailableEquipmentPost[] = [
  {
    id: 'aep1', carrierId: 'carrier1', postedDate: parseISO('2025-07-18T10:00:00Z'),
    equipmentType: '53ft Dry Van', currentLocation: 'Phoenix, AZ',
    availableFromDate: parseISO('2025-07-19T00:00:00Z'),
    preferredDestinations: 'CA, NV, UT', rateExpectation: '$2.75/mile',
    contactName: 'Mike Ross', contactPhone: '555-0011', contactEmail: 'mike.ross@speedylog.com',
    notes: 'Experienced driver, clean record.', status: 'Available', complianceDocsReady: true,
  },
  {
    id: 'aep2', carrierId: 'carrier2', postedDate: parseISO('2025-07-19T14:30:00Z'),
    equipmentType: 'Flatbed', currentLocation: 'Houston, TX',
    availableFromDate: parseISO('2025-07-20T00:00:00Z'), availableToDate: parseISO('2025-07-25T00:00:00Z'),
    preferredDestinations: 'TX, LA, OK', rateExpectation: 'Market Rate',
    contactName: 'Sarah Connor', contactPhone: '555-0022',
    notes: 'Oversize load capable.', status: 'Available', complianceDocsReady: false,
  }
];

const initialCarrierDocuments: CarrierDocument[] = [
    { id: 'cdoc1', carrierId: 'carrier1', documentName: 'W9-SpeedyLog-2024.pdf', documentType: 'W9', uploadDate: parseISO('2024-01-10T00:00:00Z'), fileUrl: 'simulated/w9_speedy.pdf' },
    { id: 'cdoc2', carrierId: 'carrier1', documentName: 'COI-SpeedyLog-Exp20251031.pdf', documentType: 'Insurance Certificate', uploadDate: parseISO('2023-11-01T00:00:00Z'), fileUrl: 'simulated/coi_speedy.pdf' },
];


export function AppDataProvider({ children }: { children: ReactNode }) {
  const [trucks, setTrucks] = useState<Truck[]>(initialTrucks);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [carriers, setCarriers] = useState<Carrier[]>(initialCarriers);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>(initialScheduleEntries);
  const [dispatchFeeRecords, setDispatchFeeRecords] = useState<DispatchFeeRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [shippers, setShippers] = useState<Shipper[]>(initialShippers);
  const [brokerLoads, setBrokerLoads] = useState<BrokerLoad[]>(initialBrokerLoads);
  const [loadDocuments, setLoadDocuments] = useState<LoadDocument[]>([]);
  const [availableEquipmentPosts, setAvailableEquipmentPosts] = useState<AvailableEquipmentPost[]>(initialAvailableEquipmentPosts);
  const [carrierDocuments, setCarrierDocuments] = useState<CarrierDocument[]>(initialCarrierDocuments);
  const { toast } = useToast();

  // Getter functions
  const getTruckById = useCallback((truckId: string) => trucks.find(t => t.id === truckId), [trucks]);
  const getDriverById = useCallback((driverId: string) => drivers.find(d => d.id === driverId), [drivers]);
  const getCarrierById = useCallback((carrierId: string) => carriers.find(c => c.id === carrierId), [carriers]);
  const getScheduleEntryById = useCallback((scheduleEntryId: string) => scheduleEntries.find(s => s.id === scheduleEntryId), [scheduleEntries]);
  const getShipperById = useCallback((shipperId: string) => shippers.find(s => s.id === shipperId), [shippers]);
  const getBrokerLoadById = useCallback((loadId: string) => brokerLoads.find(bl => bl.id === loadId), [brokerLoads]);
  const getAvailableEquipmentPostById = useCallback((postId: string) => availableEquipmentPosts.find(p => p.id === postId), [availableEquipmentPosts]);
  const getCarrierDocumentById = useCallback((docId: string) => carrierDocuments.find(d => d.id === docId), [carrierDocuments]);


  const checkAndSetCarrierBookableStatus = useCallback((carrierId: string) => {
    setCarriers(prevCarriers => {
        const carrier = prevCarriers.find(c => c.id === carrierId);
        if (!carrier) return prevCarriers;

        let hasUnpaidOverdueInvoices = false;
        const carrierSentInvoices = invoices.filter(
            inv => inv.carrierId === carrierId && inv.status === 'Sent'
        );

        if (carrierSentInvoices.length > 0) {
            const today = new Date();
            for (const inv of carrierSentInvoices) {
                const invoiceDueDateIsWednesday = new Date(inv.dueDate);
                const endOfDueWednesday = endOfDay(invoiceDueDateIsWednesday); 

                if (isPast(endOfDueWednesday)) { 
                    hasUnpaidOverdueInvoices = true;
                    break; 
                }
            }
        }
        const newIsBookable = !hasUnpaidOverdueInvoices;
        if (carrier.isBookable !== newIsBookable) {
            return prevCarriers.map(c => c.id === carrierId ? { ...c, isBookable: newIsBookable } : c);
        }
        return prevCarriers;
    });
  }, [invoices]);

   useEffect(() => {
    carriers.forEach(carrier => {
        checkAndSetCarrierBookableStatus(carrier.id);
    });
  }, [invoices, carriers.length, checkAndSetCarrierBookableStatus]);


  // Truck CRUD
  const addTruck = useCallback((truck: Omit<Truck, 'id'>) => {
    const newTruckData = {
        ...truck,
        id: `truck${Date.now()}`,
        mc150DueDate: truck.mc150DueDate ? new Date(truck.mc150DueDate) : undefined,
        permitExpiryDate: truck.permitExpiryDate ? new Date(truck.permitExpiryDate) : undefined,
        taxDueDate: truck.taxDueDate ? new Date(truck.taxDueDate) : undefined,
    };
    setTrucks(prev => [...prev, newTruckData]);
  }, []);

  const updateTruck = useCallback((updatedTruck: Truck) => {
    const newTruckData = {
        ...updatedTruck,
        mc150DueDate: updatedTruck.mc150DueDate ? new Date(updatedTruck.mc150DueDate) : undefined,
        permitExpiryDate: updatedTruck.permitExpiryDate ? new Date(updatedTruck.permitExpiryDate) : undefined,
        taxDueDate: updatedTruck.taxDueDate ? new Date(updatedTruck.taxDueDate) : undefined,
    };
    setTrucks(prev => prev.map(t => t.id === updatedTruck.id ? newTruckData : t));
  }, []);

  const removeTruck = useCallback((truckId: string) => {
    setTrucks(prev => prev.filter(t => t.id !== truckId));
    setScheduleEntries(prev => prev.filter(s => s.truckId !== truckId)); 
  }, []);

  // Driver CRUD
  const addDriver = useCallback((driver: Omit<Driver, 'id'>) => {
    setDrivers(prev => [...prev, { ...driver, id: `driver${Date.now()}` }]);
  }, []);
  const updateDriver = useCallback((updatedDriver: Driver) => {
    setDrivers(prev => prev.map(d => d.id === updatedDriver.id ? updatedDriver : d));
  }, []);
  const removeDriver = useCallback((driverId: string) => {
    setDrivers(prev => prev.filter(d => d.id !== driverId));
    setTrucks(prev => prev.map(t => t.driverId === driverId ? { ...t, driverId: undefined } : t));
    setScheduleEntries(prev => prev.map(s => s.driverId === driverId ? { ...s, driverId: undefined } : s));
  }, []);

  // Carrier CRUD
 const addCarrier = useCallback((carrierData: Omit<Carrier, 'id'>) => {
    const newCarrier: Carrier = {
      ...carrierData,
      id: `carrier${Date.now()}`,
      insurancePolicyExpirationDate: carrierData.insurancePolicyExpirationDate ? new Date(carrierData.insurancePolicyExpirationDate) : undefined,
      mcs150FormDate: carrierData.mcs150FormDate ? new Date(carrierData.mcs150FormDate) : undefined,
      fmcsaAuthorityStatus: 'Not Verified', 
      fmcsaLastChecked: undefined,
      isBookable: true,
    };
    setCarriers(prev => [...prev, newCarrier]);
    
    console.log(`New carrier "${newCarrier.name}" (ID: ${newCarrier.id}) added. 
    TODO: Send email notification to onboard@freight1stdirect.com with carrier details:
    Name: ${newCarrier.name}
    MC#: ${newCarrier.mcNumber || 'N/A'}
    USDOT#: ${newCarrier.usDotNumber || 'N/A'}
    Contact: ${newCarrier.contactPerson} (${newCarrier.contactEmail}, ${newCarrier.contactPhone})`);
  }, []);

  const updateCarrier = useCallback((updatedCarrierData: Carrier) => {
    const originalCarrier = carriers.find(c => c.id === updatedCarrierData.id);
    const updatedCarrier = {
      ...updatedCarrierData,
      insurancePolicyExpirationDate: updatedCarrierData.insurancePolicyExpirationDate ? new Date(updatedCarrierData.insurancePolicyExpirationDate) : undefined,
      mcs150FormDate: updatedCarrierData.mcs150FormDate ? new Date(updatedCarrierData.mcs150FormDate) : undefined,
      fmcsaLastChecked: updatedCarrierData.fmcsaLastChecked ? new Date(updatedCarrierData.fmcsaLastChecked) : undefined,
      isBookable: updatedCarrierData.isBookable, // Ensure this is carried over
    };
    setCarriers(prev => prev.map(c => (c.id === updatedCarrier.id ? updatedCarrier : c)));

    const originalMc150Str = originalCarrier?.mcs150FormDate ? (typeof originalCarrier.mcs150FormDate === 'string' ? parseISO(originalCarrier.mcs150FormDate) : originalCarrier.mcs150FormDate).toISOString() : null;
    const updatedMc150Str = updatedCarrier.mcs150FormDate ? (typeof updatedCarrier.mcs150FormDate === 'string' ? parseISO(updatedCarrier.mcs150FormDate) : updatedCarrier.mcs150FormDate).toISOString() : null;

    if (originalMc150Str !== updatedMc150Str) {
      const newTruckMc150DueDate = calculateMc150DueDate(updatedCarrier.mcs150FormDate);
      setTrucks(prevTrucks => 
        prevTrucks.map(t => 
          t.carrierId === updatedCarrier.id 
            ? { ...t, mc150DueDate: newTruckMc150DueDate } 
            : t
        )
      );
    }
  }, [carriers]); 

  const removeCarrier = useCallback((carrierId: string) => {
    setCarriers(prev => prev.filter(c => c.id !== carrierId));
    setTrucks(prev => prev.map(t => t.carrierId === carrierId ? {...t, carrierId: '', mc150DueDate: undefined } : t)); 
    setAvailableEquipmentPosts(prev => prev.filter(p => p.carrierId !== carrierId));
    setInvoices(prev => prev.filter(inv => inv.carrierId !== carrierId));
    setDispatchFeeRecords(prev => prev.filter(fee => fee.carrierId !== carrierId));
    setCarrierDocuments(prev => prev.filter(doc => doc.carrierId !== carrierId));
  }, []);

 const verifyCarrierFmcsa = useCallback(async (carrierId: string): Promise<FmcsaAuthorityStatus> => {
    const carrier = carriers.find(c => c.id === carrierId);
    if (!carrier) {
      toast({ title: "Error", description: "Carrier not found.", variant: "destructive" });
      return 'Verification Failed';
    }

    setCarriers(prev => prev.map(c => 
      c.id === carrierId ? { ...c, fmcsaAuthorityStatus: 'Pending Verification' } : c
    ));

    try {
      const queryParams = new URLSearchParams();
      if (carrier.usDotNumber) queryParams.append('usDotNumber', carrier.usDotNumber);
      else if (carrier.mcNumber) queryParams.append('mcNumber', carrier.mcNumber);
      else {
         toast({ title: "Verification Skipped", description: `Carrier ${carrier.name} has no MC or USDOT number.`, variant: "default" });
         setCarriers(prev => prev.map(c => c.id === carrierId ? { ...c, fmcsaAuthorityStatus: 'Not Verified', fmcsaLastChecked: new Date() } : c));
         return 'Not Verified';
      }
      
      const response = await fetch(`/api/fmcsa-verify?${queryParams.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `FMCSA API request failed with status ${response.status}`);
      }
      
      const result = await response.json(); // { status: FmcsaAuthorityStatus, details?: Partial<Carrier>, message?: string }
      const newStatus: FmcsaAuthorityStatus = result.status || 'Verification Failed';

      setCarriers(prev => prev.map(c => {
        if (c.id === carrierId) {
          // Merge details from API response if they exist
          const updatedCarrierDetails = result.details ? {
            ...c,
            ...result.details, // This will overwrite fields in 'c' with those from 'result.details'
            fmcsaAuthorityStatus: newStatus,
            fmcsaLastChecked: new Date(),
          } : {
            ...c,
            fmcsaAuthorityStatus: newStatus,
            fmcsaLastChecked: new Date(),
          };
          return updatedCarrierDetails;
        }
        return c;
      }));
      toast({
        title: "FMCSA Verification Update",
        description: result.message || `Carrier ${carrier.name} status: ${newStatus}.`,
      });
      return newStatus;

    } catch (error: any) {
      console.error("Error verifying FMCSA status:", error);
      toast({
        title: "FMCSA Verification Error",
        description: error.message || "Could not complete FMCSA verification.",
        variant: "destructive",
      });
      setCarriers(prev => prev.map(c => 
        c.id === carrierId ? { ...c, fmcsaAuthorityStatus: 'Verification Failed', fmcsaLastChecked: new Date() } : c
      ));
      return 'Verification Failed';
    }
  }, [carriers, toast]);
  
  // Schedule CRUD
  const addScheduleEntry = useCallback((entry: Omit<ScheduleEntry, 'id'>): ScheduleEntry | null => {
    const newEntryData = { 
        ...entry, 
        id: `sch${Date.now()}`, 
        start: new Date(entry.start), 
        end: new Date(entry.end),
        isPartialLoad: entry.isPartialLoad || false,
        isTeamDriven: entry.isTeamDriven || false,
    };

    const truckForEntry = getTruckById(newEntryData.truckId);

    // Check for non-partial overlaps
    for (const existingEntry of scheduleEntries) {
        if (existingEntry.truckId === newEntryData.truckId) {
            const overlap = newEntryData.start < existingEntry.end && newEntryData.end > existingEntry.start;
            if (overlap && !newEntryData.isPartialLoad && !existingEntry.isPartialLoad) {
                toast({
                    title: "Schedule Conflict",
                    description: `Truck ${truckForEntry?.name || newEntryData.truckId} already has a non-partial assignment during this time: "${existingEntry.title}".`,
                    variant: "destructive",
                    duration: 5000,
                });
                return null;
            }
        }
    }
    
    // Check 14-hour rule for non-team driven loads
    const durationHours = (newEntryData.end.getTime() - newEntryData.start.getTime()) / (1000 * 60 * 60);
    if (durationHours > 14 && !newEntryData.isTeamDriven) {
        toast({
            title: "HOS Warning",
            description: `Schedule duration for "${newEntryData.title}" exceeds 14 hours and is not team driven. Please adjust or mark as team driven.`,
            variant: "destructive",
            duration: 6000,
        });
        return null;
    }

    setScheduleEntries(prev => [...prev, newEntryData]);
    return newEntryData;
  }, [scheduleEntries, toast, getTruckById]);

  const updateScheduleEntry = useCallback((updatedEntry: ScheduleEntry): ScheduleEntry | null => {
    const entryWithDates = { 
        ...updatedEntry, 
        start: new Date(updatedEntry.start), 
        end: new Date(updatedEntry.end),
        isPartialLoad: updatedEntry.isPartialLoad || false,
        isTeamDriven: updatedEntry.isTeamDriven || false,
    };
    const truckForEntry = getTruckById(entryWithDates.truckId);

    // Check for non-partial overlaps
    for (const existingEntry of scheduleEntries) {
        if (existingEntry.truckId === entryWithDates.truckId && existingEntry.id !== entryWithDates.id) {
            const overlap = entryWithDates.start < existingEntry.end && entryWithDates.end > existingEntry.start;
            if (overlap && !entryWithDates.isPartialLoad && !existingEntry.isPartialLoad) {
                 toast({
                    title: "Schedule Conflict",
                    description: `Truck ${truckForEntry?.name || entryWithDates.truckId} already has a non-partial assignment during this time: "${existingEntry.title}".`,
                    variant: "destructive",
                    duration: 5000,
                });
                return null;
            }
        }
    }

    // Check 14-hour rule for non-team driven loads
    const durationHours = (entryWithDates.end.getTime() - entryWithDates.start.getTime()) / (1000 * 60 * 60);
    if (durationHours > 14 && !entryWithDates.isTeamDriven) {
        toast({
            title: "HOS Warning",
            description: `Schedule duration for "${entryWithDates.title}" exceeds 14 hours and is not team driven. Please adjust or mark as team driven.`,
            variant: "destructive",
            duration: 6000,
        });
        return null;
    }

    setScheduleEntries(prev => prev.map(s => s.id === entryWithDates.id ? entryWithDates : s));
    return entryWithDates;
  }, [scheduleEntries, toast, getTruckById]);

  const removeScheduleEntry = useCallback((entryId: string) => {
    setScheduleEntries(prev => prev.filter(s => s.id !== entryId));
  }, []);

  // Dispatch Fee & Invoice related functions
  const addDispatchFeeRecord = useCallback((recordData: Omit<DispatchFeeRecord, 'id' | 'calculatedDate' | 'status' | 'feeAmount'>) => {
    const feeAmount = recordData.originalLoadAmount * 0.10;
    const newRecord: DispatchFeeRecord = {
      ...recordData,
      id: `fee${Date.now()}`,
      calculatedDate: new Date(),
      status: 'Pending',
      feeAmount,
    };
    setDispatchFeeRecords(prev => [...prev, newRecord]);
  }, []);

  const updateDispatchFeeRecordStatus = useCallback((recordId: string, newStatus: DispatchFeeRecord['status'], invoiceId?: string) => {
    setDispatchFeeRecords(prev => prev.map(rec => 
      rec.id === recordId ? { ...rec, status: newStatus, invoiceId: invoiceId || rec.invoiceId } : rec
    ));
  }, []);

  const calculateInvoiceTotal = useCallback((dispatchFeeIds: string[], manualItems?: ManualLineItem[]): number => {
    let total = 0;
    dispatchFeeIds.forEach(feeId => {
      const feeRecord = dispatchFeeRecords.find(rec => rec.id === feeId);
      if (feeRecord) {
        total += feeRecord.feeAmount;
      }
    });
    if (manualItems) {
      manualItems.forEach(item => {
        if (item.status === 'Approved') { // Only include approved items in total
            total += item.type === 'charge' ? item.amount : -item.amount;
        }
      });
    }
    return total;
  }, [dispatchFeeRecords]);

  const createInvoiceForCarrier = useCallback((carrierId: string, feeRecordIds: string[]): Invoice | undefined => {
    const recordsToInvoice = dispatchFeeRecords.filter(
      rec => rec.carrierId === carrierId && feeRecordIds.includes(rec.id) && rec.status === 'Pending'
    );

    if (recordsToInvoice.length === 0) return undefined;

    
    const newInvoiceId = `inv${Date.now()}`;
    const currentDate = new Date(); 
    
    const year = currentDate.getFullYear();
    const invCountForYear = invoices.filter(inv => new Date(inv.invoiceDate).getFullYear() === year).length + 1;
    const invoiceNumber = `INV-${year}-${String(invCountForYear).padStart(3, '0')}`;

    const mondayOfThisWeek = startOfWeek(currentDate, { weekStartsOn: 1 }); 
    const dueDateIsWednesday = addDays(mondayOfThisWeek, 2);

    const initialTotalAmount = calculateInvoiceTotal(recordsToInvoice.map(rec => rec.id), []); // No manual items initially

    const newInvoice: Invoice = {
      id: newInvoiceId,
      invoiceNumber,
      carrierId,
      invoiceDate: currentDate,
      dueDate: dueDateIsWednesday, 
      dispatchFeeRecordIds: recordsToInvoice.map(rec => rec.id),
      manualLineItems: [], 
      totalAmount: initialTotalAmount, 
      status: 'Sent', 
    };

    setInvoices(prev => [...prev, newInvoice]);
    recordsToInvoice.forEach(rec => updateDispatchFeeRecordStatus(rec.id, 'Invoiced', newInvoiceId));
    checkAndSetCarrierBookableStatus(carrierId); 
    
    return newInvoice;
  }, [dispatchFeeRecords, invoices, updateDispatchFeeRecordStatus, checkAndSetCarrierBookableStatus, calculateInvoiceTotal]);

  const updateInvoiceStatus = useCallback((invoiceId: string, newStatus: Invoice['status']) => {
    let carrierIdToUpdate: string | undefined = undefined;
    setInvoices(prev => prev.map(inv => {
        if (inv.id === invoiceId) {
            carrierIdToUpdate = inv.carrierId;
            return { ...inv, status: newStatus };
        }
        return inv;
    }));
    if (carrierIdToUpdate && (newStatus === 'Paid' || newStatus === 'Void')) {
        checkAndSetCarrierBookableStatus(carrierIdToUpdate);
    }
  }, [checkAndSetCarrierBookableStatus]);

  const addManualLineItemToInvoice = useCallback((invoiceId: string, itemData: Omit<ManualLineItem, 'id' | 'status'>) => {
    setInvoices(prevInvoices => 
      prevInvoices.map(inv => {
        if (inv.id === invoiceId) {
          const newLineItem: ManualLineItem = { 
            ...itemData, 
            id: `mli-${Date.now()}`,
            status: 'Pending Approval' // New items are pending approval
          };
          const updatedManualLineItems = [...(inv.manualLineItems || []), newLineItem];
          // Total amount is NOT updated here, will be updated upon approval
          return { ...inv, manualLineItems: updatedManualLineItems };
        }
        return inv;
      })
    );
  }, []);

  const removeManualLineItemFromInvoice = useCallback((invoiceId: string, lineItemId: string) => {
    setInvoices(prevInvoices =>
      prevInvoices.map(inv => {
        if (inv.id === invoiceId) {
          const updatedManualLineItems = (inv.manualLineItems || []).filter(item => item.id !== lineItemId);
          const newTotalAmount = calculateInvoiceTotal(inv.dispatchFeeRecordIds, updatedManualLineItems);
          return { ...inv, manualLineItems: updatedManualLineItems, totalAmount: newTotalAmount };
        }
        return inv;
      })
    );
  }, [calculateInvoiceTotal]);

  const approveManualLineItem = useCallback((invoiceId: string, lineItemId: string) => {
    setInvoices(prevInvoices =>
      prevInvoices.map(inv => {
        if (inv.id === invoiceId) {
          const updatedManualLineItems = (inv.manualLineItems || []).map((item): ManualLineItem =>
            item.id === lineItemId ? { ...item, status: 'Approved' } : item
          );
          const newTotalAmount = calculateInvoiceTotal(inv.dispatchFeeRecordIds, updatedManualLineItems);
          return { ...inv, manualLineItems: updatedManualLineItems, totalAmount: newTotalAmount };
        }
        return inv;
      })
    );
  }, [calculateInvoiceTotal]);

  const rejectManualLineItem = useCallback((invoiceId: string, lineItemId: string) => {
    setInvoices(prevInvoices =>
      prevInvoices.map(inv => {
        if (inv.id === invoiceId) {
          const updatedManualLineItems = (inv.manualLineItems || []).map((item): ManualLineItem =>
            item.id === lineItemId ? { ...item, status: 'Rejected' } : item
          );
          const newTotalAmount = calculateInvoiceTotal(inv.dispatchFeeRecordIds, updatedManualLineItems);
          return { ...inv, manualLineItems: updatedManualLineItems, totalAmount: newTotalAmount };
        }
        return inv;
      })
    );
  }, [calculateInvoiceTotal]);


  // Shipper CRUD
  const addShipper = useCallback((shipper: Omit<Shipper, 'id'>) => {
    setShippers(prev => [...prev, { ...shipper, id: `shipper${Date.now()}` }]);
  }, []);
  const updateShipper = useCallback((updatedShipper: Shipper) => {
    setShippers(prev => prev.map(s => s.id === updatedShipper.id ? updatedShipper : s));
  }, []);
  const removeShipper = useCallback((shipperId: string) => {
    setShippers(prev => prev.filter(s => s.id !== shipperId));
  }, []);

  // BrokerLoad CRUD
  const addBrokerLoad = useCallback((load: Omit<BrokerLoad, 'id' | 'postedDate' | 'status' | 'postedByBrokerId'>): BrokerLoad => {
    const newLoad = { 
        ...load, 
        id: `bload${Date.now()}`, 
        postedDate: new Date(), 
        status: 'Available' as BrokerLoadStatus, 
        postedByBrokerId: 'brokerUser1', 
        pickupDate: new Date(load.pickupDate),
        deliveryDate: new Date(load.deliveryDate)
    };
    setBrokerLoads(prev => [newLoad, ...prev]);
    return newLoad;
  }, []);

  const updateBrokerLoad = useCallback((updatedLoad: BrokerLoad) => {
     const loadWithDates = {
        ...updatedLoad,
        pickupDate: new Date(updatedLoad.pickupDate),
        deliveryDate: new Date(updatedLoad.deliveryDate),
     };
    setBrokerLoads(prev => prev.map(bl => bl.id === loadWithDates.id ? loadWithDates : bl));
  }, []);

  const updateBrokerLoadStatus = useCallback((loadId: string, status: BrokerLoadStatus, carrierId?: string, truckId?: string, driverId?: string) => {
    setBrokerLoads(prev => prev.map(bl => {
      if (bl.id === loadId) {
        const updatedLoad: BrokerLoad = { ...bl, status };
        if (carrierId) updatedLoad.assignedCarrierId = carrierId;
        if (truckId) updatedLoad.assignedTruckId = truckId;
        if (driverId) updatedLoad.assignedDriverId = driverId;
        if (status === 'Booked' && !updatedLoad.confirmationNumber) {
            updatedLoad.confirmationNumber = `CONF-${Date.now().toString().slice(-6)}`;
        }
        return updatedLoad;
      }
      return bl;
    }));
  }, []);
  
  const assignLoadToCarrierAndCreateSchedule = useCallback((loadId: string, carrierId: string, truckId: string, driverId?: string): BrokerLoad | undefined => {
    const load = getBrokerLoadById(loadId); 
    const truck = getTruckById(truckId);    
    const currentCarrier = getCarrierById(carrierId); 
    const currentDriver = driverId ? getDriverById(driverId) : undefined;
    const currentShipper = load ? getShipperById(load.shipperId) : undefined; 

    if (load && truck && truck.carrierId === carrierId && load.status === 'Available') {
      if (!currentCarrier || !currentCarrier.isBookable) {
        toast({ title: "Assignment Failed", description: `${currentCarrier?.name || 'Carrier'} is currently not bookable due to overdue payments.`, variant: "destructive"});
        return undefined;
      }

      const updatedLoadData: BrokerLoad = {
        ...load,
        assignedCarrierId: carrierId,
        assignedTruckId: truckId,
        assignedDriverId: driverId,
        status: 'Booked',
        confirmationNumber: load.confirmationNumber || `CONF-${Date.now().toString().slice(-6)}`
      };
      
      const scheduleNotes = [
        `Broker Load ID: ${load.id}.`,
        `Shipper: ${currentShipper?.name || 'N/A'}.`,
        `Confirmation: ${updatedLoadData.confirmationNumber}.`
      ];
      if (load.notes) {
        scheduleNotes.push(`Broker Notes: ${load.notes}`);
      }

      const scheduleResult = addScheduleEntry({
        truckId: truckId,
        driverId: driverId,
        title: `Broker Load: ${load.commodity} (${load.originAddress} to ${load.destinationAddress})`,
        start: new Date(load.pickupDate), 
        end: new Date(load.deliveryDate),   
        origin: load.originAddress,
        destination: load.destinationAddress,
        loadValue: load.offeredRate,
        notes: scheduleNotes.join('\n'),
        scheduleType: 'Delivery' as ScheduleType, 
        color: 'hsl(260, 80%, 60%)', 
        brokerLoadId: load.id,
        isPartialLoad: false, 
        isTeamDriven: false, 
      });

      if (!scheduleResult) {
          setBrokerLoads(prev => prev.map(bl => bl.id === loadId ? {...bl, status: 'Available', assignedCarrierId: undefined, assignedTruckId: undefined, assignedDriverId: undefined } : bl));
          return undefined; 
      }
      updateBrokerLoad(updatedLoadData); 

      // Simulate Email Notification to Carrier
        console.log(`
        --- SIMULATED EMAIL NOTIFICATION ---
        To: ${currentCarrier.contactEmail || 'Carrier Contact (No Email)'}
        From: FleetFlow System <noreply@fleetflow.example.com>
        Subject: New Load Assignment - Conf #: ${updatedLoadData.confirmationNumber}

        Hello ${currentCarrier.contactPerson || currentCarrier.name},

        This email confirms that your company, ${currentCarrier.name}, has been assigned a new load:

        Load Details:
        - Commodity: ${load.commodity}
        - Confirmation #: ${updatedLoadData.confirmationNumber}
        - Origin: ${load.originAddress}
        - Destination: ${load.destinationAddress}
        - Pickup: ${format(new Date(load.pickupDate), 'PPP p')}
        - Delivery: ${format(new Date(load.deliveryDate), 'PPP p')}
        - Rate: $${load.offeredRate.toLocaleString()}
        - Assigned Truck: ${truck.name} (Plate: ${truck.licensePlate})
        ${currentDriver ? `- Assigned Driver: ${currentDriver.name}` : '- Driver: To be assigned by carrier'}
        ${load.notes ? `\nBroker Notes: ${load.notes}` : ''}

        Please review the details in your FleetFlow portal.

        Thank you,
        FleetFlow Dispatch
        --- END SIMULATED EMAIL ---
      `);

      // Simulate Email Notification to Driver (if assigned)
      if (currentDriver && currentDriver.contactEmail) {
        console.log(`
        --- SIMULATED EMAIL NOTIFICATION ---
        To: ${currentDriver.contactEmail}
        From: FleetFlow System <noreply@fleetflow.example.com>
        Subject: New Load Assignment - Conf #: ${updatedLoadData.confirmationNumber}

        Hello ${currentDriver.name},

        You have been assigned a new load:

        Load Details:
        - Commodity: ${load.commodity}
        - Confirmation #: ${updatedLoadData.confirmationNumber}
        - Origin: ${load.originAddress}
        - Destination: ${load.destinationAddress}
        - Pickup: ${format(new Date(load.pickupDate), 'PPP p')}
        - Delivery: ${format(new Date(load.deliveryDate), 'PPP p')}
        - Your Truck: ${truck.name} (Plate: ${truck.licensePlate})
        ${load.notes ? `\nBroker Notes: ${load.notes}` : ''}

        Please check your schedule in the FleetFlow portal.

        Regards,
        ${currentCarrier.name} Dispatch
        --- END SIMULATED EMAIL ---
        `);
      } else if (currentDriver && !currentDriver.contactEmail) {
         console.log(`INFO: Driver ${currentDriver.name} assigned, but no email on file for notification.`);
      }


      return updatedLoadData;
    }
    return undefined;
  }, [getBrokerLoadById, getTruckById, getCarrierById, getDriverById, getShipperById, addScheduleEntry, updateBrokerLoad, toast]);


   const addLoadDocument = useCallback((doc: Omit<LoadDocument, 'id' | 'uploadDate'>) => {
    const newDocument: LoadDocument = {
      ...doc,
      id: `doc${Date.now()}`,
      uploadDate: new Date(),
      fileUrl: `simulated_path/to/${doc.documentName.replace(/\s+/g, '_')}.pdf`, 
    };
    setLoadDocuments(prev => [newDocument, ...prev]);
  }, []);

  // Carrier Documents
  const addCarrierDocument = useCallback((docData: Omit<CarrierDocument, 'id' | 'uploadDate'>): CarrierDocument => {
    const newDocument: CarrierDocument = {
        ...docData,
        id: `cdoc${Date.now()}`,
        uploadDate: new Date(),
        fileUrl: `simulated_carrier_docs/${docData.documentName.replace(/\s+/g, '_')}.pdf`
    };
    setCarrierDocuments(prev => [newDocument, ...prev.sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())]);
    return newDocument;
  }, []);

  const removeCarrierDocument = useCallback((docId: string) => {
    setCarrierDocuments(prev => prev.filter(d => d.id !== docId));
  }, []);


  // Available Equipment Posts
  const addAvailableEquipmentPost = useCallback((postData: Omit<AvailableEquipmentPost, 'id' | 'postedDate' | 'status'>): AvailableEquipmentPost => {
    const newPost: AvailableEquipmentPost = {
      ...postData,
      id: `aep${Date.now()}`,
      postedDate: new Date(),
      status: 'Available',
      availableFromDate: new Date(postData.availableFromDate),
      availableToDate: postData.availableToDate ? new Date(postData.availableToDate) : undefined,
      complianceDocsReady: postData.complianceDocsReady || false,
    };
    setAvailableEquipmentPosts(prev => [newPost, ...prev.sort((a,b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())]);
    return newPost;
  }, []);

  const updateAvailableEquipmentPost = useCallback((updatedPost: AvailableEquipmentPost) => {
    const postWithDates = {
      ...updatedPost,
      availableFromDate: new Date(updatedPost.availableFromDate),
      availableToDate: updatedPost.availableToDate ? new Date(updatedPost.availableToDate) : undefined,
      complianceDocsReady: updatedPost.complianceDocsReady || false,
    };
    setAvailableEquipmentPosts(prev => prev.map(p => p.id === postWithDates.id ? postWithDates : p)
                                        .sort((a,b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()));
  }, []);

  const removeAvailableEquipmentPost = useCallback((postId: string) => {
    setAvailableEquipmentPosts(prev => prev.filter(p => p.id !== postId));
  }, []);


  const contextValue = useMemo(() => ({
    trucks, drivers, carriers, scheduleEntries, dispatchFeeRecords, invoices,
    shippers, brokerLoads, loadDocuments, availableEquipmentPosts, carrierDocuments,
    getTruckById, getDriverById, getCarrierById, getScheduleEntryById,
    getShipperById, getBrokerLoadById, getAvailableEquipmentPostById, getCarrierDocumentById,
    addTruck, updateTruck, removeTruck,
    addDriver, updateDriver, removeDriver,
    addCarrier, updateCarrier, removeCarrier, verifyCarrierFmcsa,
    addScheduleEntry, updateScheduleEntry, removeScheduleEntry, 
    addDispatchFeeRecord, updateDispatchFeeRecordStatus,
    createInvoiceForCarrier, updateInvoiceStatus, 
    addManualLineItemToInvoice, removeManualLineItemFromInvoice, approveManualLineItem, rejectManualLineItem,
    addShipper, updateShipper, removeShipper,
    addBrokerLoad, updateBrokerLoad, updateBrokerLoadStatus, assignLoadToCarrierAndCreateSchedule,
    addLoadDocument, addCarrierDocument, removeCarrierDocument,
    addAvailableEquipmentPost, updateAvailableEquipmentPost, removeAvailableEquipmentPost,
    checkAndSetCarrierBookableStatus,
  }), [
    trucks, drivers, carriers, scheduleEntries, dispatchFeeRecords, invoices,
    shippers, brokerLoads, loadDocuments, availableEquipmentPosts, carrierDocuments,
    getTruckById, getDriverById, getCarrierById, getScheduleEntryById,
    getShipperById, getBrokerLoadById, getAvailableEquipmentPostById, getCarrierDocumentById,
    addTruck, updateTruck, removeTruck,
    addDriver, updateDriver, removeDriver,
    addCarrier, updateCarrier, removeCarrier, verifyCarrierFmcsa,
    addScheduleEntry, updateScheduleEntry, removeScheduleEntry, 
    addDispatchFeeRecord, updateDispatchFeeRecordStatus,
    createInvoiceForCarrier, updateInvoiceStatus, 
    addManualLineItemToInvoice, removeManualLineItemFromInvoice, approveManualLineItem, rejectManualLineItem,
    addShipper, updateShipper, removeShipper,
    addBrokerLoad, updateBrokerLoad, updateBrokerLoadStatus, assignLoadToCarrierAndCreateSchedule, 
    addLoadDocument, addCarrierDocument, removeCarrierDocument,
    addAvailableEquipmentPost, updateAvailableEquipmentPost, removeAvailableEquipmentPost,
    checkAndSetCarrierBookableStatus,
  ]);

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}

    

    
