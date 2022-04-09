const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // 清除 output 输出的文件夹
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 打包 html 文件
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin'); // 命令行信息显示优化
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 提取成单独的 css 文件

const projectRoot = process.cwd(); // 当前工作目录

const setMPA = () => {
  const entry = {};
  const webpackHtmlPlugins = [];
  const entryFiles = glob.sync(path.join(projectRoot, '/src/*/index.js'));
  Object.keys(entryFiles).map((k) => {
    const entryFile = entryFiles[k];
    const match = entryFile.match(/src\/(.*)\/index\.js/);
    const pageName = match && match[1];
    entry[pageName] = entryFile;
    return webpackHtmlPlugins.push(
      new HtmlWebpackPlugin({
        template: path.join(projectRoot, `./src/${pageName}/index.html`),
        filename: `${pageName}.html`,
        chunks: [pageName],
        inject: true, // 是否将资源注入 body 中
        minify: {
          html5: true,
          collapseWhitespace: true,
          preserveLineBreaks: false,
          minifyCSS: true,
          minifyJS: true,
          removeComments: false,
        },
      }),
    );
  });
  return { entry, webpackHtmlPlugins };
};

const { entry, webpackHtmlPlugins } = setMPA();
module.exports = {
  module: {
    entry,
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
    },
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader', // css 前缀自动不齐
          {
            loader: 'px2rem-loader', // px 转 rem
            options: {
              remUni: 75, // 设计稿的十分之一
              remPrecision: 8,
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
          'postcss-loader',
          {
            loader: 'px2rem-loader',
            options: {
              remUni: 75,
              remPrecision: 8,
            },
          },
        ],
      },
      {
        test: /\.(png|jpeg|jpg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 2480,
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        use: 'file-loader',
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(), // 清除 output 输出的文件夹

    new FriendlyErrorsWebpackPlugin(), // 命令行显示优化

    new MiniCssExtractPlugin({
      filename: 'styles/[name]_[contenhash:8].css',
    }),

    // 打包代码错误捕获
    function errorPlugin() {
      this.hooks.done.tap('done', (stats) => {
        if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') === -1) {
          console.log('build error'); // eslint-disable-line 禁用这一行，不进行校验
          process.exit(1);
        }
      });
    },
  ].concat(webpackHtmlPlugins),
};
