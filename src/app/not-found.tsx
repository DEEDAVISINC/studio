import React from 'react';

export default function MinimalNotFound() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightcoral', border: '5px solid darkred', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '3rem' }}>MINIMAL NOT FOUND PAGE (NF_BAREBONES_1)</h1>
      <p style={{ fontSize: '1.5rem' }}>If you see this, the simplified not-found page is working.</p>
      <p>The previous error was: "The default export is not a React Component in /404/not-found".</p>
    </div>
  );
}
