
// THIS IS /src/app/layout.tsx - VERSION L_SIMPLE_NO_GLOBALS_4
import type { Metadata } from 'next';
// import './globals.css'; // INTENTIONALLY COMMENTED OUT FOR THIS TEST

export const metadata: Metadata = {
  title: 'FleetFlow Minimal Layout Test L_SIMPLE_NO_GLOBALS_4',
  description: 'Testing root layout L_SIMPLE_NO_GLOBALS_4',
};

export default function RootLayout_L_SIMPLE_NO_GLOBALS_4({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, border: '10px solid navy', backgroundColor: 'lightblue' }}>
        <div style={{ padding: '20px', border: '5px dashed darkblue', backgroundColor: 'aliceblue' }}>
          <h2 style={{ color: 'navy', margin: '10px', border: '2px solid navy', padding: '5px' }}>ROOT LAYOUT L_SIMPLE_NO_GLOBALS_4 - ACTIVE</h2>
          {children}
        </div>
      </body>
    </html>
  );
}
