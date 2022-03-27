const webpacckMerge = require('webpack-merge');
const webpack = require('webpack');
const baseConfig = require('./base.config');

const devConfig = {
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // 代码热更新
  ],

  // 给出服务启动位置以及内容的一些基本信息
  devServer: {
    static: './dist',
  },

  devtool: 'source-map',
};

module.exports = webpacckMerge(baseConfig, devConfig);
