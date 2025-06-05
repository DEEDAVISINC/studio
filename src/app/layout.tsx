// THIS IS /src/app/layout.tsx - VERSION L_SIMPLE_NO_GLOBALS_5
// import './globals.css'; // Explicitly NOT importing globals.css for this test

export const metadata = {
  title: 'FleetFlow App - Debugging Layout L_SIMPLE_NO_GLOBALS_5',
  description: 'FleetFlow app, attempting to resolve 404s - L_SIMPLE_NO_GLOBALS_5.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ border: '10px solid orange', backgroundColor: 'lightyellow', margin: 0, padding: 0, fontFamily: 'Arial, sans-serif' }}>
        {/* <AppDataProvider> */}
          <div style={{ padding: '20px', border: '5px dashed purple', backgroundColor: 'lavender' }}>
            <h2 style={{ color: 'purple', margin: '10px', border: '2px solid purple', padding: '5px' }}>
              ROOT LAYOUT (L_SIMPLE_NO_GLOBALS_5) - ACTIVE
            </h2>
            <p>Timestamp: {new Date().toISOString()}</p>
            {children}
          </div>
          {/* <Toaster /> */}
        {/* </AppDataProvider> */}
      </body>
    </html>
  );
}
