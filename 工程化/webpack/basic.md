```js
module.exports = {
    // 打包模式 development|production|none
    // webpack4新增
    mode: 'production',
    // 当前webpack的目录绝对路径
    // 用于解析entry和module.rules的路径匹配
    context: __dirname ,
    entry: {
        // 单文件表示
        app: './src/app.js',
        // 多文件表示
        index: ['./src/entry/index1.js', './src/entry/index2.js'],
        // 动态文件
        app2: () => new Promise((resolve) => resolve(['./src/app1.js', './src/app2.js']))
    },
    output: {
        // 文件打包后的输出地址,需要使用绝对路径
        // 可以使用hash变量
        path: path.resolve(__dirname, './dist.[hash]'),
        // 当需要把资源存放到其他地方比如aws上的cdn上时,需要添加公共地址
        // 可以在entry文件入口定义变量,来动态指定publicPath
        // __webpack_public_path__ = myRuntimePublicPath;
        publicPath: 'https://aws.cdn.com/project/static/',
        // 自定义script标签的属性
        // 'module'属性
        jsonpScriptType: 'text/javascript',
        // 在entry中定义的文件输出名称
        filename: '[name].[hash:8].bundle.js',
        // 非入口和按需打包的文件输出的名称,变量名称和filename相同;
        // chunkFilename会增加文件的包的大小
        // 注意chunkFilename的改变会引起filename的bundle失效,从而失去缓存效果
        chunkFilename: '[id].[hash:8].bundle.js',
        // 当改项目是一个可以被其他模块导入使用的库时需要用到它们
        // 以何种方式导出库
        // 需要配合library一起使用
        libraryTarget: 'umd',
        library: 'LibraryName',
        // 需要libraryTarget和library的配合
        // 会在每个模块的上面生成一段注释
        auxiliaryComment: {
            root: 'Root Comment',
            commonjs: 'CommonJS Comment',
            commonjs2: 'CommonJS2 Comment',
            amd: 'AMD Comment'
        },
        // 只适用于构建目标target为web时的情况
        // crossOriginLoading: false - 禁用跨域加载（默认）
        // crossOriginLoading: 'anonymous' 加载此脚本资源时不会带上用户的 Cookies
        // OriginLoading: 'use-credentials' 加载此脚本资源时会带上用户的 Cookies
        crossOriginLoading: false
    },
    module: {
        // 对于一些没有使用模块化方案的第三方代码, 解析的没有必要的
        // 可以使用正则或者函数
        // (content) => { return /jquery|chartjs/.test(content);}
        noParse: /jquery|chartjs/,
        // rules用于配置模块的读取解析规则
        // 是一个数组对象
        rules: [
          {
              test: /\.ts[x]?$/,
              use: [
                  {
                      // 通过添加?来提供参数
                      loader: "babel-loader?cacheDirectory"
                  },
              ],
              // exclude用于排除那些路径的文件是不需要解析的
              exclude: /node_modules/
          },
          {
              test: /\.s?[a|c]ss$/,
              // 包括哪些文件
              // test include exclude 这三个命中文件的配置项只传入了一个字符串或正则，其实它们还都支持数组类型
              include: [
                      path.resolve(__dirname, '../src'),
                      path.resolve(__dirname, '../node_modules/antd')
              ],
              // 使用一组 Loader 去处理 SCSS 文件
              // 处理顺序是从后向前, sass-loader -> postcss-loader -> resolve-url-loader -> css-loader -> style-loader/MiniCssExtractPlugin.loader 
              use: [
                  process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
                  {
                      loader: "css-loader",
                      options: {
                          sourceMap: true,
                      }
                  },
                  "resolve-url-loader",
                  "postcss-loader",
                  {
                      loader: "sass-loader",
                      // 对于有较多的参数时,可以指定options
                      options: {
                          outputStyle: 'expanded',
                          sourceMap: true
                      }
                  },
              ],
          },
          {
              // enforce:'pre' 的含义是把该 Loader 的执行顺序放到最前
              // enforce 的值还可以是 post，代表把 Loader 的执行顺序放到最后
              enforce: "pre",
              test: /\.ts[x]$/,
              // loader: 'loader' 是use: [ { loader: 'loader' } ]的简写
              loader: "source-map-loader"
          },
        ]
    },
    // resolve用于配置Webpack如何寻找模块所对应的文件
    resolve: {
        // webpack寻找无后缀文件的顺序
        extensions: ['.ts', '.tsx', '.js', '.json', '.scss'],
        // 设置别名
        alias: {
            // 将导入语句中的@替换成对应的路径
            '@': path.resolve(__dirname, "../src"),
            // 也可以在给定对象的键后的末尾添加$，以表示精准匹配
            // 下面的只会命中import md from 'componets'
            'components$': path.resolve(__dirname, "../src/components")
        },
        // 导入模块的类型选择,只会命中一个
        // 安装的第三方模块中都会有一个 package.json 文件用于描述这个模块的属性，其中有些字段用于描述入口文件在哪里，resolve.mainFields 用于配置采用哪个字段作为入口文件的描述
        // { "browser": "build/upstream.js", "module": "index" }
        // mainFields的默认选项和target属性有关
        mainFields: ['browser', 'module', 'main'],
        // 设置模块默认导入的地址
        // import Button from 'UI' -> 就会去'/src/components/UI'找
        modules: [path.resolve(__dirname, "../src/components"), 'node_modules],
        // 是否强制导入文件写上后缀类型
        enforceExtension: true,
        // 是否强制modules定义的模块导入写上后缀
        enforceModuleExtension: false,
        // 启用不安全的缓存
        // 可以使用正则表示要缓存的匹配项
        unsafeCache: true //  /src\/utilities/
    },
    // plugins可以完成webpack的几乎一切的构建任务
    // 传入的是一个插件实例
    plugins: [
      // 这是一个DLL文件配置项
      new webpack.DllReferencePlugin({
          context: __dirname,
          manifest: require("../static/libs-mainfest.json") // 指向生成的manifest.json
      }),
    ],
    // webpack4新增
    // 打包优化的配置
    optimization: {
        // 模块分割优化
        splitChunks: {
            chunks: 'all'
        },
    },
    // 本地服务器
    devServer: {},
    // 生成sourcemap的格式
    // 开发模式下建议使用eval-source-map
    // 生产模式下建议使用source-map
    devtool: 'source-map',
    // webpack编译的目标
    // web 浏览器环境
    // node node环境
    // electron-main Electron主进程
    // electron-render Electron渲染进程
    // webworker webworker
    target: 'web',
    // 排除一些依赖
    // 当通过CDN引入一些第三方库的时候,需要排除, 转而全局搜索指定对象
    // 下面表示应该排除 import $ from 'jquery' 中的 jquery 模块,转而查找全局的变量jQuery
    externals: {
        jquery: 'jQuery'
    }
}
```

