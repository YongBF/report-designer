# 组件联动使用指南

## 概述

本系统的组件联动功能允许不同组件之间进行数据传递和交互，实现以下场景：

- 表单 → 表格：查询参数传递，触发表格数据查询
- 表单 → 图表：参数传递，触发图表数据刷新
- 表单 → 表单：数据联动，自动填充表单字段
- 按钮 → 任意组件：触发各种操作（刷新、显示/隐藏等）

## 快速开始

### 场景：表单查询按钮触发表格数据刷新

#### 步骤 1：准备表单和表格组件

首先创建一个表单组件，包含查询按钮：

```vue
<!-- 表单组件 -->
<el-form>
  <el-form-item label="姓名">
    <el-input v-model="formData.name" />
  </el-form-item>
  <el-form-item label="日期">
    <el-date-picker v-model="formData.date" />
  </el-form-item>
  <el-form-item>
    <!-- 查询按钮，配置动作为"查询" -->
    <el-button type="primary" @click="handleQuery">查询</el-button>
  </el-form-item>
</el-form>
```

然后创建一个表格组件，配置 API 数据源：

```javascript
// 表格组件配置
{
  type: 'table',
  id: 'table-user-list',
  dataSource: {
    type: 'api',
    apiUrl: '/api/users',
    apiMethod: 'POST',
    // 支持接收联动参数
    linkageParams: {
      name: '',
      date: ''
    }
  }
}
```

#### 步骤 2：配置联动关系

在属性面板中，为表单按钮添加联动配置：

```javascript
{
  id: 'linkage-1',
  sourceComponentId: 'form-search', // 源：表单组件
  targetComponentId: 'table-user-list', // 目标：表格组件
  triggerEvent: 'button.click', // 触发事件：按钮点击
  actionType: 'refresh', // 动作：刷新数据
  parameterMappings: [
    {
      type: 'direct',
      sourceField: 'formData.name',
      targetParam: 'name',
      defaultValue: ''
    },
    {
      type: 'direct',
      sourceField: 'formData.date',
      targetParam: 'date',
      defaultValue: ''
    }
  ],
  enabled: true,
  description: '表单查询触发表格刷新'
}
```

#### 步骤 3：在代码中触发联动

修改表单按钮的点击处理：

```typescript
import { useComponentLinkage } from '@/composables';

const linkageManager = useComponentLinkage();

function handleQuery() {
  // 获取表单数据
  const formData = {
    name: formState.name,
    date: formState.date
  };

  // 触发联动
  linkageManager.triggerLinkage(
    'form-search', // 当前组件 ID
    'button.click', // 触发事件
    null, // 事件数据
    formData, // 源数据
    () => getAllComponents() // 获取所有组件的函数
  );
}
```

#### 步骤 4：表格组件接收参数

表格组件需要监听联动参数变化：

```vue
<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useComponentLinkage } from '@/composables';

const props = defineProps<{
  component: TableComponent;
}>();

const linkageManager = useComponentLinkage();

// 监听联动刷新事件
onMounted(() => {
  window.addEventListener('component-linkage-refresh', handleLinkageRefresh);
});

// 处理联动刷新
async function handleLinkageRefresh(event: any) {
  if (event.detail.componentId !== props.component.id) return;

  const params = event.detail.params;
  console.log('Received linkage params:', params);

  // 使用参数发送 API 请求
  await fetchTableData(params);
}

// 获取表格数据
async function fetchTableData(params?: Record<string, any>) {
  const { apiUrl, apiMethod } = props.component.dataSource;

  const requestBody = {
    ...params,
    ...props.component.linkageParams // 合并联动参数
  };

  const response = await fetch(apiUrl, {
    method: apiMethod,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  // 更新表格数据...
}
</script>
```

## 参数映射类型

### 1. 直接映射 (direct)

源字段值直接赋给目标参数：

```javascript
{
  type: 'direct',
  sourceField: 'formData.name',
  targetParam: 'userName'
}
```

### 2. 重命名 (rename)

与直接映射相同，但语义更明确：

```javascript
{
  type: 'rename',
  sourceField: 'formData.userId',
  targetParam: 'id'
}
```

### 3. 固定值 (fixed)

目标参数始终使用固定值：

```javascript
{
  type: 'fixed',
  targetParam: 'status',
  fixedValue: 'active'
}
```

### 4. 表达式 (expression)

使用 JavaScript 表达式计算值：

```javascript
{
  type: 'expression',
  targetParam: 'query',
  expression: 'data.name + "_" + data.date'
}
```

