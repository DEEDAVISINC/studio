import type { Metadata } from 'next';
import './globals.css'; // Keep for basic Tailwind resets if needed, but could be removed too for max isolation

export const metadata: Metadata = {
  title: 'FleetFlow Root Test',
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
        <div style={{ border: '2px solid blue', padding: '20px', margin: '20px', backgroundColor: '#e0e0ff' }}>
          <h1>Minimal Root Layout Test</h1>
          <p>If you see this, the RootLayout is rendering.</p>
          <div style={{ border: '2px solid green', padding: '20px', margin: '10px', backgroundColor: '#e0ffe0' }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
