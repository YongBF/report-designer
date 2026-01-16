# 🧪 Report Designer E2E 自动化测试

完整的端到端自动化测试系统，用于验证Report Designer的所有核心功能。

## 📋 测试覆盖范围

### 1️⃣ 组件创建和渲染测试 (`components.spec.js`)
- ✅ 文本组件创建
- ✅ 图片组件创建
- ✅ 表格组件创建
- ✅ 图表组件创建（柱状图、折线图、饼图、散点图、仪表盘、漏斗图）
- ✅ 矩形和线条组件创建
- ✅ 表单组件创建
- ✅ 组件渲染验证

### 2️⃣ API数据源功能测试 (`api-datasource.spec.js`)
- ✅ 表格组件API数据源配置
- ✅ 图表组件API数据源配置
- ✅ API请求发送和数据加载
- ✅ Loading状态显示
- ✅ 请求拦截器配置
- ✅ 联动功能配置
- ✅ 参数映射和传递

### 3️⃣ UI交互功能测试 (`ui-interaction.spec.js`)
- ✅ 页面加载和导航
- ✅ 组件选择和编辑
- ✅ 属性面板配置
- ✅ 样式修改（字体、颜色、尺寸）
- ✅ 组件删除
- ✅ 表单输入验证

### 4️⃣ 环境和性能测试 (`setup.spec.js`)
- ✅ 开发服务器连接
- ✅ 控制台错误检查
- ✅ Mock Server可用性验证
- ✅ 页面加载性能
- ✅ 组件创建响应时间

## 🚀 快速开始

### 前置条件

1. **启动开发服务器**
```bash
cd report-designer
npm run dev
```

2. **启动Mock Server**（用于API测试）
```bash
cd mock-server
npm start
```

### 安装测试依赖

```bash
cd e2e
npm install
```

安装Playwright浏览器：
```bash
npx playwright install chromium
```

### 运行测试

**运行所有测试（无头模式）**：
```bash
npm test
```

**运行测试（有头模式，可以看到浏览器）**：
```bash
npm run test:headed
```

**运行测试并生成HTML报告**：
```bash
npm run test:report
```

**调试特定测试**：
```bash
npm run test:debug
```

## 📊 测试报告

测试完成后，会自动生成HTML报告：

```bash
open reports/html-report/index.html
```

报告包含：
- 测试执行摘要
- 每个测试的详细信息
- 失败测试的截图
- 视频回放（失败的测试）
- 性能统计

## 📁 项目结构

```
e2e/
├── tests/                      # 测试用例
│   ├── setup.spec.js          # 环境准备和性能测试
│   ├── components.spec.js     # 组件创建和渲染测试
│   ├── api-datasource.spec.js # API数据源测试
│   └── ui-interaction.spec.js  # UI交互测试
├── reports/                    # 测试报告
│   ├── html-report/           # HTML报告
│   ├── results.json           # JSON结果
│   └── results.xml           # JUnit格式结果
├── playwright.config.js        # Playwright配置
├── package.json               # 项目配置
└── README.md                  # 本文件
```

## 🧪 测试用例详解

### 组件创建测试

**目的**：验证所有组件类型的创建和渲染功能

**测试步骤**：
1. 访问应用首页
2. 点击组件工具栏按钮
3. 等待组件在画布中渲染
4. 验证组件的DOM元素
5. 对于图表组件，验证ECharts实例

**验证点**：
- 组件出现在画布中
- 组件具有正确的CSS类
- 图表组件的ECharts实例已创建
- 表格组件的表格元素已渲染

### API数据源测试

**目的**：验证组件使用API数据源的功能

**前置条件**：
- Mock Server必须启动在 `http://localhost:3001`

**测试步骤**：
1. 创建组件（表格/图表）
2. 选中组件，打开属性面板
3. 配置API数据源
4. 输入API地址和请求方法
5. 保存配置
6. 验证数据加载和渲染

**验证点**：
- Loading状态正确显示
- 数据成功加载
- 组件正确渲染API数据
- 表格显示正确的行数
- 图表显示正确的数据点

### 联动功能测试

**目的**：验证组件间的联动配置和执行

**测试步骤**：
1. 创建表单组件
2. 添加输入字段
3. 创建目标组件（表格/图表）
4. 配置联动关系
5. 配置参数映射
6. 触发联动（点击查询按钮）
7. 验证目标组件接收到参数

