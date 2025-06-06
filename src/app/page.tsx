
export default function Page() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', color: '#4285F4' }}>
          <path d="M20 10H4C2.89543 10 2 10.8954 2 12C2 13.1046 2.89543 14 4 14H5V17C5 17.5523 5.44772 18 6 18C6.55228 18 7 17.5523 7 17V14H17V17C17 17.5523 17.4477 18 18 18C18.5523 18 19 17.5523 19 17V14H20C21.1046 14 22 13.1046 22 12C22 10.8954 21.1046 10 20 10ZM7 6H3V8H7V6ZM14 6H10V8H14V6Z" fill="currentColor"/>
          <path d="M20.8125 4.3125C20.3958 3.47917 19.5208 2.91667 18.5625 2.91667H5.4375C4.47917 2.91667 3.60417 3.47917 3.1875 4.3125L2.0625 6.9375C1.89583 7.3125 2.02083 7.75 2.375 7.95833C2.72917 8.16667 3.1875 8.04167 3.39583 7.6875L4.5625 5.0625C4.70833 4.72917 5.0625 4.5 5.4375 4.5H18.5625C18.9375 4.5 19.2917 4.72917 19.4375 5.0625L20.6042 7.6875C20.6875 7.85417 20.8333 7.97917 21 7.97917C21.0625 7.97917 21.125 7.95833 21.1875 7.9375C21.5625 7.75 21.6875 7.3125 21.5208 6.9375L20.8125 4.3125Z" fill="currentColor"/>
        </svg>
        <h1 style={{ fontSize: '2.5rem', color: '#333', margin: '0.5rem 0' }}>Welcome to FleetFlow!</h1>
      </div>
      <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>This is your main dashboard page content.</p>
      <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>You can navigate to other parts of your application using the links (if available in your layout) or by directly changing the URL.</p>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <a href="/about" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#4285F4', color: 'white', textDecoration: 'none', borderRadius: '0.375rem' }}>About Page</a>
        <a href="/contact" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#34A853', color: 'white', textDecoration: 'none', borderRadius: '0.375rem' }}>Contact Page</a>
        <a href="/api/hello" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#FBBC05', color: '#333', textDecoration: 'none', borderRadius: '0.375rem' }}>API Hello</a>
      </div>
    </main>
  );
}
