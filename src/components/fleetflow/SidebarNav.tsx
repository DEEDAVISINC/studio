
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Truck,
  CalendarDays,
  Users,
  Briefcase,
  Route,
  Settings,
  Blocks, // Icon for Load Optimization
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/trucks', label: 'Trucks', icon: Truck },
  { href: '/dashboard/schedules', label: 'Schedules', icon: CalendarDays },
  { href: '/dashboard/drivers', label: 'Drivers', icon: Users },
  { href: '/dashboard/carriers', label: 'Carriers', icon: Briefcase },
  { href: '/dashboard/optimize-route', label: 'Optimize Route', icon: Route },
  { href: '/dashboard/optimize-load', label: 'Optimize Load', icon: Blocks },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 border-r bg-card shadow-sm">
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10',
              pathname === item.href && 'bg-primary/10 text-primary font-medium',
               // Highlight parent if on a sub-route, except for overview
              (pathname.startsWith(item.href) && item.href !== '/dashboard/overview' && pathname !== '/dashboard/overview') && 'bg-primary/10 text-primary font-medium'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t">
         <Link
            href="/dashboard/settings" 
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10',
              pathname === '/dashboard/settings' && 'bg-primary/10 text-primary font-medium'
            )}
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
      </div>
    </aside>
  );
}
