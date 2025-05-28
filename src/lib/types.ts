
export interface Truck {
  id: string;
  name: string;
  licensePlate: string;
  model: string;
  year: number;
  carrierId: string;
  driverId?: string; // Driver can be unassigned
  maintenanceStatus: 'Good' | 'Needs Service' | 'In Service';
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
}

export interface ScheduleEntry {
  id: string;
  truckId: string;
  driverId?: string;
  title: string;
  start: Date;
  end: Date;
  destination: string;
  origin: string;
  notes?: string;
  color?: string; // For calendar event styling
}

// For AI Route Optimization Form
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];
