import { test, expect } from '@playwright/test';

test.describe('Preview Route Test', () => {
  test('预览页面应该正确显示', async ({ page }) => {
    // 直接导航到预览页面
    await page.goto('http://localhost:5174/preview/design-1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // 验证预览页面的结构
    await expect(page.locator('.preview-view')).toBeVisible();
    await expect(page.locator('.preview-header')).toBeVisible();
    await expect(page.locator('.preview-container')).toBeVisible();

    // 验证预览容器有padding（通过检查computed style）
    const previewContainer = page.locator('.preview-container');
    const padding = await previewContainer.evaluate((el) => {
      return window.getComputedStyle(el).padding;
    });
    expect(padding).toBe('40px');

    // 验证返回编辑按钮存在
    await expect(page.locator('button').filter({ hasText: '返回编辑' })).toBeVisible();

    // 验证导出按钮存在
    await expect(page.locator('button').filter({ hasText: '导出' })).toBeVisible();

    // 验证底部提示
    await expect(page.locator('.preview-footer')).toBeVisible();

    console.log('✅ 预览页面结构正确');
    console.log(`✅ 预览容器padding: ${padding}`);
  });

  test('预览页面的返回编辑按钮应该工作', async ({ page }) => {
    // 监听控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });

    // 导航到预览页面
    await page.goto('http://localhost:5174/preview/design-1');
    await page.waitForLoadState('networkidle');

    // 点击返回编辑按钮
    const backButton = page.locator('button').filter({ hasText: '返回编辑' });
    await backButton.click();

    // 等待导航完成
    await page.waitForTimeout(2000);

    // 验证导航到根路径
    expect(page.url()).toBe('http://localhost:5174/');

    console.log('✅ 返回编辑按钮工作正常');
  });

  test('预览页面应该禁用所有编辑功能', async ({ page }) => {
    // 导航到预览页面
    await page.goto('http://localhost:5174/preview/design-1');
    await page.waitForLoadState('networkidle');

    // 验证body有preview类
    const bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).toContain('preview');

    // 验证选择框等编辑元素被隐藏
    const selectionHandles = page.locator('.selection-handle');
    const count = await selectionHandles.count();
    expect(count).toBe(0);

    console.log('✅ 预览模式正确禁用了编辑功能');
  });

  test('设计器页面应该有预览按钮', async ({ page }) => {
    // 导航到设计器页面
    await page.goto('http://localhost:5174/');
    await page.waitForLoadState('networkidle');

    // 验证预览按钮存在
    const previewButton = page.locator('button').filter({ hasText: '预览' });
    await expect(previewButton).toBeVisible();

    console.log('✅ 设计器页面有预览按钮');
  });
});
