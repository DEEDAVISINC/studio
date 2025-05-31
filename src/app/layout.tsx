
import type { Metadata } from 'next';

// Removed globals.css import for maximum simplicity
// import './globals.css';

export const metadata: Metadata = {
  title: 'FleetFlow Root Test Minimal',
  description: 'Testing Root Layout and Page Rendering - Minimal Version',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div style={{ border: '5px solid blue', padding: '20px', margin: '20px', backgroundColor: '#e0e0ff' }}>
          <h1>EXTREMELY MINIMAL Root Layout (layout.tsx)</h1>
          <p>If you see this, the RootLayout is rendering.</p>
          <div style={{ border: '5px solid green', padding: '20px', margin: '10px', backgroundColor: '#e0ffe0' }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
