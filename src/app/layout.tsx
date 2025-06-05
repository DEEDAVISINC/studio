
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
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <AppDataProvider>
          {children}
          <Toaster />
        </AppDataProvider>
      </body>
    </html>
  );
}
