# 组件联动 - 快速使用指南

## ✅ 已完成的集成

联动配置现在已经完全集成到报表设计器中！

**位置**：选中任意组件后，在右侧属性面板底部可以看到"组件联动"部分

## 🎯 快速开始：表单 → 表格联动

### 步骤 1：创建组件

1. 从组件库拖拽一个**表单组件**到画布
2. 添加一个**文本输入框**，字段名设为 `name`
3. 添加一个**按钮**，标签设为"查询"
4. 再拖拽一个**表格组件**到画布

### 步骤 2：配置联动

1. 点击选中**表单组件**
2. 在右侧属性面板滚动到底部，找到**"组件联动"**部分
3. 点击 **"+ 添加联动"** 按钮
4. 填写配置：

**基本配置：**
- 描述：`表单查询触发表格刷新`
- 源组件：选择**表单**（当前选中的组件）
- 目标组件：选择**表格**
- 触发事件：`按钮点击`
- 联动动作：`刷新数据`

**参数映射：**
点击 **"+ 添加映射"**，添加以下映射：

| 映射类型 | 源字段 | 目标参数 | 默认值 |
|---------|--------|---------|--------|
| 直接映射 | `formData.name` | `name` | (留空) |

### 步骤 3：保存并测试

1. 点击"保存"按钮
2. 点击表单中的"查询"按钮
3. 打开浏览器控制台，查看联动日志

### 步骤 4：查看效果

在控制台中，您会看到如下日志：

```javascript
[Form Button Click] {
  formId: "form-xxx",
  buttonId: "item-xxx",
  buttonLabel: "查询",
  actionType: "submit",
  timestamp: "2025-01-16T..."
}

[Linkage] Triggered 1 linkages

[Linkage Execution] {
  linkageId: "linkage-xxx",
  sourceId: "form-xxx",
  targetId: "table-xxx",
  actionType: "refresh"
}

[Linkage] Mapped parameters: {
  name: "用户输入的值"
}

[Linkage] Refresh action: {
  componentId: "table-xxx",
  params: { name: "..." }
}
```

## 📝 配置说明

### 参数映射（可选）

**重要说明**：参数映射现在是**可选的**！

- **不配置映射**：目标组件将接收源组件的所有数据
- **配置映射**：目标组件接收源组件的所有数据 + 映射参数的额外设置（映射参数可覆盖源数据同名字段）

例如：
- 表单数据：`{name: "张三", email: "test@example.com"}`
- 不配置映射 → 目标接收：`{name: "张三", email: "test@example.com"}`
- 配置映射 `name → userName` → 目标接收：`{name: "张三", email: "test@example.com", userName: "张三"}`

### 参数映射类型

#### 1. 直接映射 (最常用)

```
源: formData.name  →  目标: params.name
```
配置：
- 类型：直接映射
- 源字段：`formData.name`
- 目标参数：`name`

#### 2. 固定值

```
目标: params.status = "active"
```
配置：
- 类型：固定值
- 目标参数：`status`
- 固定值：`active`

#### 3. 表达式 (高级)

```
源: formData  →  目标: params.query = data.name + "_" + data.date
```
配置：
- 类型：表达式
- 目标参数：`query`
- 表达式：`data.name + "_" + data.date`

### 联动动作类型

| 动作 | 说明 | 使用场景 |
|-----|------|---------|
| 刷新数据 | 重新加载组件数据 | 表格、图表等 |
| 更新配置 | 动态修改组件属性 | 动态修改标题、颜色等 |
| 显示/隐藏 | 控制组件可见性 | 条件显示内容 |
| 启用/禁用 | 控制组件可用性 | 条件禁用输入 |
| 自定义代码 | 编写自定义逻辑 | 复杂业务逻辑 |

## 🔧 实际应用场景

### 场景 1：用户查询

**表单**：姓名输入框 + 查询按钮
**表格**：用户列表

配置：
- 源：表单查询按钮
- 目标：表格
- 动作：刷新数据
- 参数：`formData.name` → `params.userName`

### 场景 2：日期范围筛选

**表单**：开始日期 + 结束日期 + 查询按钮
**折线图**：销售趋势图

配置：
- 源：表单查询按钮
- 目标：折线图
- 动作：刷新数据
- 参数：
  - `formData.startDate` → `params.start`
  - `formData.endDate` → `params.end`

### 场景 3：条件显示

**表单**：类型选择器（普通用户/VIP）
**组件**：VIP 专属图表

配置：
- 源：表单类型选择器
- 目标：VIP 图表
- 触发事件：值变化
- 动作：显示/隐藏
- 参数：
  - 类型：表达式
  - 表达式：`data.type === 'vip' ? true : false`
  - 目标参数：`visible`

## 💡 高级技巧

### 1. 延迟执行

如果表单有多个输入框，避免每次输入都触发联动：

在配置中设置延迟时间（毫秒），如 `500`。

### 2. 多目标联动

一个表单按钮可以触发多个组件：

配置多个联动：
- 表单 → 表格 1
- 表单 → 表格 2
- 表单 → 图表

### 3. 联动链

A → B → C，形成联动链：

- 联动1：表单按钮 → 表格（动作：刷新数据）
- 联动2：表格（事件：数据加载完成）→ 图表（动作：刷新数据）

### 4. 自定义代码

选择动作类型为"自定义"，编写 JavaScript 代码：

```javascript
// 示例：弹窗确认
if (params.name) {
  const confirmed = confirm('确定要查询 ' + params.name + ' 吗？');
  if (!confirmed) return;
}

// 示例：发送 API 请求
const response = await fetch('/api/search', {
  method: 'POST',
  body: JSON.stringify(params)
});

// 更新目标组件数据
component.customData = await response.json();
```

## ⚠️ 注意事项

1. **字段名匹配**：确保源字段名（如 `formData.name`）与表单项的字段名一致
2. **参数名称**：目标参数名要符合目标组件 API 的要求
3. **类型转换**：如需类型转换，使用表达式类型
4. **默认值**：建议设置默认值，避免空值错误
5. **测试联动**：使用控制台日志查看联动执行情况

## 📚 下一步

- 查看 [完整文档](./COMPONENT_LINKAGE_GUIDE.md) 了解更多细节
- 查看 [架构文档](./LINKAGE_ARCHITECTURE.md) 了解实现原理
- 尝试配置不同类型的联动，熟悉系统功能
