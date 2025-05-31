
import { redirect } from 'next/navigation';

export default function HomePage() {
  // This will perform a server-side redirect to the overview page.
  // Ensure that '/dashboard/overview' is a valid and working route.
  redirect('/dashboard/overview');

  // Note: Content below this redirect call will not be rendered
  // because the redirect interrupts the rendering process.
  // You can return null or some minimal JSX if your linter requires a return statement,
  // but it's effectively unreachable.
  return null;
}
