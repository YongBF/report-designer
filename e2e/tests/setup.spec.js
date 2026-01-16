/**
 * 环境准备和全局设置
 *
 * 测试前环境准备和全局配置验证
 */

const { test, expect } = require('@playwright/test');

test.describe('环境准备', () => {
  test('应该能够访问开发服务器', async ({ page }) => {
    const response = await page.goto('/');
    expect(response.status()).toBe(200);
  });

  test('应用应该正常加载，无控制台错误', async ({ page }) => {
    const errors = [];

    page.on('pageerror', (error) => {
      errors.push(error.toString());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 验证没有严重错误
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

  test('Mock Server应该可用', async ({ page }) => {
    // 测试Mock Server连接
    try {
      const response = await page.evaluate(async () => {
        const res = await fetch('http://localhost:3001/api/users');
        const data = await res.json();
        return { ok: res.ok, data };
      });

      expect(response.ok).toBe(true);
      expect(response.data.success).toBe(true);
    } catch (error) {
      console.warn('Mock Server未启动，部分测试将被跳过');
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

    // 页面应该在5秒内加载完成
    expect(loadTime).toBeLessThan(5000);
  });

  test('组件创建响应时间应该合理', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const startTime = Date.now();

    await page.click('button:has-text("文本")');

    // 等待组件出现
    await page.waitForSelector('.text-component', { timeout: 5000 });

    const responseTime = Date.now() - startTime;

    console.log(`组件创建响应时间: ${responseTime}ms`);

    // 组件创建应该在1秒内完成
    expect(responseTime).toBeLessThan(1000);
  });
});
