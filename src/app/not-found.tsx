
// This custom not-found page has been modified for troubleshooting.
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
      <h1 className="text-4xl font-bold tracking-tight text-destructive mb-4">
        Custom Not Found Page - Test XYZ
      </h1>
      <p className="mb-6 text-lg text-muted-foreground">
        Oops! The page you&apos;re looking for doesn&apos;t seem to exist.
      </p>
      <p className="text-sm text-muted-foreground mb-2">
        This is a custom 404 page.
      </p>
      <Link href="/dashboard/overview">
        <Button variant="default" className="bg-primary hover:bg-primary/90">
          Go to Dashboard Overview
        </Button>
      </Link>
    </div>
  );
}
