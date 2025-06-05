
import type { Metadata } from 'next';
import { AppDataProvider } from '@/contexts/AppDataContext';
import { Toaster } from '@/components/ui/toaster';
import './globals.css'; // Re-enable globals.css

export const metadata: Metadata = {
  title: 'FleetFlow App - Debugging Layout',
  description: 'FleetFlow app, attempting to resolve 404s.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ border: '10px solid teal', backgroundColor: 'lightcyan', margin: 0, padding: 0 }}>
        <AppDataProvider>
          <div style={{ padding: '20px', border: '5px dashed darkcyan', backgroundColor: 'azure' }}>
            <h2 style={{ color: 'teal', margin: '10px', border: '2px solid teal', padding: '5px' }}>
              ROOT LAYOUT (Restored Globals & Context) - ACTIVE
            </h2>
            {children}
          </div>
          <Toaster />
        </AppDataProvider>
      </body>
    </html>
  );
}
