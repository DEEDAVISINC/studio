// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard/broker-box');
  // This return is technically unreachable but good practice
  return null;
}
