'use strict';
module.exports = {
    entry: ['babel-polyfill', './src/app.js'],
    output: {
        path: __dirname + '/build/assets',
        filename: "bundle.js",
        publicPath: "/assets"
    },
    devServer: {
        inline: true,
        contentBase: './build',
        port: 8080
    },
    module: {
        rules: require("./rules.config")
    }
}