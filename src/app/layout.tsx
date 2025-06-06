
import type { Metadata } from 'next';
import './globals.css';
import { AppDataProvider } from '@/contexts/AppDataContext';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'FleetFlow - Diagnostic',
  description: 'Diagnosing rendering issues.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={cn(
          "min-h-screen bg-yellow-200 font-sans antialiased", 
          inter.variable
        )}
      >
        <div style={{ border: '5px solid red', padding: '20px', backgroundColor: 'lightcoral', color: 'white', textAlign: 'center', fontSize: '20px' }}>
          ROOT LAYOUT IS ACTIVE - DIAGNOSTIC MODE
        </div>
        <AppDataProvider>
          <main>{children}</main>
          <Toaster />
        </AppDataProvider>
      </body>
    </html>
  );
}
