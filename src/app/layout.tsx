
// THIS IS /src/app/layout.tsx - VERSION L_SIMPLE_WITH_GLOBALS_3
import type { Metadata } from 'next';
import './globals.css'; // Re-enable globals.css

export const metadata: Metadata = {
  title: 'FleetFlow Minimal Layout Test L_SIMPLE_WITH_GLOBALS_3',
  description: 'Testing root layout L_SIMPLE_WITH_GLOBALS_3',
};

export default function RootLayout_L_SIMPLE_WITH_GLOBALS_3({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, border: '5px solid blue', backgroundColor: 'lightblue' }}>
        <div style={{ padding: '20px', border: '3px dashed darkblue' }}>
          <h2 style={{ color: 'darkblue' }}>ROOT LAYOUT L_SIMPLE_WITH_GLOBALS_3 - ACTIVE</h2>
          {children}
        </div>
      </body>
    </html>
  );
}
