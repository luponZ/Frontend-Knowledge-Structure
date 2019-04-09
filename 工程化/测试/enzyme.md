### 环境配置
#### 安装依赖
```bash
yarn add enzyme @types/enzyme --dev
yarn add enzyme-adapter-react-16 --dev
yarn add enzyme-to-json --dev
```
jest.config.js添加下面配置项
```js
module.exports = {
    snapshotSerializers: ['enzyme-to-json/serializer'],
    setupFiles: ['<rootDir>/jest.shim.js', '<rootDir>/jest.setup.js'],
    ...   
};
```
jest.shim.js
```js
global.requestAnimationFrame = function(callback) {
	setTimeout(callback, 0);
};
```
jest.setup.js
```js
const enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-16");

enzyme.configure({ adapter: new Adapter() });
```
### enzyme的渲染方式
1. shallow: __浅渲染__,只渲染第一层, 子组件不会渲染,可以使用jQuery的方式访问组件的信息
2. render: __静态渲染__, 将组件渲染成html字符串,同时使用Cheerio这个库解析这段字符串，并返回一个Cheerio的实例对象，可以用来分析组件的html结构
3. mount: __完全渲染__, 将组件渲染成真实的dom节点, 用来测试DOM API的交互和组件的生命周期

### 重要api
1. simulate(event, mock)：用来触发模拟事件，event为事件的名称，mock为一个event object
2. instance: 返回测试组件的实例
3. find(selector)：根据选择器查找节点，selector可以是CSS中的选择器，也可以是组件的构造函数，以及组件的display name和Property
4. at(index)返回一组选择对象中的第几个
5. get(index)：返回一个react node，要测试它，需要重新渲染；
6. contains(nodeOrNodes)：当前对象是否包含参数重点 node，参数类型为react对象或对象数组；
7. text()：返回当前组件的文本内容；
8. html()： 返回当前组件的HTML代码形式；
9. props()：返回根组件的所有属性；
10. prop(key)：返回根组件的指定属性；
11. state()：返回根组件的状态；
12. setState(nextState)：设置根组件的状态；
13. setProps(nextProps)：设置根组件的属性；

[官方文档](https://airbnb.io/enzyme/)