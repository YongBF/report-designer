/**
 * 复杂场景测试 - 模拟真实用户操作
 *
 * 测试真实用户使用场景，包括：
 * - 创建多组件报表
 * - 配置组件属性
 * - 数据源配置
 * - 样式调整
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

    // 等待属性面板显示
    await page.waitForTimeout(500);

    // 在属性面板中找到文本内容输入框
    const textContentInput = page.locator('#text-content');
    await expect(textContentInput).toBeVisible({ timeout: 5000 });
    await textContentInput.fill('2024年度销售数据报表');

    // 修改字体大小
    const fontSizeInput = page.locator('#text-font-size');
    await fontSizeInput.fill('24');

    // 修改颜色
    const colorPicker = page.locator('#text-color');
    await colorPicker.click();
    await page.waitForTimeout(500);

    // ========== 步骤2: 添加表格组件 ==========
    const tableComponent = page.locator('.component-item').filter({ hasText: '表格' });
    await tableComponent.dragTo(canvas, { targetPosition: { x: 400, y: 250 } });
    await page.waitForTimeout(1000);

    // 选中新添加的表格组件
    const tableComponents = page.locator('.canvas-component');
    const tableComponent2 = tableComponents.nth(1);
    await tableComponent2.click();
    await page.waitForTimeout(500);

    // ========== 步骤3: 添加柱状图 ==========
    const barChartComponent = page.locator('.component-item').filter({ hasText: '柱状图' });
    await barChartComponent.dragTo(canvas, { targetPosition: { x: 400, y: 500 } });
    await page.waitForTimeout(1500);

    // 验证图表已渲染
    const chartContainer = page.locator('.chart-container').first();
    await expect(chartContainer).toBeVisible();

    // ========== 步骤4: 验证整体布局 ==========
    const allComponents = await page.locator('.canvas-component').count();
    expect(allComponents).toBe(3);

    // 验证文本内容已更新
    const textElement = page.locator('.text-content').first();
    await expect(textElement).toContainText('2024年度销售数据报表');

    // ========== 步骤5: 组件排序调整 ==========
    // 选中表格组件进行拖拽移动
    const tableToMove = page.locator('.canvas-component').nth(1);
    await tableToMove.click();

    const dragHandle = page.locator('.drag-handle').first();
    await expect(dragHandle).toBeVisible();

    // 验证工具栏功能
    const saveButton = page.locator('.toolbar button').filter({ hasText: '保存' });
    await expect(saveButton).toBeEnabled();
  });

  test('调整组件宽度和顺序', async ({ page }) => {
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

    // 选中第二个组件（表格）并修改宽度
    const tableComponent = page.locator('.canvas-component').nth(1);
    await tableComponent.click();
    await page.waitForTimeout(500);

    // 修改宽度为50%
    const widthSelect = page.locator('#component-width');
    await expect(widthSelect).toBeVisible();
    await widthSelect.selectOption('50');

    // 验证宽度变化
    await page.waitForTimeout(500);
    await expect(tableComponent).toHaveClass(/width-50/);

    // 修改高度
    const heightInput = page.locator('#component-height');
    await heightInput.fill('400');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // 验证所有组件都正常显示
    const allComponents = page.locator('.canvas-component');
    await expect(allComponents).toHaveCount(3);
  });
});

test.describe('场景2: 表单设计与配置', () => {
  test('创建完整的查询表单', async ({ page }) => {
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

    // ========== 步骤2: 配置表单布局 ==========
    // 修改表单列为2列
    const columnsRadio = page.locator('#form-columns');
    await expect(columnsRadio).toBeVisible();
    await page.locator('#form-columns[value="2"]').click();

    // 修改标签位置
    const labelPositionRadio = page.locator('#form-label-position');
    await page.locator('#form-label-position[value="right"]').click();

    // 修改标签宽度
    const labelWidthInput = page.locator('#form-label-width');
    await labelWidthInput.fill('100');
    await page.keyboard.press('Enter');

    // ========== 步骤3: 添加表单项 ==========
    // 找到表单项配置区域
    const formCollapse = page.locator('.el-collapse-item').filter({ hasText: /表单项/ });

    // 展开"表单项"折叠面板
    const formItemHeader = formCollapse.locator('.el-collapse-item__header');
    await formItemHeader.click();
    await page.waitForTimeout(500);

    // 选择新表单项类型为"文本输入"
    const itemTypeSelect = page.locator('.right-panel select').first();
    await itemTypeSelect.selectOption('text');

    // 点击添加按钮
    const addButton = page.locator('.right-panel button').filter({ hasText: '添加' });
    await addButton.click();
    await page.waitForTimeout(500);

    // ========== 步骤4: 添加查询按钮 ==========
    await itemTypeSelect.selectOption('button');
    await addButton.click();
    await page.waitForTimeout(500);

    // ========== 步骤5: 验证表单渲染 ==========
    const formContainer = page.locator('.form-container').first();
    await expect(formContainer).toBeVisible();

    // 验证表单中有输入框和按钮
    const inputFields = formContainer.locator('input[type="text"]');
    const formButton = formContainer.locator('button').filter({ hasText: /查询|button/i });

    await expect(inputFields.count()).resolves.toBeGreaterThan(0);
    await expect(formButton).toBeVisible();

    // ========== 步骤6: 添加联动组件 ==========
    // 添加表格用于显示查询结果
    const tableComponent = page.locator('.component-item').filter({ hasText: '表格' });
    await tableComponent.dragTo(canvas, { targetPosition: { x: 400, y: 500 } });
    await page.waitForTimeout(1000);

    // 验证两个组件都存在
    await expect(page.locator('.canvas-component')).toHaveCount(2);
  });
});

test.describe('场景3: 图表数据配置', () => {
  test('配置柱状图数据', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // ========== 步骤1: 添加柱状图 ==========
    const barChartComponent = page.locator('.component-item').filter({ hasText: '柱状图' });
    await barChartComponent.dragTo(canvas, { targetPosition: { x: 400, y: 300 } });
    await page.waitForTimeout(1500);

    // 选中的柱状图
    const chartComponent = page.locator('.canvas-component').first();
    await chartComponent.click();
    await page.waitForTimeout(500);

    // ========== 步骤2: 打开图表数据编辑器 ==========
    // 查找图表相关的配置面板
    const chartConfig = page.locator('.right-panel').filter({ hasText: /柱状图属性/ });

    // 查找编辑数据按钮（可能的位置）
    const editDataButton = page.locator('.right-panel button').filter({ hasText: /编辑数据|配置数据/ }).first();

    if (await editDataButton.isVisible()) {
      await editDataButton.click();
      await page.waitForTimeout(500);
    }

    // ========== 步骤3: 验证图表初始化 ==========
    const chartContainer = page.locator('.chart-container').first();
    await expect(chartContainer).toBeVisible();

    // 验证ECharts实例
    const hasChart = await page.evaluate(() => {
      const canvas = document.querySelector('.chart-container canvas');
      return canvas !== null;
    });

    expect(hasChart).toBe(true);

    // ========== 步骤4: 测试图表响应式 ==========
    // 修改图表组件尺寸
    const heightInput = page.locator('#component-height');
    await heightInput.fill('500');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // 验证图表仍然存在
    await expect(chartContainer).toBeVisible();
  });

  test('添加多个图表并排列', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // ========== 步骤1: 添加多个图表 ==========
    const chartTypes = ['柱状图', '折线图', '饼图'];

    for (let i = 0; i < chartTypes.length; i++) {
      const chart = page.locator('.component-item').filter({ hasText: chartTypes[i] });
      await chart.dragTo(canvas, { targetPosition: { x: 400, y: 150 + i * 250 } });
      await page.waitForTimeout(1500);
    }

    // ========== 步骤2: 修改每个图表的宽度为50%以形成两列布局 ==========
    const components = page.locator('.canvas-component');
    const count = await components.count();

    for (let i = 0; i < count; i++) {
      const comp = components.nth(i);
      await comp.click();
      await page.waitForTimeout(300);

      const widthSelect = page.locator('#component-width');
      await widthSelect.selectOption('50');
      await page.waitForTimeout(300);
    }

    // ========== 步骤3: 验证所有图表都正常渲染 ==========
    const chartContainers = page.locator('.chart-container');
    await expect(chartContainers).toHaveCount(3);

    // 验证每个图表都有canvas元素
    for (let i = 0; i < 3; i++) {
      const canvas = chartContainers.nth(i);
      await expect(canvas).toBeVisible();

      const hasCanvas = await canvas.locator('canvas').count();
      expect(hasCanvas).toBeGreaterThan(0);
    }
  });
});

test.describe('场景4: 表格列配置', () => {
  test('配置表格列和数据', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // ========== 步骤1: 添加表格 ==========
    const tableComponent = page.locator('.component-item').filter({ hasText: '表格' });
    await tableComponent.dragTo(canvas, { targetPosition: { x: 400, y: 250 } });
    await page.waitForTimeout(1000);

    // 选中表格
    const table = page.locator('.canvas-component').first();
    await table.click();
    await page.waitForTimeout(500);

    // ========== 步骤2: 展开"列配置"折叠面板 ==========
    const columnsCollapse = page.locator('.el-collapse-item').filter({ hasText: /列配置/ });
    const columnsHeader = columnsCollapse.locator('.el-collapse-item__header');
    await columnsHeader.click();
    await page.waitForTimeout(500);

    // ========== 步骤3: 添加新列 ==========
    const addColumnButton = page.locator('.right-panel button').filter({ hasText: '添加列' });
    await expect(addColumnButton).toBeVisible();
    await addColumnButton.click();
    await page.waitForTimeout(500);

    // 验证表格中有列配置
    const columnTable = page.locator('.right-panel .el-table').filter({ hasText: /列名/ });
    await expect(columnTable).toBeVisible();

    // ========== 步骤4: 配置表格样式 ==========
    // 展开"基础设置"
    const basicCollapse = page.locator('.el-collapse-item').filter({ hasText: /基础设置/ });
    const basicHeader = basicCollapse.locator('.el-collapse-item__header');
    await basicHeader.click();
    await page.waitForTimeout(300);

    // 启用斑马纹
    const stripeSwitch = page.locator('#table-stripe');
    await stripeSwitch.click();
    await page.waitForTimeout(300);

    // 启用边框
    const borderSwitch = page.locator('#table-border');
    await borderSwitch.click();
    await page.waitForTimeout(300);

    // ========== 步骤5: 验证表格渲染 ==========
    const tableContainer = page.locator('.table-container').first();
    await expect(tableContainer).toBeVisible();

    // 验证表格有数据行
    const tableRows = tableContainer.locator('.el-table__body-wrapper .el-table__row');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });
});

test.describe('场景5: 工具栏操作', () => {
  test('撤销和重做操作', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // ========== 步骤1: 添加多个组件 ==========
    const components = ['文本', '表格', '矩形'];
    for (const compName of components) {
      const comp = page.locator('.component-item').filter({ hasText: compName });
      await comp.dragTo(canvas, { targetPosition: { x: 400, y: 200 } });
      await page.waitForTimeout(800);
    }

    const finalCount = await page.locator('.canvas-component').count();
    expect(finalCount).toBe(3);

    // ========== 步骤2: 测试撤销 ==========
    const undoButton = page.locator('.toolbar button').filter({ hasText: '撤销' });

    // 第一次撤销
    await undoButton.click();
    await page.waitForTimeout(500);
    let count = await page.locator('.canvas-component').count();
    expect(count).toBe(2);

    // 第二次撤销
    await undoButton.click();
    await page.waitForTimeout(500);
    count = await page.locator('.canvas-component').count();
    expect(count).toBe(1);

    // ========== 步骤3: 测试重做 ==========
    const redoButton = page.locator('.toolbar button').filter({ hasText: '重做' });

    await redoButton.click();
    await page.waitForTimeout(500);
    count = await page.locator('.canvas-component').count();
    expect(count).toBe(2);

    // ========== 步骤4: 测试新建 ==========
    const newButton = page.locator('.toolbar button').filter({ hasText: '新建' });
    await newButton.click();
    await page.waitForTimeout(500);

    // 验证画布被清空
    count = await page.locator('.canvas-component').count();
    expect(count).toBe(0);
  });

  test('预览模式', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // 添加一个组件
    const textComponent = page.locator('.component-item').filter({ hasText: '文本' });
    await textComponent.dragTo(canvas, { targetPosition: { x: 400, y: 200 } });
    await page.waitForTimeout(1000);

    // ========== 步骤1: 点击预览按钮 ==========
    const previewButton = page.locator('.toolbar button').filter({ hasText: '预览' });
    await previewButton.click();
    await page.waitForTimeout(1000);

    // ========== 步骤2: 验证预览模式 ==========
    // 在预览模式下，应该看不到编辑相关元素
    const leftPanel = page.locator('.left-panel');
    const rightPanel = page.locator('.right-panel');
    const toolbar = page.locator('.toolbar');

    // 检查面板是否隐藏（预览模式下应该隐藏或改变）
    const isPreviewMode = await page.evaluate(() => {
      return document.body.classList.contains('preview-mode') ||
             !document.querySelector('.left-panel')?.offsetParent;
    });

    // ========== 步骤3: 退出预览 ==========
    // 按 ESC 或点击返回按钮
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // 验证回到编辑模式
    await expect(leftPanel).toBeVisible();
  });
});

test.describe('场景6: 复杂布局设计', () => {
  test('创建仪表板布局', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // ========== 步骤1: 创建标题行 ==========
    const textComponent = page.locator('.component-item').filter({ hasText: '文本' });
    await textComponent.dragTo(canvas, { targetPosition: { x: 400, y: 80 } });
    await page.waitForTimeout(1000);

    // 选中文本并设置为全宽
    const titleComp = page.locator('.canvas-component').first();
    await titleComp.click();
    await page.waitForTimeout(300);

    const widthSelect = page.locator('#component-width');
    await widthSelect.selectOption('100');

    // ========== 步骤2: 创建第一行两个图表 ==========
    const charts = ['柱状图', '折线图'];
    for (let i = 0; i < charts.length; i++) {
      const chart = page.locator('.component-item').filter({ hasText: charts[i] });
      await chart.dragTo(canvas, { targetPosition: { x: 250 + i * 300, y: 250 } });
      await page.waitForTimeout(1500);

      // 设置为50%宽度
      const comp = page.locator('.canvas-component').nth(i + 1);
      await comp.click();
      await page.waitForTimeout(300);
      await widthSelect.selectOption('50');
    }

    // ========== 步骤3: 创建第二行表格 ==========
    const tableComponent = page.locator('.component-item').filter({ hasText: '表格' });
    await tableComponent.dragTo(canvas, { targetPosition: { x: 400, y: 500 } });
    await page.waitForTimeout(1000);

    const tableComp = page.locator('.canvas-component').last();
    await tableComp.click();
    await page.waitForTimeout(300);
    await widthSelect.selectOption('100');

    // ========== 步骤4: 验证布局 ==========
    const allComponents = page.locator('.canvas-component');
    await expect(allComponents).toHaveCount(4);

    // 验证宽度类
    await expect(titleComp).toHaveClass(/width-100/);

    const chart1 = page.locator('.canvas-component').nth(1);
    const chart2 = page.locator('.canvas-component').nth(2);
    await expect(chart1).toHaveClass(/width-50/);
    await expect(chart2).toHaveClass(/width-50/);
    await expect(tableComp).toHaveClass(/width-100/);

    // ========== 步骤5: 截图保存 ==========
    await page.screenshot({
      path: 'e2e/screenshots/dashboard-layout.png',
      fullPage: false
    });
  });
});

test.describe('场景7: 表单与表格联动', () => {
  test('创建查询表单并联动数据表格', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // ========== 步骤1: 添加表单 ==========
    const formComponent = page.locator('.component-item').filter({ hasText: '表单' });
    await formComponent.dragTo(canvas, { targetPosition: { x: 400, y: 150 } });
    await page.waitForTimeout(1000);

    // 选中表单
    const form = page.locator('.canvas-component').first();
    await form.click();
    await page.waitForTimeout(500);

    // ========== 步骤2: 添加查询按钮 ==========
    const formCollapse = page.locator('.el-collapse-item').filter({ hasText: /表单项/ });
    const formItemHeader = formCollapse.locator('.el-collapse-item__header');
    await formItemHeader.click();
    await page.waitForTimeout(500);

    const itemTypeSelect = page.locator('.right-panel select').first();
    await itemTypeSelect.selectOption('button');

    const addButton = page.locator('.right-panel button').filter({ hasText: '添加' });
    await addButton.click();
    await page.waitForTimeout(500);

    // ========== 步骤3: 添加数据表格 ==========
    const tableComponent = page.locator('.component-item').filter({ hasText: '表格' });
    await tableComponent.dragTo(canvas, { targetPosition: { x: 400, y: 450 } });
    await page.waitForTimeout(1000);

    // ========== 步骤4: 配置表格数据源为API ==========
    const tableComp = page.locator('.canvas-component').last();
    await tableComp.click();
    await page.waitForTimeout(500);

    // 展开数据源配置
    const dataSourceCollapse = page.locator('.el-collapse-item').filter({ hasText: /数据源/ });
    const dataSourceHeader = dataSourceCollapse.locator('.el-collapse-item__header');
    await dataSourceHeader.click();
    await page.waitForTimeout(500);

    // 选择API数据源
    const dataSourceRadio = page.locator('#table-datasource-type');
    await page.locator('#table-datasource-type[value="api"]').click();
    await page.waitForTimeout(500);

    // 输入API地址
    const apiUrlInput = page.locator('#table-api-url');
    await expect(apiUrlInput).toBeVisible();
    await apiUrlInput.fill('http://localhost:3001/api/users');

    // 选择请求方法
    const apiMethodSelect = page.locator('#table-api-method');
    await apiMethodSelect.selectOption('GET');

    // ========== 步骤5: 验证配置 ==========
    // 验证API地址已保存
    const apiUrlValue = await apiUrlInput.inputValue();
    expect(apiUrlValue).toBe('http://localhost:3001/api/users');

    // 验证两个组件都存在
    await expect(page.locator('.canvas-component')).toHaveCount(2);

    // 验证表单中有按钮
    const formButton = page.locator('.form-container button');
    await expect(formButton).toBeVisible();
  });
});

test.describe('场景8: 组件删除和清理', () => {
  test('批量操作和管理组件', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // ========== 步骤1: 添加多个组件 ==========
    const components = ['文本', '图片', '表格', '柱状图', '矩形', '表单'];

    for (const compName of components) {
      const comp = page.locator('.component-item').filter({ hasText: compName });
      await comp.dragTo(canvas, { targetPosition: { x: 400, y: 150 } });
      await page.waitForTimeout(800);
    }

    // 验证所有组件都添加成功
    let count = await page.locator('.canvas-component').count();
    expect(count).toBe(6);

    // ========== 步骤2: 逐个删除组件 ==========
    for (let i = 0; i < 3; i++) {
      const firstComp = page.locator('.canvas-component').first();
      await firstComp.click();
      await page.waitForTimeout(300);

      const deleteButton = page.locator('.right-panel button').filter({ hasText: '删除组件' });
      await deleteButton.click();
      await page.waitForTimeout(500);
    }

    // 验证剩余组件数量
    count = await page.locator('.canvas-component').count();
    expect(count).toBe(3);

    // ========== 步骤3: 使用新建清空画布 ==========
    const newButton = page.locator('.toolbar button').filter({ hasText: '新建' });
    await newButton.click();
    await page.waitForTimeout(500);

    // 验证画布已清空
    count = await page.locator('.canvas-component').count();
    expect(count).toBe(0);

    // ========== 步骤4: 验证属性面板显示空状态 ==========
    const rightPanel = page.locator('.right-panel');
    await expect(rightPanel).toContainText('请选择一个组件');
  });
});

test.describe('场景9: 样式定制', () => {
  test('自定义组件样式', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    // ========== 步骤1: 添加文本组件 ==========
    const textComponent = page.locator('.component-item').filter({ hasText: '文本' });
    await textComponent.dragTo(canvas, { targetPosition: { x: 400, y: 200 } });
    await page.waitForTimeout(1000);

    const comp = page.locator('.canvas-component').first();
    await comp.click();
    await page.waitForTimeout(500);

    // ========== 步骤2: 修改多种样式属性 ==========
    // 修改内容
    const contentInput = page.locator('#text-content');
    await contentInput.fill('自定义标题文本');

    // 修改字号
    const fontSizeInput = page.locator('#text-font-size');
    await fontSizeInput.fill('32');

    // 修改颜色
    const colorPicker = page.locator('#text-color');
    await colorPicker.click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');

    // ========== 步骤3: 添加矩形并修改样式 ==========
    const rectComponent = page.locator('.component-item').filter({ hasText: '矩形' });
    await rectComponent.dragTo(canvas, { targetPosition: { x: 400, y: 350 } });
    await page.waitForTimeout(1000);

    const rect = page.locator('.canvas-component').last();
    await rect.click();
    await page.waitForTimeout(500);

    // 修改高度
    const heightInput = page.locator('#component-height');
    await heightInput.fill('200');

    // 修改宽度
    const widthSelect = page.locator('#component-width');
    await widthSelect.selectOption('100');

    // ========== 步骤4: 验证样式应用 ==========
    const textElement = page.locator('.text-content').first();
    await expect(textElement).toContainText('自定义标题文本');

    const rectElement = page.locator('.rectangle-content').first();
    await expect(rectElement).toBeVisible();

    // 截图对比
    await page.screenshot({
      path: 'e2e/screenshots/custom-styles.png'
    });
  });
});

test.describe('场景10: 性能压力测试', () => {
  test('大量组件性能测试', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('.canvas-content-inner');

    const startTime = Date.now();

    // ========== 步骤1: 添加10个组件 ==========
    const componentTypes = ['文本', '表格', '柱状图', '折线图', '饼图', '矩形', '表单', '文本', '图片', '线条'];

    for (let i = 0; i < componentTypes.length; i++) {
      const comp = page.locator('.component-item').filter({ hasText: componentTypes[i] });
      await comp.dragTo(canvas, {
        targetPosition: { x: 300 + (i % 3) * 250, y: 100 + Math.floor(i / 3) * 250 }
      });

      // 图表需要更长时间渲染
      const waitTime = componentTypes[i].includes('图') ? 1500 : 500;
      await page.waitForTimeout(waitTime);
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(`添加10个组件总耗时: ${totalTime}ms`);

    // ========== 步骤2: 验证所有组件 ==========
    const count = await page.locator('.canvas-component').count();
    expect(count).toBe(10);

    // ========== 步骤3: 验证页面响应性 ==========
    const responseStart = Date.now();

    // 点击第一个组件
    const firstComp = page.locator('.canvas-component').first();
    await firstComp.click();
    await page.waitForTimeout(500);

    const responseTime = Date.now() - responseStart;
    console.log(`组件选择响应时间: ${responseTime}ms`);

    // 验证属性面板更新
    const rightPanel = page.locator('.right-panel');
    await expect(rightPanel).toContainText('组件类型');

    // 性能基准：添加10个组件应该在30秒内完成
    expect(totalTime).toBeLessThan(30000);

    // 响应时间应该在2秒内
    expect(responseTime).toBeLessThan(2000);
  });
});
