# Hooks 目录

## 说明

此目录用于存放可复用的 Vue 3 Composition API hooks。

## 命名规范

- Hook 文件使用 camelCase 命名
- Hook 函数名使用 `use` 前缀

## 示例

```typescript
// hooks/useDebounce.ts
import { ref, watch } from 'vue';

export function useDebounce<T>(value: Ref<T>, delay: number) {
  const debouncedValue = ref(value.value) as Ref<T>;

  let timeout: NodeJS.Timeout | null = null;

  watch(value, (newValue) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      debouncedValue.value = newValue;
    }, delay);
  });

  return debouncedValue;
}
```

## 常用 Hooks

- `useDebounce` - 防抖
- `useThrottle` - 节流
- `useLocalStorage` - 本地存储
- `useFetch` - 数据请求
