/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizePackageImports: ["gsap", "three", "@gsap/react"],
  },
  images: {
    // NOTE SÉCURITÉ : AVIF retiré volontairement. L'advisory GHSA-2xp9-vwfh-vxw4
    // (RCE critique via libheif/sharp sur l'optimisation AVIF) n'est patché que
    // dans next >=15.5.24 / >=16.3.3. Next 14 ne pouvant pas être patché, on
    // sert du WebP en attendant l'upgrade de cycle (priorité haute).
    formats: ["image/webp"],
    deviceSizes: [320, 420, 768, 1024, 1200, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000,
  },
  async headers() {
    // Content-Security-Policy : liste exhaustive des origines réellement utilisées.
    // 'unsafe-inline' requis pour GSAP (inline styles) et le script de thème.
    // 'unsafe-eval' requis pour Three.js (WebGL shader compilation via eval sur certains moteurs).
    const CSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.clarity.ms",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com",
      "media-src 'self' blob:",
      "connect-src 'self' https://www.clarity.ms https://b.clarity.ms https://api.resend.com",
      "worker-src 'self' blob:",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Content-Security-Policy",
            value: CSP,
          },
        ],
      },
      // Cache agressif uniquement en production. En dev, les chunks Next ne
      // sont pas hashés de façon stable : un cache immutable sert l'ancien JS
      // avec le nouveau HTML → erreurs d'hydratation et modifications invisibles.
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              source: "/_next/static/:path*",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
            // Images/vidéos statiques : 1 an, revalidation
            {
              source: "/img/:path*",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
            {
              source: "/NV-IMG/:path*",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
            {
              source: "/fonts/:path*",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
          ]
        : []),
    ];
  },
};

export default nextConfig;