"use strict";
const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        library: [
            'react',
            'react-dom',
        ]
    },

    output: {
        filename: "[name]_[hash:8].Dll.js",
        path: path.join(__dirname, 'build/library'), // 输出地址
        library: "[name]_[hash:8]"
    },

    plugins: [
        new webpack.DllPlugin({
            name: "[name]_[hash:8]",
            path: path.join(__dirname, 'build/library/[name].json') // library.json 生成路径
        })
    ]
}
