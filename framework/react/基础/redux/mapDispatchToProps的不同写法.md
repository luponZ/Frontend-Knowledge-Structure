### 1
```jsx
const mapDispatchToProps = (dispatch) => {
    return {
        actionOne: () => dispatch(ACTION_NAME)
    }
}
```
### 2
```jsx
const mapDispatchToProps = (dispatch) => ({
 actionOne: bindActionCreators(ACTION_NAME, dispatch)
})
```
### 3
```jsx
// 这是第一种的无参简写
const mapDispatchToProps = {ACTION_NAME}
```