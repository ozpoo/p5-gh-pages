module.exports = {
	reactStrictMode: false,
	output: 'export',
	webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false }
    return config
  },
  compiler: {
    removeConsole: true
  }
}