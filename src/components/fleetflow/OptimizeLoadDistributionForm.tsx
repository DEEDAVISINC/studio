
"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { optimizeLoadDistribution, type OptimizeLoadDistributionInput, type OptimizeLoadDistributionOutput } from "@/ai/flows/optimize-load-distribution";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, CheckCircle, AlertTriangle } from "lucide-react";

const optimizeLoadSchema = z.object({
  itemsDescription: z.string().min(10, "Please describe the items to load in detail."),
  trucksDescription: z.string().min(10, "Please describe the available trucks in detail."),
  optimizationGoal: z.string().min(5, "Please specify the optimization goal."),
});

type OptimizeLoadFormData = z.infer<typeof optimizeLoadSchema>;

export function OptimizeLoadDistributionForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizeLoadDistributionOutput | null>(null);

  const form = useForm<OptimizeLoadFormData>({
    resolver: zodResolver(optimizeLoadSchema),
    defaultValues: {
      itemsDescription: "Item001: 200kg, 1.5cbm, Destination A, Value $1200\nItem002: 350kg, 2cbm, Destination B, Value $800\nItem003: 100kg, 0.5cbm, Destination A, Value $300",
      trucksDescription: "TruckA: Capacity 1000kg, 10cbm, Current Location X\nTruckB: Capacity 800kg, 7cbm, Current Location Y",
      optimizationGoal: "Minimize number of trucks used, then group by destination.",
    },
  });

  const onSubmit = async (data: OptimizeLoadFormData) => {
    setIsLoading(true);
    setOptimizationResult(null);
    try {
      const result = await optimizeLoadDistribution(data);
      setOptimizationResult(result);
      toast({
        title: "Load Optimization Suggestion Ready",
        description: "AI has generated a load distribution plan.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error optimizing load:", error);
      toast({
        title: "Error",
        description: "Failed to get load optimization suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="itemsDescription">Items to Load</Label>
          <Textarea
            id="itemsDescription"
            {...form.register("itemsDescription")}
            className="mt-1 bg-background border-border focus:ring-primary h-32"
            placeholder="e.g., Item ID: weight, volume, destination, value (optional)"
          />
          {form.formState.errors.itemsDescription && <p className="text-sm text-destructive mt-1">{form.formState.errors.itemsDescription.message}</p>}
        </div>

        <div>
          <Label htmlFor="trucksDescription">Available Trucks</Label>
          <Textarea
            id="trucksDescription"
            {...form.register("trucksDescription")}
            className="mt-1 bg-background border-border focus:ring-primary h-24"
            placeholder="e.g., Truck ID: capacity weight, capacity volume, current location"
          />
          {form.formState.errors.trucksDescription && <p className="text-sm text-destructive mt-1">{form.formState.errors.trucksDescription.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="optimizationGoal">Optimization Goal</Label>
          <Input
            id="optimizationGoal"
            {...form.register("optimizationGoal")}
            className="mt-1 bg-background border-border focus:ring-primary"
            placeholder="e.g., Minimize trucks, Maximize value, Group by destination"
          />
          {form.formState.errors.optimizationGoal && <p className="text-sm text-destructive mt-1">{form.formState.errors.optimizationGoal.message}</p>}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          Get AI Load Plan
        </Button>
      </form>

      {isLoading && (
        <div className="text-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">AI is planning your loads...</p>
        </div>
      )}

      {optimizationResult && !isLoading && (
        <Card className="mt-6 bg-background shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center"><CheckCircle className="mr-2 h-6 w-6" /> AI Load Optimization Plan</CardTitle>
            <CardDescription>Based on your input, here’s the suggested load distribution:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground">Summary:</h4>
              <p className="text-muted-foreground whitespace-pre-wrap">{optimizationResult.summary}</p>
            </div>

            {optimizationResult.truckLoadPlans && optimizationResult.truckLoadPlans.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Truck Load Plans:</h4>
                <div className="space-y-3">
                {optimizationResult.truckLoadPlans.map((plan, index) => (
                  <Card key={index} className="bg-muted/50 p-3">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-md text-primary">Truck ID: {plan.truckId}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 text-sm space-y-1">
                      <p><span className="font-medium text-foreground">Assigned Items:</span> {plan.assignedItemIds.join(', ')}</p>
                      <p><span className="font-medium text-foreground">Total Weight:</span> {plan.totalWeightLoaded.toLocaleString()} units</p>
                      <p><span className="font-medium text-foreground">Total Volume:</span> {plan.totalVolumeLoaded.toLocaleString()} units</p>
                      {plan.totalValueLoaded !== undefined && <p><span className="font-medium text-foreground">Total Value:</span> ${plan.totalValueLoaded.toLocaleString()}</p>}
                      {plan.suggestedRouteInfo && <p><span className="font-medium text-foreground">Route Info:</span> {plan.suggestedRouteInfo}</p>}
                    </CardContent>
                  </Card>
                ))}
                </div>
              </div>
            )}

            {optimizationResult.unassignedItemIds && optimizationResult.unassignedItemIds.length > 0 && (
              <div>
                <h4 className="font-semibold text-destructive flex items-center"><AlertTriangle className="mr-2 h-5 w-5" /> Unassigned Items:</h4>
                <ul className="list-disc list-inside text-muted-foreground">
                  {optimizationResult.unassignedItemIds.map(itemId => <li key={itemId}>{itemId}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
