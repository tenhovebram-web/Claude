/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Tenant-Logos werden per URL eingebunden (White-Label). Bei Bedarf hier
  // erlaubte Remote-Hosts (z. B. Supabase Storage) whitelisten.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

export default nextConfig;
