
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Waves } from "lucide-react"; // Using Waves as a "flow" icon
import Link from 'next/link';

export default function FlowLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // In a real application, you would handle authentication here
    // and redirect to a specific dashboard based on role.
    console.log("Flow Login attempt with:", { email, password });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    // For now, this login is a prototype and won't redirect to a restricted area.
    // router.push('/dashboard/restricted-overview'); // Example future path
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Waves className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">
            GO WITH THE FLOW
          </CardTitle>
          <CardDescription className="text-muted-foreground pt-1">
            Carrier & Driver Portal for FleetFlow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your-email@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-8 bg-background border-border focus:ring-primary"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="text-sm text-primary hover:underline"
                  onClick={(e) => { e.preventDefault(); console.log("Flow: Forgot password clicked"); }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-8 bg-background border-border focus:ring-primary"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login to Flow Portal'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pt-4">
          <p className="text-sm text-muted-foreground">
            Need an account?{' '}
            <Link
              href="#" 
              className="font-medium text-primary hover:underline"
              onClick={(e) => { e.preventDefault(); console.log("Flow: Sign up clicked"); }}
            >
              Contact Support
            </Link>
          </p>
           <p className="text-xs text-muted-foreground pt-2">
            Main FleetFlow Admin Login?{' '}
            <Link
              href="/login" 
              className="font-medium text-primary hover:underline"
            >
              Admin Portal
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
