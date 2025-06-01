// No imports
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div style={{ border: '5px solid purple', padding: '15px', margin: '15px', backgroundColor: '#e6e6fa' }}>
          <h1>EXTREMELY MINIMAL RootLayout</h1>
          {children}
        </div>
      </body>
    </html>
  );
}
