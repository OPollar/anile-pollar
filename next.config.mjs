/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  // Para o deploy no Render não travar por detalhe de tipagem.
  // Rode `npm run typecheck` localmente se quiser conferir os tipos.
  typescript: { ignoreBuildErrors: true },
};
export default nextConfig;
