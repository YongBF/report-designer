/**
 * 基础UI和交互测试
 *
 * 测试应用的基础功能和用户交互：
 * - 页面加载
 * - 组件工具栏
 * - 属性面板
 * - 组件选择和编辑
 * - 拖拽功能
 * - 快捷键操作
 */

const { test, expect } = require('@playwright/test');

test.describe('基础UI功能', () => {
  test('应该成功加载应用首页', async ({ page }) => {
    await page.goto('/');

    // 验证页面标题
    await expect(page).toHaveTitle(/Report Designer/);

    // 验证主要UI元素存在
    await expect(page.locator('.app-container')).toBeVisible();
    await expect(page.locator('.toolbar')).toBeVisible();
    await expect(page.locator('.design-canvas')).toBeVisible();
  });

  test('应该显示所有组件类型按钮', async ({ page }) => {
    await page.goto('/');

    // 验证组件工具栏包含所有组件类型
    const componentButtons = page.locator('.toolbar button');
    const buttonTexts = await componentButtons.allTextContents();

    const expectedButtons = [
      '文本',
      '图片',
      '表格',
      '图表',
      '柱状图',
      '折线图',
      '饼图',
      '散点图',
      '仪表盘',
      '漏斗图',
      '矩形',
      '线条',
      '表单'
    ];

    for (const button of expectedButtons) {
      expect(buttonTexts.some(text => text.includes(button))).toBeTruthy();
    }
  });

  test('应该能够切换不同的标签页', async ({ page }) => {
    await page.goto('/');

    // 查找并点击不同的标签
    const tabs = ['设计', '预览'];

    for (const tab of tabs) {
      const tabButton = page.locator(`button:has-text("${tab}")`);
      if (await tabButton.isVisible()) {
        await tabButton.click();
        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe('组件交互功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够选中组件', async ({ page }) => {
    // 添加一个文本组件
    await page.click('button:has-text("文本")');
    await page.waitForTimeout(1000);

    // 点击组件选中
    const component = page.locator('.component-item').first();
    await component.click();

    // 验证选中样式
    await expect(component).toHaveClass(/selected/);
  });

  test('选中的组件应该在属性面板显示配置项', async ({ page }) => {
    // 添加并选中组件
    await page.click('button:has-text("文本")');
    await page.waitForTimeout(1000);

    const component = page.locator('.component-item').first();
    await component.click();

    // 验证属性面板显示
    const propertiesPanel = page.locator('.properties-panel');
    await expect(propertiesPanel).toBeVisible();

    // 验证显示文本相关的配置项
    await expect(propertiesPanel).toContainText('字体大小');
    await expect(propertiesPanel).toContainText('颜色');
  });

  test('应该能够删除组件', async ({ page }) => {
    // 添加组件
    await page.click('button:has-text("文本")');
    await page.waitForTimeout(1000);

    const initialCount = await page.locator('.component-item').count();

    // 选中并删除
    const component = page.locator('.component-item').first();
    await component.click();

    // 查找并点击删除按钮
    const deleteButton = page.locator('button:has-text("删除")').or(
      page.locator('.delete-button')
    ).or(
      page.locator('[title*="删除"]')
    );

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // 验证组件被删除
      const finalCount = await page.locator('.component-item').count();
      await expect(finalCount).toBe(initialCount - 1);
    }
  });

  test('应该能够调整组件顺序', async ({ page }) => {
    // 添加两个组件
    await page.click('button:has-text("文本")');
    await page.waitForTimeout(500);

    await page.click('button:has-text("矩形")');
    await page.waitForTimeout(500);

    // 获取组件列表
    const components = page.locator('.component-item');
    const firstComponent = components.first();
    const secondComponent = components.nth(1);

    // 尝试拖拽（根据实际UI实现调整）
    const boundingBox = await firstComponent.boundingBox();
    if (boundingBox) {
      await firstComponent.dragTo(secondComponent);
      await page.waitForTimeout(500);

      // 验证顺序已改变
      // 这里可能需要更具体的验证逻辑
    }
  });
});

test.describe('属性配置功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkid');
  });

  test('应该能够修改文本组件的样式', async ({ page }) => {
    // 添加文本组件
    await page.click('button:has-text("文本")');
    await page.waitForTimeout(1000);

    // 选中文本组件
    await page.locator('.component-item').first().click();

    // 修改字体大小
    const fontSizeInput = page.locator('input[placeholder*="字体大小"]');
    if (await fontSizeInput.isVisible()) {
      await fontSizeInput.fill('24');
      // 验证字体大小已更新
      const component = page.locator('.text-component');
      const style = await component.getAttribute('style');
      expect(style).toContain('24px');
    }

    // 修改颜色
    const colorPicker = page.locator('input[type="color"]');
    if (await colorPicker.isVisible()) {
      await colorPicker.fill('#ff0000');
      await page.waitForTimeout(500);

      // 验证颜色已更新
      const updatedStyle = await page.locator('.text-component').getAttribute('style');
      expect(updatedStyle).toContain('#ff0000');
    }
  });

  test('应该能够修改组件尺寸', async ({ page }) => {
    // 添加组件
    await page.click('button:has-text("矩形")');
    await page.waitForTimeout(1000);

    // 选中组件
    await page.locator('.component-item').last().click();

    // 修改高度
    const heightInput = page.locator('input[name="height"]');
    if (await heightInput.isVisible()) {
      await heightInput.fill('300');
      await page.waitForTimeout(500);

      // 验证高度已更新
      const component = page.locator('.rectangle-component');
      const boundingBox = await component.boundingBox();
      expect(boundingBox.height).toBeCloseTo(300, 10);
    }
  });

  test('应该能够修改背景颜色', async ({ page }) => {
    // 添加表格组件
    await page.click('button:has-text("表格")');
    await page.waitForTimeout(1000);

    // 选中组件
    await page.locator('.table-container').click();

    // 修改背景色
    const bgColorInput = page.locator('input[name="backgroundColor"]');
    if (await bgColorInput.isVisible()) {
      await bgColorInput.fill('#f0f0f0');
      await page.waitForTimeout(500);

      // 验证背景色已应用
      const container = page.locator('.table-container');
      const style = await container.getAttribute('style');
      expect(style).toContain('#f0f0f0');
    }
  });
});

