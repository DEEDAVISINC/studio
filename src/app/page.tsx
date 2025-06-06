
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the dashboard overview page.
  // This effectively "removes" the static welcome page content.
  redirect('/dashboard/overview');
  
  // This part of the component will not be reached due to the redirect,
  // but a return statement is typically expected for a React component.
  return null;
}
