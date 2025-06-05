// THIS IS /src/app/not-found.tsx - VERSION NF_SIMPLE_4
import Link from 'next/link';

export default function NotFound_NF_SIMPLE_4() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', border: '5px solid red', backgroundColor: 'pink' }}>
      <h1 style={{ fontSize: '48px', color: 'darkred' }}>NOT FOUND - CUSTOM (NF_SIMPLE_4)</h1>
      <p style={{ fontSize: '24px' }}>The page you requested could not be located by our custom not-found page.</p>
      <p style={{ marginTop: '30px' }}>
        <Link href="/" style={{ color: 'purple', textDecoration: 'underline', fontSize: '20px' }}>
          Go to Home Page
        </Link>
      </p>
    </div>
  );
}
