
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TruckIcon, LogIn, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50 p-6">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <Image 
              src="https://placehold.co/240x60.png" // Placeholder image
              alt="Fleet Flow Logo" 
              width={240} 
              height={60}
              priority
              className="object-contain"
              data-ai-hint="logo company"
            />
          </div>
          <CardTitle className="text-4xl font-bold tracking-tight text-primary">
            Welcome to FleetFlow
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Your all-in-one solution for efficient fleet management and logistics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-foreground">
            Streamline your operations, optimize routes, manage carriers, and ensure compliance with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="flex-1">
              <Link href="/login">
                <LogIn className="mr-2" /> Admin Login
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="flex-1">
              <Link href="/flow-login">
                <TruckIcon className="mr-2" /> Carrier/Driver Portal
              </Link>
            </Button>
          </div>
           <div className="text-center mt-4">
             <Button asChild variant="outline" size="lg" className="w-full max-w-xs mx-auto">
              <Link href="/dashboard/overview">
                <LayoutDashboard className="mr-2" /> Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FleetFlow. All rights reserved.</p>
        <p className="mt-1">Powered by Next.js, ShadCN UI, and Firebase.</p>
      </footer>
    </div>
  );
}
