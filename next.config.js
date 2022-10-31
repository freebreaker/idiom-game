/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  rewrites: () => {
    return {
      fallback: [
        {
          source: '/:path*',
          destination: `http://localhost:3000/:path*`,
        },
      ],
    }
  }
}

module.exports = nextConfig
