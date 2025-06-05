
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/fleetflow/SiteHeader';
import { SidebarNav } from '@/components/fleetflow/SidebarNav';

export const metadata: Metadata = {
  title: 'FleetFlow Dashboard',
  description: 'Manage your trucking fleet efficiently.',
};

export default function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <SiteHeader />
      <div className="flex flex-1">
        <SidebarNav />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
