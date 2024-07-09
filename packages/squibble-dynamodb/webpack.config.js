const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    target: 'node',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: path.resolve(__dirname, './generated/schema/*'), to: path.resolve(__dirname, './dist/') }]
        })
    ]
};