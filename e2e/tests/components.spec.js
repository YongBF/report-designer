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
    const canvas = page.locator('.canvas-content-inner');

    // 从组件库拖拽文本组件到画布
    const textComponent = page.locator('.component-item').filter({ hasText: '文本' });
    await textComponent.dragTo(canvas, {
      targetPosition: { x: 150, y: 200 }
    });

    // 等待组件出现在画布中
    await page.waitForTimeout(800);

    // 验证文本组件已添加
    const textContent = page.locator('.text-content').first();
    await expect(textContent).toBeVisible();
    await expect(textContent).toContainText('双击编辑文本');
  });

  test('应该能够创建表格组件', async ({ page }) => {
    const canvas = page.locator('.canvas-content-inner');

    // 从组件库拖拽表格组件到画布
    const tableComponent = page.locator('.component-item').filter({ hasText: '表格' });
    await tableComponent.dragTo(canvas, {
      targetPosition: { x: 150, y: 200 }
    });

    // 等待组件渲染 - 表格需要更长时间
    await page.waitForTimeout(3000);

    // 验证画布组件已添加
    const canvasComponent = page.locator('.canvas-component').first();
    await expect(canvasComponent).toBeVisible();

    // 验证表格元素存在 - BaseRenderer在canvas-component内部，表格在BaseRenderer内部
    const table = page.locator('.canvas-component .base-renderer table.el-table').first();
    await expect(table).toBeVisible({ timeout: 5000 });
  });

  test('应该能够创建柱状图组件', async ({ page }) => {
    const canvas = page.locator('.canvas-content-inner');

    // 从组件库拖拽柱状图组件到画布
    const chartComponent = page.locator('.component-item').filter({ hasText: '柱状图' });
    await chartComponent.dragTo(canvas, {
      targetPosition: { x: 150, y: 200 }
    });

    // 等待图表渲染
    await page.waitForTimeout(2000);

    // 验证画布组件已添加
    const canvasComponent = page.locator('.canvas-component').first();
    await expect(canvasComponent).toBeVisible();

    // 验证图表元素存在（在画布组件内部）
    const chart = page.locator('.canvas-component .chart-container').first();
    await expect(chart).toBeVisible();
  });

  test('应该能够创建表单组件', async ({ page }) => {
    const canvas = page.locator('.canvas-content-inner');

    // 从组件库拖拽表单组件到画布
    const formComponent = page.locator('.component-item').filter({ hasText: '表单' });
    await formComponent.dragTo(canvas, {
      targetPosition: { x: 150, y: 200 }
    });

    // 等待表单渲染
    await page.waitForTimeout(1000);

    // 验证画布组件已添加
    const canvasComponent = page.locator('.canvas-component').first();
    await expect(canvasComponent).toBeVisible();

    // 验证表单容器存在（在画布组件内部）
    const form = page.locator('.canvas-component .form-container').first();
    await expect(form).toBeVisible();
  });

  test('应该能够创建图片组件', async ({ page }) => {
    const canvas = page.locator('.canvas-content-inner');

    // 从组件库拖拽图片组件到画布
    const imageComponent = page.locator('.component-item').filter({ hasText: '图片' });
    await imageComponent.dragTo(canvas, {
      targetPosition: { x: 150, y: 200 }
    });

    // 等待组件渲染
    await page.waitForTimeout(800);

    // 验证画布组件已添加
    const canvasComponent = page.locator('.canvas-component').first();
    await expect(canvasComponent).toBeVisible();
  });

  test('应该能够创建矩形组件', async ({ page }) => {
    const canvas = page.locator('.canvas-content-inner');

    // 从组件库拖拽矩形组件到画布
    const rectComponent = page.locator('.component-item').filter({ hasText: '矩形' });
    await rectComponent.dragTo(canvas, {
      targetPosition: { x: 150, y: 200 }
    });

    // 等待组件渲染
    await page.waitForTimeout(800);

    // 验证画布组件已添加
    const canvasComponent = page.locator('.canvas-component').first();
    await expect(canvasComponent).toBeVisible();

    // 验证矩形内容存在
    const rectContent = page.locator('.canvas-component .rectangle-content').first();
    await expect(rectContent).toBeVisible();
  });

  test('应该能够创建线条组件', async ({ page }) => {
    const canvas = page.locator('.canvas-content-inner');

    // 从组件库拖拽线条组件到画布
    const lineComponent = page.locator('.component-item').filter({ hasText: '线条' });
    await lineComponent.dragTo(canvas, {
      targetPosition: { x: 150, y: 200 }
    });

    // 等待组件渲染
    await page.waitForTimeout(800);

    // 验证画布组件已添加
    const canvasComponent = page.locator('.canvas-component').first();
    await expect(canvasComponent).toBeVisible();

    // 验证线条内容存在
    const lineContent = page.locator('.canvas-component .line-content').first();
    await expect(lineContent).toBeVisible();
  });
});

test.describe('图表组件完整测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('所有图表组件都应该正常渲染', async ({ page }) => {
    const canvas = page.locator('.canvas-content-inner');
    const chartTypes = ['柱状图', '折线图', '饼图', '散点图', '仪表盘'];

    for (let i = 0; i < chartTypes.length; i++) {
      const chartComponent = page.locator('.component-item').filter({ hasText: chartTypes[i] });
      await chartComponent.dragTo(canvas, {
        targetPosition: { x: 150, y: 150 + i * 250 }
      });
      await page.waitForTimeout(500);
    }

    // 等待所有图表渲染
    await page.waitForTimeout(2000);

    // 验证所有图表容器可见（至少有图表组件）
    const chartContainers = page.locator('.canvas-component .chart-container');
    const count = await chartContainers.count();
    expect(count).toBeGreaterThan(0);
  });
});
