### new的过程
1. 创建一个空对象.
2. 将该对象的原型链指向构造函数的原型
3. 通过apply函数将构造函数的this指向空对象本身
4. 如果构造函数返回一个对象就返回该对象否则返回空对象

**伪代码**
```js
function _new(constructor, ...res) {
    const newObj = Object.create(constructor.prototype);
    // 或者
    const newObj = {};
    newObj.__proto__ = constructor.prototype;

    const result = constructor.apply(newObj, res);
    return (typeof result == 'object' && result != null) ? result : newObj
}
```