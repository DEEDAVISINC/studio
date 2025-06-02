
// src/app/not-found.tsx

// Explicitly mark this page for static generation.
// This is important for ensuring Next.js can correctly build it,
// especially if there have been issues with its manifest.
export const dynamic = 'force-static';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'sans-serif',
      textAlign: 'center',
      backgroundColor: '#f3f4f6', // A light gray background
      color: '#1f2937' // A dark gray text color
    }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ef4444' /* A red color for emphasis */ }}>
        404 - Page Not Found (Custom)
      </h1>
      <p style={{ fontSize: '1.125rem', marginTop: '0.5rem', color: '#4b5563' /* A medium gray text color */ }}>
        Sorry, the page you are looking for could not be found.
      </p>
      <a
        href="/"
        style={{
          marginTop: '1.5rem',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          color: '#ffffff', // White text
          backgroundColor: '#3b82f6', // A blue background for the button
          textDecoration: 'none',
          borderRadius: '0.375rem', // Rounded corners
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)', // Subtle shadow
        }}
      >
        Go Back Home
      </a>
    </div>
  );
}
