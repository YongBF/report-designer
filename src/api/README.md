# API 接口目录

## 说明

此目录用于存放所有 API 调用相关的代码。

## 目录结构

```
api/
├── index.ts          # API 统一导出
├── user.ts           # 用户相关 API
├── auth.ts           # 认证相关 API
└── ...
```

## 示例

```typescript
// api/user.ts
import request from './request';

export interface User {
  id: string;
  name: string;
  email: string;
}

export async function getUserById(id: string): Promise<User> {
  const response = await request.get(`/users/${id}`);
  return response.data;
}
```
