/**
 * E2E 自动化测试脚本
 *
 * 使用 Puppeteer 自动化测试 Mock Server 和 Report Designer 的集成
 * 功能：
 * - 自动启动 Mock Server
 * - 自动打开浏览器访问管理界面
 * - 自动测试所有 API 接口
 * - 自动生成测试报告
 * - 截图保存测试过程
 *
 * 运行方式：npm run test:e2e
 */

const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  MOCK_SERVER_PORT: 3001,
  MOCK_SERVER_URL: 'http://localhost:3001',
  REPORTER_URL: 'http://localhost:5173',
  SCREENSHOT_DIR: path.join(__dirname, '../screenshots'),
  TEST_REPORT: path.join(__dirname, '../test-report.html'),
  HEADLESS: false, // 设为false可以看到浏览器操作
  SLOW_MO: 50 // 减慢操作速度，便于观察
};

// 测试用例
const testCases = [
  {
    name: '用户列表接口',
    method: 'GET',
    path: '/api/users',
    expectedStatus: 200,
    expectedFields: ['success', 'data']
  },
  {
    name: '订单列表接口',
    method: 'POST',
    path: '/api/orders',
    body: { status: 'completed' },
    expectedStatus: 200,
    expectedFields: ['success', 'data']
  },
  {
    name: '销售数据接口',
    method: 'POST',
    path: '/api/sales',
    body: { startDate: '2024-01-01', endDate: '2024-12-31' },
    expectedStatus: 200,
    expectedFields: ['success', 'data', 'params']
  },
  {
    name: '用户分布接口',
    method: 'GET',
    path: '/api/user-distribution',
    expectedStatus: 200,
    expectedFields: ['success', 'data']
  },
  {
    name: 'CPU使用率接口',
    method: 'GET',
    path: '/api/cpu',
    expectedStatus: 200,
    expectedFields: ['success', 'data']
  }
];

// 测试结果
let testResults = [];
let browser;
let page;

/**
 * 检查服务器是否启动
 */
function checkServer(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

/**
 * 发送HTTP请求
 */
function sendRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, CONFIG.MOCK_SERVER_URL);
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (err) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * 初始化浏览器
 */
async function initBrowser() {
  console.log('\n🌐 正在启动浏览器...');

  browser = await puppeteer.launch({
    headless: CONFIG.HEADLESS,
    slowMo: CONFIG.SLOW_MO,
    args: ['--start-maximized']
  });

  page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('✅ 浏览器启动成功\n');
}

/**
 * 截图保存
 */
