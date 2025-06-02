
// src/app/not-found.tsx

export const dynamic = 'force-static'; // Explicitly mark as static

export default function NotFound() {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for could not be found.</p>
      <a href="/">Go Back Home</a>
    </div>
  );
}
