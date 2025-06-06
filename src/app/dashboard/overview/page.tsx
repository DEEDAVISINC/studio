
"use client";

import Image from 'next/image';

export default function OverviewPage() {
  return (
    <div style={{ padding: "20px", border: "1px solid black", backgroundColor: "white", color: "black" }}>
      <h1>Dashboard Overview - Minimal Test</h1>
      <p>If you can see this message, the redirect from the homepage and the basic rendering of the overview page are working.</p>
      <p>The 404 error you were seeing likely means an issue occurred while trying to render this page or its layout.</p>
      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h2>Placeholder Image:</h2>
        <Image
          src="https://placehold.co/600x400.png"
          alt="Placeholder image for dashboard overview"
          width={600}
          height={400}
          data-ai-hint="dashboard graph"
          priority // Adding priority as it might be an important visual element
        />
        <p style={{ fontSize: '0.8em', color: '#555', marginTop: '5px' }}>This is a placeholder image using next/image.</p>
      </div>
    </div>
  );
}
