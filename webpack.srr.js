'use strict'
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // 提取成单独的 css 文件
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin"); // 压缩 css 文件
const TerserPlugin = require("terser-webpack-plugin"); // 压缩 JS 文件 webpack5
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 压缩 HTML 代码
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // 清除 output 输出的文件夹
const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin").default; // CSS 内联到Html文件
const glob = require('glob'); // 对页面打包插件
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin'); // CDN 引入不将依赖包打入bundle文件中


// 多页面打包
const setMPA = () => {
    const entry = {};
    const webpackHtmlPlugins = [];
    // __dirname根目录；查询src下文件夹里的index.js; 返回文件地址绝对路径数组
    const entryFiles = glob.sync(path.join(__dirname, './src/*/index-server.js'));
    Object.keys(entryFiles).map((k) => {
        const entryFile = entryFiles[k];
        const match = entryFile.match(/src\/(.*)\/index-server\.js/);
        const pageName = match[1];
        if (pageName) {
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
        }
    })
    return {entry, webpackHtmlPlugins};
};

let {entry, webpackHtmlPlugins} = setMPA();
module.exports = {
    mode: 'none',
    // 入口
    entry: entry,
    // 输出到哪
    output: {
        publicPath: './',
        filename: '[name]-server.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd', // umd node.js 的包管理遵从 commonjs, 因此构建生成的这个 js 文件需要兼容 commonjs，否则无法再 Node.js 里面进行 require
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader', // js文件转换
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                }
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
                parallel: true,
            }),
        ]
    },
}