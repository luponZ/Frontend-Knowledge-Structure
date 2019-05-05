**packages/react/src/ReactCreateRef.js**

### 使用
```jsx
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    // 可以通过this.myRef来操作<div />
    this.myRef = React.createRef();
  }
  render() {
    return <div ref={this.myRef} />;
  }
}
```

### 源码流程
![sd](/imgs/react/react.createRef.png)