
import Link from 'next/link';

// THIS IS A SUPER BASIC NOT FOUND PAGE FOR DEBUGGING - VERSION 3

export default function NotFound() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: 'red', fontSize: '36px', fontWeight: 'bold' }}>
        NOT FOUND - DEBUG V3
      </h1>
      <p style={{ fontSize: '18px' }}>
        If you see this, the simplified not-found.tsx file IS being used.
      </p>
      <p style={{ marginTop: '30px' }}>
        <Link href="/dashboard/overview" style={{ color: 'blue', textDecoration: 'underline' }}>
          Go to Dashboard Overview
        </Link>
      </p>
    </div>
  );
}
