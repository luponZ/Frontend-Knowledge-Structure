> 文章参考了[Vue.js 技术揭秘](https://ustbhuangyi.github.io/vue-analysis/prepare/entrance.html "Markdown")
> *只做个人参考使用*

### 1. 如何开始的?
package.json一般包含了 __整个项目的依赖__, __打包编译命令__,所以看看scripts下的执行命令:
```json
    "build": "node build/build.js", // web端
    "build:ssr": "npm run build -- web-runtime-cjs,web-server-renderer", // 服务端
    "build:weex": "npm run build -- weex", // 移动混合
```
所以, 看看build/build.js文件吧
``` javascript
    // step1
    let builds = require('./config').getAllBuilds()

    // step2
    if (process.argv[2]) {
        const filters = process.argv[2].split(',')
        builds = build.filter(b => {...})
    } else {
        builds = builds.filter(b => {...})
    }

    // step3
    build(builds)
```
代码中比较关键的就是这三个步骤:
1. step1引入了所有环境的构建配置
2. 根据命令行参数对构建配置做过滤,比如"build": "node build/build.js"这个构建命令:
    - 判断命令参数的长度
    - 没有参数,就默认过滤weex构建配置(相当于构建了所有的配置参数)
        - 以 web-runtime-cjs 配置为例
    - 返回已过滤的构建配置