"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { suggestOptimalRoutes, type SuggestOptimalRoutesInput, type SuggestOptimalRoutesOutput } from "@/ai/flows/suggest-optimal-routes";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Loader2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PRIORITIES, type Priority } from "@/lib/types";


// Zod schema based on SuggestOptimalRoutesInput from AI flow
const routeOptimizationSchema = z.object({
  deliveryDeadline: z.string().min(1, "Delivery deadline is required."), // Will be formatted date-time string
  driverAvailability: z.string().min(1, "Driver availability is required."),
  currentLocation: z.string().min(1, "Current location is required."),
  destination: z.string().min(1, "Destination is required."),
  truckCapacity: z.string().min(1, "Truck capacity is required."),
  trafficConditions: z.string().optional(),
  weatherConditions: z.string().optional(),
  routeRestrictions: z.string().optional(),
  priority: z.enum(PRIORITIES),
});

type RouteOptimizationFormData = z.infer<typeof routeOptimizationSchema>;

export function RouteOptimizationForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<SuggestOptimalRoutesOutput | null>(null);
  const [selectedDeadlineDate, setSelectedDeadlineDate] = useState<Date | undefined>(new Date());
  const [deadlineTime, setDeadlineTime] = useState<string>(format(new Date(), "HH:mm"));


  const form = useForm<RouteOptimizationFormData>({
    resolver: zodResolver(routeOptimizationSchema),
    defaultValues: {
      deliveryDeadline: `${format(new Date(), "yyyy-MM-dd")}T${format(new Date(), "HH:mm")}`,
      driverAvailability: "Driver available Mon-Fri, 8 AM - 6 PM, 1-hour break.",
      currentLocation: "New York, NY",
      destination: "Los Angeles, CA",
      truckCapacity: "45,000 lbs, 53ft trailer",
      trafficConditions: "Normal",
      weatherConditions: "Clear",
      routeRestrictions: "No restrictions",
      priority: "MEDIUM",
    },
  });
  
  const handleDateAndTimeChange = () => {
    if (selectedDeadlineDate) {
      const [hours, minutes] = deadlineTime.split(':').map(Number);
      const newDeadline = new Date(selectedDeadlineDate);
      newDeadline.setHours(hours, minutes);
      form.setValue("deliveryDeadline", format(newDeadline, "yyyy-MM-dd'T'HH:mm"));
    }
  };
  
  
  const onSubmit = async (data: RouteOptimizationFormData) => {
    setIsLoading(true);
    setOptimizationResult(null);
    try {
      // Ensure deliveryDeadline is correctly formatted before sending
      const formattedData: SuggestOptimalRoutesInput = {
        ...data,
        deliveryDeadline: data.deliveryDeadline // Already formatted by handleDateAndTimeChange effect
      };
      const result = await suggestOptimalRoutes(formattedData);
      setOptimizationResult(result);
      toast({
        title: "Optimization Suggestion Ready",
        description: "AI has generated a route suggestion.",
        variant: "default", 
      });
    } catch (error) {
      console.error("Error optimizing route:", error);
      toast({
        title: "Error",
        description: "Failed to get optimization suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Delivery Deadline */}
          <div>
            <Label htmlFor="deliveryDeadlineDate">Delivery Deadline</Label>
            <div className="flex gap-2 mt-1">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("w-[calc(60%-0.25rem)] justify-start text-left font-normal bg-background border-border", !selectedDeadlineDate && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDeadlineDate ? format(selectedDeadlineDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedDeadlineDate}
                        onSelect={(date) => { setSelectedDeadlineDate(date); handleDateAndTimeChange(); }}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <Input 
                    type="time" 
                    value={deadlineTime}
                    onChange={(e) => { setDeadlineTime(e.target.value); handleDateAndTimeChange();}}
                    className="w-[calc(40%-0.25rem)] bg-background border-border"
                />
            </div>
            {form.formState.errors.deliveryDeadline && <p className="text-sm text-destructive mt-1">{form.formState.errors.deliveryDeadline.message}</p>}
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Controller
              name="priority"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="priority" className="mt-1 bg-background border-border focus:ring-primary">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.priority && <p className="text-sm text-destructive mt-1">{form.formState.errors.priority.message}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
            {/* Current Location */}
            <div>
                <Label htmlFor="currentLocation">Current Location</Label>
                <Input id="currentLocation" {...form.register("currentLocation")} className="mt-1 bg-background border-border focus:ring-primary" placeholder="e.g., City, State or Address"/>
                {form.formState.errors.currentLocation && <p className="text-sm text-destructive mt-1">{form.formState.errors.currentLocation.message}</p>}
            </div>
            {/* Destination */}
            <div>
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" {...form.register("destination")} className="mt-1 bg-background border-border focus:ring-primary" placeholder="e.g., City, State or Address"/>
                {form.formState.errors.destination && <p className="text-sm text-destructive mt-1">{form.formState.errors.destination.message}</p>}
            </div>
        </div>

        {/* Driver Availability */}
        <div>
          <Label htmlFor="driverAvailability">Driver Availability</Label>
          <Textarea id="driverAvailability" {...form.register("driverAvailability")} className="mt-1 bg-background border-border focus:ring-primary" placeholder="e.g., Working hours, breaks, days off" rows={3}/>
          {form.formState.errors.driverAvailability && <p className="text-sm text-destructive mt-1">{form.formState.errors.driverAvailability.message}</p>}
        </div>

        {/* Truck Capacity */}
        <div>
          <Label htmlFor="truckCapacity">Truck Capacity</Label>
          <Input id="truckCapacity" {...form.register("truckCapacity")} className="mt-1 bg-background border-border focus:ring-primary" placeholder="e.g., Weight (lbs/kg), volume (cubic ft/m), type"/>
          {form.formState.errors.truckCapacity && <p className="text-sm text-destructive mt-1">{form.formState.errors.truckCapacity.message}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
            {/* Traffic Conditions */}
            <div>
                <Label htmlFor="trafficConditions">Traffic Conditions (Optional)</Label>
                <Input id="trafficConditions" {...form.register("trafficConditions")} className="mt-1 bg-background border-border focus:ring-primary" placeholder="e.g., Heavy congestion on I-95"/>
            </div>
            {/* Weather Conditions */}
            <div>
                <Label htmlFor="weatherConditions">Weather Conditions (Optional)</Label>
                <Input id="weatherConditions" {...form.register("weatherConditions")} className="mt-1 bg-background border-border focus:ring-primary" placeholder="e.g., Snowstorm expected in Rockies"/>
            </div>
        </div>
        
        {/* Route Restrictions */}
        <div>
          <Label htmlFor="routeRestrictions">Route Restrictions (Optional)</Label>
          <Textarea id="routeRestrictions" {...form.register("routeRestrictions")} className="mt-1 bg-background border-border focus:ring-primary" placeholder="e.g., Low bridge on Main St, no hazardous materials on Parkway" rows={2}/>
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Get AI Suggestion
        </Button>
      </form>

      {isLoading && (
        <div className="text-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">AI is analyzing your request...</p>
        </div>
      )}

      {optimizationResult && !isLoading && (
        <Card className="mt-6 bg-background shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-primary">AI Route Suggestion</CardTitle>
            <CardDescription>Based on the provided information, here's the optimal plan:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground">Suggested Route:</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{optimizationResult.suggestedRoute}</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Estimated Travel Time:</h4>
              <p className="text-muted-foreground">{optimizationResult.estimatedTravelTime}</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Suggested Schedule Adjustments:</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{optimizationResult.suggestedScheduleAdjustments}</p>
            </div>
             <div>
              <h4 className="font-semibold text-foreground">Reasoning:</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{optimizationResult.reasoning}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
