> webpack4之前的配置需要放在plugins下,名称为webpack.optimize.CommonsChunkPlugin

webpack4可以放在plugins下或者optimization下
```js
module.exports = {
    plugins: [
        new webpack.optimize.SplitChunksPlugin({
            // [config]
        })
    ]
    // 或者
    optimization: {
        splitChunks: {
            // [congfig]
        }
    }
}

```

### 配置项
1. chunk:
    1. 'initial' __(将所有来自node_modules的模块分配到一个叫vendors的缓存组；所有重复引用至少两次的代码，会被分配到default(由entry中的name决定)的缓存组)__
    2. 'all' __(和'initial'类似, 不同的是all不会对同步加载和异步加载的模块分开打包,而'initial'会)__,
    3. 'async' __(默认选项, 将同步模块打包到一个文件, 异步分开打包)__
2. minSize: 表示在压缩前的最小模块大小，默认为30000
3. minChunks: 表示被引用次数，默认为1
4. maxAsyncRequests: 按需加载时候最大的并行请求数，默认为5
5. maxInitialRequests: 一个入口最大的并行请求数，默认为3
6. automaticNameDelimiter: 命名连接符
7. name: 拆分出来块的名字，默认由块名和hash值自动生成
8. cacheGroups: __缓存组。缓存组的属性除上面所有属性外，还有test, priority, reuseExistingChunk__
    1. test: 用于控制哪些模块被这个缓存组匹配到
    2. priority: 缓存组打包的先后优先级
    3. reuseExistingChunk: 如果当前代码块包含的模块已经有了，就不在产生一个新的代码块

> 常见业务下设置chunk: all,其他的默认一般就行, 如果使用lerna等分包管理工具,将公共工具和业务分摊时需要使用cacheGroups定制化