async function takeScreenshot(name) {
  const filename = `${name}-${Date.now()}.png`;
  const filepath = path.join(CONFIG.SCREENSHOT_DIR, filename);

  // 确保目录存在
  if (!fs.existsSync(CONFIG.SCREENSHOT_DIR)) {
    fs.mkdirSync(CONFIG.SCREENSHOT_DIR, { recursive: true });
  }

  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 截图已保存: ${filename}`);
  return filepath;
}

/**
 * 测试管理界面
 */
async function testManagementInterface() {
  console.log('🎨 测试管理界面...\n');

  const result = {
    name: '管理界面访问',
    status: 'pending',
    duration: 0,
    message: '',
    screenshot: ''
  };

  const startTime = Date.now();

  try {
    // 访问管理界面
    console.log('  正在访问管理界面...');
    await page.goto(CONFIG.MOCK_SERVER_URL + '/index.html', {
      waitUntil: 'networkidle2'
    });

    // 等待页面加载
    await page.waitForSelector('#endpointList', { timeout: 5000 });
    console.log('  ✅ 管理界面加载成功');

    // 截图
    result.screenshot = await takeScreenshot('management-interface');

    // 检查接口列表
    const endpointCount = await page.evaluate(() => {
      const items = document.querySelectorAll('.endpoint-item');
      return items.length;
    });

    console.log(`  📋 发现 ${endpointCount} 个接口`);

    result.status = 'passed';
    result.duration = Date.now() - startTime;
    result.message = `管理界面正常，显示 ${endpointCount} 个接口`;

  } catch (err) {
    result.status = 'failed';
    result.duration = Date.now() - startTime;
    result.message = `错误: ${err.message}`;
    console.log(`  ❌ ${err.message}`);
  }

  testResults.push(result);
  console.log('');
}

/**
 * 测试API接口
 */
async function testAPIEndpoints() {
  console.log('📡 测试API接口...\n');

  for (const testCase of testCases) {
    const result = {
      name: testCase.name,
      status: 'pending',
      duration: 0,
      message: '',
      response: null
    };

    const startTime = Date.now();

    try {
      console.log(`  🧪 测试: ${testCase.name}`);
      console.log(`     ${testCase.method} ${CONFIG.MOCK_SERVER_URL}${testCase.path}`);

      // 发送请求
      const response = await sendRequest(testCase.method, testCase.path, testCase.body);
      const duration = Date.now() - startTime;

      console.log(`     状态码: ${response.status}`);
      console.log(`     响应时间: ${duration}ms`);

      // 验证响应
      if (response.status !== testCase.expectedStatus) {
        throw new Error(`状态码不匹配，期望 ${testCase.expectedStatus}`);
      }

      // 检查响应字段
      const data = response.data;
      for (const field of testCase.expectedFields) {
        if (!(field in data)) {
          throw new Error(`缺少字段: ${field}`);
        }
      }

      result.status = 'passed';
      result.duration = duration;
      result.response = data;
      result.message = `成功，响应时间 ${duration}ms`;

      console.log(`     ✅ 测试通过\n`);

    } catch (err) {
      result.status = 'failed';
      result.duration = Date.now() - startTime;
      result.message = err.message;
      console.log(`     ❌ 测试失败: ${err.message}\n`);
    }

    testResults.push(result);

    // 每个测试之间稍作延迟
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

/**
 * 测试添加接口功能
 */
async function testAddEndpoint() {
  console.log('➕ 测试添加接口功能...\n');

  const result = {
    name: '添加新接口',
    status: 'pending',
    duration: 0,
    message: '',
    screenshot: ''
  };

  const startTime = Date.now();

  try {
    // 访问管理界面
    await page.goto(CONFIG.MOCK_SERVER_URL + '/index.html', {
      waitUntil: 'networkidle2'
    });

    // 点击"添加新接口"按钮
    console.log('  正在点击"添加新接口"按钮...');
    await page.click('button[onclick="showAddForm()"]');
    await page.waitForTimeout(500);

    // 填写表单
    console.log('  正在填写接口信息...');
    await page.type('#newName', '测试接口');
    await page.type('#newPath', '/api/test-endpoint');
    await page.select('#newMethod', 'GET');
    await page.type('#newDelay', '1000');

    // 截图
    result.screenshot = await takeScreenshot('add-endpoint-form');

    // 这里不真正保存，只是测试UI
    console.log('  ✅ 表单填写成功（未保存）');

    result.status = 'passed';
    result.duration = Date.now() - startTime;
    result.message = '添加接口表单功能正常';

  } catch (err) {
    result.status = 'failed';
    result.duration = Date.now() - startTime;
    result.message = `错误: ${err.message}`;
    console.log(`  ❌ ${err.message}`);
  }

  testResults.push(result);
  console.log('');
}

/**
 * 测试接口测试按钮
 */
async function testEndpointButton() {
  console.log('🧪 测试接口测试按钮...\n');

  const result = {
    name: '接口测试按钮',
    status: 'pending',
    duration: 0,
    message: '',
    screenshot: ''
  };

  const startTime = Date.now();

  try {
    // 访问管理界面
    await page.goto(CONFIG.MOCK_SERVER_URL + '/index.html', {
      waitUntil: 'networkidle2'
    });

    // 等待接口列表加载
    await page.waitForSelector('.endpoint-item');
    await page.waitForTimeout(1000);

    // 点击第一个接口的"测试"按钮
    console.log('  正在点击接口测试按钮...');
    const testButton = await page.$('.endpoint-actions button');
    if (testButton) {
      // 设置对话框处理
      page.on('dialog', async dialog => {
        console.log(`  📄 测试对话框: ${dialog.message()}`);
        await dialog.accept();
      });

      await testButton.click();
      await page.waitForTimeout(2000);

      // 截图
      result.screenshot = await takeScreenshot('endpoint-test-dialog');

      console.log('  ✅ 测试按钮功能正常');

      result.status = 'passed';
      result.duration = Date.now() - startTime;
      result.message = '测试按钮功能正常';
    } else {
      throw new Error('未找到测试按钮');
    }

  } catch (err) {
    result.status = 'failed';
    result.duration = Date.now() - startTime;
    result.message = `错误: ${err.message}`;
    console.log(`  ❌ ${err.message}`);
  }

  testResults.push(result);
  console.log('');
}

/**
 * 生成测试报告
 */
function generateTestReport() {
  const passed = testResults.filter(r => r.status === 'passed').length;
  const failed = testResults.filter(r => r.status === 'failed').length;
  const total = testResults.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>测试报告 - Mock Server E2E Test</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f7fa;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .header h1 {
      color: #333;
      margin-bottom: 10px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-top: 20px;
    }
    .summary-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card h3 {
      font-size: 32px;
      color: #667eea;
      margin-bottom: 5px;
    }
    .summary-card p {
      color: #666;
      font-size: 14px;
    }
    .test-results {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    }
    .test-item {
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 8px;
      border-left: 4px solid #ccc;
    }
    .test-item.passed {
      background: #d4edda;
      border-left-color: #28a745;
    }
    .test-item.failed {
      background: #f8d7da;
      border-left-color: #dc3545;
    }
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .test-name {
      font-weight: bold;
      font-size: 16px;
    }
    .test-status {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    .status-passed {
      background: #28a745;
      color: white;
    }
    .status-failed {
      background: #dc3545;
      color: white;
    }
    .test-info {
      font-size: 14px;
      color: #666;
      margin: 5px 0;
    }
    .screenshot-link {
      color: #667eea;
      text-decoration: none;
      font-size: 13px;
    }
    .screenshot-link:hover {
      text-decoration: underline;
    }
    .timestamp {
      text-align: center;
      color: #999;
      margin-top: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 Mock Server E2E 测试报告</h1>
      <p>自动化测试结果 - ${new Date().toLocaleString('zh-CN')}</p>
      <div class="summary">
        <div class="summary-card">
          <h3>${total}</h3>
          <p>总测试数</p>
        </div>
        <div class="summary-card">
          <h3>${passed}</h3>
          <p>通过</p>
        </div>
        <div class="summary-card">
          <h3>${failed}</h3>
          <p>失败</p>
        </div>
        <div class="summary-card">
          <h3>${passRate}%</h3>
          <p>通过率</p>
        </div>
      </div>
    </div>

    <div class="test-results">
      <h2 style="margin-bottom: 15px;">测试详情</h2>
      ${testResults.map(test => `
        <div class="test-item ${test.status}">
          <div class="test-header">
            <span class="test-name">${test.name}</span>
            <span class="test-status status-${test.status}">
              ${test.status === 'passed' ? '✅ 通过' : '❌ 失败'}
            </span>
          </div>
          <div class="test-info">
            <strong>耗时：</strong>${test.duration}ms
          </div>
          <div class="test-info">
            <strong>消息：</strong>${test.message}
          </div>
          ${test.screenshot ? `
            <div class="test-info">
              <a href="../screenshots/${path.basename(test.screenshot)}" target="_blank" class="screenshot-link">
                📸 查看截图
              </a>
            </div>
          ` : ''}
          ${test.response ? `
            <div class="test-info">
              <strong>响应数据：</strong>
              <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(test.response, null, 2)}</pre>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>

    <div class="timestamp">
      测试完成时间: ${new Date().toLocaleString('zh-CN')}
    </div>
  </div>
</body>
</html>
  `;

  fs.writeFileSync(CONFIG.TEST_REPORT, html);
  console.log(`📄 测试报告已生成: ${CONFIG.TEST_REPORT}`);
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('\n=================================');
  console.log('🚀 Mock Server E2E 自动化测试');
  console.log('=================================\n');

  try {
    // 检查Mock Server是否启动
    console.log('🔍 检查Mock Server状态...');
    const isServerRunning = await checkServer(CONFIG.MOCK_SERVER_URL);
    if (!isServerRunning) {
      console.error('❌ Mock Server未启动！');
      console.error('   请先运行: cd mock-server && npm start');
      process.exit(1);
    }
    console.log('✅ Mock Server 已启动\n');

    // 初始化浏览器
    await initBrowser();

    // 运行测试
    await testAPIEndpoints();
    await testManagementInterface();
    await testAddEndpoint();
    await testEndpointButton();

    // 生成测试报告
    generateTestReport();

    // 关闭浏览器
    await browser.close();

    // 输出总结
    const passed = testResults.filter(r => r.status === 'passed').length;
    const failed = testResults.filter(r => r.status === 'failed').length;
    const total = testResults.length;

    console.log('\n=================================');
    console.log('📊 测试总结');
    console.log('=================================');
    console.log(`总测试数: ${total}`);
    console.log(`通过: ${passed} ✅`);
    console.log(`失败: ${failed} ${failed > 0 ? '❌' : '✅'}`);
    console.log(`通过率: ${((passed / total) * 100).toFixed(1)}%`);
    console.log(`\n📄 查看详细报告: ${CONFIG.TEST_REPORT}`);
    console.log('=================================\n');

    if (failed > 0) {
      process.exit(1);
    }

  } catch (err) {
    console.error('\n❌ 测试运行失败:', err.message);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

// 启动测试
runAllTests();
