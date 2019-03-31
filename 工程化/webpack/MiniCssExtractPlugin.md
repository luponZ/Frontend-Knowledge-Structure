>   MiniCssExtractPlugin 和 style-loader 一起使用可能出现问题。在生产环境中会将style-loader打包进vendors中

### 建议配置
```js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
    optimization: {
        minimizer: [
        // 由于重新配置minimizer会覆盖原有默认的配置项
        // 所以需要重新配置原有的UglifyJsPlugin的配置项
        new UglifyJsPlugin({
            cache: true,
            parallel: true,
            sourceMap: true
        }),
        new OptimizeCSSAssetsPlugin({})
        ],
        // 如果想把所有的css打包到一起
        splitChunks: {
            cacheGroups: {
                styles: {
                name: 'styles',
                test: /\.css$/,
                chunks: 'all',
                enforce: true
                }
            }
        }
    },
    plugins: [
    new MiniCssExtractPlugin({
        filename: devMode ? '[name].css' : '[name].[hash].css',
        chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
    })
    ],
    module: {
    rules: [
        {
        test: /\.(sa|sc|c)ss$/,
        use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            'sass-loader',
        ],
        }
    ]
    }
}
```