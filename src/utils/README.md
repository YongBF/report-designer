# Utils

本目录包含报表设计器的工具函数和数据定义。

## 文件说明

### componentData.ts
组件库数据定义。

**导出：**
- `ComponentItem` 接口：组件项类型定义
- `basicComponents`：基础组件列表
- `chartComponents`：图表组件列表
- `shapeComponents`：形状组件列表

### componentUtils.ts
组件创建工具函数。

**导出：**
- `createComponent(type, order)`：根据类型创建组件实例

### export.ts
导出功能相关的工具函数。

**导出：**
- `exportAsImage()`：导出为图片
- `exportAsPDF()`：导出为 PDF
- `exportAsJSON()`：导出为 JSON
- `exportAsExcel()`：导出为 Excel

### index.ts
统一导出所有工具函数。

## 使用方法

```typescript
import { basicComponents, chartComponents, shapeComponents } from '@/utils/componentData';
import { createComponent } from '@/utils/componentUtils';
import { exportAsImage, exportAsPDF } from '@/utils/export';

// 使用组件数据
basicComponents.forEach(item => {
  console.log(item.label);
});

// 创建组件
const component = createComponent('bar-chart', 0);

// 导出功能
await exportAsImage(currentDesign.value);
```

## 设计原则

1. **模块化**：每个功能模块独立为一个文件
2. **可维护性**：代码结构清晰，易于维护和扩展
3. **类型安全**：使用 TypeScript 提供完整的类型定义
4. **文档完善**：每个函数都有完整的 JSDoc 注释
