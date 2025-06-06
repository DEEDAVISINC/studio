
export default function AboutPage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '1rem' }}>About FleetFlow</h1>
      <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
        This is the about page for the FleetFlow application. We aim to provide the best fleet management solutions.
      </p>
      <div style={{ marginTop: '1.5rem' }}>
        <a href="/" style={{ color: '#4285F4', textDecoration: 'none' }}>&larr; Back to Home</a>
      </div>
    </main>
  );
}
