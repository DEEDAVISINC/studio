// THIS IS /src/app/not-found.tsx - VERSION NF_BAREBONES_2
import React from 'react';

export default function MinimalNotFound() { // Changed name to be distinct
  return (
    <div style={{ padding: '50px', textAlign: 'center', backgroundColor: 'lightcoral', border: '5px solid darkred', margin: '20px' }}>
      <h1 style={{ fontSize: '48px', color: 'darkred' }}>MINIMAL NOT FOUND PAGE (NF_BAREBONES_2)</h1>
      <p style={{ fontSize: '24px' }}>If you see this, the minimal src/app/not-found.tsx is working.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}
