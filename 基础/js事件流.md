事件流描述的是从页面接受事件的顺序分为: **IE事件流** 和 **标准事件流**

### IE事件流
就是事件的冒泡, 事件的出发点在事件监听的最具体的元素,再一层层的往上传播, 一直到最外层
### 标准事件流
就是事件的捕获, 事件的触发点在事件监听的具体元素的最外层, 再一层层的往下传播, 一直到最具体的元素

### DOM事件流
"DOM2级事件"规定的事件流包括三个阶段：事件捕获阶段、处于目标阶段、事件冒泡阶段。
![](https://user-gold-cdn.xitu.io/2017/8/23/52c95304faa114bfedc5665d612a4cc9?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### 事件调用
普通写法
```js
var config = { 
    once: false,
    passive: false,
    capture: false
    };
// or var config = false

var a = document.querySelector('a');
var fn = () => {console.log('click')};
a.addEventListener('click', fn, config);
a.removeEventListener('click', fn, config);
```
兼容写法
```js
var EventUtil = {
    addHandler: function (el, type, handler, config) {
        if (el.addEventListener) {
            el.addEventListener(type, handler, config);
        } else {
            el.attachEvent('on' + type, handler);
        }
    },
    removeHandler: function (el, type, handler) {
        if (el.removeEventListener) {
            el.removeEventListerner(type, handler, config);
        } else {
            el.detachEvent('on' + type, handler);
        }
    }
};
```
### 事件对象
1. currentTarget   事件处理程序当前正在处理事件的那个元素（始终等于this）
2. preventDefault  取消事件默认行为,比如链接的跳转
3. stopPropagation 取消事件冒泡
4. target  事件的目标
```js
var EventUtil = {
    addHandler: function (el, type, handler, config) {
        if (el.addEventListener) {
            el.addEventListener(type, handler, config);
        } else if (el.attachEvent) {
            el.attachEvent('on' + type, handler);
        } else {
            el['on' + type] = handler;
        }
    },
    removeHandler: function (el, type, handler, config) {
        if (el.removeEventListener) {
            el.removeEventListerner(type, handler, config);
        } else if (el.detachEvent) {
            el.detachEvent('on' + type, handler);
        } else {
            el['on' + type] = null;
        }
    },
    getEvent: function (e) {
        return e ? e : window.event;
    },
    getTarget: function (e) {
        return e.target ? e.target : e.srcElement;
    },
    preventDefault: function (e) {
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    },
    stopPropagation: function (e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }
    }
};
```

