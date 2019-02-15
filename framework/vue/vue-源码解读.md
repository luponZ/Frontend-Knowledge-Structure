> 文章参考了[Vue.js 技术揭秘](https://ustbhuangyi.github.io/vue-analysis/prepare/entrance.html "Markdown") | [Vue技术内幕](http://hcysun.me/vue-design/)
> *只做个人理解使用*
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
2. 设置Vue实例_renderProxy的内部属性,这个属性是用于执行render函数时绑定内部this的用处,注意[initProxy](#vue--private__util__initProxy)只有在非生产模式下才会挂载proxy代理
3. 这些外部导入的方法才算是组件初始化功能
    1. [initLifecycle](#vue--private__util__initLifecycle)(初始化生命周期)
    2. initEvents(初始化事件中心)
    3. [initRender](#vue--private__util__initRender)(初始化渲染) 这段代码比较复杂,我们现在所能知道的就是改方法添加了几个实例属性
    4. 生命周期声明(beforeCreate)
    5. initInjections(初始化注入器)
    6. [initState](#vue--private__util__initState)(初始化data、props、computed、watcher)
    7. initProvide(初始化provide)
    8. 生命周期声明(created)

*************************************************
*************************************************

### 响应式系统
#### 1. data属性响应系统
##### 收集依赖
```js
function initData (vm: Component) {
  let data = vm.$options.data
  // P1
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  // P2
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) {
        // P3
      proxy(vm, `_data`, key)
    }
  }
  // P4
  // observe data
  observe(data, true /* asRootData */)
}
```
1. 判断data是否是函数(mergeOptions的时候会返回一个函数),如果是函数就通过getData来获取数据对象
2. 判断data与props和methods的属性是否相同,避免同名覆盖;或者是特定属性值(第一个字符是不是 $ 或 _)
3. 通过Object.defineProperty设置代理,当我们访问vue.data上的属性时,其实是访问vue._data上的属性
4. 这里开始设置data的响应数据系统,我们来看看 __observe__ 这个函数
```js
export function observe (value: any, asRootData: ?boolean): Observer | void {
    // P1
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  // P2
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
      // P3
    observerState.shouldConvert &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}
```
1. 这里判定是不是对象或者是VNode的实例,如果判断为真就返回
2. 判断对象上是否存在__ob__属性(该属性是Observer的实例),如果有就返回该属性
3. 判断五个属性,为真就返回新的 [Observer](#vue--private__util__Observer) 实例

##### 触发收集依赖
在lifecycle.js中有这一段话
```js
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
```
1. Watcher就是观察者,Watcher对表达式的求值触发了get拦截器,从而触发了对依赖的收集
2. updateComponent 函数的作用就是：把渲染函数生成的虚拟DOM渲染成真正的DOM
*************************************************
*************************************************

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
2. if的条件判断是Ctor.super,Ctor是一个构造函数, super指的就是父类,而我们知道传入的Ctor其实是就是Vue实例的构造函数,所以<b>如果传进的是new Vue()构造的实例, 就不会走这一步</b>, 而直接会把Vue.options返回, 而如果是通过Vue.extend()创造子类的实例对象就会走这一步
    1. 这里会递归调用resolveConstructorOptions,而传入的参数变成了构造器的父类, 同时比较构造器的superOptions和构造器的父类的option是否相等, 不相等的话就更新改构造器的superOptions
    2. 这里是修复了git上提的一个bug
    3. 调用了mergeOptions来合并superOptions和extendOptions(<span style="color: red">这个属性在Vue.extend中被定义</span>)并将其返回
********************************************************

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
        
        // P3
        if (typeof child === 'function') {
            child = child.options
        }

        // P4
        normalizeProps(child, vm)
        normalizeInject(child, vm)
        normalizeDirectives(child)

        // P5
        const extendsFrom = child.extends
        if (extendsFrom) {
            parent = mergeOptions(parent, extendsFrom, vm)
        }
        if (child.mixins) {
            for (let i = 0, l = child.mixins.length; i < l; i++) {
            parent = mergeOptions(parent, child.mixins[i], vm)
            }
        }

        // P6
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
            // P6-1
            const strat = strats[key] || defaultStrat
            options[key] = strat(parent[key], child[key], vm, key)
        }
        return options
    }
```
1. 从注释可以知道该函数是合并两个option对象,同时返回一个新的对象,在实例化和继承中都是使用这个方法来合并的
2. 在非生产环境下会检查child的component的名称是否符合要求:
    2.1 字由普通的字符和中横线(-)组成，且必须以字母开头
    2.2 不是内置标签
    ```js
        export const isBuiltInTag = makeMap('slot,component', true)
    ```
    2.3 不是保留标签
    ```js
        export const isReservedTag = makeMap(
            'template,script,style,element,content,slot,link,meta,svg,view,' +
            'a,div,img,image,text,span,input,switch,textarea,spinner,select,' +
            'slider,slider-neighbor,indicator,canvas,' +
            'list,cell,header,loading,loading-indicator,refresh,scrollable,scroller,' +
            'video,web,embed,tabbar,tabheader,datepicker,timepicker,marquee,countdown',
            true
        )
    ```
3. 如果子对象是函数就取其静态属性options
4. 对props,inject,directive进行规范化,因为在写vue的option时有很多简写方法,因此要将其统一
5. 合并extends和mixins,这里会递归调用该函数, 从代码的执行顺序来看,mixins的属性会覆盖extends的相同属性
6. 这里多次出现了mergeField这个函数,这个函数的作用是什么?
    1. 首先得到了一个strats对象或者默认strats对象,而这个[strats](#vue--private__util__mergeOptions__strats)对象最初就是一个完全空对象,后面会发现在不断添加对应属性的合并策略,而注释中也说明该对象的作用是合并策略使用;defaultStrat是一个如果子选项不是 undefined 那么就是用子选项，否则使用父选项的策略函数.

### <span id="vue--private__util__initInternalComponent">initInternalComponent</span>
********************************************************

###<span id="vue--private__util__mergeOptions__strats">strats合并策略函数详解</span>
#### 1. el,propsData
``` js
    strats.el = strats.propsData = function (parent, child, vm, key) {
        if (!vm) {
            warn(
                `option "${key}" can only be used during instance ` +
                'creation with the `new` keyword.'
            )
        }
        return defaultStrat(parent, child)
    }
```
> 由于合并策略在Vue实例化和继承(Vue.extend)时都会被调用,都返回 __默认策略值__, 但如果 __没有vm参数(即实例化时)__ 就会给出警告
#### 2. data
```js
    strats.data = function (
        parentVal: any,
        childVal: any,
        vm?: Component
    ): ?Function {
        if (!vm) {
            // P1
            if (childVal && typeof childVal !== 'function') {
            process.env.NODE_ENV !== 'production' && warn(
                'The "data" option should be a function ' +
                'that returns a per-instance value in component ' +
                'definitions.',
                vm
            )

            return parentVal
            }
            // P2
            return mergeDataOrFn.call(this, parentVal, childVal)
        }

        return mergeDataOrFn(parentVal, childVal, vm)
    }
```
1. 这里告诉我们data的返回格式应该是一个函数
2. 最后返回的都会mergeDataOrFn函数
让我们看看mergeDataOrFn这个函数:
```js
export function mergeDataOrFn (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
    // P1
  if (!vm) {
    //  P1-1  
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // P1-2
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this) : parentVal
      )
    }
  // P2  
  } else if (parentVal || childVal) {
    return function mergedInstanceDataFn () {
      // instance merge
      const instanceData = typeof childVal === 'function'
        ? childVal.call(vm)
        : childVal
      const defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm)
        : parentVal
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}
```
这里有个重要的逻辑判断-合并对象是否是子组件
1. 如果是
    1. 如果没有子选项则使用父选项，没有父选项就直接使用子选项,这里主要针对的是Vue.extend的情况 
    2. 如果父子选项都有就返回一个函数 mergedDataFn
2. 如果不是(new Vue()) 就返回一个函数 mergedInstanceDataFn
3. 整个函数的最后都返回了一个函数,而这个函数又返回了一个mergeData(to,from)函数,这个函数的作用简单说就是: __将 from 对象的属性混合到 to 对象中，也可以说是将 parentVal 对象的属性混合到 childVal 中，最后返回的是处理后的 childVal 对象__,而这样返回一个函数而不是合并好的对象是有原因的:
    1. 保证每个实例都有唯一的副本
    2. 保证props和inject属性先行初始化,这样就能在data属性中使用
    3. 有个有意思的地方是childVal.call(this),parentVal.call(this),在早先的版本中是childVal.call(this, this), parentVal.call(this, this).

#### 3. LIFECYCLE_HOOKS(生命周期钩子)
```js
/**
 * Hooks and props are merged as arrays.
 */
function mergeHook (
  parentVal: ?Array<Function>,
  childVal: ?Function | ?Array<Function>
): ?Array<Function> {
  // P1  
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      // P2
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}

LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})
```
1. 合并函数的逻辑还是比较简单的
```js
return (是否有 childVal，即判断组件的选项中是否有对应名字的生命周期钩子函数)
  ? 如果有 childVal 则判断是否有 parentVal
    ? 如果有 parentVal 则使用 concat 方法将二者合并为一个数组
    : 如果没有 parentVal 则判断 childVal 是不是一个数组
      ? 如果 childVal 是一个数组则直接返回
      : 否则将其作为数组的元素，然后返回数组
  : 如果没有 childVal 则直接返回 parentVal
