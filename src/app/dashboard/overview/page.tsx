
import Image from 'next/image';

export default function OverviewPage() {
  return (
    <div style={{ padding: "20px", border: "1px solid green", backgroundColor: "lightgreen", color: "darkgreen" }}>
      <h1>Dashboard Overview - Page with Sidebar</h1>
      <p>If you see this, the dashboard overview page is rendering within its layout, which includes the sidebar.</p>
      <div style={{ marginTop: '20px', border: '1px dashed blue', padding: '10px'}}>
        <p>Placeholder image below:</p>
        <Image
            src="https://placehold.co/600x400.png"
            alt="Placeholder image for dashboard overview"
            width={600}
            height={400}
            data-ai-hint="office business"
        />
      </div>
    </div>
  );
}
