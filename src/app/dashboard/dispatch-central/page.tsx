
"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, FileText, Users, AlertCircle, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import { CreateDispatchFeeList } from '@/components/fleetflow/CreateDispatchFeeList';
import { CarrierInvoicing } from '@/components/fleetflow/CarrierInvoicing';
import { useAppData } from '@/contexts/AppDataContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import { getDay } from 'date-fns';

export default function DispatchCentralPage() {
  const { scheduleEntries, trucks, carriers, dispatchFeeRecords, addDispatchFeeRecord, getTruckById, getCarrierById, createInvoiceForCarrier, invoices, getScheduleEntryById, updateInvoiceStatus } = useAppData();
  const [activeTab, setActiveTab] = useState("create-fees");

  const [alertDynamicClass, setAlertDynamicClass] = useState('bg-accent/10 border-accent/50 text-accent-foreground');
  const [alertIconComponent, setAlertIconComponent] = useState<React.ReactNode>(<AlertCircle className="h-5 w-5 text-accent" />);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      const today = new Date();
      const day = getDay(today); // 0 for Sunday, 1 for Monday

      if (day === 0) { // Sunday
        setAlertDynamicClass('bg-yellow-100 border-yellow-400 text-yellow-700 dark:bg-yellow-700/30 dark:border-yellow-600 dark:text-yellow-400');
        setAlertIconComponent(<AlertTriangle className="h-5 w-5 text-yellow-700 dark:text-yellow-400" />);
      } else if (day === 1) { // Monday
        setAlertDynamicClass('bg-red-100 border-red-400 text-red-700 dark:bg-red-700/30 dark:border-red-600 dark:text-red-400');
        setAlertIconComponent(<AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-400" />);
      } else {
        setAlertDynamicClass('bg-accent/10 border-accent/50 text-accent-foreground');
        setAlertIconComponent(<AlertCircle className="h-5 w-5 text-accent" />);
      }
    }
  }, [hasMounted]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <DollarSign className="mr-3 h-8 w-8 text-primary" />
            Dispatch Central
          </h1>
          <p className="text-muted-foreground">
            Manage dispatch fee records and generate invoices for carriers.
          </p>
        </div>
      </div>

      {hasMounted && (
        <Alert variant="default" className={cn("shadow-md", alertDynamicClass)}>
          {alertIconComponent}
          <AlertTitle className={cn("font-semibold", 
            getDay(new Date()) === 0 ? "text-yellow-800 dark:text-yellow-300" :
            getDay(new Date()) === 1 ? "text-red-800 dark:text-red-300" :
            "text-accent"
          )}>Important Invoice Schedule</AlertTitle>
          <AlertDescription className={cn(
             getDay(new Date()) === 0 ? "text-yellow-700/90 dark:text-yellow-400/90" :
             getDay(new Date()) === 1 ? "text-red-700/90 dark:text-red-400/90" :
             "text-accent/90"
          )}>
            All dispatch invoices must be sent out to carriers by **Monday** of each week.
            Payment for these invoices is due by **Wednesday** of the same week to ensure carriers remain eligible for new bookable loads.
          </AlertDescription>
        </Alert>
      )}
      {!hasMounted && ( // Placeholder for SSR or pre-hydration
         <Alert variant="default" className="bg-accent/10 border-accent/50 text-accent-foreground shadow-md">
            <AlertCircle className="h-5 w-5 text-accent" />
            <AlertTitle className="font-semibold text-accent">Important Invoice Schedule</AlertTitle>
            <AlertDescription className="text-accent/90">
              Loading reminder...
            </AlertDescription>
        </Alert>
      )}


      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2">
          <TabsTrigger value="create-fees" className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Fee Record Creation
          </TabsTrigger>
          <TabsTrigger value="carrier-invoicing" className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Carrier Invoicing
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create-fees">
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Create Dispatch Fee Records</CardTitle>
              <CardDescription>
                Identify completed loads with a value and create a 10% dispatch fee record.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateDispatchFeeList
                scheduleEntries={scheduleEntries}
                trucks={trucks}
                carriers={carriers}
                dispatchFeeRecords={dispatchFeeRecords}
                onAddDispatchFeeRecord={addDispatchFeeRecord}
                getTruckById={getTruckById}
                getCarrierById={getCarrierById}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="carrier-invoicing">
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Carrier Invoicing</CardTitle>
              <CardDescription>
                Select a carrier to view their pending dispatch fees and generate an invoice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CarrierInvoicing
                carriers={carriers}
                dispatchFeeRecords={dispatchFeeRecords}
                invoices={invoices}
                onCreateInvoice={createInvoiceForCarrier}
                getScheduleEntryById={getScheduleEntryById}
                getCarrierById={getCarrierById}
                updateInvoiceStatus={updateInvoiceStatus}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

