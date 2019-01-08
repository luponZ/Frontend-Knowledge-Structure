> 文章参考了[Vue.js 技术揭秘](https://ustbhuangyi.github.io/vue-analysis/prepare/entrance.html "Markdown")
> *只做个人参考使用*
>
----
##说明
> 1. *<span style="color: red">红色字体可能有误<span>*
> 2. 创建Vue的实例未说明皆以下面为范例
> ```js
> var app = new Vue({
>   el: '#app',
>   data: {
>       message: 'Hello Vue!'
>   }
> })
> ```

###1. 如何开始的?
package.json一般包含了两个主要的信息: __整个项目的依赖__ __和__ __打包编译命令__,所以看看scripts下的打包的三个执行命令:
```json
    "build": "node build/build.js", // web端
    "build:ssr": "npm run build -- web-runtime-cjs,web-server-renderer", // 服务端
    "build:weex": "npm run build -- weex", // 移动混合
```
所以, 看看<span style="color: forestgreen">build/build.js</span>文件吧
``` javascript
    // P1
    let builds = require('./config').getAllBuilds()

    // P2
    if (process.argv[2]) {
        const filters = process.argv[2].split(',')
        builds = build.filter(b => {...})
    } else {
        builds = builds.filter(b => {...})
    }

    // P3
    build(builds)
```
代码中比较关键的就是这三个步骤:
1. P1引入了所有环境的构建配置

2. 根据命令行参数对构建配置做过滤,比如"build": "node build/build.js"这个构建命令:
    - 判断命令参数的长度
    - 没有参数,就默认过滤weex构建配置(相当于构建了所有的配置参数)
        | 配置名称 | 运行代码| 编译代码 | 导出格式 | 打包环境|
        |:-------:|:-------:|:---------:|:---------:|:--:|
        | web-runtime-cjs| ✓ ||CMD| |
        |web-full-cjs|✓|✓|CMD| |
        |web-runtime-esm |✓ ||ES|
        |web-full-esm|✓|✓|ES|
        |web-runtime-dev|✓||UMD|开发|
        |web-runtime-prod|✓||UMD|生产|
        |web-full-dev|✓|✓|UMD|开发|
        |web-full-prod|✓|✓|UMD|生产|
    - 返回已过滤的构建配置

3. 依次打包对应的构建配置:
    - 以 web-full-cjs 配置为例
        ```js
        'web-full-cjs': {
            entry: resolve('web/ntry-runtime-with-compiler.js'),
            dest: resolve('dist/vue.common.js'),
            format: 'cjs',
            alias: { he: './entity-decoder' },
            banner
         }
        ```
        - 入口文件 
            ```js
            // 通过resolve 可以找到真实的路径'src/platforms/web/entry-runtime-with-compiler.js'
            // 由此可知改该配置是web环境下的
            resolve('web/entry-runtime-with-compiler.js'), 
            ```
        - dist目录生成vue.common.js
 
 ### 2.new Vue()
 以上面默认的例子
 这样你就成功的把一个Vue的实例挂载到了id为app的这个元素上
 官方说Vue在背后做了大量的事情,看看究竟是哪些事情

 ##### 先看看打包的入口文件
 > <span style="color: forestgreen">src/platforms/web/entry-runtime-with-compiler.js</span>
 ```js
    import config from 'core/config'
    import { warn, cached } from 'core/util/index'
    import { mark, measure } from 'core/util/perf'

    // P1
    import Vue from './runtime/index'
    import { query } from './util/index'
    import { shouldDecodeNewlines } from './util/compat'
    import { compileToFunctions } from './compiler/index'

    const idToTemplate = cache(id => {...})

    // P2
    const mount = Vue.prototype.$mount
    // P3
    Vue.prototype.$mount = function (
        el?: string | Element,
        hydrating?: boolean
    ): Component {...}

    function getOuterHTML (el: Element): string {...}
    
    // P4
    Vue.compile = compileToFunctions

    export default Vue
 ```
 其中关键的4步:
 1. 导入Vue构造函数
 2. 将Vue原型上的$mount存入变量中
 3. 替换Vue原型上的$mount函数
 4. 直接在Vue构造函数添加compile静态方法

 所以,要找到真正的Vue构造函数还得往上找(P1)
 > import Vue from './runtime/index'
 // 从他的路径可以看出它其实也是运行时版本的构造函数

 ```js
    // P1
    import Vue from 'core/index'
    // P2
    import ...

    // P3
    Vue.config.mustUseProp = mustUseProp
    Vue.config.isReservedTag = isReservedTag
    Vue.config.isReservedAttr = isReservedAttr
    Vue.config.getTagNamespace = getTagNamespace
    Vue.config.isUnknownElement = isUnknownElement

    // P4
    extend(Vue.options.directives, platformDirectives)
    extend(Vue.options.components, platformComponents)

    Vue.prototype.__patch__ = inBrowser ? patch : noop

    // P5
    Vue.prototype.$mount = function (
        el?: string | Element,
        hydrating?: boolean
    ): Component {...}

    Vue.nextTick(() => {...}, 0)

    export default Vue
 ```

其中关键的五
1. 导入核心构造函数Vue
2. 导入工具类, 平台相关方法
3. 为Vue的config静态属性添加平台私有方法 __([该属性是在initGlobalAPI中创建的](#vue--static__config))__
4. 为Vue的options静态属性添加平台相关directives和components __([该属性是在initGlobalAPI中创建的](#vue--static__options))__
5. 为Vue的原型添加公共的$mount方法

...好吧,我承认Vue的构造函数还在其他文件,不过这也体现了作者的基本项目结构: 
> 核心代码 => 平台相关代码 => 环境方法

所以,让我们看看其中最核心的代码-core文件夹下的代码
不过在这之前,先让我们看看core的文件夹目录

- core
    - components
    - global-api
    - intance
    - observer
    - util
    - vdom
    - config.js
    - index.js

如果之前写过Vue的项目.我们可以试着猜猜这些项目文件夹都是什么作用

> <span style="color: forestgreen">src/core/index.js</span>
```js
    // P1
    import Vue from './instance/index'
    import { initGlobalAPI } from './global-api/index'
    import { isServerRendering } from 'core/util/env'

    // P2
    initGlobalAPI(Vue)

    Object.defineProperty(Vue.prototype, '$isServer', {...})

    Object.defineProperty(Vue.prototype, '$ssrContext', {...})

    Vue.version = '__VERSION__' // rollup 会将其替换成对应的Vue版本

    export default Vue
```
其中关键的两步:
1. 导入实例构造函数Vue;导入全局API方法
2. 初始化全局 Vue API

__initGlobalAPI__ 都干了啥?
> <span style="color: forestgreen">src/core/global-api/index.js</span>
```js
    import config from '../config'
    ...

    export function initGlobalAPI (Vue: GlobalAPI) {
        const configDef = {}
        configDef.get = () => config
        if (process.env.NODE_ENV !== 'production') {
            configDef.set = () => {
                warn(
                'Do not replace the Vue.config object, set individual fields instead.'
                )
            }
        }
        // P1
        Object.defineProperty(Vue, 'config', configDef)

        // P2
        // exposed util methods.
        // NOTE: these are not considered part of the public API - avoid relying on
        // them unless you are aware of the risk.
        Vue.util = {
            warn,
            extend,
            mergeOptions,
            defineReactive
        }
        // P3
        Vue.set = set
        Vue.delete = del
        Vue.nextTick = nextTick

        Vue.options = Object.create(null)

        // P4
        ASSET_TYPES.forEach(type => {
            Vue.options[type + 's'] = Object.create(null)
        })

        // this is used to identify the "base" constructor to extend all plain-object
        // components with in Weex's multi-instance scenarios.
        Vue.options._base = Vue

        extend(Vue.options.components, builtInComponents)

        // P5
        initUse(Vue)
        initMixin(Vue)
        initExtend(Vue)
        initAssetRegisters(Vue)
    }

```
其中几个关键点

1. <span id="vue--static__config">定义了Vue的一个只可读的静态属性config</span> __([Vue-全局配置](https://cn.vuejs.org/v2/api/#%E5%85%A8%E5%B1%80%E9%85%8D%E7%BD%AE))__, 生产环境会提示,注意这边定义属性用的是defineProperty方法,该方法会贯穿整个项目
2. 根据代码中的注释,util中的方法有使用风险,请谨慎使用
3. 定义了[Vue.set](https://cn.vuejs.org/v2/api/#Vue-set), [Vue.delete](https://cn.vuejs.org/v2/api/#Vue-delete), [Vue.nextTick](https://cn.vuejs.org/v2/api/#Vue-nextTick)全局API方法(这几个方法都用过吧😂 )和options属性(Object.create(null))
4. <span id="vue--static__options">为options属性添加对象</span>
    1. Vue.options.components = { KeepAlive }
    2. Vue.options.directives = Object.create(null)
    3. Vue.options.filter = Object.create(null)
    4. Vue.options._base = Vue
5. 依次创建全局API __([Vue-全局API](https://cn.vuejs.org/v2/api/#%E5%85%A8%E5%B1%80-API))__
    1. initUse: [Vue.use](https://cn.vuejs.org/v2/api/#Vue-use) __用于安装Vue插件__
    2. initMixin: [Vue.mixin](https://cn.vuejs.org/v2/api/#Vue-mixin) __用于全局注册混入对象__
    3. initExtend: [Vue.extend](https://cn.vuejs.org/v2/api/#Vue-extend) __使用基础 Vue 构造器，创建一个“子类”__ , Vue.cid __实例构造函数的标识,这使我们能够为原型继承创建包装的“子构造函数”并缓存它们__, <span style="color: red">[该方法是全局API中最复杂的](https://blog.csdn.net/w178191520/article/details/84989416)</span>
    4. initAssertRegisters: [Vue.component](https://cn.vuejs.org/v2/api/#Vue-component) __注册或获取全局组件__|[Vue.directive](https://cn.vuejs.org/v2/api/#Vue-directive) __注册或获取全局指令__ |[Vue.filter](https://cn.vuejs.org/v2/api/#Vue-filter) __注册或获取全局过滤器__

终于,我们发现了Vue的庐山真面目
> <span style="color: forestgreen">src/core/instance/index.js</span>
```js
    import { initMixin } from './init'
    import { stateMixin } from './state'
    import { renderMixin } from './render'
    import { eventsMixin } from './events'
    import { lifecycleMixin } from './lifecycle'
    import { warn } from '../util/index'

    // P1
    function Vue (options) {
    if (process.env.NODE_ENV !== 'production' &&
        !(this instanceof Vue)
    ) {
        warn('Vue is a constructor and should be called with the `new` keyword')
    }
    // P2
    this._init(options)
    }

    // P3
    initMixin(Vue)
    stateMixin(Vue)
    eventsMixin(Vue)
    lifecycleMixin(Vue)
    renderMixin(Vue)

    export default Vue
```

其中关键的几个点
1. Vue其实是一个构造函数,需要实例化使用
2. 在new一个Vue的同时执行_init函数(关键)
3. 在Vue的原型上扩展方法

###### 问题1: 为啥使用function构造而不是Class
> Vue 按功能把这些扩展分散到多个模块中去实现，而不是在一个模块里实现所有，这种方式是用 Class 难以实现的。这么做的好处是非常方便代码的维护和管理，这种编程技巧也非常值得我们去学习。

##### 问题2: init的方法在哪定义的?是它自身的实例方法还是原型上的方法?
> 在initMixin中定义, 是原型是上的方法,其实注意观察的话会发现 __P3__ 那几个扩展方法都是xxMixin的形式,其实这些方法扩展了Vue最基础的一些方法.

我们接下来看看这几个扩展方法
##### initMixin
```js
   let uid = 0

    export function initMixin (Vue: Class<Component>) {
        Vue.prototype._init = function (options?: Object) {
            const vm: Component = this
            // a uid
            vm._uid = uid++ 
```
1. 保存Vue的实例对象
2. 设置实例的_uid, uid会累加
```js
    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // 组件初始化代码...

     /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
```
该方法的作用是啥?
官方已经说明: [在浏览器开发工具的性能/时间线面板中启用对组件初始化、编译、渲染和打补丁的性能追踪](https://cn.vuejs.org/v2/api/#performance)
1. 首先判断是否是生产环境,同时配置属性已经开启性能追踪,最后判断浏览器是否支持性能检测([window.performance](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/performance))
2. 在组件初始化的开头和结尾打上标签,然后使用window.performance.measure的方法获取该标签性能

让我们看看组件初始化代码
```js
    // 用来标识一个对象是 Vue 实例, 避免被响应系统检测
    vm._isVue = true
    // P1
    // 合并options
    if (options && options._isComponent) {
        // P1-1
        initInternalComponent(vm, options)
    } else {
        // P1-2
        vm.$options = mergeOptions(
            resolveConstructorOptions(vm.constructor),
            options || {},
            vm
        )
    }
    // P2
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // P3
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) 
    initState(vm)
    initProvide(vm) 
    callHook(vm, 'created')
```
这里有几个点:
1. 这个options是啥? 根据前面的this._init(options)我们可以知道这个option就是new Vue(options)中的options参数,这里会判断参数中是否有options和options._isComponent这两个属性(__这是个内部属性,Vue中以_标识的一般都是内部属性__)
    1. 如果有options和options._isComponent属性就会执行[initInternalComponent](#vue--private__util__initInternalComponent)这个函数
    2. 如果没有这些属性就会通过[mergeOptions](#vue--private__util__mergeOptions)方法和[resolveConstructorOptions](#vue--private__util__resolveConstructorOptions)方法为Vue的实例添加$options属性, 以例子来说,mergeOptions中的三个参数分别是:
    ```js
        {   
            [Vue.options]: {
                components: {
                    KeepAlive
                    Transition,
                    TransitionGroup
                },
                directives:{
                    model,
                    show
                },
                filters: Object.create(null),
                _base: Vue
            },
            options: {
                el: '#app',
                data: {
                    message: 'Hello Vue!'
                }
            },
            vm,
        }
    ```
2. 设置Vue实例_renderProxy的内部属性
3. 这些外部导入的方法才算是组件初始化功能
    1. initLifecycle(初始化生命周期)
    2. initEvents(初始化事件中心)
    3. initRender(初始化渲染)
    4. 生命周期声明(beforeCreate)
    5. initInjections(初始化注入器)
    6. initState(初始化data、props、computed、watcher)
    7. initProvide(初始化provide)
    8. 生命周期声明(created)

##函数方法详解

### <span id="vue--private__util__resolveConstructorOptions">resolveConstructorOptions方法</span>

```js
    // P1
    function resolveConstructorOptions (Ctor: Class<Component>) {
        let options = Ctor.options
        // P2
        if (Ctor.super) {
            // P2-1
            const superOptions = resolveConstructorOptions(Ctor.super)
            const cachedSuperOptions = Ctor.superOptions
            if (superOptions !== cachedSuperOptions) {
                // super option changed,
                // need to resolve new options.
                Ctor.superOptions = superOptions
                // P2-2
                // check if there are any late-modified/attached options (#4976)
                const modifiedOptions = resolveModifiedOptions(Ctor)
                // update base extend options
                if (modifiedOptions) {
                    extend(Ctor.extendOptions, modifiedOptions)
                }
                // P2-3
                options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
                if (options.name) {
                    options.components[options.name] = Ctor
                }
            }
        }
        // P1
        return options
    }
```
1. 首先从对函数名的解读可以知道该函数可能用于解析构造器的options的, 而从他最后的返回值来看我们也能知道该函数返回的也是一个options, 所以if的过程应该就是对options的某些处理操作
2. if的条件判断是Ctor.super,Ctor是一个构造函数, super指的就是父类,而我们知道传入的Ctor其实是就是Vue实例的构造函数,所以如果传进的是new Vue()构造的实例, 就不会走这一步, 而直接会把Vue.options返回, 而如果是通过Vue.extend()创造子类的实例对象就会走这一步
    1. 这里会递归调用resolveConstructorOptions,而传入的参数变成了构造器的父类, 同时比较构造器的superOptions和构造器的父类的option是否相等, 不相等的话就更新改构造器的superOptions
    2. 这里是修复了git上提的一个bug
    3. 调用了mergeOptions来合并superOptions和extendOptions(<span style="color: red">这个属性在Vue.extend中被定义</span>)并将其返回

### <span id="vue--private__util__mergeOptions">mergeOptions方法</span>
```js
    // P1
    /**
    * Merge two option objects into a new one.
    * Core utility used in both instantiation and inheritance.
    */
    function mergeOptions (
        parent: Object,
        child: Object,
        vm?: Component
    ): Object {
        // P2
        if (process.env.NODE_ENV !== 'production') {
            checkComponents(child)
        }

        if (typeof child === 'function') {
            child = child.options
        }

        normalizeProps(child, vm)
        normalizeInject(child, vm)
        normalizeDirectives(child)
        const extendsFrom = child.extends
        if (extendsFrom) {
            parent = mergeOptions(parent, extendsFrom, vm)
        }
        if (child.mixins) {
            for (let i = 0, l = child.mixins.length; i < l; i++) {
            parent = mergeOptions(parent, child.mixins[i], vm)
            }
        }
        const options = {}
        let key
        for (key in parent) {
            mergeField(key)
        }
        for (key in child) {
            if (!hasOwn(parent, key)) {
            mergeField(key)
            }
        }
        function mergeField (key) {
            const strat = strats[key] || defaultStrat
            options[key] = strat(parent[key], child[key], vm, key)
        }
        return options
    }
```
1. 从注释可以知道该函数是合并两个option对象,同时返回一个新的对象,在实例化和继承中都是使用这个方法来合并的
2. 

### <span id="vue--private__util__initInternalComponent">initInternalComponent</span>