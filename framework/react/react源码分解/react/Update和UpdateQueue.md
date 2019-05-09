ReactDom.render不仅涉及到了Fiber对象,还有Update对象,这个对象在前文(2.从入口看ReactDomRender.md)提到
updateContainer -> updateContainerAtExpirationTime -> scheduleRootUpdate -> createUpdate

### 什么是Update
1. 用于记录组件改变状态
2. 存放于UpdateQueue
3. 多个Update可以同时存在,但不会一次update就重新渲染,而是全部update后再放到UpdateQueue中