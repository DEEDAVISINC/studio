
export interface Truck {
  id: string;
  name: string;
  licensePlate: string;
  model: string;
  year: number;
  carrierId: string;
  driverId?: string; // Driver can be unassigned
  maintenanceStatus: 'Good' | 'Needs Service' | 'In Service';
  mc150DueDate?: Date | string; 
  permitExpiryDate?: Date | string; 
  taxDueDate?: Date | string; 
}

export interface Driver {
  id: string;
  name: string;
  contactPhone: string;
  contactEmail: string;
  licenseNumber: string;
}

export type FmcsaAuthorityStatus = 'Not Verified' | 'Pending Verification' | 'Verified Active' | 'Verified Inactive' | 'Verification Failed';

export interface Carrier {
  id: string;
  name: string; // Legal Company Name
  dba?: string; // Doing Business As
  mcNumber?: string;
  usDotNumber?: string;
  taxIdEin?: string;

  companyPhone?: string;
  faxNumber?: string;
  companyEmail?: string;

  physicalAddress?: string;
  mailingAddress?: string;
  isMailingSameAsPhysical?: boolean; // For UI logic

  contactPerson: string; // Preferred Contact Person
  contactEmail: string; // Preferred Contact Email
  contactPhone: string; // Preferred Contact Phone

  equipmentTypes?: string; // e.g., "Van, Reefer, Flatbed"
  
  insuranceCompanyName?: string;
  insurancePolicyNumber?: string;
  insurancePolicyExpirationDate?: Date | string;
  insuranceAgentName?: string;
  insuranceAgentPhone?: string;
  insuranceAgentEmail?: string;

  factoringCompanyName?: string;
  factoringCompanyContact?: string; // Person
  factoringCompanyPhone?: string;
  
  paymentTerms?: string; // e.g., "Net 30", "Quick Pay 2%"
  preferredLanes?: string;
  
  contractDetails: string; // Existing field, can be used for general contract notes
  availabilityNotes?: string; // Existing field, can be used for special instructions

  fmcsaAuthorityStatus?: FmcsaAuthorityStatus;
  fmcsaLastChecked?: Date | string;

  // New fields from FMCSA SAFER
  powerUnits?: number;
  driverCount?: number; // Total drivers for the company
  mcs150FormDate?: Date | string;
  operationClassification?: string; // e.g., "Auth. For Hire", "Private Property"
  carrierOperationType?: string; // e.g., "Interstate", "Intrastate Hazmat"
  isBookable: boolean; // Added for bookable status based on payments
}


export type ScheduleType = 'Delivery' | 'Maintenance' | 'Pickup' | 'Other'; 
export const SCHEDULE_TYPES: ScheduleType[] = ['Delivery', 'Maintenance', 'Pickup', 'Other']; 

export interface ScheduleEntry {
  id: string;
  truckId: string;
  driverId?: string;
  title: string;
  start: Date;
  end: Date;
  destination: string;
  origin: string;
  loadValue?: number;
  notes?: string;
  color?: string; // For calendar event styling
  scheduleType?: ScheduleType; 
  brokerLoadId?: string; // Link to BrokerLoad if created from Broker Box
  isPartialLoad?: boolean; // Added for overlap logic
  isTeamDriven?: boolean; // Added for HOS/ELD simplified rule
}

// For AI Route Optimization Form
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

// For AI Load Optimization
export interface ItemToLoad {
  itemId: string;
  weight: number; // in kg or lbs, consistent unit
  volume: number; // in cbm or cft, consistent unit
  destination: string;
  value?: number; // monetary value
  requiredTruckType?: string;
}

export interface AvailableTruckForLoad {
  truckId:string;
  capacityWeight: number;
  capacityVolume: number;
  currentLocation: string;
  type?: string; // e.g., "Refrigerated", "Flatbed"
}

// For Dispatch Fee Management
export interface DispatchFeeRecord {
  id: string;
  scheduleEntryId: string;
  carrierId: string;
  originalLoadAmount: number;
  feeAmount: number; // 10% of originalLoadAmount
  calculatedDate: Date;
  status: 'Pending' | 'Invoiced' | 'Paid';
  invoiceId?: string; // Link to an Invoice
}

export interface ManualLineItem {
  id: string;
  description: string;
  amount: number; // positive for charge, negative for credit (or use type to determine)
  type: 'charge' | 'credit';
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // User-friendly invoice number e.g., INV-2024-001
  carrierId: string;
  invoiceDate: Date;
  dueDate: Date; // Wednesday of the week the invoice is generated
  dispatchFeeRecordIds: string[]; // IDs of DispatchFeeRecords included
  manualLineItems?: ManualLineItem[]; // Added for manual adjustments
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Void';
}

// Broker Box Types
export interface Shipper {
  id: string;
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  notes?: string;
}

export type BrokerLoadStatus = 'Available' | 'Booked' | 'In Transit' | 'Delivered' | 'Cancelled';
export const BROKER_LOAD_STATUSES: BrokerLoadStatus[] = ['Available', 'Booked', 'In Transit', 'Delivered', 'Cancelled'];

export interface BrokerLoad {
  id: string;
  shipperId: string;
  postedByBrokerId: string; // In a real app, this would be the logged-in broker's ID
  postedDate: Date;
  
  originAddress: string;
  destinationAddress: string;
  pickupDate: Date; // Could be a string or Date, ensure consistent handling
  deliveryDate: Date; // Could be a string or Date

  commodity: string;
  weight?: number; // e.g., in lbs or kg
  dims?: string; // e.g., "40ft L x 8ft W x 8ft H"
  equipmentType: string; // e.g., "Van", "Reefer", "Flatbed"
  
  offeredRate: number;
  notes?: string;

  status: BrokerLoadStatus;
  assignedCarrierId?: string;
  assignedTruckId?: string;
  assignedDriverId?: string; // Optional, could be assigned by carrier
  confirmationNumber?: string; // Provided by carrier or system
}

export type LoadDocumentType = 'BOL' | 'POD' | 'Rate Confirmation' | 'Other';
export const LOAD_DOCUMENT_TYPES: LoadDocumentType[] = ['BOL', 'POD', 'Rate Confirmation', 'Other'];

export interface LoadDocument {
  id: string;
  brokerLoadId: string;
  documentName: string;
  documentType: LoadDocumentType;
  uploadDate: Date;
  fileUrl?: string; // Placeholder for actual file path/URL
  uploadedBy: string; // Could be broker or carrier ID
}

// #noemptytrucks Feature
export interface AvailableEquipmentPost {
  id: string;
  carrierId: string; 
  // postedByUserId: string; // Would be used in a real app with auth
  postedDate: Date;
  equipmentType: string; 
  currentLocation: string; 
  availableFromDate: Date;
  availableToDate?: Date; 
  preferredDestinations?: string; 
  rateExpectation?: string; 
  contactName: string; 
  contactPhone: string;
  contactEmail?: string;
  notes?: string;
  status: 'Available' | 'Booked' | 'Expired'; // Simple status for now
  complianceDocsReady?: boolean; // New field
}

