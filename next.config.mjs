/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // O mapa do vilarejo é pixel art ampliada: qualidade alta evita artefatos visíveis.
    qualities: [75, 92]
  }
};

export default nextConfig;
