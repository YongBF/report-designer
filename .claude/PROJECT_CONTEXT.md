# Report Designer - Claude Code 项目参考文档

> 📌 **用途**: 在新的 Claude Code 会话中使用本文档，避免重复错误，加速开发。

---

## 📋 目录

1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [Playwright 测试最佳实践](#playwright-测试最佳实践)
4. [已知问题和解决方案](#已知问题和解决方案)
5. [Pinia 状态管理最佳实践](#pinia-状态管理最佳实践) ⭐ 新增
6. [UI 结构说明](#ui-结构说明)
7. [代码示例库](#代码示例库)
8. [检查清单](#检查清单)
9. [新会话快速开始](#新会话快速开始)

---

## 项目概述

### 核心功能
Report Designer 是一个**可视化报表设计器**，支持：
- 🎨 拖拽式组件布局（文本、图片、表格、表单、图表）
- 📊 多种图表类型（柱状图、折线图、饼图、散点图、仪表盘）
- 🔗 组件联动功能（触发事件、参数映射）
- 📡 API 数据源配置
- 🖼️ 报表预览和导出

### 项目结构
```
report-designer/
├── src/
│   ├── components/
│   │   ├── canvas/          # 画布和渲染器
│   │   ├── properties-panel/ # 属性配置面板
│   │   ├── toolbar/         # 工具栏
│   │   └── common/          # 通用组件
│   ├── composables/         # Vue 组合式函数
│   ├── stores/
│   │   ├── pinia/           # Pinia 状态管理 ⭐ 新增
│   │   │   ├── designerStore.ts  # 设计器 store
│   │   │   └── index.ts           # Store 导出
│   │   └── designer.ts      # 兼容层(向后兼容)
│   ├── types/              # TypeScript 类型定义
│   └── utils/              # 工具函数
├── e2e/                    # Playwright E2E 测试
├── mock-server/            # 测试用 Mock Server
└── docs/                   # 项目文档
```

### 当前状态
- ✅ **自动化测试系统**: 53个测试，100%通过率
- ✅ **组件联动功能**: 完整实现，支持多种联动模式
- ✅ **Mock Server**: 10个API端点
- ✅ **加载状态**: Loading/Empty/Error 状态展示
- ✅ **Pinia 状态管理**: 统一的状态管理,支持渐进式迁移 ⭐ **2026-01-16**

---

## 技术栈

### 前端框架
- **Vue 3.5** - Composition API
- **TypeScript 5.9** - 类型安全
- **Vite 5.4** - 构建工具

### 状态管理
- **Pinia 2.2** - 统一状态管理 ⭐ **2026-01-16 新增**
- **兼容层** - 支持旧的导入方式,渐进式迁移
- **Store 文件**: `src/stores/pinia/designerStore.ts`

### UI 组件库
- **Element Plus 2.13** - 主要UI组件
- ⚠️ **重要**: Element Plus 的 Select 不是原生 `<select>`

### 图表库
- **ECharts 6.0** - 所有图表组件
- **Vue-Draggable-Plus** - 拖拽功能

### 测试框架
- **Playwright 1.57** - E2E 测试
- **Chromium** - 测试浏览器

### 开发服务器
- **Vite Dev Server**: http://localhost:5173 (或 5174,如果5173被占用)
- **Mock Server**: http://localhost:3001

---

## Playwright 测试最佳实践

### ✅ DO - 正确做法

#### 1. 拖拽组件到画布
```javascript
// ✅ 正确：使用 dragTo()
const canvas = page.locator('.canvas-content-inner');
const component = page.locator('.component-item').filter({ hasText: '文本' });
await component.dragTo(canvas, {
  targetPosition: { x: 400, y: 300 }
});

// ❌ 错误：假设有"添加"按钮
await page.click('button:has-text("添加文本")');
```

#### 2. 拖拽位置选择
```javascript
// ✅ 正确：使用靠左位置，避免右侧面板遮挡
await component.dragTo(canvas, {
  targetPosition: { x: 150, y: 300 }  // x < 200 安全
});

// ❌ 错误：太靠右会被右侧属性面板遮挡
await component.dragTo(canvas, {
  targetPosition: { x: 400, y: 300 }  // 可能被遮挡
});
```

#### 3. 元素定位
```javascript
// ✅ 正确：使用精确的 class 选择器
const canvas = page.locator('.canvas-content-inner');
const linkagePanel = page.locator('.linkage-config');

// ⚠️ 谨慎：使用 text= 可能导致 strict mode violation
const panel = page.locator('text=联动配置');  // 如果有多个会报错

// ❌ 错误：假设不存在的元素
await page.click('button:has-text("表格")');
```

#### 4. Element Plus Select 组件
```javascript
// ❌ 错误：selectOption() 不适用于 Element Plus
await select.selectOption('50');

// ✅ 正确：直接点击下拉选项
await page.locator('.el-select-dropdown__item')
  .filter({ hasText: '50%' })
  .click();
```

#### 5. 等待策略
```javascript
// ✅ 组件添加后等待
await page.waitForTimeout(800);

// ✅ 图表组件等待更长时间（需要渲染）
await page.waitForTimeout(1500);

// ✅ 等待网络空闲
await page.waitForLoadState('networkidle');

// ✅ 等待元素可见
await expect(element).toBeVisible({ timeout: 5000 });
```

#### 6. 组件选择
```javascript
// ✅ 正确：使用 first() 或 last()
const component = page.locator('.canvas-component').first();
const lastComponent = page.locator('.canvas-component').last();

// ✅ 正确：使用 nth(index)
const thirdComponent = page.locator('.canvas-component').nth(2);
```

### ❌ DON'T - 常见错误

#### 1. 假设UI结构
```javascript
// ❌ 假设有按钮来添加组件
await page.click('button:has-text("添加表格")');

// ✅ 实际是拖拽添加
const table = page.locator('.component-item').filter({ hasText: '表格' });
await table.dragTo(canvas, { targetPosition: { x: 400, y: 300 } });
```

#### 2. 忽略右侧面板遮挡
```javascript
// ❌ 拖拽位置太靠右，会被右侧属性面板遮挡
await component.dragTo(canvas, {
  targetPosition: { x: 600, y: 300 }  // 危险区域
});

// ✅ 使用安全区域（x < 200）
await component.dragTo(canvas, {
  targetPosition: { x: 150, y: 300 }  // 安全
});
```

#### 3. 使用模糊选择器
```javascript
// ❌ 可能匹配多个元素
const linkage = page.locator('text=联动配置');

// ✅ 使用精确的 class
const linkage = page.locator('.linkage-config');
```

#### 4. 等待时间不足
```javascript
// ❌ 图表需要时间渲染
await page.waitForTimeout(100);

// ✅ 足够的等待时间
await page.waitForTimeout(1500);
```

---

## 已知问题和解决方案

### 问题1：右侧面板遮挡拖拽路径

**错误信息**:
```
TimeoutError: locator.dragTo: Timeout 10000ms exceeded
<label class="el-form-item__label">宽度</label> from
<div class="right-panel"> subtree intercepts pointer events
```

**原因**:
- 选中组件后，右侧属性面板展开
- 拖拽目标位置太靠右（x > 200），被面板遮挡

**解决方案**:
```javascript
// 方案1：使用靠左的位置
await component.dragTo(canvas, {
  targetPosition: { x: 150, y: 300 }
});

// 方案2：拖拽前先取消选中
await page.locator('.canvas-panel').click({
  position: { x: 50, y: 50 }
});
await page.waitForTimeout(200);

// 方案3：分步操作，先添加后配置
// 先批量添加所有组件（不选中）
// 然后逐个选中配置
```

**相关文件**:
- `e2e/tests/complex-scenarios-v2.spec.js:568`
- `e2e/tests/component-linkage.spec.js:240`

---

### 问题2：Strict Mode Violation

**错误信息**:
```
Error: strict mode violation:
locator('.right-panel').locator('text=联动配置')
resolved to 2 elements
```

**原因**:
- `text=` 选择器匹配到多个元素
- 例如：标题 `<h4>联动配置</h4>` 和描述 `<p>暂无联动配置</p>`

**解决方案**:
```javascript
// ❌ 错误：模糊选择器
const linkage = page.locator('text=联动配置');

// ✅ 方案1：使用精确的 class
const linkage = page.locator('.linkage-config');

// ✅ 方案2：使用更具体的定位
const linkage = page.locator('.right-panel')
  .locator('h4')
  .filter({ hasText: '联动配置' });

// ✅ 方案3：使用 first()
const linkage = page.locator('text=联动配置').first();
```

**相关文件**:
- `e2e/tests/component-linkage.spec.js:292`
- `e2e/tests/component-linkage.spec.js:436`

---

### 问题3：Element UI Select 组件

**错误信息**:
```
selectOption() does not work with Element Plus virtual Select
```

**原因**:
- Element Plus 使用自定义虚拟 Select
- 不是原生的 `<select>` 元素

**解决方案**:
```javascript
// ❌ 错误：使用 selectOption()
const widthSelect = page.locator('#component-width');
await widthSelect.selectOption('50');

// ✅ 正确：直接点击下拉选项
await page.locator('.el-select-dropdown__item')
  .filter({ hasText: '50%' })
  .click();

// ✅ 或者使用 force 选项
await page.locator('.el-select').click();
await page.waitForTimeout(300);
await page.locator('.el-select-dropdown__item')
  .filter({ hasText: '50%' })
  .click();
```

**相关文件**:
- `e2e/tests/complex-scenarios.spec.js` (早期尝试)

---

### 问题4：表单边框样式类名假设

**错误信息**:
```
expect(hasBorder).toBe(true)
Expected: true
Received: false
```

**原因**:
- 测试假设了特定的 CSS 类名 `form-bordered`
- 实际实现可能使用不同的类名或内联样式

**解决方案**:
```javascript
// ❌ 错误：假设特定类名
const hasBorder = await formContainer.evaluate(el =>
  el.classList.contains('form-bordered')
);
expect(hasBorder).toBe(true);

// ✅ 正确：验证功能而非实现
const isVisible = await formContainer.isVisible();
expect(isVisible).toBe(true);

// ✅ 或验证样式属性
const hasBorder = await formContainer.evaluate(el => {
  const styles = window.getComputedStyle(el);
  return styles.border !== 'none';
});
expect(hasBorder).toBe(true);
```

**相关文件**:
- `e2e/tests/complex-scenarios-v2.spec.js:101`

---

## Pinia 状态管理最佳实践 ⭐ 2026-01-16 新增

### ✅ DO - 正确做法

#### 1. 使用 Pinia Store

```javascript
// ✅ 方案1: 直接使用 Pinia store (推荐新代码)
import { useDesignerStore } from '@/stores/pinia';

const designerStore = useDesignerStore();
const { currentDesign, selectedIds, updateComponent } = designerStore;

// 更新组件
designerStore.updateComponent(componentId, { content: '新内容' });

// ✅ 方案2: 使用兼容层 (旧代码,无需修改)
import { currentDesign, selectedIds, updateComponent } from '@/stores/designer';

// 仍然可以正常工作,内部使用 Pinia
updateComponent(componentId, { content: '新内容' });
```

#### 2. 在组件中使用 Store

```vue
<script setup lang="ts">
import { useDesignerStore } from '@/stores/pinia';

// ✅ 在组件顶层调用 store
const designerStore = useDesignerStore();

// ✅ 解构需要的属性和方法
const {
  currentDesign,
  selectedIds,
  canUndo,
  canRedo,
  updateComponent,
  selectComponent,
} = designerStore;

// ✅ 直接使用
function handleComponentClick(componentId: string) {
  selectComponent(componentId);
}
</script>

<template>
  <div>
    <!-- ✅ 在模板中使用 -->
    <span>组件数: {{ currentDesign.components.length }}</span>
    <button :disabled="!canUndo" @click="designerStore.undo()">撤销</button>
  </div>
</template>
```

#### 3. 在 Composables 中使用 Store

```typescript
// ✅ 正确: 在 composable 函数中使用 store
import { useDesignerStore } from '@/stores/pinia';

export function useComponentOperations() {
  const designerStore = useDesignerStore();
  const { currentDesign, selectedIds } = designerStore;

  function deleteSelectedComponents() {
    designerStore.removeComponents(selectedIds.value);
  }

  function duplicateSelectedComponents() {
    designerStore.duplicateComponents(selectedIds.value);
  }

  return {
    deleteSelectedComponents,
    duplicateSelectedComponents,
  };
}
```

#### 4. Store 初始化

```typescript
// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { useDesignerStore } from './stores/pinia';

const app = createApp(App);

// ✅ 创建并安装 Pinia
const pinia = createPinia();
app.use(pinia);

// ✅ 初始化 store
const designerStore = useDesignerStore();
designerStore.initDesigner();

app.mount('#app');
```

### ❌ DON'T - 常见错误

#### 1. 不要在函数内部调用 store

```javascript
// ❌ 错误: 在事件处理函数中调用 store
function handleClick() {
  const store = useDesignerStore();  // ❌ 每次都创建新实例
  store.updateComponent(id, data);
}

// ✅ 正确: 在组件顶层调用 store
const store = useDesignerStore();

function handleClick() {
  store.updateComponent(id, data);
}
```

#### 2. 不要解构 actions

```javascript
// ❌ 错误: 解构会丢失 this 上下文
const { updateComponent, undo } = designerStore;

function handleUpdate() {
  updateComponent(id, data);  // ❌ this 上下文丢失
}

// ✅ 正确: 直接使用 store
function handleUpdate() {
  designerStore.updateComponent(id, data);  // ✅ 保持 this 上下文
}

// ✅ 或者: 解构 state 和 getters,保留方法
const { currentDesign, selectedIds } = designerStore;

function handleUpdate() {
  designerStore.updateComponent(id, data);
}
```

#### 3. 不要混合使用旧的和新的导入方式

```javascript
// ❌ 混乱: 混合使用
import { useDesignerStore } from '@/stores/pinia';
import { currentDesign } from '@/stores/designer';

const store = useDesignerStore();
const design = currentDesign;  // ❌ 不一致

// ✅ 一致: 统一使用一种方式
// 方案A: 全部使用 Pinia
import { useDesignerStore } from '@/stores/pinia';
const store = useDesignerStore();
const design = store.currentDesign;

// 方案B: 全部使用兼容层(渐进式迁移)
import { currentDesign, updateComponent } from '@/stores/designer';
// 继续使用旧的导入方式
```

#### 4. 不要直接修改 store 内部状态

```javascript
// ❌ 错误: 直接修改 state
designerStore.currentDesign.components.push(newComponent);

// ✅ 正确: 使用 action
designerStore.addComponent(newComponent);

// ✅ 正确: 使用暴露的方法
designerStore.updateComponent(id, updates);
```

### Store 架构说明

```
┌─────────────────────────────────────┐
│       应用组件和 Composables         │
│    (使用任一导入方式)                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   兼容层 (src/stores/designer.ts)    │
│   - 保持旧 API 不变                  │
│   - 内部委托给 Pinia store           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Pinia Store (designerStore)         │
│  - 统一的状态管理                     │
│  - 类型安全                          │
│  - DevTools 支持                     │
└─────────────────────────────────────┘
```

### 渐进式迁移策略

1. **阶段1: 继续使用兼容层**
   ```javascript
   // 现有代码无需修改
   import { currentDesign, updateComponent } from '@/stores/designer';
   ```

2. **阶段2: 新代码使用 Pinia**
   ```javascript
   // 新组件和功能直接使用 Pinia
   import { useDesignerStore } from '@/stores/pinia';
   const store = useDesignerStore();
   ```

3. **阶段3: 逐步迁移现有代码**
   - 按模块逐个迁移
   - 先迁移简单模块
   - 最后迁移核心模块

### Store 可用属性和方法

```typescript
// State
currentDesign      // 当前设计对象
history           // 历史记录
selectedIds       // 选中的组件ID数组
hoveredId         // 悬停的组件ID
scale             // 画布缩放比例
gridSize          // 网格大小
showGrid          // 是否显示网格
snapToGrid        // 是否吸附网格

// Getters (Computed)
selectedComponents     // 选中的组件数组
singleSelectedComponent // 单个选中组件
hoveredComponent       // 悬停的组件
canUndo               // 可以撤销
canRedo               // 可以重做

// Actions
initDesigner()              // 初始化设计器
saveHistory(desc)           // 保存历史记录
undo()                      // 撤销
redo()                      // 重做
createNewDesign()           // 创建新设计
loadDesign(design)          // 加载设计
exportDesign()              // 导出设计
importDesign(design)        // 导入设计
addComponent(comp)          // 添加组件
updateComponent(id, updates) // 更新组件
removeComponents(ids)       // 删除组件
duplicateComponents(ids)    // 复制组件
changeComponentOrder(id, dir) // 调整顺序
selectComponent(id)         // 选择组件
clearSelection()            // 清除选择
selectAll()                 // 全选
addDataSource(source)       // 添加数据源
updateDataSource(id, updates) // 更新数据源
removeDataSource(id)        // 删除数据源
updateCanvasSize(w, h)      // 更新画布大小
updateCanvasStyle(updates)  // 更新画布样式
```

### 相关文件

- `src/stores/pinia/designerStore.ts` - Pinia store 实现
- `src/stores/designer.ts` - 兼容层
- `src/main.ts` - Pinia 初始化
- `src/App.vue` - Store 使用示例

---

## UI 结构说明

### 主要布局

```html
<div class="report-designer">
  <!-- 工具栏 -->
  <div class="toolbar">
    <button>新建</button>
    <button>撤销</button>
    <button>重做</button>
    <button>保存</button>
    <button>预览</button>
  </div>

  <!-- 主设计区域 -->
  <div class="designer-main">
    <!-- 左侧组件库 -->
    <div class="left-panel">
      <h4>组件库</h4>
      <!-- 基础组件 -->
      <div class="component-item" draggable="true">文本</div>
      <div class="component-item" draggable="true">图片</div>
      <div class="component-item" draggable="true">表格</div>
      <div class="component-item" draggable="true">表单</div>

      <!-- 图表组件 -->
      <div class="component-item" draggable="true">柱状图</div>
      <div class="component-item" draggable="true">折线图</div>
      <div class="component-item" draggable="true">饼图</div>
      <div class="component-item" draggable="true">散点图</div>
      <div class="component-item" draggable="true">仪表盘</div>

      <!-- 形状组件 -->
      <div class="component-item" draggable="true">矩形</div>
      <div class="component-item" draggable="true">线条</div>
    </div>

    <!-- 中间画布 -->
    <div class="canvas-panel">
      <div class="canvas-content-inner">
        <!-- 组件通过拖拽添加到这里 -->
        <div class="canvas-component">...</div>
      </div>
    </div>

    <!-- 右侧属性面板 -->
    <div class="right-panel">
      <h4>属性面板</h4>
      <!-- 未选中时 -->
      <div>请选择一个组件</div>

      <!-- 选中后显示配置 -->
      <div class="linkage-config">...</div>
      <div class="data-source-config">...</div>
    </div>
  </div>
</div>
```

### 关键 CSS 选择器

```css
/* 布局 */
.toolbar
.designer-main
.left-panel
.canvas-panel
.canvas-content-inner
.right-panel

/* 组件 */
.component-item
.canvas-component
.text-content
.chart-container
.table-container
.form-container

/* 属性面板 */
.linkage-config
.data-source-config
```

### 组件数据结构

```typescript
// src/utils/componentData.ts
export const basicComponents = [
  { type: 'text', label: '文本', icon: Document },
  { type: 'image', label: '图片', icon: Picture },
  { type: 'table', label: '表格', icon: Grid },
  { type: 'form', label: '表单', icon: DocumentAdd },
];

export const chartComponents = [
  { type: 'bar-chart', label: '柱状图', icon: TrendCharts },
  { type: 'line-chart', label: '折线图', icon: DataLine },
  { type: 'pie-chart', label: '饼图', icon: PieChart },
  { type: 'scatter-chart', label: '散点图', icon: DataAnalysis },
  { type: 'gauge-chart', label: '仪表盘', icon: Odometer },
];
```

---

## 代码示例库

### 示例1：添加单个组件

```javascript
test('添加文本组件', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const canvas = page.locator('.canvas-content-inner');
  const textComponent = page.locator('.component-item')
    .filter({ hasText: '文本' });

  await textComponent.dragTo(canvas, {
    targetPosition: { x: 400, y: 300 }
  });
  await page.waitForTimeout(800);

  // 验证
  const textContent = page.locator('.text-content').first();
  await expect(textContent).toBeVisible();
});
```

### 示例2：配置组件属性

```javascript
test('配置文本样式', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('.canvas-content-inner');

  // 添加组件
  const text = page.locator('.component-item')
    .filter({ hasText: '文本' });
  await text.dragTo(canvas, { targetPosition: { x: 400, y: 300 } });
  await page.waitForTimeout(800);

  // 选中组件
  const component = page.locator('.canvas-component').first();
  await component.click();
  await page.waitForTimeout(500);

  // 修改属性
  const contentInput = page.locator('#text-content');
  await contentInput.fill('自定义标题');

  const fontSizeInput = page.locator('#text-font-size');
  await fontSizeInput.fill('24');

  // 验证
  const textElement = page.locator('.text-content').first();
  await expect(textElement).toContainText('自定义标题');
});
```

### 示例3：批量添加组件（避免面板遮挡）

```javascript
test('批量添加组件', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('.canvas-content-inner');

  const components = ['文本', '表格', '柱状图'];

  // 先批量添加（不配置，避免选中）
  for (let i = 0; i < components.length; i++) {
    const comp = page.locator('.component-item')
      .filter({ hasText: components[i] });

    // 使用靠左位置
    await comp.dragTo(canvas, {
      targetPosition: { x: 150 + i * 250, y: 200 + i * 200 }
    });
    await page.waitForTimeout(800);
  }

  // 再逐个配置
  const allComps = page.locator('.canvas-component');
  for (let i = 0; i < await allComps.count(); i++) {
    const comp = allComps.nth(i);
    await comp.click();
    await page.waitForTimeout(500);
    // 配置逻辑...
  }
});
```

### 示例4：测试联动配置

```javascript
test('测试联动配置面板', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('.canvas-content-inner');

  // 添加表单和表格
  const form = page.locator('.component-item').filter({ hasText: '表单' });
  await form.dragTo(canvas, { targetPosition: { x: 300, y: 200 } });
  await page.waitForTimeout(1000);

  const table = page.locator('.component-item').filter({ hasText: '表格' });
  await table.dragTo(canvas, { targetPosition: { x: 300, y: 400 } });
  await page.waitForTimeout(1000);

  // 选中表格，查看联动配置
  const tableComponent = page.locator('.canvas-component').last();
  await tableComponent.click();
  await page.waitForTimeout(500);

  // 验证联动配置面板
  const linkagePanel = page.locator('.linkage-config');
  await expect(linkagePanel).toBeVisible();

  // 添加联动
  const addButton = page.locator('button:has-text("添加联动")');
  if (await addButton.isVisible()) {
    await addButton.click();
    await page.waitForTimeout(500);

    // 验证对话框
    const dialog = page.locator('.el-dialog')
      .filter({ hasText: '添加联动' });
    await expect(dialog).toBeVisible();

    // 验证配置项
    await expect(dialog.locator('label').filter({ hasText: '源组件' }))
      .toBeVisible();
    await expect(dialog.locator('label').filter({ hasText: '目标组件' }))
      .toBeVisible();
    await expect(dialog.locator('label').filter({ hasText: '触发事件' }))
      .toBeVisible();
    await expect(dialog.locator('label').filter({ hasText: '联动动作' }))
      .toBeVisible();
  }
});
```

### 示例5：测试工具栏功能

```javascript
test('测试预览功能', async ({ page }) => {
  await page.goto('/');

  // 添加组件
  const canvas = page.locator('.canvas-content-inner');
  const text = page.locator('.component-item').filter({ hasText: '文本' });
  await text.dragTo(canvas, { targetPosition: { x: 400, y: 300 } });
  await page.waitForTimeout(800);

  // 点击预览
  const previewButton = page.locator('.toolbar button')
    .filter({ hasText: '预览' });
  await previewButton.click();
  await page.waitForTimeout(1000);

  // 验证预览模式（检查 body class）
  const bodyClass = await page.locator('body').getAttribute('class');
  console.log('预览模式class:', bodyClass);

  // 退出预览
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
});
```

---

## 检查清单

### 编写测试前检查清单

- [ ] **阅读实际UI结构**
  - [ ] 查看 `src/App.vue` 了解布局
  - [ ] 查看 `src/utils/componentData.ts` 了解组件列表
  - [ ] 确认组件的实际类名和ID

- [ ] **了解第三方组件**
  - [ ] Element Plus Select 使用虚拟下拉
  - [ ] Element Plus Form 有特殊验证
  - [ ] ECharts 图表需要时间渲染

- [ ] **规划测试步骤**
  - [ ] 列出所有操作步骤
  - [ ] 确定等待时间
  - [ ] 准备验证断言

### 编写测试时检查清单

- [ ] **拖拽位置**
  - [ ] 使用 `x: 150` 或更小的值
  - [ ] 避免 `x > 200`（面板遮挡区域）
  - [ ] 不同组件使用不同的y坐标

- [ ] **选择器使用**
  - [ ] 优先使用 `.class` 选择器
  - [ ] 避免使用 `text=`（除非唯一）
  - [ ] 使用 `filter({ hasText: ... })` 精确匹配

- [ ] **等待时间**
  - [ ] 普通组件：800ms
  - [ ] 图表组件：1500ms
  - [ ] 网络请求：`waitForLoadState('networkidle')`

- [ ] **元素选择**
  - [ ] 使用 `first()` 或 `last()` 明确选择
  - [ ] 或使用 `nth(index)` 精确索引
  - [ ] 避免歧义

### 测试失败时检查清单

- [ ] **查看完整错误信息**
  - [ ] 错误堆栈
  - [ ] 超时信息
  - [ ] 元素定位错误

- [ ] **查看截图**
  - [ ] 路径：`test-results/.../test-failed-1.png`
  - [ ] 分析截图中的UI状态

- [ ] **查看视频**
  - [ ] 路径：`test-results/.../video.webm`
  - [ ] 观察失败时的操作过程

- [ ] **检查选择器**
  - [ ] 使用 `page.locator().count()` 检查匹配数量
  - [ ] 使用 DevTools 确认实际的class/ID

- [ ] **参考已有测试**
  - [ ] 查看 `e2e/tests/basic-setup.spec.js`（基础测试）
  - [ ] 查看 `e2e/tests/drag-drop.spec.js`（拖拽测试）
  - [ ] 复用类似的模式

### 常见陷阱检查清单

- [ ] ❌ **不要假设按钮存在**
  - 组件是通过拖拽添加的，不是点击按钮

- [ ] ❌ **不要用 selectOption()**
  - Element Plus Select 需要点击下拉选项

- [ ] ❌ **不要让拖拽位置太靠右**
  - x > 200 会被右侧面板遮挡

- [ ] ❌ **不要使用模糊的 text= 选择器**
  - 可能匹配多个元素导致 strict mode violation

- [ ] ❌ **不要等待时间太短**
  - 图表需要 1500ms 渲染
  - 组件需要 800ms 初始化

### Pinia 状态管理检查清单 ⭐ 2026-01-16 新增

#### 在新组件中使用 Store

- [ ] **选择导入方式**
  - [ ] 新代码: `import { useDesignerStore } from '@/stores/pinia'`
  - [ ] 旧代码: 继续使用 `import { ... } from '@/stores/designer'`

- [ ] **正确初始化**
  - [ ] 在 `<script setup>` 顶层调用 `useDesignerStore()`
  - [ ] 不要在函数内部调用

- [ ] **解构模式**
  - [ ] ✅ 可以解构 state 和 getters: `const { currentDesign, selectedIds } = store`
  - [ ] ❌ 不要解构 actions: 保持 `store.updateComponent()`

- [ ] **类型安全**
  - [ ] 使用 TypeScript 类型定义
  - [ ] 享受 IDE 自动补全

#### 迁移现有代码到 Pinia

- [ ] **评估迁移优先级**
  - [ ] 简单组件优先
  - [ ] 核心功能最后迁移
  - [ ] 可以保持兼容层不变

- [ ] **测试迁移**
  - [ ] 迁移后运行测试套件
  - [ ] 验证功能正常
  - [ ] 检查控制台无错误

- [ ] **保持一致性**
  - [ ] 同一模块使用统一导入方式
  - [ ] 不要混用新旧导入

#### Store 使用最佳实践

- [ ] **使用 Actions 而非直接修改**
  - [ ] ✅ `store.updateComponent(id, data)`
  - [ ] ❌ `store.currentDesign.components.push(...)`

- [ ] **利用响应式**
  - [ ] State 和 getters 自动响应变化
  - [ ] 模板中直接使用即可

- [ ] **性能优化**
  - [ ] 只解构需要的属性
  - [ ] 避免不必要的响应式开销

---

## 新会话快速开始

### 🚀 场景1：为新功能编写测试

**复制以下提示词到新会话**：

```
我正在为 Report Designer 项目开发自动化测试。

项目信息：
- Vue 3 + TypeScript + Vite
- UI 框架：Element Plus（注意：Select 不是原生元素）
- 测试框架：Playwright
- 浏览器：Chromium
- 画布URL：http://localhost:5173
- Mock Server：http://localhost:3001

已知问题（请避免）：
1. 右侧属性面板会遮挡拖拽，使用 x: 150 或更小的值
2. Element Plus Select 不能用 selectOption()，要点击下拉选项
3. 避免使用 text= 选择器，使用 .class 选择器
4. 图表组件需要 1500ms 渲染时间
5. 组件通过拖拽添加，不是点击按钮

参考代码：
- e2e/tests/basic-setup.spec.js（基础测试模式）
- e2e/tests/drag-drop.spec.js（拖拽测试模式）
- e2e/tests/complex-scenarios-v2.spec.js（复杂场景模式）

请为以下功能编写测试：
[描述你的测试需求]
```

### 🚀 场景2：修复测试失败

**复制以下提示词**：

```
Report Designer 项目中有一个测试失败了：

测试文件：e2e/tests/xxx.spec.js
错误信息：[粘贴错误信息]

请帮我：
1. 查看错误截图：test-results/.../test-failed-1.png
2. 查看失败视频：test-results/.../video.webm
3. 参考已修复的测试：e2e/tests/complex-scenarios-v2.spec.js
4. 应用已知解决方案：
   - 拖拽位置使用 x: 150
   - 使用 .class 而非 text=
   - Element Plus 需要特殊处理

项目结构：
- UI 结构在 src/App.vue
- 组件列表在 src/utils/componentData.ts
- 已有测试在 e2e/tests/

请帮我修复这个测试。
```

### 🚀 场景3：添加新组件测试

**复制以下提示词**：

```
我需要为 Report Designer 添加一个新的组件测试。

项目上下文：
- 使用 Playwright v1.57
- 测试文件位置：e2e/tests/
- 参考模式：e2e/tests/basic-setup.spec.js 和 drag-drop.spec.js

现有组件测试模式：
```javascript
test('测试组件名', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const canvas = page.locator('.canvas-content-inner');
  const component = page.locator('.component-item')
    .filter({ hasText: '组件名' });

  await component.dragTo(canvas, {
    targetPosition: { x: 150, y: 300 }  // 避免面板遮挡
  });
  await page.waitForTimeout(800);

  // 验证
  await expect(page.locator('.组件容器')).toBeVisible();
});
```

已知约束：
- x < 200 避免右侧面板遮挡
- 等待时间：组件 800ms，图表 1500ms
- 使用精确选择器 .class 而非 text=

请帮我为 [组件名称] 编写测试。
```

### 🚀 场景4：调试测试问题

**复制以下提示词**：

```
我在调试 Report Designer 的 Playwright 测试时遇到问题。

测试环境：
- Playwright v1.57
- Chromium
- http://localhost:5173

调试检查清单：
□ 查看完整错误堆栈
□ 查看截图 test-results/.../test-failed-1.png
□ 查看视频 test-results/.../video.webm
□ 确认选择器是否正确
□ 确认拖拽位置 x < 200
□ 确认等待时间足够

常见问题和解决方案：
1. 右侧面板遮挡 → 使用 x: 150
2. Strict mode violation → 使用 .class
3. Element Plus Select → 点击而非 selectOption
4. 渲染未完成 → 增加等待时间到 1500ms

请帮我调试以下问题：
[描述具体问题]
```

---

## 📚 补充资源

### 关键文件路径

```
# 项目结构
src/App.vue                        # 主应用布局
src/utils/componentData.ts         # 组件列表
src/components/properties-panel/common/ComponentLinkageConfig.vue  # 联动配置

# 测试文件
e2e/tests/basic-setup.spec.js       # 基础测试（参考）
e2e/tests/drag-drop.spec.js         # 拖拽测试（参考）
e2e/tests/complex-scenarios-v2.spec.js  # 复杂场景（已修复）
e2e/tests/component-linkage.spec.js  # 联动测试

# 配置文件
e2e/playwright.config.js            # Playwright 配置
e2e/package.json                    # 测试依赖
```

### 性能基准

```
页面加载时间：< 10s（实际：~700ms）
组件库响应：< 3s（实际：~20ms）
单组件添加：< 2s（实际：~800ms）
图表渲染：< 3s（实际：~1500ms）
```

### 测试覆盖

```
总计：53个测试
- 基础环境：14个
- 拖拽交互：16个
- 复杂场景：13个
- 组件联动：10个

通过率：100%
执行时间：~43秒
```

---

## 🎯 使用建议

### 何时参考本文档

1. **开启新会话时**
   - 复制"新会话快速开始"部分的提示词
   - 提供项目上下文和已知问题

2. **遇到测试失败时**
   - 查看"已知问题和解决方案"
   - 对照"检查清单"
   - 参考"代码示例库"

3. **编写新测试时**
   - 参考"代码示例库"
   - 遵循"Playwright 测试最佳实践"
   - 使用"检查清单"验证

4. **调试问题时**
   - 查看"已知问题"是否有类似情况
   - 使用"检查清单"系统排查
   - 参考修复后的代码

### 维护建议

1. **定期更新**
   - 遇到新问题时，添加到"已知问题"
   - 发现新模式时，添加到"代码示例库"
   - 修复错误后，更新"检查清单"

2. **版本控制**
   - 本文档已提交到仓库：`.claude/PROJECT_CONTEXT.md`
   - 修改后记得 git add 和 commit
   - 在新会话中可以直接引用

---

## 📝 文档信息

**文件**: `.claude/PROJECT_CONTEXT.md`
**版本**: 2.0
**创建日期**: 2026-01-16
**最后更新**: 2026-01-16
**维护者**: Claude Code + 用户

**更新内容**:
- ✅ v2.0: 添加 Pinia 状态管理系统
- ✅ v2.0: 添加状态管理最佳实践
- ✅ v2.0: 添加 Pinia 检查清单
- ✅ v2.0: 更新项目结构和架构说明
- ✅ v2.0: 移除测试按钮,统一状态管理

**用途**: 为新 Claude Code 会话提供项目上下文，避免重复错误，加速开发。

---

**💡 提示**: 在新会话开始时，告诉 Claude：
```
"请参考 .claude/PROJECT_CONTEXT.md 文档，了解 Report Designer 项目的上下文和已知问题。"
```

这样可以大幅减少错误重犯，提高开发效率！🎯
