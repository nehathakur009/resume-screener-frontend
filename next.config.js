/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  eslint:         { ignoreDuringBuilds: true },
  typescript:     { ignoreBuildErrors: true },
}

module.exports = nextConfig
