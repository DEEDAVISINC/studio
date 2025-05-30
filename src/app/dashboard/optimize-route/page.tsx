
"use client";
import { useState } from 'react';
import { RouteOptimizationForm } from "@/components/fleetflow/RouteOptimizationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lightbulb, Percent, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OptimizeRoutePage() {
  const { toast } = useToast();
  const [loadAmountForFee, setLoadAmountForFee] = useState<string>('');
  const [dispatchFee, setDispatchFee] = useState<number | null>(null);

  const calculateFee = () => {
    const amount = parseFloat(loadAmountForFee);
    if (!isNaN(amount) && amount > 0) {
      const fee = amount * 0.10;
      setDispatchFee(fee);
      toast({
        title: "Dispatch Fee Calculated",
        description: `10% fee for $${amount.toFixed(2)} is $${fee.toFixed(2)}.`,
      });
    } else {
      setDispatchFee(null);
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number for the load amount.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Route &amp; Schedule Optimization</h1>
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
            <CardTitle>AI-Powered Route Suggestions</CardTitle>
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

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-start gap-4">
            <div className="bg-accent/10 p-3 rounded-full">
                <Percent className="h-6 w-6 text-accent" />
            </div>
            <div>
                <CardTitle>Dispatch Fee Calculator</CardTitle>
                <CardDescription>
                Quickly calculate a 10% dispatch fee based on the load's dollar amount.
                </CardDescription>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="loadAmount" className="text-foreground">Load Dollar Amount</Label>
                <div className="relative mt-1">
                    <DollarSign className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                        id="loadAmount" 
                        type="number" 
                        step="0.01"
                        value={loadAmountForFee}
                        onChange={(e) => setLoadAmountForFee(e.target.value)}
                        className="pl-8 bg-background border-border focus:ring-primary" 
                        placeholder="Enter total load value"
                    />
                </div>
            </div>
            <Button onClick={calculateFee} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Percent className="mr-2 h-4 w-4" /> Load Dispatch
            </Button>
            {dispatchFee !== null && (
                <div className="mt-4 p-3 bg-muted rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Calculated Dispatch Fee (10%):</p>
                    <p className="text-2xl font-bold text-accent">
                        {dispatchFee.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </p>
                </div>
            )}
        </CardContent>
      </Card>

    </div>
  );
}
