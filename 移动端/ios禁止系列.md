### 禁止缩放
> ios在ios10以前是通过initial-scale=1.0实现的
```html
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;" name="viewport" />
```
> ios10+的情况下 完美解决
```js
document.addEventListener('touchstart',function (event) {
        if(event.touches.length>1){
        event.preventDefault();
        }
        },  {
        passive: false  // 关闭被动监听
    });
var lastTouchEnd=0;

document.addEventListener('touchend',function (event) {
    var now=(new Date()).getTime();
    if(now-lastTouchEnd<=300){
    event.preventDefault();
    }
    lastTouchEnd=now;
},false);

// 该事件只在ios上有用
document.addEventListener('gesturestart', function (event) {
    event.preventDefault();
});
```

### 禁止下拉弹簧效果
```html
<style>
html. body {
    width: 100%;
    height: 100%;
}
.wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>
<div class="wrapper">
    <article></article>
</div>
```