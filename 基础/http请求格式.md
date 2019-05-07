1. application/x-www-form-urlencoded
> form表单常用格式
```js
经过encodeURIComponent转义
key1=val1&key2=val2
```
2. multipart/form-data
> 文件,图片上传格式
```js
const formData = new FormData();
formData.append("username", "Groucho");
formData.append("accountnum", 123456); //数字123456会被立即转换成字符串 "123456"

// HTML 文件类型input，由用户选择
formData.append("userfile", fileInputElement.files[0]);

// JavaScript file-like 对象
var content = '<a id="a"><b id="b">hey!</b></a>'; // 新文件的正文...
var blob = new Blob([content], {type: "text/xml"});

formData.append("webmasterfile", blob);
```

3. application/json
> 使用json格式数据
```js
const data = JSON.stringify{name: 'harry'}
```

4. text/xml
> 用于传输xml数据
```js
const data = '<user><name>harry</name></user>'
```

