
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
    // Removed ignorePatterns from here as it's not a valid option
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
        "https://9003-firebase-studio-1748402970575.cluster-ux5mmlia3zhhask7riihruxydo.cloudworkstations.dev",
        "https://9004-firebase-studio-1748402970575.cluster-ux5mmlia3zhhask7riihruxydo.cloudworkstations.dev" // Added new origin for port 9004
    ],
  },
};

export default nextConfig;
