
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppDataProvider } from '@/contexts/AppDataContext';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'FleetFlow - Streamlined Fleet Management',
  description: 'Manage your fleet efficiently with FleetFlow.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Apply inline style for very obvious red background */}
      <body 
        className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)} 
        style={{ backgroundColor: 'red !important', border: '10px solid lime' }}
      >
        <div style={{ border: '5px solid yellow', padding: '10px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <h1 style={{ color: 'white', textAlign: 'center', fontSize: '2rem', backgroundColor: 'blue', padding: '10px' }}>ROOT LAYOUT TEST - RED BACKGROUND / LIME BORDER ON BODY?</h1>
          <AppDataProvider>
            {children}
            <Toaster />
          </AppDataProvider>
        </div>
      </body>
    </html>
  );
}
