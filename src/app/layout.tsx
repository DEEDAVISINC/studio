
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from "@/lib/utils";
import { AppDataProvider } from '@/contexts/AppDataContext';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: 'FleetFlow',
    template: '%s | FleetFlow',
  },
  description: 'Efficiently manage your trucking fleet, schedules, and operations with FleetFlow.',
  icons: {
    // TODO: Add actual icon paths if you have them in /public
    // icon: '/favicon.ico',
    // apple: '/apple-touch-icon.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <AppDataProvider>
          {children}
          <Toaster />
        </AppDataProvider>
      </body>
    </html>
  );
}