### output

#### filename
|变量|含义|
|:--:|:--:|
|id|Chunk 的唯一标识，从0开始|
|name|Chunk 的名称|
|hash|Chunk 的唯一标识的Hash值|
|chunkhash|Chunk内容的Hash值|

#### libraryTarget
1. 值为'var'时,会导出一个变量,变量名称为library属性LibraryName
```js
// webpack输出代码
var LibraryName = lib_code;
// 到入库使用代码
LibraryName.doSomething();
// 如果library为空的话
// 直接输出lib_code
```
2. 值为'commomjs',会以Commonjs规范导出
```js
// Webpack 输出的代码
exports['LibraryName'] = lib_code;

// 使用库的方法
// library-name-in-npm是发布到npm上的包名称
require('library-name-in-npm')['LibraryName'].doSomething();
```
3. 值为'commomjs',会以Commonjs2规范导出
CommonJS2 和 CommonJS 规范很相似，差别在于 CommonJS 只能用 exports 导出，而 CommonJS2 在 CommonJS 的基础上增加了 module.exports 的导出方式。
```js
// Webpack 输出的代码
module.exports = lib_code;

// 使用库的方法
require('library-name-in-npm').doSomething();
```
4. 值为'this'
```js
// Webpack 输出的代码
this['LibraryName'] = lib_code;

// 使用库的方法
this.LibraryName.doSomething();
```
5. 值为'window',会将模块挂载到window对象上
```js
// Webpack 输出的代码
window['LibraryName'] = lib_code;

// 使用库的方法
window.LibraryName.doSomething();
```
6. 值为'global', 将模块挂载到global对象上
```js
// Webpack 输出的代码
global['LibraryName'] = lib_code;

// 使用库的方法
global.LibraryName.doSomething();
```
7. 值为'amd', 会以AMD的标注导出, 一般需要require.js提供加载环境
```js
// Webpack 输出的代码
define('MyLibrary', [], function() {
  return lib_code;
});
// 使用库的方法
require(['MyLibrary'], function(MyLibrary) {
  // 使用 library 做一些事……
});
```
8. 值为'umd', 模块可以在所有模块的定义下运行
```js
(function webpackUniversalModuleDefinition(root, factory) {
  if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory();
  else if(typeof define === 'function' && define.amd)
    define([], factory);
  else if(typeof exports === 'object')
    exports['MyLibrary'] = factory();
  else
    root['MyLibrary'] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
  return lib_code; // 此模块返回值，是入口 chunk 返回的值
});
// 在改配置下, library可以写成一下格式
library: {
            root: 'MyLibrary',
            amd: 'my-library',
            commonjs: 'my-common-library'
        }
```

