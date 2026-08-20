import type { NextConfig } from "next";

const avatarRemotePatterns: Array<{
  protocol: "http" | "https";
  hostname: string;
  port: string;
  pathname: string;
}> = [];

// Limit the image optimizer to this project's public Supabase avatar bucket.
try {
  const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  if (supabaseUrl.protocol === "http:" || supabaseUrl.protocol === "https:") {
    avatarRemotePatterns.push({
      protocol: supabaseUrl.protocol.slice(0, -1) as "http" | "https",
      hostname: supabaseUrl.hostname,
      port: supabaseUrl.port,
      pathname: "/storage/v1/object/public/avatars/**",
    });
  }
} catch {
  // src/lib/supabase.ts reports a clearer error when the URL is missing or invalid.
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: avatarRemotePatterns,
  },
};

export default nextConfig;
