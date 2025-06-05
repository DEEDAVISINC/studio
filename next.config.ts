/** @type {import('next').NextConfig} */
const nextConfig = {
    // ...other config options
    allowedDevOrigins: [
      "https://3000-firebase-studio-1748402970575.cluster-ux5mmlia3zhhask7riihruxydo.cloudworkstations.dev"
      // Add more origins as needed
    ],
    async headers() {
        return [
            {
                // Apply these headers to all routes.
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'ALLOWALL', // WARNING: For debugging only. More permissive than SAMEORIGIN.
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "frame-ancestors *;", // WARNING: For debugging only. Allows any origin.
                    },
                ],
            },
        ];
    },
  };
  
  module.exports = nextConfig;