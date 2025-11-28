/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        pg: false,
        'pg-hstore': false,
        'pg-native': false,
        'pg-pool': false,
        pgpass: false,
        'pg-connection-string': false,
      };
    }
    
    config.externals = config.externals || [];
    config.externals.push({
      'pg-hstore': 'commonjs pg-hstore',
    });
    
    return config;
  },
  turbopack: {}, // Empty config to silence warning
};

module.exports = nextConfig;
