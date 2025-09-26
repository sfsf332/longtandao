/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'youke1.picui.cn',
        port: '',
        pathname: '/s1/**',
      },
    ],
  },
};

export default nextConfig;
