### 产生的原因
1. 复用带有状态的组件嵌套过深
2. 需要在声明周期声明同样的服务
> 仅在顶层的 React 函数调用 hooks。也就是说，你不能在循环、条件或内嵌函数中调用 hooks。这将确保每次组件渲染时都以相同的顺序调用 hooks

### state hook
> 声明状态变量, 参数为initial State, 返回一个数组[stateName, stateHandle]
1. useState可以多次被调用互不影响
```jsx
import * as React from 'react',
function Mycomponent() {
    // it same as 
    // let _useState = React.useState(0);
    // let count = __useState[0];
    // let setCount = _useState[1];
    let [count, setCount] = React.useState(0);
    let [name, setName] = React.useState('harry');
    return (
        <div>
            <p>{count}</p>
            <button onClick={() => setCount(++count)}>click</button>
        </div>
    )
}
```

### effect hook
> 用于产生副作用的服务
1. 组件首次渲染和每次更新都会调用一次useEffect中传递的函数及其返回函数
2. useEffect中的函数是异步执行的,不会阻塞dom的渲染
3. 可以在useEffect传递的函数中,在返回的函数中执行副作用事件的解绑事件
4. 通过添加useEffect的第三个参数来避免useEffect在每次更新后都会执行
5. 可以被多次调用
```jsx
import * as React from 'react';

funcion MyComponent() {
    const [info, setInfo] = React.useState('is top');

    function handleScroll() {
        if (window.pageYOffset > 100) {
            setInfo('not is top')
        } else {
            setInfo('is top')
        }
    }
    React.useEffect(() => {
        document.addEventListener('scroll', handleScroll),
        // 返回的函数会在下次更新调用useEffect之前被调用
        return () => {
            document.removeEventListener('scroll', handleScroll)
        } 
    }, [info])
    return (
        <div>{info}</div>
    )
}
```