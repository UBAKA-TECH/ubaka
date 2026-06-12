/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL || "",
    NEXT_PUBLIC_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    NEXT_PUBLIC_API_URL: process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL || ""
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "ik.imagekit.io" }
    ]
  }
};

export default nextConfig;

