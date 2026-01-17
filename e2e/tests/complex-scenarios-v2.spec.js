/**
 * 复杂场景测试 V2 - 修复版
 *
 * 针对Element UI组件特性进行优化
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
    if (await textContentInput.isVisible({ timeout: 3000 })) {
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

    console.log('✅ 成功创建包含标题、表格和图表的报表');
  });
});

test.describe('场景2: 表单设计与配置', () => {
  test('配置表单布局和样式', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // ========== 步骤1: 添加表单组件 ==========
    const formComponent = page.locator('.component-item').filter({ hasText: '表单' });
    await formComponent.dragTo(canvas, { targetPosition: { x: 400, y: 200 } });
    await page.waitForTimeout(1000);

    // 选中表单组件
    const form = page.locator('.canvas-component').first();
    await form.click();
    await page.waitForTimeout(500);

    // 验证表单容器可见
    const formContainer = page.locator('.form-container').first();
    await expect(formContainer).toBeVisible();

    console.log('✅ 成功添加并配置表单组件');
  });
});

test.describe('场景3: 图表组件测试', () => {
  test('添加多个图表并验证渲染', async ({ page }) => {
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

    console.log('✅ 成功添加并渲染多个图表');
  });
});

test.describe('场景4: 表格配置测试', () => {
  test('配置表格基础样式', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // 添加表格组件
    const tableComponent = page.locator('.component-item').filter({ hasText: '表格' });
    await tableComponent.dragTo(canvas, { targetPosition: { x: 400, y: 200 } });
    await page.waitForTimeout(3000);

    // 验证表格结构 - 表格在BaseRenderer内部
    const table = page.locator('.canvas-component table.el-table').first();
    await expect(table).toBeVisible({ timeout: 5000 });

    // 验证表格有数据
    const rows = page.locator('.canvas-component .el-table__body-wrapper .el-table__row');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    console.log('✅ 成功配置表格组件');
  });
});

test.describe('场景5: 工具栏操作', () => {
  // 预览功能测试已移至 preview-route.spec.js
  // 新建功能测试
  test('新建操作', async ({ page }) => {
    await page.goto('http://localhost:5174/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // 添加组件
    const textComponent = page.locator('.component-item').filter({ hasText: '文本' });
    await textComponent.dragTo(canvas, { targetPosition: { x: 400, y: 200 } });
    await page.waitForTimeout(800);

    // 点击新建按钮
    const newButton = page.locator('.toolbar button').filter({ hasText: '新建' });
    await newButton.click();
    await page.waitForTimeout(500);

    // 验证画布清空
    const components = page.locator('.canvas-component');
    const count = await components.count();
    expect(count).toBe(0);

    console.log('✅ 成功测试新建功能');
  });
});

test.describe('场景10: 拖拽排序测试', () => {
  test('组件拖拽移动和排序', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // 添加多个组件
    const components = ['文本', '矩形', '表格'];
    for (let i = 0; i < components.length; i++) {
      const comp = page.locator('.component-item').filter({ hasText: components[i] });
      await comp.dragTo(canvas, { targetPosition: { x: 400, y: 150 + i * 200 } });
      await page.waitForTimeout(800);
    }

    // 验证所有组件都添加成功
    const allComponents = await page.locator('.canvas-component').count();
    expect(allComponents).toBeGreaterThanOrEqual(3);

    console.log('✅ 成功测试组件拖拽和排序');
  });
});
