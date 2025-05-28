"use client";
import { RouteOptimizationForm } from "@/components/fleetflow/RouteOptimizationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function OptimizeRoutePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Route & Schedule Optimization</h1>
        <p className="text-muted-foreground">
          Leverage AI to find optimal routes and adjust schedules based on various factors.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>AI-Powered Suggestions</CardTitle>
            <CardDescription>
              Input the details below to receive intelligent recommendations for route optimization
              and scheduling adjustments.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <RouteOptimizationForm />
        </CardContent>
      </Card>
    </div>
  );
}
