
// Remove "use client" - this will now be a Server Component by default

// No imports needed for this simplified version
// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { Loader2 } from 'lucide-react';

export default function HomePage() {
  // The redirect logic is removed for this test.
  // If this page loads, we know Next.js can serve the root.
  // We can then re-evaluate the redirect strategy.

  return (
    <div style={{ padding: '20px', border: '2px solid red', textAlign: 'center' }}>
      <h1>Root Page (/src/app/page.tsx)</h1>
      <p>If you see this, Next.js is able to render the basic root page.</p>
      <p>The automatic redirect to /dashboard/overview has been temporarily disabled for this test.</p>
      <p>Please try navigating to <a href="/dashboard/overview" style={{color: 'blue', textDecoration: 'underline'}}>/dashboard/overview</a> manually.</p>
    </div>
  );
}
