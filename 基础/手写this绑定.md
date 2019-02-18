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
}}
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