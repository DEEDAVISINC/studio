
// THIS IS /src/app/not-found.tsx - VERSION NF_SIMPLE_5
import Link from 'next/link';

export default function NotFound_NF_SIMPLE_5() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', border: '10px solid darkred', backgroundColor: 'pink' }}>
      <h1 style={{ fontSize: '48px', color: 'maroon', margin: '10px', border: '2px solid maroon', padding: '5px' }}>NOT FOUND - CUSTOM (NF_SIMPLE_5)</h1>
      <p style={{ fontSize: '24px', color: 'darkred' }}>The page you requested could not be located by our custom not-found page (NF_SIMPLE_5).</p>
      <p style={{ marginTop: '30px' }}>
        <Link href="/" style={{ color: 'purple', textDecoration: 'underline', fontSize: '20px' }}>
          Go to Home Page (NF_SIMPLE_5)
        </Link>
      </p>
    </div>
  );
}
