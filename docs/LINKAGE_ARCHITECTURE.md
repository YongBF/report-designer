# 组件联动系统架构说明

## 设计目标

1. **灵活性**：支持任意组件间的联动
2. **可扩展性**：易于添加新的联动类型和动作
3. **可视化**：提供图形化配置界面
4. **安全性**：隔离执行环境，防止恶意代码
5. **调试友好**：完善的日志和错误提示

## 系统架构

```
┌───────────────────────────────────────────────────────────────┐
│                         报表设计器                              │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐    │
│  │  表单组件    │───▶│  联动管理器   │───▶│  表格组件    │    │
│  │  Form A     │    │  Linkage Mgr  │    │  Table B    │    │
│  │             │    │              │    │             │    │
│  │ [查询按钮]   │    │ - 依赖映射   │    │ - 接收参数   │    │
│  │ - name      │    │ - 数据转换   │    │ - API 请求   │    │
│  │ - date      │    │ - 触发时机   │    │ - 刷新数据   │    │
│  └─────────────┘    │ - 延迟执行   │    └─────────────┘    │
│                      │ - 自定义代码 │                      │
│                      └──────────────┘                      │
│                             │                               │
│                             ▼                               │
│                      ┌──────────────┐                      │
│                      │  事件系统     │                      │
│                      │              │                      │
│                      │ - refresh    │                      │
│                      │ - update     │                      │
│                      │ - toggle     │                      │
│                      │ - custom     │                      │
│                      └──────────────┘                      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## 核心模块

### 1. 类型定义 (types/linkage.ts)

定义了所有联动相关的 TypeScript 接口：

- `LinkageConfig`: 联动配置
- `ParameterMapping`: 参数映射
- `LinkageContext`: 执行上下文
- `LinkageActionType`: 动作类型枚举
- `ParameterMappingType`: 映射类型枚举

### 2. 联动管理器 (composables/useComponentLinkage.ts)

核心业务逻辑，提供：

- **CRUD 操作**：添加、删除、更新、查询联动配置
- **参数处理**：支持 4 种映射类型（直接、重命名、固定值、表达式）
- **联动执行**：异步执行联动逻辑
- **事件触发**：通过浏览器事件系统通信
- **日志记录**：记录所有联动执行情况

### 3. 配置面板 (components/ComponentLinkageConfig.vue)

用户界面，提供：

- **联动列表**：显示所有联动关系
- **可视化编辑**：拖拽式配置界面
- **参数映射配置**：表格化编辑参数映射
- **自定义代码编辑**：支持 JavaScript 代码

## 数据流

```
用户操作
    │
    ▼
┌──────────────┐
│ 源组件事件    │
│ (按钮点击等)  │
└──────┬───────┘
       │
       │ triggerLinkage(sourceId, event, data)
       ▼
┌──────────────┐
│ 查找联动配置  │
│ (根据源组件ID)│
└──────┬───────┘
       │
       │ 匹配触发事件
       ▼
┌──────────────┐
│ 处理参数映射  │
│ (4种映射类型) │
└──────┬───────┘
       │
       │ 生成目标参数
       ▼
┌──────────────┐
│ 执行联动动作  │
│ (refresh等)   │
└──────┬───────┘
       │
       │ 事件通知
       ▼
┌──────────────┐
│ 目标组件      │
│ (接收参数)    │
└──────────────┘
```

## 参数映射详解

### 直接映射

```
源: formData.userName  ──直接传递──▶  目标: params.name
```

### 重命名映射

```
源: formData.userId    ──重命名──▶  目标: params.id
```

### 固定值映射

```
源: (无)               ──固定值──▶  目标: params.status = 'active'
```

### 表达式映射

```
源: formData            ──表达式──▶  目标: params.query
                                    表达式: data.name + '_' + data.date
```

## 事件系统

使用浏览器 CustomEvent API 实现组件间通信：

```javascript
// 发送事件
window.dispatchEvent(new CustomEvent('component-linkage-refresh', {
  detail: { componentId, params }
}));

// 监听事件
window.addEventListener('component-linkage-refresh', (event) => {
  const { componentId, params } = event.detail;
  // 处理联动...
});
```

## 扩展点

### 1. 添加新的动作类型

在 `LinkageActionType` 枚举中添加新类型：

```typescript
export enum LinkageActionType {
  REFRESH = 'refresh',
  // 添加新类型
  HIGHLIGHT = 'highlight',
}
```

在 `executeLinkage` 函数中添加处理逻辑：

```typescript
case 'highlight':
  await executeHighlightAction(targetComponent, params);
  break;
```

### 2. 添加新的映射类型

在 `ParameterMappingType` 枚举中添加：

```typescript
export enum ParameterMappingType {
  DIRECT = 'direct',
  // 添加新类型
  TEMPLATE = 'template',
}
```

在 `processParameterMappings` 中添加处理：

```typescript
case 'template':
  value = evaluateTemplate(mapping.template, sourceData);
  break;
```

### 3. 添加新的触发事件

在配置面板的下拉选项中添加：

```vue
<el-option label="自定义事件" value="custom.event" />
```

## 安全考虑

### 1. 沙箱执行

自定义代码在受限环境中执行：

```typescript
const handler = new Function(
  'context',
  'params',
  'component',
  'console',
  'window',
  customHandler
);
```

### 2. 输入验证

所有映射参数都经过验证：

```typescript
if (!mapping.targetParam) {
  throw new Error('Target parameter is required');
}
```

### 3. 错误隔离

单个联动失败不影响其他联动：

```typescript
try {
  await executeLinkage(linkage, context);
} catch (error) {
  console.error('Linkage failed:', error);
  // 继续执行其他联动
}
```

## 性能优化

### 1. 延迟执行

避免频繁触发：

```typescript
if (linkage.delay && linkage.delay > 0) {
  await new Promise(resolve => setTimeout(resolve, linkage.delay));
}
```

### 2. 条件启用

可以临时禁用联动：

```typescript
{
  enabled: false  // 不执行此联动
}
```

### 3. 异步执行

所有联动都是异步的，不阻塞 UI：

```typescript
async function executeLinkage(...) {
  // 异步执行
}
```

## 未来增强

1. **可视化依赖图**：使用 D3.js 或 ECharts 显示组件联动关系
2. **联动测试工具**：在编辑器中测试联动效果
3. **联动模板**：预设常用的联动配置模板
4. **批量操作**：批量启用/禁用联动
5. **联动历史**：记录联动执行历史，便于调试
6. **联动分组**：将联动分组管理，提高可维护性
