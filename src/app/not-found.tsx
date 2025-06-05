
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-6" />
        <h1 className="text-5xl font-bold text-destructive tracking-tight">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="mt-3 text-muted-foreground">
          Oops! The page you&apos;re looking for doesn&apos;t seem to exist. It might have been moved, deleted, or you might have mistyped the URL.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/overview">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
