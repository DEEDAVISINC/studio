/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Removed for default server-based behavior
  async headers() {
    return [
      {
        // Apply these headers to all routes.
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL', // WARNING: For debugging only.
          },
          {
            key: 'Content-Security-Policy',
            // WARNING: For debugging only. Allows any origin to frame.
            // For production, restrict to specific origins or 'SAMEORIGIN'.
            value: "frame-ancestors *;", 
          },
        ],
      },
    ];
  },
  // If you have specific origins for development tools that need Fast Refresh
  // you might re-add allowedDevOrigins here, but it's usually not needed
  // for basic preview functionality if headers are permissive.
  // allowedDevOrigins: [
  //   "https://3000-firebase-studio-1748402970575.cluster-ux5mmlia3zhhask7riihruxydo.cloudworkstations.dev"
  // ]
};

module.exports = nextConfig;
