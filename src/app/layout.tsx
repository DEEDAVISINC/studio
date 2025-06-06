
import type { Metadata } from 'next';
import './globals.css';
import { AppDataProvider } from '@/contexts/AppDataContext';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'FleetFlow - MINIMAL LAYOUT TEST',
  description: 'Minimal layout test for FleetFlow.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <div style={{ border: '5px solid green', padding: '10px', backgroundColor: 'lightyellow' }}>
          <h1 style={{ color: 'darkgreen', textAlign: 'center', fontSize: '1.5rem', backgroundColor: 'lightgreen', padding: '5px' }}>
            MINIMAL ROOT LAYOUT ACTIVE
          </h1>
          <AppDataProvider>
            {children}
            <Toaster />
          </AppDataProvider>
        </div>
      </body>
    </html>
  );
}
