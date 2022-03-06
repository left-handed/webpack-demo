'use strict'
const path = require('path');
const webpack = require('webpack');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const glob = require('glob');
const HtmlWebpackPlugin = require("html-webpack-plugin");

// 多页面打包
const setMPA = () => {
  const entry = {};
  const webpackHtmlPlugins = [];
  // __dirname根目录；查询src下文件夹里的index.js; 返回文件地址绝对路径数组
  const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'));
  Object.keys(entryFiles).map((k) => {
    const entryFile = entryFiles[k];
    const match = entryFile.match(/src\/(.*)\/index\.js/);
    const pageName = match[1];
    entry[pageName] = entryFile;
    console.log(pageName, entry)
    webpackHtmlPlugins.push(
        new HtmlWebpackPlugin({
          template: path.join(__dirname, `src/${pageName}/index.html`), // 引入的 html 模板
          filename: `${pageName}.html`, // 输出的文件名称
          chunks: [pageName], // 对应 entry 的模块
          inject: true, // 是否将资源注入到 body 标签底部
          minify: {
            html5: true,
            collapseWhitespace: true,
            preserveLineBreaks: false,
            minifyCSS: true,
            minifyJS: true,
            removeComments: false
          },
        })
    )
  })
  return {entry, webpackHtmlPlugins};
};

let {entry, webpackHtmlPlugins} = setMPA();

module.exports = {
  mode: 'development',
  entry: entry,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {  
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ]
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.(png|jpeg|jpg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 2480,
            }
          }
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        use: 'flie-loader'
      },
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ].concat(webpackHtmlPlugins),

  devServer: {
    static: './dist',
    hot: true
  },

  optimization:{
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin({
        test: /\.(css | less)$/i, // 匹配文件
        parallel: true, // 使用多进程并发执行，提升构建速度
      }),
    ]
  }
}