/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'i.ibb.co'],
  },
  webpack: (config, { isServer }) => {
    // Solución para el problema con el módulo 'canvas' en el lado del cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
