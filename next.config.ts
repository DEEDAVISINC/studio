
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
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
        "https://9002-firebase-studio-1748402970575.cluster-ux5mmlia3zhhask7riihruxydo.cloudworkstations.dev",
        "https://6000-firebase-studio-1748402970575.cluster-ux5mmlia3zhhask7riihruxydo.cloudworkstations.dev"
    ],
  },
};

export default nextConfig;