#### optimization
```js
const optimization = {
    // 告知 webpack 使用 TerserPlugin 压缩 bundle
    // 默认是true
    // false 表示不使用压缩
    minimize: true,
    // 配置一个或者多个TerserPlugin实例
    minimizer: [
        new TerserPlugin({
            cache: true,
            parallel: true,
            sourceMap: true, // Must be set to true if using source-maps in production
            terserOptions: {
            // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
            }
      }),
    ],
    // 原先的SplitChunksPlugin插件
    // 模块的分块策略
    splitChunks: {
        // 参照SplitChunksPlugins.md
    },
    // 将包含chunks 映射关系的 list单独从入口文件里提取出来，因为每一个 chunk 的 id 基本都是基于内容 hash 出来的，所以你每次改动都会影响它，如果不将它提取出来的话，等于app.js每次都会改变。缓存就失效了
    // 保证模块正常运行的预加载文件
    runtimeChunk: {
        // 会生成manifest的文件, 保证在所有入口文件和chunk文件之前运行
        name: 'manifest',
        // 会为每个chunk文件生成
        name: entrypoint => `runtime~${entrypoint.name}`
    },
     // 设置process.env.NODE_ENV的值
    nodeEnv: 'production'
}
```

#### devServer
```js
const devServer = {
    // ip
    host: '0.0.0.0',
    // 端口号
    port: 10000,
    // 是否自动打开页面
    open: true,
    // 消息通知的级别
    clientLogLevel: 'warning',
    // history模式
    historyApiFallback: {
        rewrites: [{
            from: /.*/,
            to: '/index.html'
        }],
    },
    // 热更新
    hot: true,
    // 在哪提供静态文件
    contentBase: [path.join(__dirname, 'public'), path.join(__dirname, 'assets')],
    // 当contentBase下的文件修改时触发页面刷新
    watchContentBase: true
    // 是否启用gzip压缩
    compress: true,
    // 当出现编译器错误或警告时，在浏览器中显示全屏覆盖层
    // 下面的表示只在warning和error的状态显示
    overlay: {
        warnings: false,
        errors: true
    },
    // 是否允许使用本地Ip
    useLocalIp: true,
    publicPath: '/',
    // 是否显示错误问题
    // FriendlyErrorsPlugin插件下需要开启
    quiet: true,
    watchOptions: {
        poll: false,
    },
    // 自定义中间件
    before: function(app, server) {
      app.get('/some/path', function(req, res) {
        res.json({ custom: 'response' });
      });
    },
    // 反向代理
    proxy: {
        '/': {
            target: 'http://proxy.ip.com/',
            changeOrigin: true,
            pathRewrite: {
                '^/': '/'
            }
        }
    }
}
```