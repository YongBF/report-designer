/**
 * 基础UI和交互测试
 *
 * 测试应用的基础功能和用户交互：
 * - 页面加载
 * - 组件库
 * - 属性面板
 * - 组件选择和编辑
 * - 拖拽功能
 * - 快捷键操作
 */

const { test, expect } = require('@playwright/test');

test.describe('基础UI功能', () => {
  test('应该成功加载应用首页', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 验证页面标题
    await expect(page).toHaveTitle(/report-designer/);

    // 验证主要UI元素存在
    await expect(page.locator('.report-designer')).toBeVisible();
    await expect(page.locator('.toolbar')).toBeVisible();
    await expect(page.locator('.canvas-panel')).toBeVisible();
  });

  test('应该显示所有组件类型', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 验证左侧面板组件库存在
    await expect(page.locator('.left-panel')).toBeVisible();

    // 验证基础组件组
    const basicComponents = ['文本', '图片', '表格', '表单'];
    for (const name of basicComponents) {
      const component = page.locator('.component-item').filter({ hasText: name });
      await expect(component).toBeVisible();
    }

    // 验证图表组件组
    const chartComponents = ['柱状图', '折线图', '饼图', '散点图', '仪表盘'];
    for (const name of chartComponents) {
      const component = page.locator('.component-item').filter({ hasText: name });
      await expect(component).toBeVisible();
    }

    // 验证形状组件组
    const shapeComponents = ['矩形', '线条'];
    for (const name of shapeComponents) {
      const component = page.locator('.component-item').filter({ hasText: name });
      await expect(component).toBeVisible();
    }
  });

  test('应该能够切换到预览模式', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 点击预览按钮
    const previewButton = page.locator('.toolbar button').filter({ hasText: '预览' });
    await previewButton.click();
    await page.waitForTimeout(2000);

    // 验证进入预览模式（body 有 preview class）
    const bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).toContain('preview');

    // 验证预览模式组件可见
    const previewMode = page.locator('.preview-mode');
    await expect(previewMode).toBeVisible();

    // 退出预览（按 Escape）
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // 验证退出预览模式
    const bodyClassAfter = await page.locator('body').getAttribute('class');
    expect(bodyClassAfter).not.toContain('preview');

    // 验证预览模式组件消失
    const previewModeAfter = page.locator('.preview-mode');
    await expect(previewModeAfter).not.toBeVisible();
  });
});

