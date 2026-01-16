#!/usr/bin/env node

/**
 * Report Designer 功能测试脚本
 *
 * 这是一个不依赖浏览器的轻量级自动化测试脚本
 * 通过HTTP请求和文件系统检查来验证应用功能
 *
 * 运行方式：node quick-test.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// 配置
const CONFIG = {
  DEV_SERVER_URL: 'http://localhost:5173',
  MOCK_SERVER_URL: 'http://localhost:3001',
  REPORT_DIR: path.join(__dirname, 'reports'),
  TEST_REPORT: path.join(__dirname, 'reports/quick-test-report.html')
};

// 测试结果
let testResults = [];

/**
 * 检查服务器是否运行
 */
async function checkServer(url, name) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      console.log(`✅ ${name} 运行中 (${url})`);
      resolve(true);
    }).on('error', () => {
      console.log(`❌ ${name} 未启动 (${url})`);
      resolve(false);
    });
  });
}

/**
 * 发送HTTP请求测试页面
 */
async function testPage(url, name, method = 'GET') {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const request = http.request(url, options, (res) => {
      const duration = Date.now() - startTime;
      let data = '';

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          duration,
          size: data.length,
          ok: res.statusCode === 200
        });
      });
    });

    request.on('error', (err) => {
      resolve({
        status: 0,
        duration: Date.now() - startTime,
        ok: false,
        error: err.message
      });
    });

    // For POST requests, send empty body
    if (method === 'POST') {
      request.write('{}');
    }

    request.end();
  });
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('\n=================================');
  console.log('🧪 Report Designer 功能测试');
  console.log('=================================\n');

  // 测试组1: 服务器检查
  console.log('📡 测试组1: 服务器状态检查\n');

  const devServerOK = await checkServer(CONFIG.DEV_SERVER_URL, '开发服务器');
  const mockServerOK = await checkServer(CONFIG.MOCK_SERVER_URL, 'Mock Server');

  testResults.push({
    name: '开发服务器状态',
    status: devServerOK ? 'passed' : 'failed',
    message: devServerOK ? '开发服务器运行正常' : '开发服务器未启动，请运行: npm run dev'
  });

  testResults.push({
    name: 'Mock Server状态',
    status: mockServerOK ? 'passed' : 'failed',
    message: mockServerOK ? 'Mock Server运行正常' : 'Mock Server未启动，请运行: cd mock-server && npm start'
  });

  if (!devServerOK) {
    console.log('\n⚠️  开发服务器未启动，跳过应用测试');
    console.log('   请先运行: cd report-designer && npm run dev\n');
    generateReport();
    return;
  }

  // 测试组2: 页面加载测试
  console.log('\n📄 测试组2: 页面加载测试\n');

  const pageTests = [
    { path: '/', name: '应用首页' },
    { path: '/index.html', name: '首页HTML' }
  ];

  for (const test of pageTests) {
    const result = await testPage(`${CONFIG.DEV_SERVER_URL}${test.path}`, test.name);

    testResults.push({
      name: test.name,
      status: result.ok ? 'passed' : 'failed',
      message: result.ok
        ? `加载成功，状态码 ${result.status}，耗时 ${result.duration}ms，大小 ${result.size} bytes`
        : `加载失败: ${result.error || '状态码 ' + result.status}`
    });

    console.log(`${result.ok ? '✅' : '❌'} ${test.name}: ${result.ok ? '通过' : '失败'}`);
  }

  // 测试组3: API接口测试（如果Mock Server可用）
  if (mockServerOK) {
    console.log('\n🔌 测试组3: API接口测试\n');

    const apiTests = [
      { method: 'GET', path: '/api/users', name: '用户列表接口' },
      { method: 'POST', path: '/api/orders', name: '订单列表接口' },
      { method: 'POST', path: '/api/sales', name: '销售数据接口' }
    ];

    for (const test of apiTests) {
      const result = await testPage(`${CONFIG.MOCK_SERVER_URL}${test.path}`, test.name, test.method);

      testResults.push({
        name: test.name,
        status: result.ok ? 'passed' : 'failed',
        message: result.ok
          ? `API响应正常，状态码 ${result.status}，耗时 ${result.duration}ms`
          : `API请求失败`
      });

      console.log(`${result.ok ? '✅' : '❌'} ${test.name}: ${result.ok ? '通过' : '失败'}`);
    }
  }

  // 测试组4: 文件系统检查
  console.log('\n📁 测试组4: 项目文件检查\n');

  const fileTests = [
    { path: '../src/App.vue', name: '主应用文件' },
    { path: '../src/types/index.ts', name: '类型定义文件' },
    { path: '../src/components', name: '组件目录', isDir: true },
    { path: '../package.json', name: '项目配置文件' }
  ];

  for (const test of fileTests) {
    const fullPath = path.resolve(__dirname, test.path);
    const exists = test.isDir
      ? fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()
      : fs.existsSync(fullPath);

    testResults.push({
      name: test.name,
      status: exists ? 'passed' : 'failed',
      message: exists ? '文件存在' : '文件不存在'
    });

    console.log(`${exists ? '✅' : '❌'} ${test.name}: ${exists ? '存在' : '不存在'}`);
  }

  // 测试组5: 组件文件检查
  console.log('\n🧩 测试组5: 组件文件检查\n');

  const componentFiles = [
    'TableRenderer.vue',
    'BarChartRenderer.vue',
    'LineChartRenderer.vue',
    'PieChartRenderer.vue',
    'ScatterChartRenderer.vue',
    'GaugeChartRenderer.vue',
    'FunnelChartRenderer.vue',
    'TextRenderer.vue',
    'ImageRenderer.vue',
    'RectangleRenderer.vue',
    'LineRenderer.vue'
  ];

  const rendererDir = path.resolve(__dirname, '../src/components/canvas/renderers');

  if (fs.existsSync(rendererDir)) {
    const files = fs.readdirSync(rendererDir);

    for (const comp of componentFiles) {
      const exists = files.includes(comp);
      testResults.push({
        name: comp,
        status: exists ? 'passed' : 'failed',
        message: exists ? '渲染器文件存在' : '渲染器文件缺失'
      });
      console.log(`${exists ? '✅' : '❌'} ${comp}: ${exists ? '存在' : '缺失'}`);
    }
  } else {
    console.log('⚠️  渲染器目录不存在');
  }

  // 生成测试报告
  generateReport();
}

