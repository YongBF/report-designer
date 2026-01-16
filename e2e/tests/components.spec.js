/**
 * 组件创建和渲染测试
 *
 * 测试各种组件类型的创建和渲染功能：
 * - 文本组件
 * - 图片组件
 * - 表格组件
 * - 图表组件（柱状图、折线图、饼图等）
 * - 矩形组件
 * - 线条组件
 * - 表单组件
 */

const { test, expect } = require('@playwright/test');

test.describe('组件创建和渲染', () => {
  test.beforeEach(async ({ page }) => {
    // 访问应用首页
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够创建文本组件', async ({ page }) => {
    // 点击添加文本组件
    await page.click('button:has-text("文本")');

    // 等待组件出现在画布中
    const textComponent = page.locator('.component-item:has-text("双击编辑文本")');
    await expect(textComponent).toBeVisible();

    // 验证组件在组件列表中
    const componentList = page.locator('.components-list');
    await expect(componentList).toContainText('text');
  });

  test('应该能够创建表格组件', async ({ page }) => {
    // 点击添加表格组件
    await page.click('button:has-text("表格")');

    // 等待组件渲染
    const tableComponent = page.locator('.table-container');
    await expect(tableComponent).toBeVisible({ timeout: 5000 });

    // 验证表格元素存在
    const table = page.locator('table.el-table');
    await expect(table).toBeVisible();
  });

  test('应该能够创建柱状图组件', async ({ page }) => {
    // 点击添加柱状图
    await page.click('button:has-text("柱状图")');

    // 等待图表渲染
    const chartContainer = page.locator('.chart-container');
    await expect(chartContainer).toBeVisible({ timeout: 5000 });

    // 验证ECharts实例已创建
    const chartElement = page.locator('div[_echarts_instance_]');
    await expect(chartElement).toHaveCount(1);
  });

  test('应该能够创建表单组件', async ({ page }) => {
    // 点击添加表单组件
    await page.click('button:has-text("表单")');

    // 等待表单渲染
    const formComponent = page.locator('.form-container');
    await expect(formComponent).toBeVisible({ timeout: 5000 });

    // 验证表单元素存在
    const formItems = page.locator('.el-form-item');
    await expect(formItems).toHaveCount(3); // 默认有3个表单项
  });

  test('应该能够创建图片组件', async ({ page }) => {
    await page.click('button:has-text("图片")');

    const imageComponent = page.locator('.image-container');
    await expect(imageComponent).toBeVisible({ timeout: 5000 });
  });

  test('应该能够创建矩形组件', async ({ page }) => {
    await page.click('button:has-text("矩形")');

    const rectComponent = page.locator('div[style*="background-color"]');
    await expect(rectComponent).toBeVisible({ timeout: 5000 });
  });

  test('应该能够创建线条组件', async ({ page }) => {
    await page.click('button:has-text("线条")');

    const lineComponent = page.locator('div[style*="border-top"]');
    await expect(lineComponent).toBeVisible({ timeout: 5000 });
  });
});

test.describe('图表组件完整测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('所有图表组件都应该正常渲染', async ({ page }) => {
    const chartTypes = ['柱状图', '折线图', '饼图', '散点图', '仪表盘', '漏斗图'];

    for (const chartType of chartTypes) {
      // 添加图表组件
      await page.click(`button:has-text("${chartType}")`);
      await page.waitForTimeout(1000);

      // 验证图表渲染
      const chartContainer = page.locator('.chart-container').last();
      await expect(chartContainer).toBeVisible();

      // 验证ECharts实例
      const chartElement = chartContainer.locator('div[_echarts_instance_]');
      await expect(chartElement).toHaveCount(1);
    }
  });
});
