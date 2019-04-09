### 环境配置
#### 安装依赖
```bash
yarn add jest @types/jest --dev
// 如果是依靠ts-loader解析ts和tsx文件
 yarn add ts-jest --dev
// 如果是依靠最新的babel解析ts和tsx
yarn add babel-jest --dev
```
#### 创建config文件
jest.config.js
```js
module.exports = {
    moduleFileExtensions: ['js', 'ts', 'tsx'],
    transform: {
        '^.+\\.tsx?$': 'babel-jest'
        // or
        '^.+\\.tsx?$': 'ts-jest'
    },
    testMatch: ['<rootDir>/test/**/?(*.)(spec|test).ts?(x)']
};