const webpack = require('webpack');
module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "url": require.resolve("url"),
        "buffer": require.resolve("buffer")
    })
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            // process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ])
    return config;
}