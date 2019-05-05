### 什么是this
> js和java一样,一切皆为对象,甚至连运行环境也是, 所以函数都是运行在某一对象中的, 而this就是该对象.
> js中的环境是可以动态切换的,也就是说this的指向也是动态变化的


### call
```js
Function.prototype._call = function (context) {
    if (typeof context === 'undefined' || context === null) {
        context = window;
    }
    context.fn = this;
    let args = [...arguments].slice(1);
    let result = context.fn(...args);
    delete context.fn;
    return result;
}
```

### apply
```js
Function.prototype._apply = function (context) {
    if (typeof context === 'undefined' || context === null) {
        context = window;
    }
    context.fn = this;
    let args = arguments[1];
    if (args) {
        let result = context.fn(args)
    } else {
        let result = context.fn()
    }
    delete context.fn;
    return result
}
```

### bind
```js
Function.prototype._bind = function (context) {
    if (typeof this !== 'function') throw new Error();
    if (typeof context === 'undefined' || context === null) {
        context = window;
    }
    let _this = this;
    let arg = [...arguments].slice(1);
    return function Fn() {
        if (this instanceof Fn) {
            return _this.apply(this, arg.concat([...arguments]))
        } else {
            return _this.apply(context, arg.concat([...arguments]))
        }
    }
}
```