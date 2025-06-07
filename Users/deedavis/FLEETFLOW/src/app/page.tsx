
export default function Page() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <div style={{ marginBottom: '2rem' }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', color: '#4285F4' }}>
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h1 style={{ fontSize: '2.5rem', color: '#333', margin: '0.5rem 0' }}>FleetFlow App</h1>
      </div>
      <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
        This is the main page of the FleetFlow application.
      </p>
      <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
        If you are seeing this, the Next.js app is rendering!
      </p>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <a href="/dashboard/overview" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#4285F4', color: 'white', textDecoration: 'none', borderRadius: '0.375rem' }}>Go to Dashboard</a>
      </div>
    </main>
  );
}
