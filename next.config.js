/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fixe la racine du workspace (un lockfile parasite dans un dossier parent
  // faisait deviner la mauvaise racine a Turbopack)
  turbopack: {
    root: __dirname,
  },
  // Configuration pour éviter les problèmes CORS en dev
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