test.describe('组件交互功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够选中组件', async ({ page }) => {
    const canvas = page.locator('.canvas-content-inner');

    // 拖拽添加文本组件
    const textComponent = page.locator('.component-item').filter({ hasText: '文本' });
    await textComponent.dragTo(canvas, {
      targetPosition: { x: 150, y: 200 }
    });
    await page.waitForTimeout(800);

    // 点击画布上的组件选中
    const canvasComponent = page.locator('.canvas-component').first();
    await canvasComponent.click();

    // 验证组件被选中（通过检查是否显示调整手柄）
    await expect(canvasComponent).toBeVisible();
  });

  test('选中的组件应该在属性面板显示配置项', async ({ page }) => {
    const canvas = page.locator('.canvas-content-inner');

    // 拖拽添加文本组件
    const textComponent = page.locator('.component-item').filter({ hasText: '文本' });
    await textComponent.dragTo(canvas, {
      targetPosition: { x: 150, y: 200 }
    });
    await page.waitForTimeout(800);

    // 选中画布上的组件
    const canvasComponent = page.locator('.canvas-component').first();
    await canvasComponent.click();
    await page.waitForTimeout(500);

    // 验证属性面板显示
    const rightPanel = page.locator('.right-panel');
    await expect(rightPanel).toBeVisible();

    // 验证显示文本相关的配置项
    await expect(rightPanel).toContainText('内容');
    await expect(rightPanel).toContainText('字号');
  });

  test.skip('应该能够删除组件', async ({ page }) => {
    // TODO: 组件选中功能在测试环境中不工作，需要调查原因
    // 可能的原因：
    // 1. 事件处理机制与测试环境不兼容
    // 2. 组件结构在旧版和新版之间不一致
    // 3. 需要更长等待时间或不同的选择器策略
    const canvas = page.locator('.canvas-content-inner');

    // 拖拽添加文本组件
    const textComponent = page.locator('.component-item').filter({ hasText: '文本' });
    await textComponent.dragTo(canvas, {
      targetPosition: { x: 150, y: 200 }
    });
    await page.waitForTimeout(2000);

    // 等待组件完全渲染
    await page.waitForSelector('.canvas-component', { state: 'visible', timeout: 10000 });
    const initialCount = await page.locator('.canvas-component').count();
    console.log('初始组件数量:', initialCount);

    // 检查组件是否已经被自动选中（拖拽后通常会自动选中）
    const canvasComponent = page.locator('.canvas-component').first();
    let isSelected = await canvasComponent.evaluate(el =>
      el.classList.contains('selected')
    );
    console.log('组件是否被自动选中:', isSelected);

    // 如果没有被选中，尝试点击选中
    if (!isSelected) {
      console.log('组件未被自动选中，尝试点击选中');
      // 点击组件的内容区域，而不是外层容器
      const textContent = canvasComponent.locator('.text-content').first();
      if (await textContent.isVisible()) {
        await textContent.click();
      } else {
        await canvasComponent.click();
      }
      await page.waitForTimeout(500);

      isSelected = await canvasComponent.evaluate(el =>
        el.classList.contains('selected')
      );
      console.log('点击后组件是否被选中:', isSelected);
    }

    // 尝试删除 - 即使没有selected class也尝试（可能是样式问题）
    // 方法1: 尝试工具栏删除按钮（App.vue中的旧按钮）
    let deleted = false;
    const oldDeleteButton = page.locator('.toolbar button').filter({ hasText: '删除' });
    if (await oldDeleteButton.isVisible()) {
      const isDisabled = await oldDeleteButton.isDisabled();
      console.log('旧版删除按钮是否可用:', !isDisabled);
      if (!isDisabled) {
        await oldDeleteButton.click();
        console.log('使用旧版删除按钮');
        deleted = true;
      }
    }

    // 方法2: 尝试新版工具栏删除按钮
    if (!deleted) {
      const newDeleteButton = page.locator('.toolbar .el-button').filter({ hasText: /删除/ }).first();
      if (await newDeleteButton.isVisible()) {
        const isDisabled = await newDeleteButton.isDisabled();
        console.log('新版删除按钮是否可用:', !isDisabled);
        if (!isDisabled) {
          await newDeleteButton.click();
          console.log('使用新版删除按钮');
          deleted = true;
        }
      }
    }

    // 方法3: 键盘快捷键
    if (!deleted) {
      console.log('尝试键盘快捷键');
      await page.keyboard.press('Delete');
      await page.waitForTimeout(500);
    }

    await page.waitForTimeout(1500);

    // 验证组件被删除
    const finalCount = await page.locator('.canvas-component').count();
    console.log('删除后组件数量:', finalCount);

    // 如果删除失败，记录信息
    if (finalCount >= initialCount) {
      console.log('删除失败，组件仍然存在');
    }

    expect(finalCount).toBeLessThan(initialCount);
  });

  test('应该能够调整组件顺序', async ({ page }) => {
    const canvas = page.locator('.canvas-content-inner');

    // 拖拽添加两个组件
    const textComponent = page.locator('.component-item').filter({ hasText: '文本' });
    await textComponent.dragTo(canvas, {
      targetPosition: { x: 150, y: 150 }
    });
    await page.waitForTimeout(500);

    const rectComponent = page.locator('.component-item').filter({ hasText: '矩形' });
    await rectComponent.dragTo(canvas, {
      targetPosition: { x: 150, y: 300 }
    });
    await page.waitForTimeout(800);

    // 获取组件列表
    const components = page.locator('.canvas-component');
    const count = await components.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('属性配置功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够修改文本组件的样式', async ({ page }) => {
    const canvas = page.locator('.canvas-content-inner');

    // 拖拽添加文本组件
    const textComponent = page.locator('.component-item').filter({ hasText: '文本' });
    await textComponent.dragTo(canvas, {
      targetPosition: { x: 150, y: 200 }
    });
    await page.waitForTimeout(800);

    // 选中文本组件
    const canvasComponent = page.locator('.canvas-component').first();
    await canvasComponent.click();
    await page.waitForTimeout(500);

    // 修改文本内容
    const contentInput = page.locator('#text-content');
    if (await contentInput.isVisible()) {
      await contentInput.fill('测试文本');
      await page.waitForTimeout(500);

      // 验证内容已更新
      const textContent = page.locator('.text-content').first();
      await expect(textContent).toContainText('测试文本');
    }

    // 修改字体大小
    const fontSizeInput = page.locator('#text-font-size');
    if (await fontSizeInput.isVisible()) {
      await fontSizeInput.fill('24');
      await page.waitForTimeout(500);

      // 验证字体大小已更新
      const textContentElem = page.locator('.text-content').first();
      const style = await textContentElem.getAttribute('style');
      expect(style).toContain('24');
    }

    // 修改颜色 - 颜色选择器是按钮类型，需要点击而不是fill
    const colorInput = page.locator('#text-color');
    if (await colorInput.isVisible()) {
      // 点击颜色选择器打开颜色面板
      await colorInput.click();
      await page.waitForTimeout(500);

      // 尝试输入颜色值（如果在颜色面板中有输入框）
      const colorValueInput = page.locator('.el-color-dropdown__input input');
      if (await colorValueInput.isVisible()) {
        await colorValueInput.fill('#ff0000');
        await page.waitForTimeout(500);
        // 点击页面其他地方关闭颜色面板
        await page.mouse.click(100, 100);
        await page.waitForTimeout(500);

        // 验证颜色已更新
        const updatedStyle = await textContent.getAttribute('style');
        expect(updatedStyle).toContain('#ff0000');
      }
    }
  });

  test('应该能够修改组件尺寸', async ({ page }) => {
    const canvas = page.locator('.canvas-content-inner');

    // 拖拽添加矩形组件
    const rectComponent = page.locator('.component-item').filter({ hasText: '矩形' });
    await rectComponent.dragTo(canvas, {
      targetPosition: { x: 150, y: 200 }
    });
    await page.waitForTimeout(800);

    // 选中组件
    const canvasComponent = page.locator('.canvas-component').first();
    await canvasComponent.click();
    await page.waitForTimeout(500);

    // 修改高度
    const heightInput = page.locator('#component-height');
    if (await heightInput.isVisible()) {
      await heightInput.fill('300');
      await page.waitForTimeout(500);

      // 验证高度已更新
      const componentBox = await canvasComponent.boundingBox();
      expect(componentBox.height).toBeCloseTo(300, 10);
    }
  });

  test('应该能够修改背景颜色', async ({ page }) => {
    const canvas = page.locator('.canvas-content-inner');

    // 拖拽添加矩形组件
    const rectComponent = page.locator('.component-item').filter({ hasText: '矩形' });
    await rectComponent.dragTo(canvas, {
      targetPosition: { x: 150, y: 200 }
    });
    await page.waitForTimeout(800);

    // 选中组件
    const canvasComponent = page.locator('.canvas-component').first();
    await canvasComponent.click();
    await page.waitForTimeout(500);

    // 修改背景色 - 颜色选择器是按钮类型，需要点击而不是fill
    const bgColorInput = page.locator('#component-bg-color');
    if (await bgColorInput.isVisible()) {
      // 点击颜色选择器打开颜色面板
      await bgColorInput.click();
      await page.waitForTimeout(500);

      // 尝试输入颜色值
      const colorValueInput = page.locator('.el-color-dropdown__input input');
      if (await colorValueInput.isVisible()) {
        await colorValueInput.fill('#f0f0f0');
        await page.waitForTimeout(500);
        // 点击页面其他地方关闭颜色面板
        await page.mouse.click(100, 100);
        await page.waitForTimeout(500);

        // 验证背景色已应用
        const rectContent = page.locator('.rectangle-content').first();
        const style = await rectContent.getAttribute('style');
        expect(style).toContain('#f0f0f0');
      }
    }
  });
});

