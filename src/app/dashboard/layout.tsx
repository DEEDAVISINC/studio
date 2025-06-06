
import type { ReactNode } from 'react';

export default function DashboardAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div style={{ border: '2px solid blue', padding: '10px' }}>
      <h2 style={{ color: 'blue' }}>Dashboard Layout</h2>
      <main>{children}</main>
    </div>
  );
}
