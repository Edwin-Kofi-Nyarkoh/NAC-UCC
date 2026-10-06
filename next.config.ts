import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Lets a phone on the same Wi-Fi open the dev server by this address
  allowedDevOrigins: ["192.168.1.155"],
  images: {
    // Every picture comes from Cloudinary already resized and compressed (see
    // src/lib/cloudinary.ts), so browsers fetch it straight from there. Passing
    // it through this server as well would only add a hop that can time out.
    unoptimized: true,
  },
}

export default nextConfig
