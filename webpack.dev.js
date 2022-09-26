/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const { responseInterceptor } = require('http-proxy-middleware');
const common = require('./webpack.config.js');

module.exports = {
    ...common,
    mode: 'development',
    optimization: {
        minimize: false
    },
    devServer: {
        host: '0.0.0.0', // This allows you to access the server from other computers on the network
        hot: 'only', // Use hot-reloading to inject changes as you develop, but don't reload the page
        proxy: {
            '/api/': {
                target: 'https://module.oooh.io/', // Requests to relative /api/ are served by https://module.oooh.io/api/
                changeOrigin: true,
                autoRewrite: true,
                selfHandleResponse: true,
                onProxyRes: responseInterceptor((buffer, proxyRes, req, res) => {
                    const src = buffer.toString('utf8');
                    if (req.url.endsWith('/o3h.js')) {
                        // Turn the local development flag on, commenting the original line
                        return 'const LOCAL_DEVELOPMENT = true; //' + src;
                    }
                    return src;
                })
            }
        }
    }
};
