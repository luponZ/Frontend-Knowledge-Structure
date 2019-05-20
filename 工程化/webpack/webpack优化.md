webpack的优化有两个方向, 一个是webpack构建流程, 一个是webpack构建的目标代码

## webpack构建流程
### 减少文件搜索
#### module.rules.loader
1. 增加include,直接包含需要编译的类型文件
2. babel-loader增加缓存
3. test的正则更为精确
```js
// 如果项目源码中只有 js 文件就不要写成 /\.jsx?$/，提升正则表达式性能
test: /\.js$/,
// babel-loader 支持缓存转换出的结果，通过 cacheDirectory 选项开启
use: ['babel-loader?cacheDirectory'],
// 只对项目根目录下的 src 目录中的文件采用 babel-loader
include: path.resolve(__dirname, 'src'),
```

#### resolve.modules
1. 明确第三方模块位置
```js
modules: [path.resolve(__dirname, "../src/components"), 'node_modules],
```

#### resolve.mainFields
1. 明确第三方模块导入的类型
```js
mainFields: ['main'],
```

#### resolve.alias
一般第三方库会采用模块化的来构建整个库,webpack会递归依次解析文件打包输出
通过设置别名可以直接指定打包好的文件, 注意**这种方法会导致tree-shaking(摇树优化)失效**
```js
alias: {
      'react': path.resolve(__dirname, './node_modules/react/dist/react.min.js'), // react15
      // 'react': path.resolve(__dirname, './node_modules/react/umd/react.production.min.js'), // react16
    }
```

#### resolve.extensions
1. 避免设置过长的后缀列表
2. 将最常见的后缀类型放到前面
3. 在项目中尽量带上后缀名称

### 使用Dll文件
#### 创建DLL文件
```js
const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const AssetsPlugin = require("assets-webpack-plugin"); // 生成文件名，配合HtmlWebpackPlugin增加打包后dll的缓存
const CleanWebpackPlugin = require("clean-webpack-plugin");//清空文件夹
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
    mode: "production",
    entry: {
        libs: [
            "react",
            "react-dom",
            "react-redux",
            "react-router-dom",
            "connected-react-router",
            "redux",
            "redux-thunk",
            "lodash",
            "qs"
        ]
    },
    output: {
        path: path.resolve(__dirname, "../static"),
        filename: "[name].[chunkhash:7].js",
        library: "[name]_library"
    },
    plugins: [
        new webpack.DllPlugin({
            // 描述动态链接库的 manifest.json 文件输出时的文件名称
            // 在使用DLL的时候需要这个文件名称
            path: path.resolve(__dirname, "../static/[name]-mainfest.json"),
            // 注意这个name属性需要和output.library相同
            name: "[name]_library",
            context: __dirname // 执行的上下文环境，对之后DllReferencePlugin有用
        }),
        // 压缩js
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    warnings: false
                }
            },
            sourceMap: true,
            parallel: true
        }),
        new AssetsPlugin({
            filename: "bundle-config.json",
            path: "./static"
        }),
        new CleanWebpackPlugin(["static"], {
            root: path.join(__dirname, "../"), // 绝对路径
            verbose: true, // 是否显示到控制台
            dry: false, // 不删除所有
            exclude: ["img"]
        }),
    ],
    // 如果需要对dll文件中的模块解析
    module: {
        rules: [
            {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: [{
                    loader: "css-loader",
                    options: {
                        minimize: true //启用压缩
                    }
                }]
            })
        }, {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: "url-loader",
            query: {
                limit: 10000,
                name: "img/[name].[hash:7].[ext]"
            }
        }, {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            loader: "url-loader",
            query: {
                limit: 10000,
                name: "fonts/[name].[hash:7].[ext]"
            }
        }]
    },
}
```
#### 使用DLL文件
```js
 plugins: [
        // 告诉 Webpack 使用了哪些动态链接库
        // 可以使用多个DllReferencePlugin
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require("../static/libs-mainfest.json") // 指向生成的manifest.json
        }),
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, "../static"),
            to: "static",
            ignore: [".*"]
        }])
    ]
```

### 多进程构建
#### HappyPack
```js
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HappyPack = require('happypack');

const threadPool = HappyPack.ThreadPool({size: 5});

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        // 把对 .js 文件的处理转交给 id 为 babel 的 HappyPack 实例
        use: ['happypack/loader?id=babel'],
        // 排除 node_modules 目录下的文件，node_modules 目录下的文件都是采用的 ES5 语法，没必要再通过 Babel 去转换
        exclude: path.resolve(__dirname, 'node_modules'),
      },
      {
        // 把对 .css 文件的处理转交给 id 为 css 的 HappyPack 实例
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: ['happypack/loader?id=css'],
        }),
      },
    ]
  },
  plugins: [
    new HappyPack({
      // 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件
      id: 'babel',
      // 如何处理 .js 文件，用法和 Loader 配置中一样
      loaders: ['babel-loader?cacheDirectory'],
      // 开启的子进程数
      threads: 3,
      // 是否允许输出日志
      verbose: true,
      // 多个happyPack实例使用同一个共享池上的子进程, 防止资源占用过多
      threadPool: threadPool
    }),
    new HappyPack({
      id: 'css',
      // 如何处理 .css 文件，用法和 Loader 配置中一样
      loaders: ['css-loader'],
      threadPool: threadPool
    }),
    new ExtractTextPlugin({
      filename: `[name].css`,
    }),
  ],
};
```
### ParallelUglifyPlugin
```js
const path = require('path');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

module.exports = {
  plugins: [
    // 使用 ParallelUglifyPlugin 并行压缩输出的 JS 代码
    new ParallelUglifyPlugin({
        // 匹配文件压缩
        test: /.js$/
        // 匹配一系列文件需要压缩
        include: [],
        // 匹配一些列文件不需要压缩
        exclude: [],
        // 存放压缩缓存地址
        cacheDir: ''
        // 多少个子进程并发执行
        workerCount: '2'
        // 是否输出sourceMap,会极大影响性能,慎重使用
        sourceMap: false,
        // 压缩ES6的代码, 不能与uglifyJS一起使用
        uglifyES: {},
        // 压缩ES5的代码, 不能与uglifyES一起使用
        uglifyJS: {
            output: {
                // 最紧凑的输出
                beautify: false,
                // 删除所有的注释
                comments: false,
            },
            compress: {
                // 在UglifyJs删除没有用到的代码时不输出警告
                warnings: false,
                // 删除所有的 `console` 语句，可以兼容ie浏览器
                drop_console: true,
                // 内嵌定义了但是只用到一次的变量
                collapse_vars: true,
                // 提取出出现多次但是没有定义成变量去引用的静态值
                reduce_vars: true,
            }
        },
    }),
  ],
};
```

### 代码加载减少
#### 代码分割
参考SplitChunksPlugin.md
#### 按需加载
```js
import(/* webpackChunkName: "com" */ './components/com.js').then((show) => {
    show('Webpack');
  })
// 需要在.babelrc添加下面的插件
"plugins": [
    "syntax-dynamic-import"
  ]
```
#### prepack
目前还无法用于生产
#### Scope Hoisting
作用域提升,在webpack3需要手动添加, webpack4中添加mode: 'production'自动开始
```js
const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');

module.exports = {
  plugins: [
    // 开启 Scope Hoisting
    new ModuleConcatenationPlugin(),
  ],
};
```