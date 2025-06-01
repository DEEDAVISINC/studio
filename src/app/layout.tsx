
import type { Metadata } from 'next';
import './globals.css'; // Re-adding this

export const metadata: Metadata = {
  title: 'FleetFlow - Root Test',
  description: 'Testing Root Layout and Page Rendering',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div style={{ border: '2px solid blue', padding: '10px', margin: '10px', backgroundColor: '#f0f8ff' }}>
          <h2>MINIMAL Root Layout (layout.tsx)</h2>
          <p>If you see this, the RootLayout is rendering.</p>
          <div style={{ border: '2px solid green', padding: '10px', margin: '5px', backgroundColor: '#f0fff0' }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
