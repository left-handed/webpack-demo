const webpackMeragr = require('webpack-merge');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin'); // 代码压缩 css
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');// CDN 引入不将依赖包打入bundle文件中
const baseConfig = require('./base.config');

const ssrConfig = {
  mode: 'production',

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'ignore-loader', // 忽略部分文件
        ],
      },
      {
        test: /\.less$/i,
        use: 'ignore-loader',
      },
    ],
  },

  plugins: [
    new CssMinimizerPlugin({
      test: /\.css$/i, // 匹配 css 文件
      parallel: true, // 开启多进程
    }),

    new HtmlWebpackExternalsPlugin({
      externals: [
        {
          module: 'react',
          entry: 'https://unpkg.com/react@17.0.2/umd/react.production.min.js',
          global: 'React',
        },
        {
          module: 'react-dom',
          entry: 'https://unpkg.com/react-dom@17.0.2/umd/react-dom.production.min.js',
          global: 'ReactDOM',
        },
      ],
    }),
  ],

  // 优化
  optimization: {
    splitChunks: {
      // async：异步引入的库进行分离（默认）， initial： 同步引入的库进行分离， all：所有引入的库进行分离（推荐）
      chunks: 'async',
      // minSize: 3000, // 最大的大小
      minSize: 20000, // 抽离的公共包最小的大小，单位字节
      minChunks: 1, // 资源使用的次数(在多个页面使用到)， 大于1， 最小使用次数
      maxAsyncRequests: 30, // 并发请求的数量
      maxInitialRequests: 30, // 入口文件做代码分割最多能分成30个js文件
      name: true, // 让cacheGroups里设置的名字（filename）有效, 不建议打开因为代码会打包到同一个文件，从而增加单个文件的体积，影响页面的加载速度
      // 当打包同步代码时,上面的参数生效
      cacheGroups: {
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
        },
      },
      defaultVendors: {
        test: /(react|react-dom)/, // 检测引入的库是否在node_modlues目录下的
        name: 'vendors',
        chunks: 'all',
        priority: -10, // 值越大,优先级越高.模块先打包到优先级高的组里
        reuseExistingChunk: true,
        filename: 'vendors.js', // 把所有的库都打包到一个叫vendors.js的文件里
      },
      default: {
        minChunks: 2,
        priority: -20,
        reuseExistingChunk: true, // 如果一个模块已经被打包过了,那么再打包时就忽略这个上模块
      },
    },
  },
};

module.exports = webpackMeragr(baseConfig, ssrConfig);
