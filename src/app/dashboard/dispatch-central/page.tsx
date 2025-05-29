
"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, FileText, Users } from "lucide-react";
import { CreateDispatchFeeList } from '@/components/fleetflow/CreateDispatchFeeList';
import { CarrierInvoicing } from '@/components/fleetflow/CarrierInvoicing';
import { useAppData } from '@/contexts/AppDataContext';

export default function DispatchCentralPage() {
  const { scheduleEntries, trucks, carriers, dispatchFeeRecords, addDispatchFeeRecord, getTruckById, getCarrierById, createInvoiceForCarrier, invoices, getScheduleEntryById, updateInvoiceStatus } = useAppData();
  const [activeTab, setActiveTab] = useState("create-fees");

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
