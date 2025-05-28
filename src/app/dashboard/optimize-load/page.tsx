
"use client";
import { OptimizeLoadDistributionForm } from "@/components/fleetflow/OptimizeLoadDistributionForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageSearch } from "lucide-react"; // Changed icon

export default function OptimizeLoadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Load Distribution Optimization</h1>
        <p className="text-muted-foreground">
          Use AI to optimize how items are distributed across your available trucks.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <PackageSearch className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>AI-Powered Load Planning</CardTitle>
            <CardDescription>
              Provide details about your items and trucks to receive an optimized load plan.
              Consider weights, volumes, destinations, and your primary optimization goal.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <OptimizeLoadDistributionForm />
        </CardContent>
      </Card>
    </div>
  );
}
