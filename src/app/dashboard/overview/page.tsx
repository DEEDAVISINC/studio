"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppData } from "@/contexts/AppDataContext";
import { BarChart, Users, CalendarCheck, Truck as TruckIcon } from "lucide-react";
import Image from "next/image";

export default function OverviewPage() {
  const { trucks, drivers, carriers, scheduleEntries } = useAppData();

  const stats = [
    { title: "Total Trucks", value: trucks.length, icon: TruckIcon, color: "text-primary" },
    { title: "Active Drivers", value: drivers.length, icon: Users, color: "text-blue-500" },
    { title: "Registered Carriers", value: carriers.length, icon: BarChart, color: "text-purple-500" },
    { title: "Upcoming Schedules", value: scheduleEntries.filter(s => s.start > new Date()).length, icon: CalendarCheck, color: "text-green-500" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {scheduleEntries.slice(0, 3).map(entry => (
                 <li key={entry.id} className="flex items-center space-x-3 p-2 bg-muted/50 rounded-md">
                    <CalendarCheck className="h-5 w-5 text-primary" />
                    <div>
                        <p className="font-medium text-sm text-foreground">{entry.title} for Truck ID: {entry.truckId}</p>
                        <p className="text-xs text-muted-foreground">
                            {new Date(entry.start).toLocaleDateString()} - {new Date(entry.end).toLocaleDateString()}
                        </p>
                    </div>
                 </li>
              ))}
               {scheduleEntries.length === 0 && <p className="text-muted-foreground">No recent activity.</p>}
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Welcome to FleetFlow</CardTitle>
            <CardDescription>Efficiently manage your trucking operations.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Image 
              src="https://placehold.co/600x300.png" 
              alt="Fleet Management Illustration" 
              width={300} 
              height={150} 
              className="rounded-lg mb-4"
              data-ai-hint="truck fleet logistics" 
            />
            <p className="text-muted-foreground">
              Utilize the sidebar to navigate through trucks, schedules, drivers, carriers, and optimize routes using our AI-powered tool.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
