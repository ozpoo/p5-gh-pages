module.exports = {
	reactStrictMode: false,
	output: 'export',
	webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  },
}