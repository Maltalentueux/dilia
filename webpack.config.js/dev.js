const path = require('path');

const webpackMerge = require('webpack-merge');
const commonConfig = require('./common');
const DefinePlugin = require('webpack').DefinePlugin;

const outputDir = path.join(path.dirname(__dirname), '/public/');

module.exports = webpackMerge(commonConfig, {
    debug: true,
    devtool: 'source-map',
    devServer: {
        inline: true,
        colors: true,
        historyApiFallback: false,
        contentBase: 'public/',
        publicPath: '/',
        port: 8001,
        proxy: {
            '/api/*': 'http://localhost:8000/',
            '/socket.io/*': 'http://localhost:8000/',
        }
    },
    output: {
        path: outputDir,
        filename: 'js/[name].js',
        chunkFilename: 'js/[id].chunk.js',
        sourceMapFilename: 'js/[name].map.js'
    },
    plugins: [
        new DefinePlugin({
            VERSION: "1.0",
            IS_PRODUCTION: false,
        }),
    ],
});