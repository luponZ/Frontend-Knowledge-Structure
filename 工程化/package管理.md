### [lerna](https://github.com/minhuaF/blog/issues/2)
> 项目包的组织和管理
#### 安装
```bash
npm i -g lerna
cd project
```
#### 初始化项目
1. 固定模式(Fixed mode)
> 固定模式中，packages下的所有包共用一个版本号(version)，会自动将所有的包绑定到一个版本号上(该版本号也就是lerna.json中的version字段)，所以任意一个包发生了更新，这个共用的版本号就会发生改变
```bash
lerna init
```
2. 独立模式(Independent mode)
> 独立模式允许每一个包有一个独立的版本号，在使用lerna publish命令时，可以为每个包单独制定具体的操作，同时可以只更新某一个包的版本号。每次发布时，你都会收到每个发生更改的包的提示，同时来指定它是 patch，minor，major 还是自定义类型的迭代。
```bash
lerna init --independent
```

#### 新建包
```bash
lerna create [name] [ioc]
# lerna create pkg01 module ---> /packages/module/pkg01
```

#### 添加依赖
```bash
lerna add module-1 packages/module-2 # Install module-1 to module-2
lerna add module-1 --scope=module-2 # Install module-1 to module-2
lerna add module-1 --scope=module-2 --dev # Install module-1 to module-2 in devDependencies
lerna add module-1 # Install module-1 in all modules except module-1
lerna add babel-core # Install babel-core in all modules
```
__注意: 在一些环境情况会出现使用lerna add module-1 --scope=module-2报错的情况, 该情况可以通过继续执行lerna bootstrap或者用packages/module-2来代替--scope=module-2来尝试解决__

#### 清除包依赖
```bash
lerna clean [--scope=你要包含的包]|[--ignore=你要忽视的包]
```

#### 包版本迭代



### 配置文件
> lerna.json
```json
{
  "version": "1.1.3", // 版本, 默认Fix模式下依赖该版本
  "npmClient": "npm", // 包下载管理器, 默认为npm, 可修改为yarn
  "command": {
    "publish": {
      "ignoreChanges": ["ignored-file", "*.md"], // pubish时忽略的文件变化
      "message": "chore(release): publish"
    },
    "bootstrap": {
      "ignore": "component-*", // bootstrap时忽略的文件
      "npmClientArgs": ["--no-package-lock"] // bootstrap默认带的参数
    }
  },
  "packages": ["packages/*"] // packages文件夹
}
```

### 参考文章
[使用lerna优雅地管理多个package](https://zhuanlan.zhihu.com/p/35237759)
[lerna管理前端packages的最佳实践](https://juejin.im/post/5a989fb451882555731b88c2)
[手摸手教你玩转 Lerna](https://blog.runningcoder.me/2018/08/17/learning-lerna/)