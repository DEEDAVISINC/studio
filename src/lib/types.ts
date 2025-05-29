
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

export interface Carrier {
  id: string;
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  contractDetails: string;
  mcNumber?: string; 
  usDotNumber?: string; 
  availabilityNotes?: string; 
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

export interface Invoice {
  id: string;
  invoiceNumber: string; // User-friendly invoice number e.g., INV-2024-001
  carrierId: string;
  invoiceDate: Date;
  dueDate: Date;
  dispatchFeeRecordIds: string[]; // IDs of DispatchFeeRecords included
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Void';
}
