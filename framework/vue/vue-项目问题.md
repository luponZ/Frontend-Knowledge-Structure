### 单击和双击事件冲突
> 描述: 如果一个对象同时存在click和dblClick两个事件,当触发双击事件的同时会触发单击事件
解决方法
```js
{
    data: {
        clickTimer: null
    },
    method: {
        click() {
                if (!this.clickTimer) {
                    this.clickTimer = setTimeout(() => {
                        this.clickTimer = null;
                        // 业务代码
                    }, 500)
                }
            },

        dblClick() {
            clearTimeout(this.clickTimer);
            this.clickTimer = null;
            // 业务代码
        }
    }
}
// 网上的解决方案有缺陷,只是取消了双击中第一次的单击事件,但第二次的点击没取消
```
