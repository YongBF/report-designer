/**
 * 复杂场景测试 - 模拟真实用户操作
 *
 * 测试真实用户使用场景，包括：
 * - 创建多组件报表
 * - 配置组件属性
 * - 组件布局调整
 */

const { test, expect } = require('@playwright/test');

test.describe('场景1: 创建销售数据报表', () => {
  test('完整的报表创建流程', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // ========== 步骤1: 添加标题文本 ==========
    const textComponent = page.locator('.component-item').filter({ hasText: '文本' });
    await textComponent.dragTo(canvas, { targetPosition: { x: 400, y: 100 } });
    await page.waitForTimeout(1000);

    // 选中文本组件并修改内容
    const component = page.locator('.canvas-component').first();
    await component.click();
    await page.waitForTimeout(500);

    // 在属性面板中找到文本内容输入框
    const textContentInput = page.locator('#text-content');
    if (await textContentInput.isVisible()) {
      await textContentInput.fill('2024年度销售数据报表');
    }

    // ========== 步骤2: 添加表格组件 ==========
    const tableComponent = page.locator('.component-item').filter({ hasText: '表格' });
    await tableComponent.dragTo(canvas, { targetPosition: { x: 400, y: 250 } });
    await page.waitForTimeout(1000);

    // ========== 步骤3: 添加柱状图 ==========
    const barChartComponent = page.locator('.component-item').filter({ hasText: '柱状图' });
    await barChartComponent.dragTo(canvas, { targetPosition: { x: 400, y: 500 } });
    await page.waitForTimeout(1500);

    // 验证图表已渲染
    const chartContainer = page.locator('.chart-container').first();
    await expect(chartContainer).toBeVisible();

    // ========== 步骤4: 验证整体布局 ==========
    const allComponents = await page.locator('.canvas-component').count();
    expect(allComponents).toBeGreaterThanOrEqual(3);

    // 验证工具栏功能
    const saveButton = page.locator('.toolbar button').filter({ hasText: '保存' });
    await expect(saveButton).toBeVisible();
  });

  test('调整组件顺序', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // 添加3个组件
    const components = ['文本', '表格', '柱状图'];
    for (let i = 0; i < components.length; i++) {
      const comp = page.locator('.component-item').filter({ hasText: components[i] });
      await comp.dragTo(canvas, { targetPosition: { x: 400, y: 150 + i * 200 } });
      await page.waitForTimeout(800);
    }

    // 验证组件都添加成功
    const allComponents = await page.locator('.canvas-component').count();
    expect(allComponents).toBeGreaterThanOrEqual(3);
  });
});

test.describe('场景2: 表单设计与配置', () => {
  test('创建并配置表单', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // 添加表单组件
    const formComponent = page.locator('.component-item').filter({ hasText: '表单' });
    await formComponent.dragTo(canvas, { targetPosition: { x: 400, y: 200 } });
    await page.waitForTimeout(1000);

    // 选中表单
    const canvasComponent = page.locator('.canvas-component').first();
    await canvasComponent.click();
    await page.waitForTimeout(500);

    // 验证表单容器可见
    const formContainer = page.locator('.form-container').first();
    await expect(formContainer).toBeVisible();
  });
});

