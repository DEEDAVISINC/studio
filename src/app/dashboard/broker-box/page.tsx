
"use client";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PackagePlus, Users, ListChecks, TruckIcon, FileUp } from "lucide-react";
import { ManageShippers } from '@/components/fleetflow/broker-box/ManageShippers';
import { ManageBrokerLoads } from '@/components/fleetflow/broker-box/ManageBrokerLoads';
import { AvailableBrokerLoads } from '@/components/fleetflow/broker-box/AvailableBrokerLoads';
import { MyBookedLoads } from '@/components/fleetflow/broker-box/MyBookedLoads';
import { useAppData } from '@/contexts/AppDataContext';

export default function BrokerBoxPage() {
  const { shippers, addShipper, updateShipper, removeShipper, brokerLoads, addBrokerLoad, updateBrokerLoad, carriers, trucks, drivers, assignLoadToCarrierAndCreateSchedule, loadDocuments, addLoadDocument, getShipperById } = useAppData();
  const [activeTab, setActiveTab] = useState("manage-loads"); // Default to broker-centric view

  // Simulate a logged-in user type. In a real app, this would come from auth.
  // For now, we can toggle this to see different views or assume a role.
  const currentUserRole: 'broker' | 'carrier' = 'broker'; // or 'carrier'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <PackagePlus className="mr-3 h-8 w-8 text-primary" />
            Broker Box
          </h1>
          <p className="text-muted-foreground">
            Manage shippers, post loads, and find available freight.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          {/* Tabs for Broker */}
          <TabsTrigger value="manage-loads" className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Post & Manage Loads
          </TabsTrigger>
          <TabsTrigger value="manage-shippers" className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Shippers
          </TabsTrigger>
          
          {/* Tabs for Carrier */}
          <TabsTrigger value="available-loads" className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5" />
            Available Loads
          </TabsTrigger>
           <TabsTrigger value="my-booked-loads" className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            My Booked Loads
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage-loads">
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Post and Manage Your Loads</CardTitle>
              <CardDescription>
                Create new load postings and view the status of your existing loads.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ManageBrokerLoads 
                brokerLoads={brokerLoads.filter(bl => bl.postedByBrokerId === 'brokerUser1')} // Simulate broker specific loads
                shippers={shippers}
                carriers={carriers}
                trucks={trucks}
                drivers={drivers}
                onAddBrokerLoad={addBrokerLoad}
                onUpdateBrokerLoad={updateBrokerLoad}
                getShipperById={getShipperById}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manage-shippers">
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Manage Shippers</CardTitle>
              <CardDescription>
                Add, view, and edit your shipper contacts and details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ManageShippers 
                shippers={shippers}
                onAddShipper={addShipper}
                onUpdateShipper={updateShipper}
                onRemoveShipper={removeShipper}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available-loads">
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Available Loads</CardTitle>
              <CardDescription>
                Browse and accept loads posted by brokers.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <AvailableBrokerLoads 
                    brokerLoads={brokerLoads.filter(bl => bl.status === 'Available')}
                    carriers={carriers} // Assuming the current user is one of these carriers
                    trucks={trucks} // Trucks belonging to the current carrier
                    drivers={drivers} // Drivers belonging to the current carrier
                    onAcceptLoad={assignLoadToCarrierAndCreateSchedule}
                    getShipperById={getShipperById}
                />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-booked-loads">
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle>My Booked Loads</CardTitle>
              <CardDescription>
                Manage loads you have accepted and upload necessary documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MyBookedLoads
                // Simulate current carrier ID - in a real app, this comes from auth
                bookedLoads={brokerLoads.filter(bl => bl.assignedCarrierId === carriers[0]?.id && bl.status !== 'Available')} 
                loadDocuments={loadDocuments}
                onAddLoadDocument={addLoadDocument}
                getShipperById={getShipperById}
                getTruckById={(id) => trucks.find(t => t.id === id)}
                getDriverById={(id) => drivers.find(d => d.id === id)}
              />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
