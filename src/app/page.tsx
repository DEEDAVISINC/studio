
export default function HomePage() {
  return (
    <div style={{ padding: "50px", textAlign: "center", fontFamily: "sans-serif", backgroundColor: "#f0f0f0" }}>
      <h1 style={{ color: "orange", fontSize: "2em", border: "2px dashed orange", padding: "20px" }}>DIAGNOSTIC TEST PAGE</h1>
      <p style={{ fontSize: "1.2em", marginTop: "20px" }}>If you are seeing this message, it means the content of <strong><code>src/app/page.tsx</code></strong> has been updated by the AI.</p>
      <p style={{ fontSize: "1.2em" }}>You should <strong>NOT</strong> be seeing the "Welcome to FleetFlow" content right now.</p>
      <p style={{ marginTop: "30px" }}>Please report back what you see at the root URL of your application.</p>
    </div>
  );
}
