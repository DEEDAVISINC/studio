
"use client";
import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import type { Truck, Driver, Carrier, ScheduleEntry, ScheduleType } from '@/lib/types';
// format from 'date-fns' is not used here, so removed import to avoid confusion.
// new Date() is used to parse ISO strings, which is fine.

interface AppDataContextType {
  trucks: Truck[];
  drivers: Driver[];
  carriers: Carrier[];
  scheduleEntries: ScheduleEntry[];
  addTruck: (truck: Omit<Truck, 'id'>) => void;
  updateTruck: (truck: Truck) => void;
  removeTruck: (truckId: string) => void;
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (driver: Driver) => void;
  removeDriver: (driverId: string) => void;
  addCarrier: (carrier: Omit<Carrier, 'id'>) => void;
  updateCarrier: (carrier: Carrier) => void;
  removeCarrier: (carrierId: string) => void;
  addScheduleEntry: (entry: Omit<ScheduleEntry, 'id'>) => void;
  updateScheduleEntry: (entry: ScheduleEntry) => void;
  removeScheduleEntry: (entryId: string) => void;
  getTruckById: (truckId: string) => Truck | undefined;
  getDriverById: (driverId: string) => Driver | undefined;
  getCarrierById: (carrierId: string) => Carrier | undefined;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// Using fixed ISO date strings for all Date fields in initial data
// For due dates (mc150DueDate, etc.), using 'YYYY-MM-DD' which new Date() parses as local time midnight.
// For start/end times in schedules, using full ISO strings with 'Z' for UTC.
const initialTrucks: Truck[] = [
  { id: 'truck1', name: 'Alpha Hauler', licensePlate: 'TRK-001', model: 'Volvo VNL', year: 2022, carrierId: 'carrier1', driverId: 'driver1', maintenanceStatus: 'Good', mc150DueDate: new Date('2025-06-15'), permitExpiryDate: new Date('2024-12-31'), taxDueDate: new Date('2024-09-30') },
  { id: 'truck2', name: 'Beta Mover', licensePlate: 'TRK-002', model: 'Freightliner Cascadia', year: 2021, carrierId: 'carrier2', driverId: 'driver2', maintenanceStatus: 'Needs Service', mc150DueDate: new Date('2025-08-01') },
  { id: 'truck3', name: 'Gamma Transporter', licensePlate: 'TRK-003', model: 'Peterbilt 579', year: 2023, carrierId: 'carrier1', maintenanceStatus: 'In Service', permitExpiryDate: new Date('2025-03-28') },
];

const initialDrivers: Driver[] = [
  { id: 'driver1', name: 'John Doe', contactPhone: '555-1234', contactEmail: 'john.doe@example.com', licenseNumber: 'DL12345' },
  { id: 'driver2', name: 'Jane Smith', contactPhone: '555-5678', contactEmail: 'jane.smith@example.com', licenseNumber: 'DL67890' },
];

const initialCarriers: Carrier[] = [
  { id: 'carrier1', name: 'Speedy Logistics', contactPerson: 'Mike Ross', contactEmail: 'mike.ross@speedylog.com', contactPhone: '555-0001', contractDetails: 'Primary Carrier Agreement, expires 2025-12-31', mcNumber: 'MC123456', usDotNumber: 'USDOT987654', availabilityNotes: 'Available Mon-Fri, national coverage.' },
  { id: 'carrier2', name: 'Reliable Transport Inc.', contactPerson: 'Sarah Connor', contactEmail: 's.connor@reliabletransport.com', contactPhone: '555-0002', contractDetails: 'Secondary Carrier, flexible terms', mcNumber: 'MC654321', usDotNumber: 'USDOT123789', availabilityNotes: 'Weekend availability, regional only.' },
];

// Using dates far in the future (e.g., 2025) to ensure they are "upcoming" relative to "new Date()" checks.
const initialScheduleEntries: ScheduleEntry[] = [
  { id: 'sch1', truckId: 'truck1', driverId: 'driver1', title: 'Delivery to LA', start: new Date('2025-07-20T10:00:00Z'), end: new Date('2025-07-21T18:00:00Z'), origin: 'Phoenix, AZ', destination: 'Los Angeles, CA', loadValue: 2500.00, color: 'hsl(var(--primary))', scheduleType: 'Delivery' },
  { id: 'sch2', truckId: 'truck2', driverId: 'driver2', title: 'Pickup from Dallas', start: new Date('2025-07-22T09:00:00Z'), end: new Date('2025-07-22T17:00:00Z'), origin: 'Houston, TX', destination: 'Dallas, TX', loadValue: 1800.50, notes: 'Handle with care', color: 'hsl(var(--accent))', scheduleType: 'Pickup' },
  { id: 'sch3', truckId: 'truck1', title: 'Maintenance Check', start: new Date('2025-07-24T14:00:00Z'), end: new Date('2025-07-24T16:00:00Z'), origin: 'Base', destination: 'Garage', color: 'hsl(var(--destructive))', scheduleType: 'Maintenance', notes: 'Oil change and tire rotation' },
  { id: 'sch4', truckId: 'truck1', driverId: 'driver1', title: 'Long Haul to NY', start: new Date('2025-07-26T08:00:00Z'), end: new Date('2025-07-29T17:00:00Z'), origin: 'Los Angeles, CA', destination: 'New York, NY', loadValue: 5500.75, notes: 'High value goods', color: 'hsl(var(--primary))', scheduleType: 'Delivery' },
];


export function AppDataProvider({ children }: { children: ReactNode }) {
  const [trucks, setTrucks] = useState<Truck[]>(initialTrucks);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [carriers, setCarriers] = useState<Carrier[]>(initialCarriers);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>(initialScheduleEntries);

  const addTruck = useCallback((truck: Omit<Truck, 'id'>) => {
    setTrucks(prev => [...prev, { ...truck, id: `truck${Date.now()}` }]);
  }, []);
  const updateTruck = useCallback((updatedTruck: Truck) => {
    setTrucks(prev => prev.map(t => t.id === updatedTruck.id ? updatedTruck : t));
  }, []);
  const removeTruck = useCallback((truckId: string) => {
    setTrucks(prev => prev.filter(t => t.id !== truckId));
    setScheduleEntries(prev => prev.filter(s => s.truckId !== truckId)); 
  }, []);

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

  const addCarrier = useCallback((carrier: Omit<Carrier, 'id'>) => {
    setCarriers(prev => [...prev, { ...carrier, id: `carrier${Date.now()}` }]);
  }, []);
  const updateCarrier = useCallback((updatedCarrier: Carrier) => {
    setCarriers(prev => prev.map(c => c.id === updatedCarrier.id ? updatedCarrier : c));
  }, []);
  const removeCarrier = useCallback((carrierId: string) => {
    setCarriers(prev => prev.filter(c => c.id !== carrierId));
  }, []);
  
  const addScheduleEntry = useCallback((entry: Omit<ScheduleEntry, 'id'>) => {
    setScheduleEntries(prev => [...prev, { ...entry, id: `sch${Date.now()}` }]);
  }, []);
  const updateScheduleEntry = useCallback((updatedEntry: ScheduleEntry) => {
    setScheduleEntries(prev => prev.map(s => s.id === updatedEntry.id ? updatedEntry : s));
  }, []);
  const removeScheduleEntry = useCallback((entryId: string) => {
    setScheduleEntries(prev => prev.filter(s => s.id !== entryId));
  }, []);

  const getTruckById = useCallback((truckId: string) => trucks.find(t => t.id === truckId), [trucks]);
  const getDriverById = useCallback((driverId: string) => drivers.find(d => d.id === driverId), [drivers]);
  const getCarrierById = useCallback((carrierId: string) => carriers.find(c => c.id === carrierId), [carriers]);

  return (
    <AppDataContext.Provider value={{
      trucks, drivers, carriers, scheduleEntries,
      addTruck, updateTruck, removeTruck,
      addDriver, updateDriver, removeDriver,
      addCarrier, updateCarrier, removeCarrier,
      addScheduleEntry, updateScheduleEntry, removeScheduleEntry,
      getTruckById, getDriverById, getCarrierById
    }}>
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
