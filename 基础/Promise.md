### 基础的Promise方法
下面是一个范例
```js
// 延时执行promise
function asyncFun() {
    return new Promise((resolve, reject) => {
        // 异步操作
        setTimeout(() => {
            resolve()
        }, 1000)
    })
}
// 立即执行promise
function asyncFunResolveImmediately() {
    return Promise.resolve()
}
function asyncFunRejectImmediately() {
    return Promise.reject()
}

asyncFun().then(
    () => console.log('success'),
    (err) => console.error(error) 
).catch(
    (err) => console.error(error) 
)
```
1. Promise.resolve()只是 new Promise((resolve) => resolve())的语法糖
2. 无论是延时执行还是立即执行,都会将对应的onFulfilled事件加到micro队列中
3. Promise.resolve()调用的是then中的resolve的方法,Promise.reject()调用的是catch中的方法

### 为什么Promise.resolve()和Promise.reject()仍然是异步的
> 不能在异步回调函数中进行同步调用, 这样的结果是不可控的

### Promise Chain
我们会经常碰到下面的表达式
```js
const promise = Promise.resolve;
promise.then(fn).then(fn2).fn(fn3).catch(fn4)
```
**为什么then的后面可以继续使用then或者catch**
> then函数返回的实际上是新的Promise.resolve(resolve函数中返回的对象)对象 / Promise.reject(reject函数中返回的对象),因此可以执行链式操作,同时上个then中返回的值可以作为下一个then中函数的参数

### catch在IE8下面的问题
catch只是promise.then(undefined, onRejected)的别名;
IE8-使用的是基于ECMAScript 3使用的,catch作为保留字无法使用;而基于ECMAScript 5实现的浏览器是可以将保留字作为属性使用的

### Promise.all和Promise.race
```js
const promiseFun1 = () => new Promise(resolve,reject);
const promiseFun2 = () => new Promise(resolve, reject);

Promise.all([promiseFun1(), promiseFun2()]).then(() => void)
Promise.race([promiseFun1(), promiseFun2()]).then(() => void)
```
1. Promise.all是所有promise都resolve或者reject才执行then, 得到的参数和执行的promise顺序相同, 所有promise都是并行执行的.
2. Promise.race是只要有一个promise返回resove或者reject就是会执行then, Promise.race 在第一个promise对象变为Fulfilled之后，并不会取消其他promise对象的执行。

### 实现一个Promise
```js
function MyPromise(executor) {
    this.status = 'pending'; // promise当前状态
    this.data = null; // promise的值
    this.onResolveCallback = []; // resolve集
    this.onRejectCallback = []; // reject集

    this.resolve = function(value) {
        if (this.status === 'pending') {
            this.status = 'resolved';
            this.data = value;
            // 如果已经注册了resolve事件就会直接运行
            this.onResolveCallback.forEach(resolve => resolve(this.data));
        }
    }

    this.reject = function(reason) {
        if (this.status === 'pending') {
            this.status = 'rejected';
            this.data = reason;
            // 如果已经注册了reject事件就会直接执行
            this.onRejectCallback.forEach(reject => reject(this.data));
        }
    }

    try {
        // 执行异步的主体函数
        executor(this.resolve.bind(this), this.reject.bind(this))
    } catch (e) {
        reject.bind(this, e)
    }

}
MyPromise.prototype.catch = function (errorCatch) {
    return this.then(null, errorCatch);
}
MyPromise.prototype.then = function (onResolved, onRejected) {
    const self = this;
    let newP = null;
    let x = null;
    onResolved = typeof onResolved === 'function' ? onResolved : (value) => value;
    onRejected = typeof onRejected === 'function' ? onRejected : (error) => { throw error};

    /**
     * 如果当前的Promise还处于pending状态，我们并不能确定调用onResolved还是onRejected
     * 只能等到Promise的状态确定后，才能确实如何处理。
     * 需要将对应的处理逻辑放入onResolveCallback和onRejectCallback队列中
     */
    if (self.status === 'pending') {
        newP = new MyPromise((resolve, reject) => {
            self.onResolveCallback.push(function () {
                try {
                   x = onResolved(self.data);
                    if (x instanceof MyPromise) {
                       x.then(resolve, reject);
                   }
                } catch (error) {
                    reject(error)
                }
            });
            self.onRejectCallback.push(function() {
                try {
                    x = onRejected(self.data);
                    if (x instanceof MyPromise) {
                      x.then(resolve. reject);
                    }  
                } catch (error) {
                    reject(error)
                }
            })
        })
    }
    /**
     * resolved状态
     */
    if (self.status === 'resolved') {
        newP = new MyPromise((resolve, reject) => {
            try {
                x = onResolved(self.data);
                if (x instanceof MyPromise) {
                    x.then(resolve, reject)
                }
                resolve(x);
            } catch (error) {
                reject(error)
            }
        })
    }
    /**
     * reject状态
     */
    if (self.status === 'rejected') {
        newP = new MyPromise((resolve, reject) => {
            try {
                x = onRejected(self.data);
                if (x instanceof MyPromise) {
                    x.then(resolve, reject);
                }
            } catch (error) {
               reject(error) 
            }
        })
    }

    return newP;
}

MyPromise.resolve = function (data) {
    return new MyPromise(resolve => setImmediate(() => resolve(data)));
}
MyPromise.reject = function (reason) {
    return new MyPromise((resolve, reject) => setImmediate(() => reject(reason)));
}
```