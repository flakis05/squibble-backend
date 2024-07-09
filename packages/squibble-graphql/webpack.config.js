const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'production',
    plugins: [
        new CopyPlugin({
            patterns: [{ from: path.resolve(__dirname, './src/schema'), to: path.resolve(__dirname, './dist/schema') }]
        })
    ]
};