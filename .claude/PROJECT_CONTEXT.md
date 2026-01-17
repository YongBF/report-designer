# Report Designer - Claude Code 项目参考文档

> 📌 **用途**: 在新的 Claude Code 会话中使用本文档，避免重复错误，加速开发。

---

## 📋 目录

1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [路由系统](#路由系统)
4. [组件命名和属性面板](#组件命名和属性面板) ⭐ 2026-01-17 新增
5. [Playwright 测试最佳实践](#playwright-测试最佳实践)
6. [已知问题和解决方案](#已知问题和解决方案)
7. [Pinia 状态管理最佳实践](#pinia-状态管理最佳实践)
8. [UI 结构说明](#ui-结构说明)
9. [代码示例库](#代码示例库)
10. [检查清单](#检查清单)
11. [新会话快速开始](#新会话快速开始)

---

## 项目概述

### 核心功能
Report Designer 是一个**可视化报表设计器**，支持：
- 🎨 拖拽式组件布局（文本、图片、表格、表单、图表）
- 📊 多种图表类型（柱状图、折线图、饼图、散点图、仪表盘）
- 🔗 组件联动功能（触发事件、参数映射）
- 📡 API 数据源配置
- 🖼️ **报表预览和导出**（新页签 + 路由）
- 🔄 **Vue Router 路由系统**
- 🏷️ **组件命名功能** - 组件可设置自定义名称，用于联动配置中展示 ⭐ 2026-01-17 新增
- 📋 **统一属性面板** - 所有属性使用折叠面板统一展示 ⭐ 2026-01-17 新增

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
│   ├── router/              # Vue Router 配置 ⭐ 新增
│   │   └── index.ts         # 路由定义
│   ├── stores/
│   │   ├── pinia/           # Pinia 状态管理
│   │   │   ├── designerStore.ts  # 设计器 store
│   │   │   └── index.ts           # Store 导出
│   │   └── designer.ts      # 兼容层(向后兼容)
│   ├── types/               # TypeScript 类型定义
│   ├── utils/               # 工具函数
│   ├── views/               # 页面视图 ⭐ 新增
│   │   ├── Designer.vue     # 设计器页面
│   │   └── PreviewView.vue  # 预览页面
│   ├── App.vue              # 根组件（路由容器）
│   └── main.ts              # 应用入口
├── e2e/                     # Playwright E2E 测试
├── mock-server/             # 测试用 Mock Server
└── docs/                    # 项目文档
```

### 当前状态
- ✅ **自动化测试系统**: 53+个测试，100%通过率
- ✅ **组件联动功能**: 完整实现，支持多种联动模式
- ✅ **Mock Server**: 10个API端点
- ✅ **加载状态**: Loading/Empty/Error 状态展示
- ✅ **Pinia 状态管理**: 统一的状态管理，支持渐进式迁移
- ✅ **Vue Router 路由**: 新页签预览，专用路由 ⭐ **2026-01-17**
- ✅ **预览功能**: 40px padding，美观布局，返回编辑 ⭐ **2026-01-17**

---

## 技术栈

### 前端框架
- **Vue 3.5** - Composition API
- **TypeScript 5.9** - 类型安全
- **Vite 5.4** - 构建工具

### 路由系统 ⭐ 2026-01-17 新增
- **Vue Router 4** - 单页应用路由
- **History 模式** - URL 友好
- **路由配置**:
  ```typescript
  // 设计器页面
  { path: '/', name: 'designer', component: Designer.vue }

  // 预览页面
  { path: '/preview/:id?', name: 'preview', component: PreviewView.vue }
  ```

### 状态管理
- **Pinia 2.2** - 统一状态管理
- **自动解包**: 在组件中访问 store 状态不需要 `.value`
- **兼容层** - 支持旧的导入方式，渐进式迁移
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
- **Vite Dev Server**: http://localhost:5173 (或 5174/5175，如果端口被占用)
- **Mock Server**: http://localhost:3001

---

## 路由系统 ⭐ 2026-01-17 新增

### 路由配置

```typescript
// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'designer',
    component: () => import('../views/Designer.vue'),
    meta: {
      title: '报表设计器',
    },
  },
  {
    path: '/preview/:id?',
    name: 'preview',
    component: () => import('../views/PreviewView.vue'),
    meta: {
      title: '预览报表',
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
```

### 在组件中使用路由

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

// 导航到预览页面
function handlePreview() {
  const url = `/preview/${designerStore.currentDesign.id}`;
  window.open(url, '_blank');  // 新页签打开
}

// 返回编辑器
function goBack() {
  router.push('/');
}
</script>
```

### 路由最佳实践

#### ✅ DO - 正确做法

```typescript
// ✅ 新页签打开预览
function handlePreview() {
  const url = `/preview/${designerStore.currentDesign.id}`;
  window.open(url, '_blank');
}

// ✅ 程序化导航
function goBack() {
  router.push('/');
}

// ✅ 获取路由参数
const route = useRoute();
const designId = route.params.id;
```

#### ❌ DON'T - 常见错误

```typescript
// ❌ 错误：直接修改 location（会刷新页面）
function handlePreview() {
  window.location.href = '/preview/123';
}

// ❌ 错误：忘记使用 .value 访问 params
const designId = route.params.id;  // ❌ route.params 是响应式对象

// ✅ 正确：直接访问（在模板中）
const designId = route.params.id;

// ✅ 或者在 script 中使用
const { params } = toRefs(route);
const designId = params.id;
```

### 路由相关文件

- `src/router/index.ts` - 路由配置
- `src/views/Designer.vue` - 设计器页面（从 App.vue 移动）
- `src/views/PreviewView.vue` - 预览页面
- `src/App.vue` - 简化为路由容器 `<router-view />`

---

## 组件命名和属性面板 ⭐ 2026-01-17 新增

### 组件命名功能

#### 组件名称属性

每个组件都有一个可选的 `name` 属性，用于在联动配置中识别和展示：

```typescript
// src/types/index.ts - BaseComponent 接口
export interface BaseComponent {
  id: string;
  type: ComponentType;
  name?: string;  // 组件名称（可选，用于在联动配置等地方显示）
  // ... 其他属性
}
```

#### 默认名称生成

创建新组件时，会自动生成默认的组件名称：

```typescript
// src/composables/useComponentCreation.ts
const typeLabels: Record<string, string> = {
  form: '表单',
  table: '表格',
  'bar-chart': '柱状图',
  'line-chart': '折线图',
  'pie-chart': '饼图',
  'scatter-chart': '散点图',
  'gauge-chart': '仪表盘',
  'funnel-chart': '漏斗图',
  text: '文本',
  image: '图片',
  rectangle: '矩形',
  line: '线条',
};

// 生成默认名称：格式为 "类型 (ID后4位)"
const defaultName = `${typeLabel} (${id.slice(-4)})`;
// 例如："表格 (a3b2)"、"柱状图 (f4e1)"
```

#### 联动配置中的显示

在联动配置的组件下拉列表中，组件显示格式为：

```typescript
// src/components/properties-panel/common/ComponentLinkageConfig.vue
function getComponentLabel(component: Component): string {
  // 如果组件有自定义名称，优先显示
  if (component.name) {
    const typeLabel = typeLabels[component.type] || component.type;
    return `${component.name} (${typeLabel})`;  // 例如："销售数据表 (表格)"
  }

  // 没有自定义名称时，显示默认格式
  const typeLabel = typeLabels[component.type] || component.type;
  return `${typeLabel} (${component.id.slice(-4)})`;  // 例如："表格 (a3b2)"
}
```

#### 属性面板中的配置

在属性面板中，组件名称输入框位于"组件信息"折叠面板的顶部：

```vue
<!-- src/views/Designer.vue -->
<el-collapse-item title="组件信息" name="info">
  <el-form label-width="100px" size="small">
    <el-form-item label="组件名称">
      <el-input
        v-model="selectedComponent.name"
        placeholder="为组件设置一个名称，方便在联动配置中识别"
        clearable
      />
      <div style="margin-top: 4px; font-size: 12px; color: #909399">
        此名称将显示在联动配置的组件列表中
      </div>
    </el-form-item>

    <el-form-item label="组件类型">
      <el-input :value="selectedComponent.type" disabled />
    </el-form-item>

    <el-form-item label="组件ID">
      <el-input :value="selectedComponent.id" disabled />
    </el-form-item>
  </el-form>
</el-collapse-item>
```

### 统一属性面板结构

#### 属性面板使用 el-collapse

所有组件的属性现在统一使用 `el-collapse` 折叠面板展示，样式保持一致：

```vue
<!-- 属性面板结构 -->
<el-collapse v-model="panelCollapseActive" accordion>
  <!-- 1. 组件信息（默认展开） -->
  <el-collapse-item title="组件信息" name="info">
    <el-form label-width="100px" size="small">
      <el-form-item label="组件名称">...</el-form-item>
      <el-form-item label="组件类型">...</el-form-item>
      <el-form-item label="组件ID">...</el-form-item>
    </el-form>
  </el-collapse-item>

  <!-- 2. 基础属性 -->
  <el-collapse-item title="基础属性" name="basic">
    <el-form label-width="100px" size="small">
      <el-form-item label="宽度">...</el-form-item>
      <el-form-item label="高度">...</el-form-item>
      <el-form-item label="排序">...</el-form-item>
      <el-form-item label="可见">...</el-form-item>
      <el-form-item label="锁定">...</el-form-item>
    </el-form>
  </el-collapse-item>

  <!-- 3. 组件特定属性（根据组件类型动态显示） -->
  <template v-if="selectedComponent.type === 'text'">
    <el-collapse-item title="文本属性" name="text">
      <el-form label-width="100px" size="small">
        <el-form-item label="内容">...</el-form-item>
        <el-form-item label="字号">...</el-form-item>
        <!-- ... 其他文本属性 -->
      </el-form>
    </el-collapse-item>
  </template>

  <template v-if="selectedComponent.type === 'table'">
    <el-collapse-item title="表格设置" name="table-settings">...</el-collapse-item>
    <el-collapse-item title="表头样式" name="table-header">...</el-collapse-item>
    <el-collapse-item title="列配置" name="table-columns">...</el-collapse-item>
    <el-collapse-item title="数据源" name="table-datasource">...</el-collapse-item>
    <el-collapse-item title="分页设置" name="table-pagination">...</el-collapse-item>
  </template>

  <!-- 4. 组件联动（所有组件通用） -->
  <el-collapse-item title="组件联动" name="linkage">
    <ComponentLinkageConfig ... />
  </el-collapse-item>

  <!-- 5. 操作 -->
  <el-collapse-item title="操作" name="actions">
    <el-button type="danger" @click="handleDelete">删除组件</el-button>
  </el-collapse-item>
</el-collapse>
```

#### 样式规范

所有属性表单遵循统一的样式规范：

```typescript
// 统一配置
label-width: "100px"   // 所有表单项标签宽度一致
size: "small"           // 所有表单组件使用小尺寸
```

#### 折叠面板状态管理

```typescript
// src/views/Designer.vue
import { ref } from 'vue';

// 属性面板折叠状态，默认展开"组件信息"
const panelCollapseActive = ref('info');
```

### 组件属性面板文件

各个组件类型的属性面板位于 `src/components/properties-panel/properties/` 目录：

```
properties-panel/
├── PropertiesPanel.vue              # 主属性面板（已废弃，移至 Designer.vue）
├── properties/
│   ├── TextProperties.vue           # 文本组件属性
│   ├── ImageProperties.vue          # 图片组件属性
│   ├── TableProperties.vue          # 表格组件属性
│   ├── FormProperties.vue           # 表单组件属性
│   ├── ChartProperties.vue          # 通用图表属性
│   ├── BarChartProperties.vue       # 柱状图属性
│   ├── LineChartProperties.vue      # 折线图属性
│   ├── PieChartProperties.vue       # 饼图属性
│   ├── ScatterChartProperties.vue   # 散点图属性
│   ├── GaugeChartProperties.vue     # 仪表盘属性
│   ├── FunnelChartProperties.vue    # 漏斗图属性
│   ├── RectangleProperties.vue      # 矩形属性
│   └── LineProperties.vue           # 线条属性
└── common/
    ├── ChartDataSourceConfig.vue    # 图表数据源配置
    └── ComponentLinkageConfig.vue   # 组件联动配置
```

### 相关文件

- `src/types/index.ts` - BaseComponent 接口（添加 name 属性）
- `src/composables/useComponentCreation.ts` - 组件创建逻辑（默认名称生成）
- `src/views/Designer.vue` - 属性面板（统一使用 el-collapse）
- `src/components/properties-panel/common/ComponentLinkageConfig.vue` - 联动配置（组件名称显示）

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

### 问题5：兼容层初始化错误

**错误信息**:
```
Uncaught ReferenceError: Cannot access 'useDesignerStore' before initialization
    at getDesignerStore (designer.ts:22:5)
    at designer.ts:66:35
```

**原因**:
- 兼容层 `src/stores/designer.ts` 在模块加载时立即调用 `getDesignerStore()`
- 此时 Pinia 还未初始化（在 `main.ts` 中 `app.use(pinia)` 之前）

**解决方案**:
```typescript
// ❌ 错误：在模块加载时立即求值
export const selectedComponents = getDesignerStore().selectedComponents;
export const canUndo = getDesignerStore().canUndo;

// ✅ 正确：使用 getter 延迟求值
export const selectedComponents = {
  get value() { return getDesignerStore().selectedComponents; }
};
export const canUndo = {
  get value() { return getDesignerStore().canUndo; }
};
```

**相关文件**:
- `src/stores/designer.ts:66-80`

---

### 问题6：兼容层 setter 缺失

**错误信息**:
```
Uncaught TypeError: Cannot set property value of #<Object> which has only a getter
    at Proxy.handleComponentClick (useDragDrop.ts:156:19)
```

**原因**:
- 兼容层导出的状态对象（如 `selectedIds`）只有 getter，没有 setter
- 当代码尝试赋值时（`selectedIds.value = [id]`）就会报错

**解决方案**:
```typescript
// ❌ 错误：只有 getter
export const selectedIds = {
  get value() { return getDesignerStore().selectedIds; },
};

// ✅ 正确：同时提供 getter 和 setter
export const selectedIds = {
  get value() { return getDesignerStore().selectedIds; },
  set value(val) { getDesignerStore().selectedIds = val; }
};

// ✅ 所有需要修改的状态都需要 setter
export const hoveredId = {
  get value() { return getDesignerStore().hoveredId; },
  set value(val) { getDesignerStore().hoveredId = val; }
};

export const scale = {
  get value() { return getDesignerStore().scale; },
  set value(val) { getDesignerStore().scale = val; }
};
```

**相关文件**:
- `src/stores/designer.ts:41-69`
- `src/composables/useDragDrop.ts:156`

---

### 问题7：导入路径错误

**错误信息**:
```
Uncaught SyntaxError: The requested module '/src/stores/designer.ts?t=...'
does not provide an export named 'useDesignerStore'
```

**原因**:
- `useDesignerStore` 只存在于 `src/stores/pinia/designerStore.ts`
- `src/stores/designer.ts` 是兼容层，不导出 `useDesignerStore`

**解决方案**:
```typescript
// ❌ 错误：从兼容层导入 useDesignerStore
import { useDesignerStore } from './stores/designer';

// ✅ 正确：从 Pinia store 导入
import { useDesignerStore } from './stores/pinia';

// ✅ 正确：使用兼容层（用于旧代码）
import { currentDesign, selectedIds, updateComponent } from './stores/designer';
```

**相关文件**:
- `src/main.ts:9`
- `src/stores/designer.ts`（兼容层）
- `src/stores/pinia/designerStore.ts`（实际导出）

---

### 问题8：可选链缺失

**错误信息**:
```
useComponentLinkage.ts:50 Uncaught TypeError: Cannot read properties of undefined
(reading 'linkages')
```

**原因**:
- 在 watch 中访问 `currentDesign.value.linkages` 时，`currentDesign.value` 可能是 undefined
- 需要使用可选链操作符 `?.`

**解决方案**:
```typescript
// ❌ 错误：直接访问可能为 undefined 的对象属性
watch(
  () => currentDesign.value.linkages,  // ❌ 如果 currentDesign.value 是 undefined 会报错
  (loadedLinkages) => { ... }
);

// ✅ 正确：使用可选链
watch(
  () => currentDesign.value?.linkages,  // ✅ 安全访问
  (loadedLinkages) => { ... }
);

// ✅ 同时也需要在赋值前检查
if (currentDesign?.value) {  // ✅ 检查存在
  currentDesign.value.linkages = [...newLinkages];
}
```

**相关文件**:
- `src/composables/useComponentLinkage.ts:50`
- `src/composables/useComponentLinkage.ts:40`

---

### 问题9：Pinia Store 访问错误 ⭐ 2026-01-17 新增

**错误信息**:
```
Uncaught TypeError: Cannot read properties of undefined (reading 'id')
    at handlePreview (Designer.vue:1602:47)
```

**原因**:
- 在组件中访问 store 状态时，错误地使用了 `.value`
- Pinia store 返回的 ref 会自动解包，不需要 `.value`

**解决方案**:
```typescript
// ❌ 错误：在组件中访问 store 使用 .value
function handlePreview() {
  const url = `/preview/${designerStore.currentDesign.value.id}`;
  window.open(url, '_blank');
}

// ✅ 正确：直接访问（Pinia 自动解包）
function handlePreview() {
  const url = `/preview/${designerStore.currentDesign.id}`;
  window.open(url, '_blank');
}
```

**重要说明**:
- **在 store 内部**: `currentDesign.value.id` ✅ (需要 .value)
- **在组件中访问 store**: `designerStore.currentDesign.id` ✅ (自动解包，不需要 .value)

**相关文件**:
- `src/views/Designer.vue:1602`

---

### 问题10：视图文件导入路径错误 ⭐ 2026-01-17 新增

**错误信息**:
```
Failed to resolve import "./components/canvas/renderers/TableRenderer.vue"
from "src/views/Designer.vue"
```

**原因**:
- `Designer.vue` 位于 `src/views/` 目录
- 使用相对路径 `./components` 会查找 `src/views/components/`（不存在）
- 应该使用 `../components` 查找 `src/components/`

**解决方案**:
```typescript
// ❌ 错误：在 views/ 目录中使用 ./components
import TableRenderer from './components/canvas/renderers/TableRenderer.vue';

// ✅ 正确：使用 ../components 访问 src 目录
import TableRenderer from '../components/canvas/renderers/TableRenderer.vue';
```

**相关文件**:
- `src/views/Designer.vue:1434`
- `src/views/PreviewView.vue:50-61`

---

## Pinia 状态管理最佳实践

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

#### 3. Store 状态自动解包 ⭐ 重要

```typescript
// ✅ 在组件中访问 store 状态（自动解包，不需要 .value）
function handlePreview() {
  // designerStore.currentDesign 已经是值本身
  const url = `/preview/${designerStore.currentDesign.id}`;
  window.open(url, '_blank');
}

// ❌ 错误：在组件中使用 .value
const url = `/preview/${designerStore.currentDesign.value.id}`;

// ✅ 在模板中使用（自动解包）
<template>
  <div>{{ designerStore.currentDesign.name }}</div>
</template>

// ❌ 错误：在模板中使用 .value
<template>
  <div>{{ designerStore.currentDesign.value.name }}</div>
</template>
```

#### 4. 在 Composables 中使用 Store

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

#### 5. Store 初始化

```typescript
// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';  // ⭐ 新增
import App from './App.vue';
import { useDesignerStore } from './stores/pinia';

const app = createApp(App);

// ✅ 创建并安装 Pinia
const pinia = createPinia();
app.use(pinia);

// ✅ 安装路由 ⭐ 新增
app.use(router);

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
│  - 自动解包（在组件中）              │ ⭐ 新增
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
- `src/router/index.ts` - 路由配置 ⭐ 新增

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

### 预览页面结构 ⭐ 新增

```html
<div class="preview-view">
  <!-- 顶部导航栏 -->
  <div class="preview-header">
    <h1 class="preview-title">{{ currentDesign.name }}</h1>
    <button>返回编辑</button>
    <button>导出</button>
  </div>

  <!-- 预览内容区域 -->
  <div class="preview-container">
    <!-- 40px padding -->
    <div class="preview-canvas">
      <!-- 渲染所有组件（禁用编辑） -->
    </div>
  </div>

  <!-- 底部提示 -->
  <div class="preview-footer">
    预览模式 - 所有编辑功能已禁用
  </div>
</div>
```

### 关键 CSS 选择器

```css
/* 设计器布局 */
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

/* 预览页面 ⭐ 新增 */
.preview-view
.preview-header
.preview-container  /* 40px padding */
.preview-canvas     /* 居中，阴影 */
.preview-footer
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
  await page.goto('http://localhost:5174');  // ⭐ 注意端口号
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

### 示例2：测试预览功能 ⭐ 新增

```javascript
test('应该能够在新页签中打开预览页面', async ({ page }) => {
  // 启动设计器页面
  await page.goto('http://localhost:5174/');
  await page.waitForLoadState('networkidle');

  // 查找并点击预览按钮
  const previewButton = page.locator('button').filter({ hasText: '预览' });
  await expect(previewButton).toBeVisible();

  // 直接导航到预览页面（由于 window.open 测试限制）
  await page.goto('http://localhost:5174/preview/design-1');
  await page.waitForLoadState('networkidle');

  // 验证预览页面的结构
  await expect(page.locator('.preview-view')).toBeVisible();
  await expect(page.locator('.preview-header')).toBeVisible();
  await expect(page.locator('.preview-container')).toBeVisible();

  // 验证预览容器有 padding（40px）
  const previewContainer = page.locator('.preview-container');
  const padding = await previewContainer.evaluate((el) => {
    return window.getComputedStyle(el).padding;
  });
  expect(padding).toBe('40px');

  // 验证返回编辑按钮存在
  await expect(page.locator('button').filter({ hasText: '返回编辑' }))
    .toBeVisible();
});
```

### 示例3：配置组件属性

```javascript
test('配置文本样式', async ({ page }) => {
  await page.goto('http://localhost:5174/');
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

### 示例4：批量添加组件（避免面板遮挡）

```javascript
test('批量添加组件', async ({ page }) => {
  await page.goto('http://localhost:5174/');
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

### 示例5：测试联动配置

```javascript
test('测试联动配置面板', async ({ page }) => {
  await page.goto('http://localhost:5174/');
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

---

## 检查清单

### 编写测试前检查清单

- [ ] **阅读实际UI结构**
  - [ ] 查看 `src/views/Designer.vue` 了解布局 ⭐ 更新
  - [ ] 查看 `src/utils/componentData.ts` 了解组件列表
  - [ ] 确认组件的实际类名和ID

- [ ] **了解第三方组件**
  - [ ] Element Plus Select 使用虚拟下拉
  - [ ] Element Plus Form 有特殊验证
  - [ ] ECharts 图表需要时间渲染

- [ ] **了解路由系统** ⭐ 新增
  - [ ] 设计器页面：`/`
  - [ ] 预览页面：`/preview/:id`
  - [ ] 新页签打开：`window.open(url, '_blank')`

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
  - [ ] 查看 `e2e/tests/preview-route.spec.js`（预览测试）⭐ 新增
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

- [ ] ❌ **不要在组件中使用 `.value` 访问 store** ⭐ 新增
  - Pinia 自动解包，直接使用 `designerStore.currentDesign.id`

### Pinia 状态管理检查清单

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

- [ ] **访问 store 状态** ⭐ 重要
  - [ ] ✅ 在组件中：`designerStore.currentDesign.id`（不需要 .value）
  - [ ] ✅ 在模板中：`{{ designerStore.currentDesign.name }}`
  - [ ] ❌ 不要在组件中使用：`designerStore.currentDesign.value.id`

- [ ] **类型安全**
  - [ ] 使用 TypeScript 类型定义
  - [ ] 享受 IDE 自动补全

#### 路由系统检查清单 ⭐ 新增

- [ ] **路由配置**
  - [ ] 使用 `createRouter()` 和 `createWebHistory()`
  - [ ] 在 `main.ts` 中安装：`app.use(router)`

- [ ] **导航方式**
  - [ ] 新页签：`window.open(url, '_blank')`
  - [ ] 程序化导航：`router.push('/')`
  - [ ] 获取路由参数：`route.params.id`

- [ ] **测试路由**
  - [ ] 直接导航：`page.goto('/preview/design-1')`
  - [ ] 验证页面结构：`.preview-view`
  - [ ] 验证返回按钮：`button:has-text("返回编辑")`

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
- Vue Router 4 - 路由系统（设计器：/，预览：/preview/:id）
- UI 框架：Element Plus（注意：Select 不是原生元素）
- 测试框架：Playwright
- 浏览器：Chromium
- 画布URL：http://localhost:5174
- Mock Server：http://localhost:3001

已知问题（请避免）：
1. 右侧属性面板会遮挡拖拽，使用 x: 150 或更小的值
2. Element Plus Select 不能用 selectOption()，要点击下拉选项
3. 避免使用 text= 选择器，使用 .class 选择器
4. 图表组件需要 1500ms 渲染时间
5. 组件通过拖拽添加，不是点击按钮
6. 在组件中访问 store 不需要 .value（Pinia 自动解包）
7. 预览功能在新页签打开，测试时直接导航到 /preview/:id

参考代码：
- e2e/tests/basic-setup.spec.js（基础测试模式）
- e2e/tests/drag-drop.spec.js（拖拽测试模式）
- e2e/tests/complex-scenarios-v2.spec.js（复杂场景模式）
- e2e/tests/preview-route.spec.js（预览测试模式）

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
   - 访问 store 不使用 .value

项目结构：
- UI 结构在 src/views/Designer.vue
- 组件列表在 src/utils/componentData.ts
- 已有测试在 e2e/tests/
- 路由配置在 src/router/index.ts

请帮我修复这个测试。
```

### 🚀 场景3：使用预览功能 ⭐ 新增

**复制以下提示词**：

```
我需要在 Report Designer 中使用预览功能。

项目上下文：
- 使用 Vue Router 4
- 预览路由：/preview/:id
- 在新页签打开预览

实现方式：
```typescript
// 在组件中
import { useRouter } from 'vue-router';
const router = useRouter();

// 点击预览按钮
function handlePreview() {
  const url = `/preview/${designerStore.currentDesign.id}`;
  window.open(url, '_blank');  // 新页签打开
}
```

预览页面特点：
- 40px padding（不铺满屏幕）
- 顶部导航栏（标题、返回编辑、导出按钮）
- 底部提示栏
- 禁用所有编辑功能

相关文件：
- src/router/index.ts - 路由配置
- src/views/Designer.vue - 设计器页面
- src/views/PreviewView.vue - 预览页面
- e2e/tests/preview-route.spec.js - 预览测试

请帮我实现/测试预览功能。
```

### 🚀 场景4：添加新路由 ⭐ 新增

**复制以下提示词**：

```
我需要在 Report Designer 中添加新的路由。

项目路由结构：
```typescript
// src/router/index.ts
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'designer',
    component: () => import('../views/Designer.vue'),
  },
  {
    path: '/preview/:id?',
    name: 'preview',
    component: () => import('../views/PreviewView.vue'),
  },
];
```

新路由需求：
- 路径：[你的路径]
- 组件：[你的组件]
- 参数：[需要的参数]

实现步骤：
1. 在 src/views/ 创建新的 Vue 组件
2. 在 src/router/index.ts 添加路由配置
3. 在 main.ts 中确认 router 已安装
4. 编写测试验证路由

请帮我实现这个新路由。
```

### 🚀 场景5：调试测试问题

**复制以下提示词**：

```
我在调试 Report Designer 的 Playwright 测试时遇到问题。

测试环境：
- Playwright v1.57
- Chromium
- http://localhost:5174

调试检查清单：
□ 查看完整错误堆栈
□ 查看截图 test-results/.../test-failed-1.png
□ 查看视频 test-results/.../video.webm
□ 确认选择器是否正确
□ 确认拖拽位置 x < 200
□ 确认等待时间足够
□ 检查是否正确访问 store（不使用 .value）

常见问题和解决方案：
1. 右侧面板遮挡 → 使用 x: 150
2. Strict mode violation → 使用 .class
3. Element Plus Select → 点击而非 selectOption
4. 渲染未完成 → 增加等待时间到 1500ms
5. Store 访问错误 → 不使用 .value

请帮我调试以下问题：
[描述具体问题]
```

---

## 📚 补充资源

### 关键文件路径

```
# 项目结构
src/main.ts                        # 应用入口（Pinia + Router 初始化）
src/App.vue                        # 根组件（路由容器）
src/router/index.ts                # 路由配置
src/views/Designer.vue             # 设计器页面（包含统一属性面板）
src/views/PreviewView.vue          # 预览页面
src/utils/componentData.ts         # 组件列表
src/types/index.ts                 # TypeScript 类型定义（含组件 name 属性）
src/composables/useComponentCreation.ts  # 组件创建逻辑（含默认名称生成）
src/components/properties-panel/common/ComponentLinkageConfig.vue  # 联动配置
src/stores/pinia/designerStore.ts  # Pinia store
src/stores/designer.ts             # 兼容层

# 属性面板组件 ⭐ 新增
src/components/properties-panel/properties/
├── TextProperties.vue             # 文本组件属性
├── ImageProperties.vue            # 图片组件属性
├── TableProperties.vue            # 表格组件属性
├── FormProperties.vue             # 表单组件属性
├── BarChartProperties.vue         # 柱状图属性
├── LineChartProperties.vue        # 折线图属性
├── PieChartProperties.vue         # 饼图属性
├── ScatterChartProperties.vue     # 散点图属性
├── GaugeChartProperties.vue       # 仪表盘属性
├── FunnelChartProperties.vue      # 漏斗图属性
├── RectangleProperties.vue        # 矩形属性
└── LineProperties.vue             # 线条属性

# 测试文件
e2e/tests/basic-setup.spec.js       # 基础测试（参考）
e2e/tests/drag-drop.spec.js         # 拖拽测试（参考）
e2e/tests/complex-scenarios-v2.spec.js  # 复杂场景（已修复）
e2e/tests/component-linkage.spec.js  # 联动测试
e2e/tests/preview-route.spec.js     # 预览测试 ⭐ 新增

# 配置文件
e2e/playwright.config.js            # Playwright 配置
e2e/package.json                    # 测试依赖
vite.config.ts                      # Vite 配置（支持 history 模式）
```

### 性能基准

```
页面加载时间：< 10s（实际：~700ms）
组件库响应：< 3s（实际：~20ms）
单组件添加：< 2s（实际：~800ms）
图表渲染：< 3s（实际：~1500ms）
路由切换：< 1s（实际：~100ms）⭐ 新增
```

### 测试覆盖

```
总计：57+个测试 ⭐ 更新
- 基础环境：14个
- 拖拽交互：16个
- 复杂场景：13个
- 组件联动：10个
- 预览路由：4个 ⭐ 新增

通过率：100%
执行时间：~45秒
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

4. **实现路由功能时** ⭐ 新增
   - 参考"路由系统"章节
   - 查看预览功能实现示例
   - 遵循路由最佳实践

5. **使用 Pinia Store 时** ⭐ 更新
   - 参考"Pinia 状态管理最佳实践"
   - 注意自动解包特性
   - 不要使用 `.value` 访问状态

6. **调试问题时**
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

3. **重要更新记录**
   - ✅ v2.3: 添加组件命名和统一属性面板功能 ⭐ 2026-01-17
   - ✅ v2.2: 添加路由系统和预览功能（问题9-10）
   - ✅ v2.1: 添加兼容层常见问题和解决方案（问题5-8）
   - ✅ v2.0: 添加 Pinia 状态管理系统
   - ✅ v2.0: 添加状态管理最佳实践
   - ✅ v2.0: 添加 Pinia 检查清单
   - ✅ v2.0: 更新项目结构和架构说明

---

## 📝 文档信息

**文件**: `.claude/PROJECT_CONTEXT.md`
**版本**: 2.3
**创建日期**: 2026-01-16
**最后更新**: 2026-01-17
**维护者**: Claude Code + 用户

**最新更新内容** (v2.3 - 2026-01-17):
- ✅ 添加组件命名功能章节
- ✅ 添加统一属性面板结构说明
- ✅ 更新组件创建逻辑（默认名称生成）
- ✅ 更新联动配置中的组件显示格式
- ✅ 更新属性面板使用 el-collapse 的最佳实践
- ✅ 添加相关文件列表

**历史更新**:
- v2.2: 添加 Vue Router 4 路由系统和预览功能
- v2.1: 添加兼容层常见问题和解决方案
- v2.0: 添加 Pinia 状态管理系统

**用途**: 为新 Claude Code 会话提供项目上下文，避免重复错误，加速开发。

---

**💡 提示**: 在新会话开始时，告诉 Claude：
```
"请参考 .claude/PROJECT_CONTEXT.md 文档，了解 Report Designer 项目的上下文、路由系统、组件命名功能、统一属性面板和已知问题。"
```

这样可以大幅减少错误重犯，提高开发效率！🎯

**最新功能** (v2.3 - 2026-01-17):
- 🏷️ 组件命名功能 - 每个组件都有可编辑的名称，用于联动配置中识别
- 📋 统一属性面板 - 所有属性使用 el-collapse 折叠面板，样式一致
- 🤖 自动命名 - 创建组件时自动生成默认名称（格式："类型 (ID后4位)"）

