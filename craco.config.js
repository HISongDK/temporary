const path = require('path')
const CracoLessPlugin = require('craco-less')
const CracoAntDesignPlugin = require('craco-antd')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')
const CircularDependencyPlugin = require('circular-dependency-plugin')
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin')

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const pathResolve = (pathUrl) => path.join(__dirname, pathUrl)

const { whenProd } = require('@craco/craco')

module.exports = {
  webpack: {
    // 别名配置
    alias: {
      '@': pathResolve('src'),
    },
    plugins: [
      new CircularDependencyPlugin({
        exclude: /node_modules/,
        include: /src/,
        failOnError: true,
        allowAsyncCycles: false,
        cwd: process.cwd(),
      }),
      // 查看打包的进度
      new SimpleProgressWebpackPlugin(),
      new BundleAnalyzerPlugin(),
      // 替换moment为dayjs
      new AntdDayjsWebpackPlugin(),
      ...whenProd(
        () => [
          new UglifyJsPlugin({
            uglifyOptions: {
              // 删除注释
              output: {
                comments: false,
              },
              compress: {
                drop_console: true, // 删除所有调式带有console的
                drop_debugger: true,
                pure_funcs: ['console.log'], // 删除console.log
              },
            },
          }),

          // 打压缩包
          new CompressionWebpackPlugin({
            algorithm: 'gzip',
            test: /\.js$|\.html$|\.css$/, // 匹配文件名
            threshold: 1024,
            minRatio: 0.8,
          }),
        ],
        []
      ),
    ],
    configure: (webpackConfig, { env, paths }) => {
      paths.appBuild = 'dist'
      webpackConfig.output = {
        ...webpackConfig.output,
        path: path.resolve(__dirname, 'dist'),
        // publicPath: "/",
      }
      return webpackConfig
    },
  },
  babel: {
    plugins: [
      // AntDesign 按需加载
      [
        'import',
        {
          libraryName: 'antd',
          libraryDirectory: 'es',
          style: 'css',
        },
        'antd',
      ],
    ],
  },
  plugins: [
    { plugin: CracoAntDesignPlugin },
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            // modifyVars: { '@primary-color': '#1DA57A' },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
}
