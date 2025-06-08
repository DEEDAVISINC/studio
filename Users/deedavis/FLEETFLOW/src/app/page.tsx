
import { redirect } from 'next/navigation';

/**
 * This is the root page of the application.
 * It immediately redirects the user to the dashboard overview page.
 */
export default function HomePage() {
  // Perform a server-side redirect to the main dashboard overview page.
  redirect('/dashboard/overview');

  // Note: The code below this redirect call will not be executed.
  // It's good practice to have a return statement for linters or type checkers,
  // but it's effectively unreachable.
  return null;
}
