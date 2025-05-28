
export interface Truck {
  id: string;
  name: string;
  licensePlate: string;
  model: string;
  year: number;
  carrierId: string;
  driverId?: string; // Driver can be unassigned
  maintenanceStatus: 'Good' | 'Needs Service' | 'In Service';
  mc150DueDate?: Date | string; // Added
  permitExpiryDate?: Date | string; // Added
  taxDueDate?: Date | string; // Added
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
  mcNumber?: string; // Added
  usDotNumber?: string; // Added
  availabilityNotes?: string; // Added
}

export type ScheduleType = 'Delivery' | 'Maintenance' | 'Pickup' | 'Other'; // Added
export const SCHEDULE_TYPES: ScheduleType[] = ['Delivery', 'Maintenance', 'Pickup', 'Other']; // Added

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
  scheduleType?: ScheduleType; // Added
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
