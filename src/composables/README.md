# Composables

本目录包含报表设计器的所有 Vue 3 composables，用于按功能模块组织逻辑。

## 文件说明

### useToolbar.ts
工具栏操作相关的 composable。

**功能：**
- 新建设计
- 撤销/重做
- 保存设计
- 预览
- 图表配置更新

### useDragDrop.ts
拖拽和调整大小相关的 composable。

**功能：**
- 从组件库拖拽到画布
- 画布内组件拖拽排序
- 组件高度调整
- 组件选择和删除

### useTableConfig.ts
表格组件配置相关的 composable。

**功能：**
- 表格列管理（添加、删除、移动）
- 静态数据编辑
- 数据源配置

### useFormConfig.ts
表单组件配置相关的 composable。

**功能：**
- 表单项管理（添加、删除、编辑）
- 表单项选项配置（静态/API）
- 表单项验证规则配置

### useChartData.ts
图表数据编辑相关的 composable。

**功能：**
- 图表数据编辑器管理
- 类别（categories）和系列（series）管理
- 静态数据和 API 数据源配置

### useComponentStyle.ts
组件样式计算相关的 composable。

**功能：**
- 通用组件样式计算
- 文本组件样式计算
- 矩形组件样式计算
- 线条组件样式计算

### useChartGenerator.ts
图表生成相关的 composable。

**功能：**
- 生成各类图表的 ECharts 配置
- 更新图表显示
- 初始化图表实例

支持的图表类型：
- 柱状图 (Bar Chart)
- 折线图 (Line Chart)
- 饼图 (Pie Chart)
- 散点图 (Scatter Chart)
- 仪表盘 (Gauge Chart)
- 漏斗图 (Funnel Chart)

## 使用方法

```vue
<script setup lang="ts">
import { useToolbar, useDragDrop, useTableConfig } from '@/composables';

// 使用工具栏功能
const { handleNew, handleSave, canUndo, canRedo } = useToolbar();

// 使用拖拽功能
const { handleDragStart, handleComponentClick } = useDragDrop(canvasRef, orderedComponents, createComponent);

// 使用表格配置功能
const { addTableColumn, removeTableColumn } = useTableConfig(selectedComponent);
</script>
```

## 设计原则

1. **单一职责**：每个 composable 只负责一个功能模块
2. **可复用性**：composable 可以在多个组件中复用
3. **类型安全**：使用 TypeScript 提供完整的类型定义
4. **响应式**：充分利用 Vue 3 的响应式系统
5. **清晰的文档**：每个函数都有完整的 JSDoc 注释
