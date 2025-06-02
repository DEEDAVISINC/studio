
// src/app/not-found.tsx
export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      fontFamily: 'sans-serif',
      padding: '20px',
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>404 - Page Not Found</h1>
      <p style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>
        Sorry, the page you are looking for could not be found.
      </p>
      <a href="/" style={{
        color: '#0070f3',
        textDecoration: 'none',
        fontSize: '1rem',
      }}>
        Go Back Home
      </a>
    </div>
  );
}
