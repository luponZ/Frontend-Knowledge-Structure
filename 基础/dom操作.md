### 创建新元素
> document.createElement(String tagName)
> document.createTextNode(String text)
```js
const li = document.createElement('li');
const text = document.createTextNode('lalala');

li.appendChild(text);
document.getElementsByTagName('ul')[0].appendChild(li);
```

### 创建元素碎片
> document.DocumentFragment();
```js
const d = document.DocumentFragment():

d.appendChild(document.getElementByTagName('li')[0]) // 会将第一个li标签移除存入DocumentFragment中
document.getElementsByTagName('ul')[0].appendChild(d);
``` 

### 修改节点文本内容
> Element.textContent = String;
```js
const li = document.createElement('li');
li.textContent = 'test';
document.getElementsByTagName('ul')[0].appendChild(li);
```

### 修改节点内容
> Element.innerHtml = String;
```js
const ul = document.getElementsByTagName('ul');
ul.innerHtml = '<li>1</li>'; // 会覆盖ul下面的所有内容
```

### 修改属性
> Element.setAttribute(String AttributeName, String AttributeValue);
```js
const ul = document.getElementsByTagName('ul');
ul.setAttribute('class', 'ul');

// 对于class 可以使用一下的方法
ul.className = 'ul';
// 最好的办法还是用classList
ul.classList.add('class');
ul.classList.remove('class');
// 除了表单元素以外,其余的可以使用直接设置属性的方式来设置对应的属性值
// 直接设置属性的值可能无法在dom上直接显示.因此无法通过getAttribute获取属性值
ul.id = 'ul';
```

### 添加到末尾/移动到末尾元素
> parentNode.appendChild(newNode)
```js
const ul = document.getElementsByTagName('ul')[0];
const li = document.createElement('li');

ul.appendChild(li); // 添加元素到末尾
ul.appendChild(document.getElementsByTagName('li')[0]);// 移动元素到末尾
```

### 添加/移动元素
> parentNode.insertBefore(newNode, refrenceNode|null) // 移动元素到指定元素的前面
> parentNode.insertBefore(newNode, refrenceNode.nextSibling) // 移动元素到指定元素的后面
```js
const ul = document.getElementsByTagName('ul')[0];
const li = document.createElement('li');

ul.insertBefore(li, document.getElementsByTagName('li')[1]) // 将li插入原ul中第二个li的前面
ul.insertBefore(li, null) //移动上面的li到最后一位
```

### 替换元素
> parentNode.replaceChild(newNode, replaceNode)
```js
const ul = document.getElementsByTagName('ul')[0];
const li = document.createElement('li');
ul.replaceChild(li, ul.firstChild)
```

### 合并/分割文本节点
> Element.normalize()
> Element.splitText(int offset)
```js
var element = document.createElement("div");
element.className = "message";

var textNode1 = document.createTextNode("Hello world!");
element.appendChild(textNode);

var textNode2 = document.createTextNode("Yippee!");
element.appendChild(textNode2);

document.body.appendChild(element);
console.log(element.childNodes.length);    // 2

element.normalize();
console.log(element.childNodes.length);    // 1
console.log(element.firstChild.nodeValue); // "Hello world!Yippee!"
```

### Node 属性概述
1. nodeType：显示节点的类型
2. nodeName：显示节点的名称
3. nodeValue：显示节点的值(对于元素节点, 始终为null)
4. attributes：获取一个属性节点
5. firstChild：表示某一节点的第一个节点
6. lastChild：表示某一节点的最后一个子节点
7. childNodes：表示所在节点的所有子节点
8. parentNode：表示所在节点的父节点
9. nextSibling：紧挨着当前节点的下一个节点
10. previousSibling：紧挨着当前节点的上一个节点