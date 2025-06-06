/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Apply these headers to all routes.
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            // WARNING: ALLOWALL is non-standard and primarily for older browser compatibility.
            // It's better to rely on Content-Security-Policy's frame-ancestors.
            // For debugging, we're trying everything.
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            // WARNING: EXTREMELY PERMISSIVE - FOR DEBUGGING ONLY.
            // Allows any origin to frame your application.
            // For production, you MUST restrict this to 'self' or specific trusted origins.
            value: "frame-ancestors *;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
