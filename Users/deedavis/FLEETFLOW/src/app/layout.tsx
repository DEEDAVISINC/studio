
import type { Metadata } from 'next';
import './globals.css';
// import { AppDataProvider } from '@/contexts/AppDataContext'; // Temporarily removed
// import { Toaster } from '@/components/ui/toaster'; // Temporarily removed
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'FleetFlow - Diagnostic',
  description: 'Fleet Management Application - Diagnostic Mode',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* You can add specific head tags here if needed for diagnostics */}
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
        style={{ backgroundColor: 'lightyellow', border: '5px solid orange', padding: '10px' }}
      >
        <div style={{ padding: '20px', border: '2px dashed blue', margin: '20px', backgroundColor: 'lightblue' }}>
          <h1>ROOT LAYOUT - DIAGNOSTIC MODE</h1>
          <p>This is the simplified root layout.</p>
        </div>
        <main>{children}</main>
        {/* 
        <AppDataProvider>
          <main>{children}</main>
          <Toaster />
        </AppDataProvider>
        */}
      </body>
    </html>
  );
}
