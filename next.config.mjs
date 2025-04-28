/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: `${process.env.NEXT_PUBLIC_BASE_URL}`,
        port: "9000",
      },
    ],
  },
};

export default nextConfig;
