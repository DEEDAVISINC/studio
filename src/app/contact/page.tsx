
export default function ContactPage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '1rem' }}>Contact Us</h1>
      <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>
        Get in touch with the FleetFlow team.
      </p>
      <form style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        <div>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '0.25rem', color: '#333' }}>Name:</label>
          <input type="text" id="name" name="name" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem' }} />
        </div>
        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.25rem', color: '#333' }}>Email:</label>
          <input type="email" id="email" name="email" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem' }} />
        </div>
        <div>
          <label htmlFor="message" style={{ display: 'block', marginBottom: '0.25rem', color: '#333' }}>Message:</label>
          <textarea id="message" name="message" rows={4} style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '0.25rem' }} />
        </div>
        <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Send Message</button>
      </form>
      <div style={{ marginTop: '1.5rem' }}>
        <a href="/" style={{ color: '#4285F4', textDecoration: 'none' }}>&larr; Back to Home</a>
      </div>
    </main>
  );
}
