
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // NOTE: No ignorePatterns here, as it's not a valid Next.js ESLint config option directly.
    // Ignoring directories for ESLint should be handled in .eslintrc.json or eslint.config.js
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
        "https://6000-firebase-studio-1748402970575.cluster-ux5mmlia3zhhask7riihruxydo.cloudworkstations.dev",
        // Removed 9003 as we are now targeting 9004 primarily
        "https://9004-firebase-studio-1748402970575.cluster-ux5mmlia3zhhask7riihruxydo.cloudworkstations.dev"
    ],
  },
};

export default nextConfig;