```
2. 这里会判断传入的childVal是否是数组,一般我们设置的都是函数即:
```js
created() {
    console.log("created")
}
```
由此我们也可以知道我们还能写成数组:
```js
created: [
    function () {
      console.log('first')
    },
    function () {
      console.log('second')
    },
    function () {
      console.log('third')
    }
  ]
```

#### 4. ASSET_TYPES(资源:directives、filters 以及 components)
```js
/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): Object {
  // P1  
  const res = Object.create(parentVal || null)
  if (childVal)
    // P2
    process.env.NODE_ENV !== 'production' && assertObjectType(key, childVal, vm)
    return extend(res, childVal)
  } else {
    return res
  }
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})
```
1. 以parentVal为原型创建对象res
2. 如果存在childVal, 就用 extend 函数将 childVal 上的属性混合到 res 对象上并返回,注意在非生产环境会检测 childVal 是不是一个纯对象
3. 如果不存在就返回res

#### 5. watch
```js
/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): ?Object {
  // P1  
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) parentVal = undefined
  if (childVal === nativeWatch) childVal = undefined

  // P2
  /* istanbul ignore if */
  if (!childVal) return Object.create(parentVal || null)
  if (process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm)
  }
  if (!parentVal) return childVal

  // P3
  // P3-1
  const ret = {}
  extend(ret, parentVal)
  // P3-2
  for (const key in childVal) {
    let parent = ret[key]
    const child = childVal[key]
    if (parent && !Array.isArray(parent)) {
      parent = [parent]
    }
    ret[key] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child]
  }
  return ret
}
``` 
1. 这里会对firfox浏览器进行特殊处理,因为Firefox 浏览器中 Object.prototype 拥有原生的 watch 函数,这样即使用户没有传入watch选项,我们依然能获取到watch,这样在用户没有传入watch对象的时候,就重置为 undefined
2. 如果不存在childVal则返回parentVal;如果不存在parentVal,则返回childVal;
3. 如果childVal和parentVal都存在
    1. 声明一个对象ret, 并将parentVal的属性拷贝到该对象
    2. 将遍历childVal对象,如果ret已存在该对象,就先将原来ret上的属性设置成数组,并将childVal上的属性存入改数组;如果不存在该对象,就将childVal上的属性转成数组,并保存在ret对象上

#### 6. props、methods、inject、computed
```js
/**
 * Other object hashes.
 */
