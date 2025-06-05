
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Truck, Users, DollarSign } from "lucide-react";
import { useAppData } from "@/contexts/AppDataContext";
import Link from "next/link";

export default function OverviewPage() {
  const { trucks, drivers, carriers, scheduleEntries, brokerLoads } = useAppData();

  const activeLoads = scheduleEntries.filter(entry => new Date(entry.end) > new Date() && entry.scheduleType === 'Delivery').length;
  const availableBrokerLoads = brokerLoads.filter(load => load.status === 'Available').length;

  const StatCard = ({ title, value, icon: Icon, description, linkTo }: { title: string, value: string | number, icon: React.ElementType, description?: string, linkTo?: string }) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {linkTo && (
          <Link href={linkTo} className="text-xs text-primary hover:underline mt-1 block">
            View Details
          </Link>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Fleet Overview</h1>
          <p className="text-muted-foreground">
            Welcome to your FleetFlow dashboard. Here&apos;s a quick look at your operations.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Trucks" value={trucks.length} icon={Truck} description="Managed trucks in the fleet" linkTo="/dashboard/trucks" />
        <StatCard title="Total Drivers" value={drivers.length} icon={Users} description="Registered drivers" linkTo="/dashboard/drivers" />
        <StatCard title="Total Carriers" value={carriers.length} icon={Users} description="Partner carriers" linkTo="/dashboard/carriers" />
        <StatCard title="Active Loads" value={activeLoads} icon={Activity} description="Deliveries currently in progress" linkTo="/dashboard/schedules" />
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access common tasks quickly.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/schedules" className="p-4 bg-accent/10 hover:bg-accent/20 rounded-lg text-center transition-colors">
                <CalendarDays className="mx-auto h-8 w-8 text-accent mb-2" />
                <p className="font-medium text-accent-foreground">View Scheduler</p>
            </Link>
            <Link href="/dashboard/broker-box" className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg text-center transition-colors">
                <PackagePlus className="mx-auto h-8 w-8 text-primary mb-2" />
                <p className="font-medium text-primary">Broker Box</p>
            </Link>
             <Link href="/dashboard/no-empty-trucks" className="p-4 bg-muted hover:bg-muted/80 rounded-lg text-center transition-colors">
                <RadioTower className="mx-auto h-8 w-8 text-foreground mb-2" />
                <p className="font-medium text-foreground">#NoEmptyTrucks</p>
            </Link>
             <Link href="/dashboard/dispatch-central" className="p-4 bg-secondary hover:bg-secondary/80 rounded-lg text-center transition-colors">
                <DollarSign className="mx-auto h-8 w-8 text-secondary-foreground mb-2" />
                <p className="font-medium text-secondary-foreground">Dispatch Central</p>
            </Link>
          </CardContent>
        </Card>
         <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Broker Load Board Snapshot</CardTitle>
             <CardDescription>Status of loads you&apos;ve posted or can accept.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                <div>
                    <p className="text-sm font-medium text-foreground">Available Loads to Accept</p>
                    <p className="text-xs text-muted-foreground">Loads posted by brokers ready for booking.</p>
                </div>
                <div className="text-2xl font-bold text-green-600">{availableBrokerLoads}</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                <div>
                    <p className="text-sm font-medium text-foreground">Your Posted Loads (Total)</p>
                    <p className="text-xs text-muted-foreground">All loads you have posted.</p>
                </div>
                <div className="text-2xl font-bold text-primary">{brokerLoads.filter(bl => bl.postedByBrokerId === 'brokerUser1').length}</div>
            </div>
             <Button asChild variant="outline" className="w-full mt-2">
                 <Link href="/dashboard/broker-box">Manage Broker Loads</Link>
             </Button>
          </CardContent>
        </Card>
      </div>
       <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Welcome to FleetFlow!</CardTitle>
            <CardDescription>
              This is your central hub for managing all aspects of your trucking operations.
              Use the sidebar to navigate to different sections like Trucks, Drivers, Schedules, and Carrier management.
              The Broker Box allows you to post and find loads. Dispatch Central helps with invoicing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Explore the features and let us know if you have any feedback! This prototype includes sample data to help you get started.
            </p>
          </CardContent>
        </Card>
    </div>
  );
}

// Temporary icons, replace with actual ones from lucide-react if different
import { CalendarDays, PackagePlus, RadioTower } from "lucide-react";
import { Button } from "@/components/ui/button";
