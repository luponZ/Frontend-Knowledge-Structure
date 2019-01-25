> EventLoop 即事件循环, 是js特有的一种并发模型.

### 首先理解堆, 栈, 队列三者的概念
#### 1.堆(Heap)
堆是一种利用完全二叉树维护的一维数组结构
#### 2.栈(Stack)
栈是一种后进先出(LIFO)的数据结构,只能在某端进行操作
#### 3.队列(Queue)
队列是一种先进先出(FIFO)的数据结构

### 任务类型
1. 宏任务(MacroTask)
包括 __script,setTimeout, setInterval, setImmediate, I/O, Ui rendering__
2. 微任务(MicoTask)
包括Promise,MutationObserver,process.nextTick

### 浏览器环境事件循环机制
1. 主线程依次执行压栈的宏任务
2. 遇到异步任务交给其他工作线程,并注册回调函数放入任务队列等待主线程执行
3. 宏任务结束出栈
4. 检查任务队微任务,并放入主线程执行
6. 浏览器重新渲染
7. 检查宏任务并压栈执行,往复如此

### Node环境事件循环机制

1. timers: 执行所有setTimeout和setInterval中到期的callback。
2. pending callback: 上一轮循环中少数的callback会放在这一阶段执行。
3. idle, prepare: 仅在内部使用。
4. poll: 最重要的阶段，执行pending callback，在适当的情况下回阻塞在这个阶段。该poll阶段有两个主要功能:
    1. 执行I/O回调。
    2. 处理轮询队列中的事件。

    __A. 当事件循环进入poll阶段并且在timers中没有可以执行定时器时，将发生以下两种情况之一:__
    1. 如果poll队列不为空，则事件循环将遍历其同步执行它们的callback队列，直到队列为空，或者达到system-dependent（系统相关限制）。
    2. 如果poll队列为空，则会发生以下两种情况之一:
        1. 如果有setImmediate()回调需要执行，则会立即停止执行poll阶段并进入执行check阶段以执行回调。
        2. 如果没有setImmediate()回到需要执行，poll阶段将等待callback被添加到队列中，然后立即执行。

    __B. 当设定了 timer 的话且 poll 队列为空，则会判断是否有 timer 超时，如果有的话会回到 timer 阶段执行回调。__
5. check: 执行setImmediate(setImmediate()是将事件插入到事件队列尾部，主线程和事件队列的函数执行完成之后立即执行setImmediate指定的回调函数)的callback。
6. close callbacks: 执行close事件的callback，例如socket.on('close'[,fn])或者http.server.on('close, fn)。

> 每个阶段之间都会执行 nextTickQueue 和 micoTask

看看下面的代码
```js
console.log('start')
setTimeout(() => {
  console.log('timer1')
  Promise.resolve().then(function() {
    console.log('promise1')
  })
}, 0)
setTimeout(() => {
  console.log('timer2')
  Promise.resolve().then(function() {
    console.log('promise2')
  })
}, 0)
Promise.resolve().then(function() {
  console.log('promise3')
})
console.log('end')
```
在浏览器环境输出
```js
start
end
promise3
timer1
promise1
timer2
promise2
```
在Node环境(10-)
```js
stat
end
promise3
timer1
promise1
timer2
promise2
```
> node 11的输出和浏览器一致

### Process.nextTick()
nextTick就像他的名字一样是当前事件阶段到下个事件中间的事件,包括主进程执行完获取任务队列和任务队列之间的循环

看看下面的代码"
```js
setImmediate(() => {
    console.log('setImmediate------------');
});
Promise.resolve().then(() => {
    console.log('resolve------------------');
});
process.nextTick(() => {
    console.log('process.nextTick========');
});
setTimeout(() => {
    console.log('setTimeout===============');
}, 0);
```
输出:
```js
"process.nextTick========"
"resolve------------------"
"setTimeout==============="
"setImmediate------------"
```