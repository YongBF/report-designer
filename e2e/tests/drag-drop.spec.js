/**
 * 拖拽添加组件测试
 *
 * 基于实际UI结构的测试：
 * - 左侧组件库面板
 * - 中间画布区域
 * - 右侧属性面板
 */

const { test, expect } = require('@playwright/test');

test.describe('拖拽添加组件', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('应该能够拖拽文本组件到画布', async ({ page }) => {
    // 1. 找到文本组件（在左侧组件库）
    const textComponent = page.locator('.component-item').filter({ hasText: '文本' }).first();
    await expect(textComponent).toBeVisible();

    // 2. 找到画布区域
    const canvas = page.locator('.canvas-content');
    await expect(canvas).toBeVisible();

    // 3. 获取初始组件数量
    const initialCount = await page.locator('.canvas-component').count();

    // 4. 拖拽文本组件到画布
    await textComponent.dragTo(canvas, {
      targetPosition: { x: 400, y: 300 }
    });

    // 5. 等待组件出现
    await page.waitForTimeout(1000);

    // 6. 验证组件已添加
    const finalCount = await page.locator('.canvas-component').count();
    expect(finalCount).toBeGreaterThan(initialCount);

    // 7. 验证文本组件存在
    const textContent = page.locator('.text-content').first();
    await expect(textContent).toBeVisible();
  });

  test('应该能够拖拽表格组件到画布', async ({ page }) => {
    // 找到表格组件
    const tableComponent = page.locator('.component-item').filter({ hasText: '表格' }).first();
    await expect(tableComponent).toBeVisible();

    // 找到画布区域
    const canvas = page.locator('.canvas-content');
    await expect(canvas).toBeVisible();

    // 拖拽表格组件到画布
    await tableComponent.dragTo(canvas, {
      targetPosition: { x: 400, y: 300 }
    });

    // 等待组件出现
    await page.waitForTimeout(1000);

    // 验证表格组件存在
    const tableContainer = page.locator('.table-container').first();
    await expect(tableContainer).toBeVisible();
  });

  test('应该能够拖拽柱状图组件到画布', async ({ page }) => {
    // 找到柱状图组件
    const barChartComponent = page.locator('.component-item').filter({ hasText: '柱状图' }).first();
    await expect(barChartComponent).toBeVisible();

    // 找到画布区域
    const canvas = page.locator('.canvas-content');
    await expect(canvas).toBeVisible();

    // 拖拽柱状图组件到画布
    await barChartComponent.dragTo(canvas, {
      targetPosition: { x: 400, y: 300 }
    });

    // 等待组件出现并渲染图表
    await page.waitForTimeout(2000);

    // 验证图表容器存在
    const chartContainer = page.locator('.chart-container').first();
    await expect(chartContainer).toBeVisible();
  });

  test('应该能够拖拽表单组件到画布', async ({ page }) => {
    // 找到表单组件
    const formComponent = page.locator('.component-item').filter({ hasText: '表单' }).first();
    await expect(formComponent).toBeVisible();

    // 找到画布区域
    const canvas = page.locator('.canvas-content');
    await expect(canvas).toBeVisible();

    // 拖拽表单组件到画布
    await formComponent.dragTo(canvas, {
      targetPosition: { x: 400, y: 300 }
    });

    // 等待组件出现
    await page.waitForTimeout(1000);

    // 验证表单组件存在
    const formContainer = page.locator('.form-container').first();
    await expect(formContainer).toBeVisible();
  });

  test('应该能够拖拽矩形组件到画布', async ({ page }) => {
    // 找到矩形组件
    const rectangleComponent = page.locator('.component-item').filter({ hasText: '矩形' }).first();
    await expect(rectangleComponent).toBeVisible();

    // 找到画布区域
    const canvas = page.locator('.canvas-content');
    await expect(canvas).toBeVisible();

    // 拖拽矩形组件到画布
    await rectangleComponent.dragTo(canvas, {
      targetPosition: { x: 400, y: 300 }
    });

    // 等待组件出现
    await page.waitForTimeout(1000);

    // 验证矩形组件存在
    const rectangleContent = page.locator('.rectangle-content').first();
    await expect(rectangleContent).toBeVisible();
  });
});