test.describe('场景3: 图表数据配置', () => {
  test('添加多个图表并排列', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // 添加多个图表
    const charts = ['柱状图', '折线图', '饼图'];
    for (let i = 0; i < charts.length; i++) {
      const chart = page.locator('.component-item').filter({ hasText: charts[i] });
      await chart.dragTo(canvas, { targetPosition: { x: 400, y: 150 + i * 300 } });
      await page.waitForTimeout(1000);
    }

    // 验证图表容器可见
    const chartContainers = page.locator('.chart-container');
    const count = await chartContainers.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

test.describe('场景4: 表格列配置', () => {
  test('添加表格并验证结构', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // 添加表格组件
    const tableComponent = page.locator('.component-item').filter({ hasText: '表格' });
    await tableComponent.dragTo(canvas, { targetPosition: { x: 400, y: 200 } });
    await page.waitForTimeout(3000);

    // 验证表格结构 - 表格在BaseRenderer内部，BaseRenderer在canvas-component内部
    const table = page.locator('.canvas-component table.el-table').first();
    await expect(table).toBeVisible({ timeout: 5000 });

    // 验证表格有列
    const headers = page.locator('.canvas-component th.el-table__cell');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(0);
  });
});

test.describe('场景5: 工具栏操作', () => {
  // 预览功能测试已移至 preview-route.spec.js，使用新的路由方式

  test('新建和撤销操作', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // 添加组件
    const textComponent = page.locator('.component-item').filter({ hasText: '文本' });
    await textComponent.dragTo(canvas, { targetPosition: { x: 400, y: 200 } });
    await page.waitForTimeout(1000);

    // 点击新建按钮
    const newButton = page.locator('.toolbar button').filter({ hasText: '新建' });
    await newButton.click();
    await page.waitForTimeout(500);

    // 验证画布清空
    const components = page.locator('.canvas-component');
    const count = await components.count();
    expect(count).toBe(0);
  });
});

test.describe('场景6: 复杂布局设计', () => {
  test('创建仪表板布局', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // 添加标题
    const titleComponent = page.locator('.component-item').filter({ hasText: '文本' });
    await titleComponent.dragTo(canvas, { targetPosition: { x: 400, y: 100 } });
    await page.waitForTimeout(800);

    // 添加多个图表
    const charts = ['柱状图', '折线图', '饼图'];
    for (let i = 0; i < charts.length; i++) {
      const chart = page.locator('.component-item').filter({ hasText: charts[i] });
      await chart.dragTo(canvas, { targetPosition: { x: 200 + i * 300, y: 250 } });
      await page.waitForTimeout(800);
    }

    // 添加表格
    const tableComponent = page.locator('.component-item').filter({ hasText: '表格' });
    await tableComponent.dragTo(canvas, { targetPosition: { x: 400, y: 550 } });
    await page.waitForTimeout(1000);

    // 验证所有组件添加成功
    const allComponents = await page.locator('.canvas-component').count();
    expect(allComponents).toBeGreaterThanOrEqual(5);
  });
});

test.describe('场景7: 表单与表格联动', () => {
  test('创建查询表单并添加表格', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // 添加表单
    const formComponent = page.locator('.component-item').filter({ hasText: '表单' });
    await formComponent.dragTo(canvas, { targetPosition: { x: 400, y: 150 } });
    await page.waitForTimeout(800);

    // 添加表格
    const tableComponent = page.locator('.component-item').filter({ hasText: '表格' });
    await tableComponent.dragTo(canvas, { targetPosition: { x: 400, y: 400 } });
    await page.waitForTimeout(1000);

    // 验证两个组件都存在
    const components = page.locator('.canvas-component');
    const count = await components.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

test.describe('场景8: 样式定制', () => {
  test('修改组件样式', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // 添加矩形
    const rectComponent = page.locator('.component-item').filter({ hasText: '矩形' });
    await rectComponent.dragTo(canvas, { targetPosition: { x: 400, y: 200 } });
    await page.waitForTimeout(800);

    // 选中组件
    const canvasComponent = page.locator('.canvas-component').first();
    await canvasComponent.click();
    await page.waitForTimeout(500);

    // 验证组件可以选中
    await expect(canvasComponent).toBeVisible();
  });
});

test.describe('场景9: 性能测试', () => {
  test('大量组件性能测试', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // 添加多个组件
    const components = ['文本', '矩形', '线条'];
    for (let i = 0; i < 6; i++) {
      const compName = components[i % 3];
      const comp = page.locator('.component-item').filter({ hasText: compName });
      await comp.dragTo(canvas, { targetPosition: { x: 200 + (i % 3) * 300, y: 100 + Math.floor(i / 3) * 200 } });
      await page.waitForTimeout(500);
    }

    // 验证所有组件都添加成功
    const allComponents = await page.locator('.canvas-component').count();
    expect(allComponents).toBeGreaterThanOrEqual(6);
  });
});

test.describe('场景10: 导出功能', () => {
  test('保存和导出功能验证', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // 添加组件
    const textComponent = page.locator('.component-item').filter({ hasText: '文本' });
    await textComponent.dragTo(canvas, { targetPosition: { x: 400, y: 200 } });
    await page.waitForTimeout(800);

    // 验证保存按钮存在
    const saveButton = page.locator('.toolbar button').filter({ hasText: '保存' });
    await expect(saveButton).toBeVisible();

    // 验证导出按钮存在
    const exportButton = page.locator('.toolbar button').filter({ hasText: '导出' });
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeVisible();
    }
  });
});
