/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Intentionally keeping headers commented out for this diagnostic step.
  // If the preview issue was related to headers, this minimal config
  // without custom headers might behave differently.
  // async headers() {
  //   return [
  //     {
  //       // Apply these headers to all routes.
  //       source: '/:path*',
  //       headers: [
  //         {
  //           key: 'X-Frame-Options',
  //           value: 'ALLOWALL', // WARNING: For debugging only.
  //         },
  //         {
  //           key: 'Content-Security-Policy',
  //           // WARNING: For debugging only. Allows any origin to frame.
  //           // For production, restrict to specific origins or 'SAMEORIGIN'.
  //           value: "frame-ancestors *;",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