strats.props =
strats.methods =
strats.inject =
strats.computed = function (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): ?Object {
  if (childVal && process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm)
  }
  // P1
  if (!parentVal) return childVal
  // P2
  const ret = Object.create(null)
  extend(ret, parentVal)
  if (childVal) extend(ret, childVal)
  return ret
}
```
这个合并策略比较简单:
1. 如果不存在parentVal, 就返回childVal
2. 如果存在parentVal, 就声明一个空对象, 继承parentVal和childVal(如果存在,并且会覆盖父级),然后返回该对象

#### 7. provide
```js
strats.provide = mergeDataOrFn
```
可以知道provide的策略和data是一样的

#### 8. 其他属性(默认策略)
默认合并策略函数 defaultStrat 的策略是：只要子选项不是 undefined 就使用子选项，否则使用父选项。
********************************************************

### <span id="vue--private__util__initProxy">initProxy
```js
let initProxy

if (process.env.NODE_ENV !== 'production') {...}

export {initProxy}
```
我们可以看到initProxy只有在非生产模式下才会赋值
然后看下initProxy函数
```js
initProxy = function initProxy (vm) {
    // P1
    if (hasProxy) {
        // determine which proxy handler to use
        const options = vm.$options
        // P2
        const handlers = options.render && options.render._withStripped
            ? getHandler
            : hasHandler
        vm._renderProxy = new Proxy(vm, handlers)
    } else {
        vm._renderProxy = vm
    }
}
```
1. 这里会有个逻辑判断,会对浏览器是否支持proxy代理,如果支持就设置代理
2. 这边代理的回调会对条件进行判断,不过options.render._withStripped只在测试中出现,所以这里的handle一般都是hasHandler
我们看看hasHandler这个函数
```js
const hasHandler = {
    has (target, key) {
      const has = key in target
      const isAllowed = allowedGlobals(key) || key.charAt(0) === '_'
      if (!has && !isAllowed) {
        warnNonPresent(target, key)
      }
      return has || !isAllowed
    }
  }
