const path = require("path");
const CracoLessPlugin = require("craco-less");
const CracoAntDesignPlugin = require("craco-antd");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const SimpleProgressWebpackPlugin = require("simple-progress-webpack-plugin");

const pathResolve = (pathUrl) => path.join(__dirname, pathUrl);

module.exports = {
  webpack: {
    // 别名配置
    alias: {
      "@": pathResolve("src"),
    },
    configure: (webpackConfig, { env, paths }) => {
      paths.appBuild = "dist";
      webpackConfig.output = {
        ...webpackConfig.output,
        path: path.resolve(__dirname, "dist"),
        // publicPath: "/",
      };
      return webpackConfig;
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
};