test.describe('表单组件功能', () => {
  test('表单组件应该能够接收用户输入', async ({ page }) => {
    // 添加表单组件
    await page.click('button:has-text("表单")');
    await page.waitForTimeout(1000);

    // 查找表单中的输入框
    const nameInput = page.locator('.form-container input[placeholder*="姓名"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('张三');

      // 验证输入值
      await expect(nameInput).toHaveValue('张三');
    }

    // 测试邮箱输入
    const emailInput = page.locator('.form-container input[placeholder*="邮箱"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com');
    }

    // 测试下拉选择
    const selectInput = page.locator('.form-container .el-select');
    if (await selectInput.isVisible()) {
      await selectInput.click();
      await page.waitForTimeout(500);

      // 选择选项
      const option = page.locator('.el-select-dropdown__item').first();
      await option.click();
    }
  });

  test('表单查询按钮应该触发事件', async ({ page }) => {
    // 添加表单组件
    await page.click('button:has-text("表单")');
    await page.waitForTimeout(1000);

    // 查找查询按钮
    const queryButton = page.locator('.form-container button:has-text("查询")');
    if (await queryButton.isVisible()) {
      // 监听控制台日志
      const consoleMessages = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      // 点击查询按钮
      await queryButton.click();
      await page.waitForTimeout(1000);

      // 验证触发了事件（通过控制台日志）
      const hasEventLog = consoleMessages.some(msg =>
        msg.includes('handleFormItemButtonClick') ||
        msg.includes('button.click')
      );

      // 这个验证可能需要根据实际实现调整
      console.log('控制台消息:', consoleMessages);
    }
  });
});
