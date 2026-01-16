# 常量目录

## 说明

此目录用于存放项目中的常量定义。

## 命名规范

使用 camelCase 命名文件

## 示例

```typescript
// constants/api.ts
export const API_BASE_URL = '/api';
export const API_TIMEOUT = 5000;

// constants/index.ts
export * from './api';
export * from './config';
```

## 常量类型

- API 相关常量
- 业务常量
- 配置常量
- 环境变量
