generator是一种异步解决方案
```js
function* generator() {
    console.log("begin");
    yield "hi";
    yield "hello";
    return "nihao"
}

var a = generator(); //这里没有执行函数中的语句
a.next(); // 打印了"begin"
a.next();
a.next();
```
### 流程
1. 函数调用时会被暂停,知道第一次调用next才开始执行接下的语句
2. 遇到yield表达式，就暂停执行后面的操作，并将紧跟在yield后面的那个表达式的值，作为返回的对象的value属性值。
3. 下一次调用next方法时，再继续往下执行，直到遇到下一个yield表达式
4. 如果没有再遇到新的yield表达式，就一直运行到函数结束，直到return语句为止，并将return语句后面的表达式的值，作为返回的对象的value属性值
5. 如果该函数没有return语句，则返回的对象的value属性值为undefined

### 注意
1. yield表达式如果用在另一个表达式之中，必须放在圆括号里面
```js
function* generator() {
    console.log('hello' + (yield "world"))
}
```
2. yield表达式用作函数参数或放在赋值表达式的右边，可以不加括号。
```js
function* generator() {  
    foo(yield 'a', yield 'b'); // OK
    let input = yield; // OK
}
```

### 与Iterator的接口关系
由于 Generator 函数就是遍历器生成函数，因此可以把 Generator 赋值给对象的Symbol.iterator属性，从而使得该对象具有 Iterator 接口
```js
var myIterable = {};
myIterable[Symbol.iterator] = function* () {
  yield 1;
  yield 2;
  yield 3;
};

[...myIterable] // [1, 2, 3]
```
其实generator执行后返回的就是一个迭代器对象
```js
function* myIterable() {
  yield 1;
  yield 2;
  yield 3;
};

var a = myIterable();

console.log(a); // {}
console.log(a[Symbol.iterator]()); // {}
console.log(a[Symbol.iterator]() == a); // true
```

### next的参数
yield 本身没有返回值,通过next(arg)可以让其返回一个参数,从而控制函数内部运行

### for...of循环, 扩展运算符, 解构赋值, Array.from
自动迭代遍历, 但不会输出最后一个return的内容

### throw方法
generator调用的返回的迭代对象都有一个throw的方法,改方法抛出的错误可以在generator内部被捕获
```js
var g = function* () {
  try {
    yield;
  } catch (e) {
    console.log(e);
  }
};

var i = g();
i.next();
i.throw(new Error('出错了！'));
```
1. throw方法抛出的错误要被内部捕获，前提是必须至少执行过一次next方法
2. throw方法被捕获以后，会附带执行下一条yield表达式。也就是说，会附带执行一次next方法。
3. generator内部未捕获的错误可以在外部被捕获

### return方法
返回给定的值，并且终结遍历 Generator 函数。
```js
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

var g = gen();

g.next()        // { value: 1, done: false }
g.return('foo') // { value: "foo", done: true }
g.next()        // { value: undefined, done: true }
```
1. 如果 Generator 函数内部有try...finally代码块，且正在执行try代码块，那么return方法会推迟到finally代码块执行完再执行。

### next(), throw(), return()的本质就是将yield替换成某个值

### yield*
ES6 提供了yield*表达式，作为解决办法，用来在一个 Generator 函数里面执行另一个 Generator 函数。返回一个迭代器对象
```js
function* foo() {
  yield 'a';
  yield 'b';
}

function* bar() {
  yield 'x';
  yield* foo();
  yield 'y';
}

// 等同于
function* bar() {
  yield 'x';
  yield 'a';
  yield 'b';
  yield 'y';
}

// 等同于
function* bar() {
  yield 'x';
  for (let v of foo()) {
    yield v;
  }
  yield 'y';
}

for (let v of bar()){
  console.log(v);
}
// "x"
// "a"
// "b"
// "y"
```
1. yield*后面的 Generator 函数（没有return语句时），等同于在 Generator 函数内部，部署一个for...of循环
2. 在有return语句时，则需要用var value = yield* iterator的形式获取return语句的值
3. 任何数据结构只要有 Iterator 接口，就可以被yield*遍历, 包括数组,字符串

```js 二叉树遍历Generator方式
function Tree(left, label, right) {
    this.left = left;
    this.label = label;
    this.right = right;
}

function* inorder(t) {
    if (t) {
        yield* inorder(t.left);
        yield t.label;
        yield* inorder(t.right);
    }
}

function make(arry) {
    if (arry.length === 1) {
        return new Tree(null, arry[0], null)
    } else {
        return new Tree(make(arry[0]), arry[1], make(arry[2]))
    }
}

let tree = make([[['a'], 'b', ['c']], 'd', [['e'], 'f', ['g']]]);
var result = [];
for (const iterator of inorder(tree)) {
    result.push(iterator)
}
console.log(result);
```

### Generator的对象形式表现
```js
const a = {
    * generator() {}
}
```