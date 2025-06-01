
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Truck, LogIn, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background p-6 text-center">
      <header className="mb-12">
        <Truck className="h-24 w-24 text-primary mx-auto mb-6" />
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Welcome to FleetFlow
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          Streamline your trucking operations, manage schedules, optimize routes, and keep your fleet flowing smoothly.
        </p>
      </header>

      <main className="space-y-6">
        <p className="text-lg text-muted-foreground">
          Get started by logging into your account or exploring the dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/login">
              <LogIn className="mr-2 h-5 w-5" /> Admin Login
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/flow-login">
               <Truck className="mr-2 h-5 w-5" /> Carrier/Driver Portal
            </Link>
          </Button>
           <Button asChild size="lg" variant="secondary">
            <Link href="/dashboard/overview">
              <BarChart3 className="mr-2 h-5 w-5" /> View Dashboard
            </Link>
          </Button>
        </div>
      </main>

      <footer className="mt-16 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FleetFlow. All rights reserved.</p>
        <p className="mt-1">
          Placeholder images by <a href="https://placehold.co" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">placehold.co</a>
        </p>
      </footer>
    </div>
  );
}
