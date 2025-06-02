
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Attempt to force static generation for the not-found page.
export const dynamic = 'force-static';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f5f5f5', // Fallback for light gray
      color: '#333333' // Fallback for dark text
    }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        404 - Page Not Found
      </h1>
      <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#71717a' /* Fallback for muted-foreground */ }}>
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" passHref>
        {/* The Button component uses Tailwind classes which should be processed fine.
            If issues persist, this could be further simplified to a basic <a> tag.
        */}
        <Button size="lg">
          Go Back Home
        </Button>
      </Link>
    </div>
  );
}
