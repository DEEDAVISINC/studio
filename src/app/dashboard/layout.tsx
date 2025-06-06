
import type { ReactNode } from 'react';
import { SidebarNav } from '@/components/fleetflow/SidebarNav';
import { SiteHeader } from '@/components/fleetflow/SiteHeader';

export default function DashboardAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <SiteHeader />
      <div className="flex flex-1">
        <SidebarNav />
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