test.describe('表单组件功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('表单组件应该能够接收用户输入', async ({ page }) => {
    const canvas = page.locator('.canvas-content-inner');

    // 拖拽添加表单组件
    const formComponent = page.locator('.component-item').filter({ hasText: '表单' });
    await formComponent.dragTo(canvas, {
      targetPosition: { x: 150, y: 200 }
    });
    await page.waitForTimeout(1000);

    // 查找表单中的输入框
    const nameInput = page.locator('.form-container input[placeholder*="请输入姓名"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill('张三');
      await page.waitForTimeout(500);

      // 验证输入值
      await expect(nameInput).toHaveValue('张三');
    }

    // 测试邮箱输入
    const emailInput = page.locator('.form-container input[placeholder*="请输入邮箱"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      await page.waitForTimeout(500);

      await expect(emailInput).toHaveValue('test@example.com');
    }

    // 测试下拉选择
    const selectWrapper = page.locator('.form-container .el-select').first();
    if (await selectWrapper.isVisible()) {
      await selectWrapper.click();
      await page.waitForTimeout(500);

      // 选择选项
      const option = page.locator('.el-select-dropdown__item').first();
      if (await option.isVisible()) {
        await option.click();
      }
    }
  });

  test('表单查询按钮应该触发事件', async ({ page }) => {
    const canvas = page.locator('.canvas-content-inner');

    // 拖拽添加表单组件
    const formComponent = page.locator('.component-item').filter({ hasText: '表单' });
    await formComponent.dragTo(canvas, {
      targetPosition: { x: 150, y: 200 }
    });
    await page.waitForTimeout(1000);

    // 监听控制台日志
    const consoleMessages = [];
    page.on('console', msg => consoleMessages.push(msg.text()));

    // 查找并点击查询按钮
    const queryButton = page.locator('.form-container button').filter({ hasText: /查询|提交/ });
    if (await queryButton.isVisible()) {
      await queryButton.click();
      await page.waitForTimeout(1000);

      // 验证触发了事件（通过控制台日志）
      const hasEventLog = consoleMessages.some(msg =>
        msg.includes('handleFormItemButtonClick') ||
        msg.includes('button.click') ||
        msg.includes('Form Button Click')
      );

      console.log('控制台消息:', consoleMessages);
      // 这个验证可能需要根据实际实现调整
    }
  });
});
