
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-6">
      <AlertTriangle className="h-24 w-24 text-destructive mx-auto mb-6" />
      <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4">
        404 - Page Not Found
      </h1>
      <p className="mt-2 text-xl text-muted-foreground max-w-md mx-auto mb-8">
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
        <Link href="/">Go Back Home</Link>
      </Button>
    </div>
  );
}