## 联动动作类型

### 1. 刷新数据 (refresh)

触发目标组件刷新数据，最常用：

```javascript
{
  actionType: 'refresh'
}
```

### 2. 更新配置 (update_config)

动态更新目标组件的配置属性：

```javascript
{
  actionType: 'update_config',
  parameterMappings: [
    {
      type: 'fixed',
      targetParam: 'title',
      fixedValue: '用户列表'
    }
  ]
}
```

### 3. 显示/隐藏 (toggle_visible)

控制目标组件的可见性：

```javascript
{
  actionType: 'toggle_visible',
  parameterMappings: [
    {
      type: 'fixed',
      targetParam: 'visible',
      fixedValue: true
    }
  ]
}
```

### 4. 启用/禁用 (toggle_disabled)

控制目标组件的禁用状态：

```javascript
{
  actionType: 'toggle_disabled',
  parameterMappings: [
    {
      type: 'fixed',
      targetParam: 'disabled',
      fixedValue: false
    }
  ]
}
```

### 5. 自定义代码 (custom)

编写自定义处理逻辑：

```javascript
{
  actionType: 'custom',
  customHandler: `
    async function handle(context, params, component) {
      console.log('自定义联动', context, params);

      // 发送 API 请求
      const response = await fetch('/api/custom', {
        method: 'POST',
        body: JSON.stringify(params)
      });

      const data = await response.json();

      // 更新目标组件
      component.customData = data;

      // 触发其他操作...
    }
  `
}
```

## 高级用法

### 延迟执行

设置延迟时间（毫秒）：

```javascript
{
  delay: 500 // 延迟 500 毫秒执行
}
```

### 条件联动（使用表达式）

```javascript
{
  type: 'expression',
  targetParam: 'shouldRefresh',
  expression: 'data.age > 18 ? true : false'
}
```

### 多目标联动

一个组件可以触发多个目标组件：

```javascript
// 表单按钮点击
linkageManager.triggerLinkage(
  'form-search',
  'button.click',
  null,
  formData,
  getAllComponents
);

// 会自动触发所有配置的联动
// form-search → table-user-list
// form-search → chart-user-stats
```

### 联动链

A → B → C，形成联动链：

```javascript
// 组件 A 触发组件 B
linkage1: { source: 'A', target: 'B', ... }

// 组件 B 在刷新后触发组件 C
linkage2: { source: 'B', target: 'C', triggerEvent: 'data.loaded', ... }
```

## 在 App.vue 中集成

```vue
<script setup lang="ts">
import { useComponentLinkage } from '@/composables';
import ComponentLinkageConfig from '@/components/properties-panel/common/ComponentLinkageConfig.vue';

const linkageManager = useComponentLinkage();

// 获取所有组件
function getAllComponents() {
  return currentDesign.value.components;
}

// 修改表单按钮点击处理
function handleFormItemButtonClick(component: any, item: any) {
  // 获取表单数据
  const formData = getFormData(component);

  // 触发联动
  linkageManager.triggerLinkage(
    component.id,
    'button.click',
    { buttonId: item.id },
    formData,
    getAllComponents
  );

  // 执行按钮原有逻辑...
}

// 在属性面板中添加联动配置
</script>

<template>
  <!-- 属性面板 -->
  <el-tab-pane label="联动配置" name="linkage">
    <ComponentLinkageConfig
      :component="selectedComponent"
      :all-components="currentDesign.components"
      @update="handleUpdate"
    />
  </el-tab-pane>
</template>
```

## 调试技巧

### 查看联动日志

```javascript
const { executionLogs } = linkageManager;

console.log('联动执行日志:', executionLogs.value);
```

### 查看组件的所有联动

```javascript
const linkages = linkageManager.getComponentLinkages('component-id');

console.log('作为源:', linkages.asSource);
console.log('作为目标:', linkages.asTarget);
```

## 最佳实践

1. **命名规范**：联动描述要清晰，如"表单查询触发表格刷新"
2. **参数验证**：在目标组件中验证接收的参数
3. **错误处理**：在自定义代码中添加 try-catch
4. **性能优化**：使用延迟避免频繁触发
5. **可维护性**：复杂的联动逻辑使用自定义代码，保持配置简洁

## 示例项目

完整示例请参考：
- `/examples/linkage-form-to-table.vue` - 表单到表格
- `/examples/linkage-form-to-chart.vue` - 表单到图表
- `/examples/linkage-custom.vue` - 自定义联动