```
我能可以看到拦截的属性必须符合以下条件,才会被正确拦截
1. 属性值存在
2. 被运行的全局属性或者属性是以_开头

否则将会抛出错误warnNonPresent, 我们可以看下这个抛出的错误
```js
warn(
      `Property or method "${key}" is not defined on the instance but ` +
      'referenced during render. Make sure that this property is reactive, ' +
      'either in the data option, or for class-based components, by ' +
      'initializing the property. ' +
      'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
      target
    )
```
警告信息提示你“在渲染的时候引用了 key，但是在实例对象上并没有定义 key 这个属性或方法”,我们也清除initProxy的作用是绑定渲染的作用域,提供一些提示信息

### <span id="vue--private__util__initLifecycle">initLifecycle</span>
```js
export function initLifecycle (vm: Component) {
  const options = vm.$options

  // P1  
  // locate first non-abstract parent
  let parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }

  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm

  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}
```
1. 经过while 循环后，parent 应该是一个非抽象的组件，将它作为当前实例的父级，所以将当前实例 vm 添加到父级的 $children 属性里,这里有个属性abstract可以注意一下,这个属性我们很少使用,那这个属性是干什么的,实际上设置abstract: true的属性的组件表示其为抽象组件,这种抽象组件不会产生实际的dom结构,例如keep-alive

### <span id="#vue--private__util__initRender">initRender</span>
```js
export function initRender (vm: Component) {
  vm._vnode = null // the root of the child tree
  const options = vm.$options
  const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
  const renderContext = parentVnode && parentVnode.context
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
  vm.$scopedSlots = emptyObject
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  const parentData = parentVnode && parentVnode.data

  /* istanbul ignore else */
  if (process.env.NODE_ENV !== 'production') {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm)
    }, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm)
    }, true)
  } else {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
  }
}
```

### <span id="#vue--private__util__initState">initState</span>
```js
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```
分别初始化了props methods data computed watch, 搭建了响应式系统

**************************************************
### <span id="#vue--private__util__Observer">Observer</span>
```js
// P1
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that has this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    // P2
    def(value, '__ob__', this)
    // P3
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  /**
   * Walk through each property and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
   // P3-2
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }

  /**
   * Observe a list of Array items.
   */
   // P3-1
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}
```
1. 首先可以知道Observer构造函数有三个属性和两个方法
2. 这里调用了Object.defineProperty定义了__ob__属性,也就是构造函数本身
3. 这里会对数据对象类型做判断,
    1. 如果为数组对象, 先为数组的增删方法设置代理检测,然后遍历数组对象,按照普通对象方法检测
    2. 如果为普通对象,就调用walk方法,这里对每个属性都调用defineReactive方法
```js

