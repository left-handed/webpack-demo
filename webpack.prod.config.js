'use strict'

const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 提取成单独的 css 文件
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin"); // 压缩 css 文件
const TerserPlugin = require("terser-webpack-plugin"); // 压缩 JS 文件 webpack5
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 压缩 HTML 代码
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // 清除 output 输出的文件夹
const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin").default; // CSS 内联到Html文件
const glob = require('glob'); // 对页面打包插件
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');// CDN 引入不将依赖包打入bundle文件中
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin'); // 进行打包命令行优化
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

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
        webpackHtmlPlugins.push(
            new HtmlWebpackPlugin({
                template: path.join(__dirname, `src/${pageName}/index.html`), // 引入的 html 模板
                filename: `${pageName}.html`, // 输出的文件名称
                chunks: ['vendors', pageName], // 对应 entry 的模块
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

const smp = new SpeedMeasurePlugin(); // 时间维度分析各个插件的打包时间

module.exports = smp.wrap(
  {
      mode: 'none',
      // 入口
      entry: entry,
      // 输出到哪
      output: {
          filename: '[name]_[chunkhash:8].js',
          path: path.resolve(__dirname, 'dist'),
      },

      module: {
          rules: [
              {
                  test: /\.js$/,
                  exclude: /(node_modules)/,
                  use: [
                      {
                          loader: "thread-loader", // 每次 webpack 解析一个模块时，thread-loader 会将他及他的依赖分配给 worker 线程中
                          options: {
                              workers: 3
                          }
                      },{
                          loader: 'babel-loader', // js文件转换
                          options: {
                              presets: ['@babel/preset-env'],
                          },
                      }
                  ]
              },
              {
                  test: /\.css$/,
                  use: [
                      MiniCssExtractPlugin.loader,
                      'css-loader',
                      'postcss-loader', // css 自动补全
                      {
                          loader: "px2rem-loader", // px 转换 rem
                          options: {
                              remUni: 75,
                              remPrecision: 8,
                          }
                      }
                  ]
              },
              {
                  test: /\.less$/,
                  use: [
                      MiniCssExtractPlugin.loader,
                      'css-loader', // 打包css 文件
                      'less-loader', // 导报less 文件
                      'postcss-loader', // css 自动补全
                      {
                          loader: "px2rem-loader", // px 转换 rem
                          options: {
                              remUni: 75,
                              remPrecision: 8 // 转换成功保留的小数点后面的位数
                          }
                      }
                  ]
              },
              {
                  test: /\.(png|jpeg|jpg)$/i,
                  loader: 'file-loader',
                  options: {
                      name: 'assets/[name]_[hash:8].[ext]'
                  }
              },
              {
                  test: /\.(woff|woff2|eot|ttf|otf)$/i,
                  loader: 'file-loader',
                  options: {
                      name: 'fonts/[name]_[hash:8].[ext]'
                  }
              },
          ]
      },

      // 插件 （ 处理loader不能处理的模块，打包到优化。）
      plugins: [
          new CleanWebpackPlugin(),

          // 将依赖包通过CND引入，不打入bundle
          new HtmlWebpackExternalsPlugin({
              externals: [
                  {
                      module: 'react',
                      entry: 'https://unpkg.com/react@17.0.2/umd/react.production.min.js',
                      global: 'React'
                  },
                  {
                      module: 'react-dom',
                      entry: 'https://unpkg.com/react-dom@17.0.2/umd/react-dom.production.min.js',
                      global: 'ReactDOM'
                  }
              ]
          }),

          // css文件指纹
          new MiniCssExtractPlugin({
              filename: 'styles/[name]_[contenthash:8].css'
          }),

          new HTMLInlineCSSWebpackPlugin(),

          new FriendlyErrorsWebpackPlugin(),

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
      ].concat(webpackHtmlPlugins),

      // 优化
      optimization:{
          minimizer: [
              // Css 代码压缩
              new CssMinimizerPlugin({
                  test: /\.css$/i, // 匹配文件
                  parallel: true, // 使用多进程并发执行，提升构建速度
              }),
              // JS 代码压缩
              new TerserPlugin({
                  test: /\.js$/i,
                  parallel: true, // 使用多进程并发执行，提升构建速度
              }),
          ],

          // splitChunks: {
          // async：异步引入的库进行分离（默认）， initial： 同步引入的库进行分离， all：所有引入的库进行分离（推荐）
          // chunks: 'async',
          // minSize: 3000, // 最大的大小
          // minSize: 20000, // 抽离的公共包最小的大小，单位字节
          // minChunks: 1, // 资源使用的次数(在多个页面使用到)， 大于1， 最小使用次数
          // maxAsyncRequests: 30, // 并发请求的数量
          // maxInitialRequests: 30,  // 入口文件做代码分割最多能分成30个js文件
          // name: true, //让cacheGroups里设置的名字（filename）有效, 不建议打开因为代码会打包到同一个文件，从而增加单个文件的体积，影响页面的加载速度
          //当打包同步代码时,上面的参数生效
          // cacheGroups: {
          // commons: {
          //     name: "commons",
          //     chunks: 'all',
          //     minChunks: 2,
          // }
          // defaultVendors: {
          // test: /(react|react-dom)/, //检测引入的库是否在node_modlues目录下的
          // name: 'vendors',
          // chunks: "all"
          // priority: -10,  //值越大,优先级越高.模块先打包到优先级高的组里
          // reuseExistingChunk: true,
          // filename: 'vendors.js'//把所有的库都打包到一个叫vendors.js的文件里
          // },
          // default: {
          //     minChunks: 2,
          //     priority: -20,
          //     reuseExistingChunk: true, //如果一个模块已经被打包过了,那么再打包时就忽略这个上模块
          // },
          // },
          // },
      },
  }
)
