// THIS IS /src/app/layout.tsx - VERSION L_SIMPLE_NO_GLOBALS_5
import React from 'react';

export default function RootLayout_L_SIMPLE_NO_GLOBALS_5({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ border: '10px solid orange', padding: '10px', margin: '10px' }}>
      <body style={{ backgroundColor: 'lavender', padding: '20px', margin: '10px', border: '5px solid purple' }}>
        <div style={{ border: '3px dashed red', padding: '15px', margin: '5px', backgroundColor: 'lightyellow' }}>
          <h1 style={{ color: 'blue', textAlign: 'center', fontSize: '28px' }}>Root Layout (L_SIMPLE_NO_GLOBALS_5)</h1>
          <p style={{ textAlign: 'center' }}>Timestamp from layout: {new Date().toISOString()}</p>
          {children}
        </div>
      </body>
    </html>
  );
}
