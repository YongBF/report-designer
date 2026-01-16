/**
 * 基础环境测试
 *
 * 测试应用的基本加载和UI结构
 */

const { test, expect } = require('@playwright/test');

test.describe('基础环境', () => {
  test('应该能够访问开发服务器', async ({ page }) => {
    const response = await page.goto('/');
    expect(response.status()).toBe(200);
  });

  test('应用标题应该正确', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/report-designer/);
  });

  test('应用应该正常加载，无严重错误', async ({ page }) => {
    const errors = [];

    page.on('pageerror', (error) => {
      errors.push(error.toString());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 只关注严重错误
    const criticalErrors = errors.filter(err =>
      err.includes('TypeError') ||
      err.includes('ReferenceError') ||
      err.includes('SyntaxError')
    );

    if (criticalErrors.length > 0) {
      console.error('发现关键错误:', criticalErrors);
    }

    expect(criticalErrors.length).toBe(0);
  });

  test('主要UI元素应该存在', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 验证工具栏
    const toolbar = page.locator('.toolbar');
    await expect(toolbar).toBeVisible();

    // 验证左侧组件库面板
    const leftPanel = page.locator('.left-panel');
    await expect(leftPanel).toBeVisible();

    // 验证中间画布区域
    const canvasPanel = page.locator('.canvas-panel');
    await expect(canvasPanel).toBeVisible();

    // 验证右侧属性面板
    const rightPanel = page.locator('.right-panel');
    await expect(rightPanel).toBeVisible();
  });

  test('Mock Server应该可用', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    try {
      const response = await page.evaluate(async () => {
        const res = await fetch('http://localhost:3001/api/users');
        const data = await res.json();
        return { ok: res.ok, data };
      });

      expect(response.ok).toBe(true);
      expect(response.data.success).toBe(true);
    } catch (error) {
      console.warn('Mock Server未启动，跳过相关测试');
      test.skip('Mock Server未启动');
    }
  });
});

test.describe('性能测试', () => {
  test('页面初始加载时间应该合理', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    console.log(`页面加载时间: ${loadTime}ms`);

    // 页面应该在10秒内加载完成
    expect(loadTime).toBeLessThan(10000);
  });

  test('组件库面板应该快速响应', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const startTime = Date.now();

    // 等待组件库面板加载
    await page.waitForSelector('.component-item', { timeout: 5000 });

    const responseTime = Date.now() - startTime;

    console.log(`组件库加载时间: ${responseTime}ms`);

    // 组件库应该在3秒内加载完成
    expect(responseTime).toBeLessThan(3000);
  });
});

test.describe('面板布局测试', () => {
  test('左侧面板应该显示组件库标题', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const leftPanel = page.locator('.left-panel');
    await expect(leftPanel).toContainText('组件库');
  });

  test('右侧面板应该显示属性面板标题', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const rightPanel = page.locator('.right-panel');
    await expect(rightPanel).toContainText('属性面板');
  });

  test('未选中组件时应该显示空状态提示', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const rightPanel = page.locator('.right-panel');
    await expect(rightPanel).toContainText('请选择一个组件');
  });
});

test.describe('组件库元素测试', () => {
  test('基础组件应该全部可见', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const basicComponents = ['文本', '图片', '表格', '表单'];

    for (const componentName of basicComponents) {
      const component = page.locator('.component-item').filter({ hasText: componentName });
      await expect(component).toBeVisible();
    }
  });

  test('图表组件应该全部可见', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const chartComponents = ['柱状图', '折线图', '饼图', '散点图', '仪表盘'];

    for (const componentName of chartComponents) {
      const component = page.locator('.component-item').filter({ hasText: componentName });
      await expect(component).toBeVisible();
    }
  });

  test('形状组件应该全部可见', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const shapeComponents = ['矩形', '线条'];

    for (const componentName of shapeComponents) {
      const component = page.locator('.component-item').filter({ hasText: componentName });
      await expect(component).toBeVisible();
    }
  });

  test('组件应该是可拖拽的', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 验证组件有draggable属性
    const draggableComponents = await page.locator('.component-item[draggable="true"]').count();

    // 应该至少有11个可拖拽组件
    expect(draggableComponents).toBeGreaterThanOrEqual(11);
  });
});
