'use strict'

const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // 清除 output 输出的文件夹
const glob = require('glob');
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 打包 html 文件
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin'); // 命令行信息显示优化 

const setMPA = () => {
  const entry = null, webpackHtmlPlugins = [];
  const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'));
  Object.keys(entryFiles).map((k) => {
    const entryFile = entryFiles[k];
    const match = entryFile.match(/src\/(.*)\/index\.js /);
    const pageName = match[1];
    entry[pageName] = entryFile;
    webpackHtmlPlugins.push(
      new HtmlWebpackPlugin({
        template: path.join(__dirname, `./src/${pageName}/index.html`),
        filename: `${pageName}.html`,
        chunks: [pageName],
        inject: true, // 是否将资源注入 body 中 
        minify: {
          html5: true,
          collapseWhitespace: true,
          preserveLineBreaks: false,
          minifyCSS: true,
          minifyJS: true,
          removeComments: false
        }
      })
    )
  })
  return {entry, webpackHtmlPlugins};
}

const {entry, webpackHtmlPlugins} = setMPA();
module.exports = {
  module: {
    entry: entry,
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist')
    },
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
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
          'postcss-loader', // css 前缀自动补齐
          {
            loader: "px2rem-loader", // px 转 rem
            options: {
              remUni: 75, // 设计稿的十分之一
              remPrecision: 8
            }
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader',
          'postcss-loader',
          {
            loader: "px2rem-loade",
            options: {
              remUni: 75,
              remPrecision: 8
            }
          }
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
    new CleanWebpackPlugin(), // 清除 output 输出的文件夹

    new FriendlyErrorsWebpackPlugin(), // 命令行显示优化

    // 打包代码错误捕获
    function() {
      this.hooks.done.tap('done', (stats) => {
          if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') == -1)
          {
              console.log('build error');
              process.exit(1);
          }
      })
    },
  ].concat(webpackHtmlPlugins)
}