export function defineReactive (
    obj: Object,
    key: string,
    val: any,
    customSetter?: ?Function,
    shallow?:boolean
) 
    // P1
    const dep = new Dep()

    //P2
    const property = Object.getOwnPropertyDescriptor(obj, key)
    if (property && property.configurable === false) {
        return
    }

    // cater for pre-defined getter/setters
    const getter = property && property.get
    const setter = property && property.set

    // P3
    let childOb = !shallow && observe(val)
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        // P4
        get: function reactiveGetter () {
            // P4-1
            const value = getter ? getter.call(obj) : val
            if (Dep.target) {
                // P4-2
                dep.depend()
                // P4-3
                if (childOb) {
                    childOb.dep.depend()
                    if (Array.isArray(value)) {
                        // P4-4
                        dependArray(value)
                    }
                }
            }
            return value
        },
        // P5
        set: function reactiveSetter (newVal) {
            // P5-1
            const value = getter ? getter.call(obj) : val
            /* eslint-disable no-self-compare */
            if (newVal === value || (newVal !== newVal && value !== value)) {
                return
            }
            /* eslint-enable no-self-compare */
            if (process.env.NODE_ENV !== 'production' && customSetter) {
                customSetter()
            }
            // P5-2
            if (setter) {
                setter.call(obj, newVal)
            } else {
                val = newVal
            }
            // P5-3
            childOb = !shallow && observe(newVal)
            // P5-4
            dep.notify()
        }
    })
}
```
1. 依赖收集器(与Observer中的dep不同的是,这个dep针对的是所有属性值,而Observer的针对的是普通对象和数组)
2. 判断对象的属性描述是否是可编辑,同时获取可能存在的get和setter方法
3. 通过shallow来判断是否进行深度观测
4. get属性作用:
    1. __返回原属性的getter值 || 原属性值__
    2. __自身收集依赖(自身值变化引起的handle), dep.depend()就是执行dep对象的depend方法并将依赖收集到dep这个对象中__
    3. __子对象收集依赖(子属性的值变化引起的handle), childOb其实就是data[ParentProp].\_\_ob\_\_属性__
5. set属性作用:
    1. __比较新值和旧值,在值不同且值不为NaN的时候赋值__
    2. __如果存在用户定义的set方法就执行原来的set,否则就设置新值__
    3. __对新值进行深度检测__
    4. __执行每一个响应依赖__
   ************

   ### <span id="#vue--private__util__Watcher">Watcher</span>
```js
export default class Watcher {
  vm: Component;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: SimpleSet;
  newDepIds: SimpleSet;
  before: ?Function;
  getter: Function;
  value: any;

  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    this.vm = vm
    if (isRenderWatcher) {
      vm._watcher = this
    }
    vm._watchers.push(this)
    // options
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
      this.before = options.before
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    this.dirty = this.lazy // for lazy watchers
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = noop
        process.env.NODE_ENV !== 'production' && warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        )
      }
    }
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get () {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    return value
  }

  /**
   * Add a dependency to this directive.
   */
  addDep (dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }

  /**
   * Clean up for dependency collection.
   */
  cleanupDeps () {
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run () {
    if (this.active) {
      const value = this.get()
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        this.value = value
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue)
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  evaluate () {
    this.value = this.get()
    this.dirty = false
  }

  /**
   * Depend on all deps collected by this watcher.
   */
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  /**
   * Remove self from all dependencies' subscriber list.
   */
  teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this)
      }
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
    }
  }
}
```