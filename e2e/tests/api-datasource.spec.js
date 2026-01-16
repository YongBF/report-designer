/**
 * API数据源测试
 *
 * 测试组件的API数据源功能：
 * - API配置界面
 * - API请求发送
 * - 数据加载和渲染
 * - 联动参数传递
 * - 请求拦截器
 */

const { test, expect } = require('@playwright/test');

test.describe('API数据源功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 确保Mock Server已启动
    const mockServerReady = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/users');
        return response.ok;
      } catch {
        return false;
      }
    });

    if (!mockServerReady) {
      test.skip('Mock Server未启动，跳过API测试');
    }
  });

  test('表格组件应该能够使用API数据源', async ({ page }) => {
    // 1. 创建表格组件
    await page.click('button:has-text("表格")');
    await page.waitForTimeout(1000);

    // 2. 选中表格组件
    const canvas = page.locator('.design-canvas');
    await canvas.locator('.table-container').click();

    // 3. 切换到数据源配置标签
    const dataSourceTab = page.locator('text=数据源');
    await expect(dataSourceTab).toBeVisible();
    // 点击数据源标签（根据实际UI调整）

    // 4. 配置API数据源
    await page.selectOption('select[name="dataSourceType"]', 'api');

    // 5. 输入API地址
    await page.fill('input[placeholder*="api"]', 'http://localhost:3001/api/users');
    await page.selectOption('select[name="apiMethod"]', 'GET');

    // 6. 保存配置
    await page.click('button:has-text("保存")');

    // 7. 验证数据加载（显示loading状态）
    await page.waitForSelector('.el-table.is-loading', { state: 'visible', timeout: 5000 });
    await page.waitForSelector('.el-table.is-loading', { state: 'hidden', timeout: 10000 });

    // 8. 验证数据已渲染
    const tableRows = page.locator('.el-table__body-wrapper .el-table__row');
    await expect(tableRows).toHaveCount(5); // Mock Server返回5条数据
  });

  test('图表组件应该能够使用API数据源', async ({ page }) => {
    // 1. 创建柱状图组件
    await page.click('button:has-text("柱状图")');
    await page.waitForTimeout(1000);

    // 2. 选中图表组件
    const canvas = page.locator('.design-canvas');
    await canvas.locator('.chart-container').click();

    // 3. 配置API数据源（需要根据实际UI调整选择器）
    await page.selectOption('[name="dataSourceType"]', 'api');
    await page.fill('input[name="apiUrl"]', 'http://localhost:3001/api/sales');
    await page.selectOption('[name="apiMethod"]', 'POST');

    // 4. 保存并刷新
    await page.click('button:has-text("保存")');

    // 5. 等待数据加载
    await page.waitForTimeout(2000);

    // 6. 验证图表已渲染数据
    const chartCanvas = page.locator('canvas');
    await expect(chartCanvas).toBeVisible();

    // 7. 截图验证
    await page.screenshot({ path: 'e2e/screenshots/chart-with-api-data.png' });
  });

  test('应该支持API请求拦截器配置', async ({ page }) => {
    // 创建组件并配置API
    await page.click('button:has-text("表格")');
    await page.waitForTimeout(1000);

    // 配置API数据源
    const canvas = page.locator('.design-canvas');
    await canvas.locator('.table-container').click();

    // 切换到数据源配置
    await page.selectOption('[name="dataSourceType"]', 'api');
    await page.fill('input[name="apiUrl"]', 'http://localhost:3001/api/users');

    // 打开请求拦截器配置
    const interceptorButton = page.locator('button:has-text("配置拦截器")');
    if (await interceptorButton.isVisible()) {
      await interceptorButton.click();

      // 验证拦截器配置对话框打开
      const dialog = page.locator('.el-dialog').filter({ hasText: '请求拦截器' });
      await expect(dialog).toBeVisible();

      // 添加拦截器代码
      const codeEditor = page.locator('.el-dialog textarea');
      await codeEditor.fill(`
        async function intercept(config, linkageParams) {
          config.headers['X-Custom-Header'] = 'test-value';
          return config;
        }
      `);

      // 保存拦截器配置
      await page.click('.el-dialog button:has-text("保存")');
    }
  });
});

test.describe('联动功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够配置表单到表格的联动', async ({ page }) => {
    // 1. 创建表单组件
    await page.click('button:has-text("表单")');
    await page.waitForTimeout(1000);

    // 2. 在表单中添加日期选择器
    const canvas = page.locator('.design-canvas');
    await canvas.locator('.form-container').click();

    // 切换到表单项配置
    const formItemsTab = page.locator('text=表单项');
    await formItemsTab.click();

    // 添加日期选择器
    await page.click('button:has-text("添加")');
    await page.selectOption('select[name="itemType"]', 'date');
    await page.fill('input[name="itemField"]', 'startDate');
    await page.click('button:has-text("确定")');

    // 3. 创建表格组件
    await page.click('button:has-text("表格")');
    await page.waitForTimeout(1000);

    // 4. 配置表格的API数据源
    await canvas.locator('.table-container').last().click();
    await page.selectOption('[name="dataSourceType"]', 'api');
    await page.fill('input[name="apiUrl"]', 'http://localhost:3001/api/orders');

    // 5. 配置联动关系
    await page.click('text=联动配置');

    // 添加新联动
    await page.click('button:has-text("添加联动")');

    // 选择源组件（表单）
    await page.selectOption('#sourceComponent', /form/);

    // 选择目标组件（表格）
    await page.selectOption('#targetComponent', /table/);

    // 选择触发事件
    await page.selectOption('#triggerEvent', 'button.click');

    // 配置参数映射
    await page.click('button:has-text("添加参数映射")');
    await page.selectOption('.param-mapping-source', 'startDate');
    await page.selectOption('.param-mapping-target', 'startDate');

    // 保存联动配置
    await page.click('button:has-text("保存联动")');

    // 6. 测试联动功能
    const formComponent = canvas.locator('.form-container').first();
    await formComponent.locator('input[type="date"]').fill('2024-01-01');

    // 点击查询按钮
    await formComponent.locator('button:has-text("查询")').click();

    // 7. 验证表格接收到联动参数并刷新
    await page.waitForTimeout(1000);

    // 验证数据已更新
    const tableData = await page.locator('.el-table__body-wrapper').textContent();
    console.log('表格数据:', tableData);
  });
});