test.describe('组件交互功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 添加一个文本组件用于测试
    const textComponent = page.locator('.component-item').filter({ hasText: '文本' }).first();
    const canvas = page.locator('.canvas-content');
    await textComponent.dragTo(canvas, {
      targetPosition: { x: 400, y: 300 }
    });
    await page.waitForTimeout(1000);
  });

  test('应该能够选中组件', async ({ page }) => {
    // 添加组件到画布
    const textComponent = page.locator('.component-item').filter({ hasText: '文本' }).first();
    const canvas = page.locator('.canvas-content');
    await textComponent.dragTo(canvas, {
      targetPosition: { x: 400, y: 300 }
    });
    await page.waitForTimeout(1000);

    // 点击组件选中 - 点击内容区域
    const component = page.locator('.canvas-component').first();
    const textContent = component.locator('.text-content').first();
    await textContent.click({ force: true });
    await page.waitForTimeout(500);

    // 验证组件仍然存在且可见
    await expect(component).toBeVisible();
  });

  test('选中的组件应该在属性面板显示配置', async ({ page }) => {
    // 选中组件 - 点击内部内容
    const component = page.locator('.canvas-component').first();
    const textContent = component.locator('.text-content').first();
    await textContent.click({ force: true });

    // 验证属性面板显示组件信息
    const rightPanel = page.locator('.right-panel');
    await expect(rightPanel).toContainText('组件类型');
    await expect(rightPanel).toContainText('组件ID');
  });

  test('应该能够删除组件', async ({ page }) => {
    // 获取初始组件数量
    const initialCount = await page.locator('.canvas-component').count();

    // 选中组件
    const component = page.locator('.canvas-component').first();
    await component.click();
    await page.waitForTimeout(500);

    // 展开"操作"面板
    const actionsPanel = page.locator('.right-panel .el-collapse-item').filter({ hasText: '操作' });
    await actionsPanel.click();
    await page.waitForTimeout(300);

    // 点击删除按钮
    const deleteButton = page.locator('.right-panel button').filter({ hasText: '删除组件' });
    await deleteButton.click();

    // 等待删除生效
    await page.waitForTimeout(500);

    // 验证组件被删除
    const finalCount = await page.locator('.canvas-component').count();
    expect(finalCount).toBeLessThan(initialCount);
  });
});

test.describe('工具栏功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('工具栏应该显示所有操作按钮', async ({ page }) => {
    const toolbar = page.locator('.toolbar');
    await expect(toolbar).toBeVisible();

    // 验证主要按钮存在
    await expect(toolbar).toContainText('新建');
    await expect(toolbar).toContainText('撤销');
    await expect(toolbar).toContainText('重做');
    await expect(toolbar).toContainText('保存');
    await expect(toolbar).toContainText('预览');
  });

  test('应该能够点击预览按钮', async ({ page }) => {
    const previewButton = page.locator('.toolbar button').filter({ hasText: '预览' });
    await expect(previewButton).toBeEnabled();

    // 点击预览按钮（不验证具体行为，只验证可点击）
    await previewButton.click();
    await page.waitForTimeout(500);
  });
});

test.describe('组件库面板', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('应该显示所有组件组', async ({ page }) => {
    const leftPanel = page.locator('.left-panel');
    await expect(leftPanel).toBeVisible();

    // 验证组件组标题
    await expect(leftPanel).toContainText('组件库');
    await expect(leftPanel).toContainText('基础组件');
    await expect(leftPanel).toContainText('图表组件');
    await expect(leftPanel).toContainText('形状组件');
  });

  test('应该显示所有基础组件', async ({ page }) => {
    const leftPanel = page.locator('.left-panel');

    // 验证基础组件
    await expect(leftPanel).toContainText('文本');
    await expect(leftPanel).toContainText('图片');
    await expect(leftPanel).toContainText('表格');
    await expect(leftPanel).toContainText('表单');
  });

  test('应该显示所有图表组件', async ({ page }) => {
    const leftPanel = page.locator('.left-panel');

    // 验证图表组件
    await expect(leftPanel).toContainText('柱状图');
    await expect(leftPanel).toContainText('折线图');
    await expect(leftPanel).toContainText('饼图');
    await expect(leftPanel).toContainText('散点图');
    await expect(leftPanel).toContainText('仪表盘');
  });

  test('应该显示所有形状组件', async ({ page }) => {
    const leftPanel = page.locator('.left-panel');

    // 验证形状组件
    await expect(leftPanel).toContainText('矩形');
    await expect(leftPanel).toContainText('线条');
  });
});

test.describe('画布区域', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('画布应该正常显示', async ({ page }) => {
    const canvas = page.locator('.canvas-panel');
    await expect(canvas).toBeVisible();

    const canvasContent = page.locator('.canvas-content-inner');
    await expect(canvasContent).toBeVisible();
  });

  test('画布应该支持拖放高亮', async ({ page }) => {
    const canvas = page.locator('.canvas-content');
    const textComponent = page.locator('.component-item').filter({ hasText: '文本' }).first();

    // 开始拖拽
    await textComponent.dragTo(canvas, {
      targetPosition: { x: 400, y: 300 },
      force: true
    });

    // 验证组件已添加
    const component = page.locator('.canvas-component').first();
    await expect(component).toBeVisible();
  });
});