/**
 * 生成HTML测试报告
 */
function generateReport() {
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
  <title>Report Designer 功能测试报告</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      background: white;
      padding: 40px;
      border-radius: 15px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      margin-bottom: 30px;
      text-align: center;
    }
    .header h1 {
      color: #333;
      font-size: 32px;
      margin-bottom: 10px;
    }
    .header .subtitle {
      color: #666;
      font-size: 16px;
      margin-bottom: 20px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }
    .summary-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 25px;
      border-radius: 12px;
      text-align: center;
      color: white;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    .summary-card h3 {
      font-size: 42px;
      margin-bottom: 8px;
    }
    .summary-card p {
      font-size: 15px;
      opacity: 0.9;
    }
    .test-groups {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 20px;
    }
    .test-group {
      background: white;
      padding: 25px;
      border-radius: 15px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .test-group h2 {
      color: #333;
      font-size: 20px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    .test-item {
      background: #f8f9fa;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 8px;
      border-left: 4px solid #ccc;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .test-item.passed {
      border-left-color: #28a745;
      background: #d4edda;
    }
    .test-item.failed {
      border-left-color: #dc3545;
      background: #f8d7da;
    }
    .test-name {
      font-weight: bold;
      font-size: 16px;
      color: #333;
    }
    .test-badge {
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: bold;
      color: white;
    }
    .badge-passed {
      background: #28a745;
    }
    .badge-failed {
      background: #dc3545;
    }
    .test-message {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }
    .footer {
      text-align: center;
      color: white;
      margin-top: 30px;
      padding: 20px;
      font-size: 14px;
    }
    .retry-button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 30px;
      background: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 25px;
      font-weight: bold;
      transition: all 0.3s;
    }
    .retry-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 Report Designer 功能测试报告</h1>
      <p class="subtitle">自动化功能验证 - ${new Date().toLocaleString('zh-CN')}</p>
      <div class="summary">
        <div class="summary-card">
          <h3>${total}</h3>
          <p>总测试数</p>
        </div>
        <div class="summary-card">
          <h3>${passed}</h3>
          <p>✅ 通过</p>
        </div>
        <div class="summary-card">
          <h3>${failed}</h3>
          <p>❌ 失败</p>
        </div>
        <div class="summary-card">
          <h3>${passRate}%</h3>
          <p>通过率</p>
        </div>
      </div>
    </div>

    <div class="test-groups">
      <div class="test-group">
        <h2>📡 服务器状态</h2>
        ${testResults.filter(r => r.name.includes('服务器')).map(test => `
          <div class="test-item ${test.status}">
            <div>
              <div class="test-name">${test.name}</div>
              <div class="test-message">${test.message}</div>
            </div>
            <span class="test-badge badge-${test.status}">
              ${test.status === 'passed' ? '✅ 正常' : '❌ 异常'}
            </span>
          </div>
        `).join('')}
      </div>

      <div class="test-group">
        <h2>📄 页面加载</h2>
        ${testResults.filter(r => r.name.includes('首页')).map(test => `
          <div class="test-item ${test.status}">
            <div>
              <div class="test-name">${test.name}</div>
              <div class="test-message">${test.message}</div>
            </div>
            <span class="test-badge badge-${test.status}">
              ${test.status === 'passed' ? '✅ 通过' : '❌ 失败'}
            </span>
          </div>
        `).join('')}
      </div>

      <div class="test-group">
        <h2>🔌 API接口</h2>
        ${testResults.filter(r => r.name.includes('接口')).map(test => `
          <div class="test-item ${test.status}">
            <div>
              <div class="test-name">${test.name}</div>
              <div class="test-message">${test.message}</div>
            </div>
            <span class="test-badge badge-${test.status}">
              ${test.status === 'passed' ? '✅ 通过' : '❌ 失败'}
            </span>
          </div>
        `).join('')}
      </div>

      <div class="test-group">
        <h2>📁 项目文件</h2>
        ${testResults.filter(r => r.name.includes('文件') || r.name.includes('目录')).map(test => `
          <div class="test-item ${test.status}">
            <div>
              <div class="test-name">${test.name}</div>
              <div class="test-message">${test.message}</div>
            </div>
            <span class="test-badge badge-${test.status}">
              ${test.status === 'passed' ? '✅ 存在' : '❌ 缺失'}
            </span>
          </div>
        `).join('')}
      </div>

      <div class="test-group">
        <h2>🧩 组件文件</h2>
        ${testResults.filter(r => r.name.includes('Renderer')).map(test => `
          <div class="test-item ${test.status}">
            <div>
              <div class="test-name">${test.name}</div>
              <div class="test-message">${test.message}</div>
            </div>
            <span class="test-badge badge-${test.status}">
              ${test.status === 'passed' ? '✅ 存在' : '❌ 缺失'}
            </span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="footer">
      <p>Report Designer 功能测试报告</p>
      <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
      <a href="javascript:location.reload()" class="retry-button">🔄 重新测试</a>
    </div>
  </div>
</body>
</html>
  `;

  // 确保目录存在
  if (!fs.existsSync(CONFIG.REPORT_DIR)) {
    fs.mkdirSync(CONFIG.REPORT_DIR, { recursive: true });
  }

  // 写入报告
  fs.writeFileSync(CONFIG.TEST_REPORT, html);

  console.log('\n=================================');
  console.log('📊 测试总结');
  console.log('=================================');
  console.log(`总测试数: ${total}`);
  console.log(`通过: ${passed} ✅`);
  console.log(`失败: ${failed} ${failed > 0 ? '❌' : '✅'}`);
  console.log(`通过率: ${passRate}%`);
  console.log(`\n📄 测试报告: ${CONFIG.TEST_REPORT}`);
  console.log('=================================\n');

  // 在浏览器中打开报告
  const openCommand = process.platform === 'darwin' ? 'open' :
                      process.platform === 'win32' ? 'start' : 'xdg-open';

  require('child_process').exec(`${openCommand} ${CONFIG.TEST_REPORT}`, (err) => {
    if (err) console.log(`\n💡 请在浏览器中打开: file://${CONFIG.TEST_REPORT}`);
    else console.log(`\n🌐 已在浏览器中打开测试报告`);
  });

  if (failed > 0) {
    process.exit(1);
  }
}

// 启动测试
runAllTests();