**验证点**：
- 联动配置保存成功
- 参数正确传递
- 目标组件接收到联动参数
- 目标组件触发API请求
- 数据正确刷新

### UI交互测试

**目的**：验证用户交互和配置功能

**测试内容**：
- 组件选择和取消选择
- 属性面板配置
- 样式修改（字体、颜色、尺寸）
- 组件删除
- 表单输入

**验证点**：
- 选中的组件有视觉反馈
- 属性配置实时生效
- 组件正确删除
- 表单输入正确接收

## ⚙️ 配置说明

### Playwright配置

```javascript
// playwright.config.js
{
  baseURL: 'http://localhost:5173',  // 开发服务器地址
  timeout: 10000,                      // 操作超时时间
  screenshot: 'only-on-failure',       // 失败时截图
  video: 'retain-on-failure'           // 失败时录制视频
}
```

### 测试超时设置

- **操作超时**: 10秒
- **导航超时**: 30秒
- **组件加载超时**: 5秒

## 🐛 调试测试

### 查看详细日志

```bash
DEBUG=pw:api npm test
```

### 调试特定测试

```bash
npx playwright test --debug
```

这会：
1. 打开浏览器窗口
2. 慢速执行测试
3. 可以单步执行
4. 查看每一步的状态

### 只运行特定测试

```bash
# 只运行组件测试
npx playwright test components.spec.js

# 只运行特定测试用例
npx playwright test --grep "表格组件"
```

## 📈 性能基准

根据性能测试，预期的性能指标：

| 操作 | 预期时间 |
|------|---------|
| 页面初始加载 | < 5秒 |
| 组件创建 | < 1秒 |
| API数据加载 | < 2秒 |
| 属性配置更新 | < 500ms |
| 样式修改响应 | < 300ms |

## 🎯 测试最佳实践

### 1. 编写可维护的测试

- 使用描述性的测试名称
- 遵循AAA模式（Arrange, Act, Assert）
- 添加详细的注释
- 提取可复用的操作为函数

### 2. 选择器最佳实践

- 优先使用data-testid属性
- 避免使用过于具体的选择器
- 使用语义化的选择器

### 3. 等待策略

```javascript
// 等待元素可见
await expect(element).toBeVisible();

// 等待网络空闲
await page.waitForLoadState('networkidle');

// 等待特定条件
await page.waitForSelector('.component');
```

## 🔧 故障排查

### 问题1: "找不到元素"

**可能原因**：
- 选择器不正确
- 元素尚未渲染
- 页面结构已变化

**解决方法**：
- 使用Playwright Inspector检查选择器
- 添加等待时间
- 使用更宽松的选择器

### 问题2: "测试超时"

**可能原因**：
- 网络请求慢
- 组件渲染慢
- Mock Server未启动

**解决方法**：
- 增加超时时间
- 确保Mock Server已启动
- 检查网络请求

### 问题3: "Mock Server未启动"

**解决方法**：
```bash
# 在另一个终端启动Mock Server
cd mock-server
npm start
```

## 📝 扩展测试

### 添加新测试

1. 在`tests/`目录创建新的测试文件
2. 使用Playwright API编写测试
3. 运行测试验证

### 测试模板

```javascript
const { test, expect } = require('@playwright/test');

test.describe('功能模块', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('应该能够执行某个操作', async ({ page }) => {
    // Arrange (准备)
    const button = page.locator('button');

    // Act (执行)
    await button.click();

    // Assert (断言)
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

## 📚 参考资源

- [Playwright文档](https://playwright.dev/)
- [最佳实践指南](https://playwright.dev/docs/best-practices)
- [选择器最佳实践](https://playwright.dev/docs/selectors)

## 🎓 学习路径

1. **基础测试**: 从setup.spec.js开始
2. **组件测试**: 学习components.spec.js
3. **交互测试**: 练习ui-interaction.spec.js
4. **API测试**: 掌握api-datasource.spec.js
5. **扩展测试**: 添加自己的测试用例

## 🔄 CI/CD 集成

可以将测试集成到CI/CD流程中：

```yaml
# GitHub Actions示例
- name: Install dependencies
  run: npm ci

- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:report

- name: Upload test report
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: e2e/reports/html-report/
```

---

**现在就开始运行测试，验证Report Designer的功能是否正常工作！** 🚀
