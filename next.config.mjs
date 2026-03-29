/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pyodide'],
  webpack: (config, { isServer }) => {
    // Prevent webpack from trying to bundle any node: built-in modules.
    // Pyodide references these; they must never be bundled on the client.
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      'node:child_process': false,
      'node:crypto':        false,
      'node:fs':            false,
      'node:fs/promises':   false,
      'node:path':          false,
      'node:os':            false,
      'node:url':           false,
      'child_process':      false,
      'crypto':             false,
      'fs':                 false,
      'path':               false,
      'os':                 false,
    };

    // Completely exclude pyodide from webpack bundling on both sides.
    // The dynamic import() in the browser will load it at runtime from CDN.
    const existingExternals = config.externals || [];
    const externalsArray = Array.isArray(existingExternals)
      ? existingExternals
      : [existingExternals];

    config.externals = [
      ...externalsArray,
      ({ request }, callback) => {
        if (request === 'pyodide' || (request && request.startsWith('pyodide/'))) {
          return callback(null, 'commonjs ' + request);
        }
        callback();
      },
    ];

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
