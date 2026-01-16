/**
 * 自动化测试脚本（简化版）
 *
 * 不依赖Puppeteer，直接使用HTTP请求测试API
 * 自动生成HTML测试报告
 * 自动打开浏览器查看报告
 *
 * 运行方式：npm test
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// 配置
const CONFIG = {
  MOCK_SERVER_PORT: 3001,
  MOCK_SERVER_URL: 'http://localhost:3001',
  REPORT_DIR: path.join(__dirname, '../test-reports'),
  TEST_REPORT: path.join(__dirname, '../test-reports/report.html')
};

// 测试用例
const testCases = [
  {
    name: '用户列表接口',
    method: 'GET',
    path: '/api/users',
    description: '获取用户列表数据，返回表格格式'
  },
  {
    name: '订单列表接口',
    method: 'POST',
    path: '/api/orders',
    body: { status: 'completed' },
    description: '获取订单列表，支持POST请求和参数'
  },
  {
    name: '销售数据接口',
    method: 'POST',
    path: '/api/sales',
    body: { startDate: '2024-01-01', endDate: '2024-12-31' },
    description: '获取销售图表数据，测试参数回显'
  },
  {
    name: '用户分布接口',
    method: 'GET',
    path: '/api/user-distribution',
    description: '获取用户分布数据，返回饼图格式'
  },
  {
    name: 'CPU使用率接口',
    method: 'GET',
    path: '/api/cpu',
    description: '获取CPU使用率，返回仪表盘格式'
  },
  {
    name: '月度趋势接口',
    method: 'GET',
    path: '/api/trends',
    description: '获取月度趋势数据，多系列图表'
  },
  {
    name: '产品销售接口',
    method: 'POST',
    path: '/api/product-sales',
    body: { category: 'electronics' },
    description: '获取产品销售数据，饼图格式'
  },
  {
    name: '内存使用率接口',
    method: 'GET',
    path: '/api/memory',
    description: '获取内存使用率，仪表盘格式'
  },
  {
    name: '身高体重接口',
    method: 'GET',
    path: '/api/height-weight',
    description: '获取身高体重分布，散点图格式'
  },
  {
    name: '转化漏斗接口',
    method: 'GET',
    path: '/api/funnel',
    description: '获取转化漏斗数据，漏斗图格式'
  }
];

// 测试结果
let testResults = [];

/**
 * 检查服务器状态
 */
async function checkServer() {
  return new Promise((resolve) => {
    http.get(CONFIG.MOCK_SERVER_URL, (res) => {
      console.log(`✅ Mock Server 运行中 (${CONFIG.MOCK_SERVER_URL})`);
      resolve(true);
    }).on('error', () => {
      console.log(`❌ Mock Server 未启动`);
      console.log(`   请先运行: cd mock-server && npm start`);
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
          const response = {
            status: res.statusCode,
            data: JSON.parse(data),
            headers: res.headers
          };
          resolve(response);
        } catch (err) {
          resolve({
            status: res.statusCode,
            data: null,
            error: err.message,
            raw: data
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
 * 运行测试用例
 */
async function runTest(testCase) {
  const result = {
    name: testCase.name,
    method: testCase.method,
    path: testCase.path,
    description: testCase.description,
    status: 'pending',
    duration: 0,
    size: 0,
    message: '',
    response: null,
    error: null
  };

  const startTime = Date.now();

  try {
    console.log(`\n🧪 ${testCase.name}`);
    console.log(`   ${testCase.method} ${CONFIG.MOCK_SERVER_URL}${testCase.path}`);
    console.log(`   ${testCase.description}`);

    if (testCase.body) {
      console.log(`   请求体: ${JSON.stringify(testCase.body)}`);
    }

    // 发送请求
    const response = await sendRequest(testCase.method, testCase.path, testCase.body);
    const duration = Date.now() - startTime;

    // 计算响应大小
    const size = JSON.stringify(response.data).length;

    console.log(`   状态: ${response.status} ⏱ ${duration}ms 📦 ${size} bytes`);

    // 验证响应
    if (response.status !== 200) {
      throw new Error(`HTTP状态码错误: ${response.status}`);
    }

    if (!response.data) {
      throw new Error('响应数据解析失败');
    }

    if (!response.data.success) {
      throw new Error('API返回success=false');
    }

    if (!response.data.data) {
      throw new Error('响应中缺少data字段');
    }

    // 检查参数回显
    if (testCase.body && response.data.params) {
      console.log(`   参数回显: ✅`);
      console.log(`   接收参数: ${JSON.stringify(response.data.params.body || response.data.params.query)}`);
    }

    result.status = 'passed';
    result.duration = duration;
    result.size = size;
    result.response = response.data;
    result.message = `成功，响应时间 ${duration}ms，数据大小 ${size} bytes`;

    console.log(`   ✅ 测试通过`);

  } catch (err) {
    result.status = 'failed';
    result.duration = Date.now() - startTime;
    result.error = err.message;
    result.message = `失败: ${err.message}`;
    console.log(`   ❌ 测试失败: ${err.message}`);
  }

  return result;
}

/**
 * 生成HTML测试报告
 */
function generateHTMLReport() {
  const passed = testResults.filter(r => r.status === 'passed').length;
  const failed = testResults.filter(r => r.status === 'failed').length;
  const total = testResults.length;
  const passRate = ((passed / total) * 100).toFixed(1);
  const totalDuration = testResults.reduce((sum, r) => sum + r.duration, 0);
  const totalSize = testResults.reduce((sum, r) => sum + (r.size || 0), 0);

  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mock Server 测试报告</title>
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
      transition: transform 0.3s;
    }
    .summary-card:hover {
      transform: translateY(-5px);
    }
    .summary-card h3 {
      font-size: 42px;
      margin-bottom: 8px;
    }
    .summary-card p {
      font-size: 15px;
      opacity: 0.9;
    }
    .test-results {
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .test-results h2 {
      color: #333;
      font-size: 24px;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 3px solid #667eea;
    }
    .test-item {
      background: #f8f9fa;
      padding: 20px;
      margin-bottom: 15px;
      border-radius: 10px;
      border-left: 5px solid #ccc;
      transition: all 0.3s;
    }
    .test-item:hover {
      box-shadow: 0 3px 10px rgba(0,0,0,0.1);
      transform: translateX(5px);
    }
    .test-item.passed {
      border-left-color: #28a745;
      background: #d4edda;
    }
    .test-item.failed {
      border-left-color: #dc3545;
      background: #f8d7da;
    }
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .test-name {
      font-weight: bold;
      font-size: 18px;
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
    .test-meta {
      display: flex;
      gap: 20px;
      margin: 10px 0;
      flex-wrap: wrap;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
      color: #666;
    }
    .test-description {
      color: #666;
      font-size: 14px;
      margin: 8px 0;
      font-style: italic;
    }
    .test-response {
      background: white;
      padding: 15px;
      border-radius: 8px;
      margin-top: 10px;
      max-height: 300px;
      overflow: auto;
    }
    .test-response pre {
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
      color: #333;
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 25px;
      font-weight: bold;
      transition: all 0.3s;
    }
    .retry-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Mock Server 测试报告</h1>
      <p class="subtitle">自动化API接口测试 - ${new Date().toLocaleString('zh-CN')}</p>
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
        <div class="summary-card">
          <h3>${totalDuration}ms</h3>
          <p>总耗时</p>
        </div>
        <div class="summary-card">
          <h3>${(totalSize / 1024).toFixed(1)}KB</h3>
          <p>总数据量</p>
        </div>
      </div>
    </div>

    <div class="test-results">
      <h2>📋 测试详情</h2>
      ${testResults.map(test => `
        <div class="test-item ${test.status}">
          <div class="test-header">
            <span class="test-name">${test.name}</span>
            <span class="test-badge badge-${test.status}">
              ${test.status === 'passed' ? '✅ 通过' : '❌ 失败'}
            </span>
          </div>
          <div class="test-description">${test.description}</div>
          <div class="test-meta">
            <div class="meta-item">
              <span>📡</span>
              <span>${test.method} ${test.path}</span>
            </div>
            <div class="meta-item">
              <span>⏱</span>
              <span>${test.duration}ms</span>
            </div>
            ${test.size ? `
              <div class="meta-item">
                <span>📦</span>
                <span>${test.size} bytes</span>
              </div>
            ` : ''}
          </div>
          ${test.message ? `
            <div style="margin-top: 8px; font-size: 14px; color: #666;">
              💬 ${test.message}
            </div>
          ` : ''}
          ${test.error ? `
            <div style="margin-top: 8px; font-size: 14px; color: #dc3545;">
              ⚠️ ${test.error}
            </div>
          ` : ''}
          ${test.response ? `
            <div class="test-response">
              <strong>📦 响应数据：</strong>
              <pre>${JSON.stringify(test.response, null, 2)}</pre>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>

    <div class="footer">
      <p>Mock Server API 测试报告</p>
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

  console.log(`\n📄 测试报告已生成: ${CONFIG.TEST_REPORT}`);

  return CONFIG.TEST_REPORT;
}

/**
 * 在浏览器中打开报告
 */
function openReport(reportPath) {
  const platform = process.platform;

  let command;
  if (platform === 'darwin') {
    command = `open ${reportPath}`;
  } else if (platform === 'win32') {
    command = `start ${reportPath}`;
  } else {
    command = `xdg-open ${reportPath}`;
  }

  exec(command, (err) => {
    if (err) {
      console.log(`\n💡 提示: 请在浏览器中打开 file://${reportPath}`);
    } else {
      console.log(`\n🌐 已在浏览器中打开测试报告`);
    }
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('\n=================================');
  console.log('🚀 Mock Server 自动化测试');
  console.log('=================================\n');

  try {
    // 检查服务器
    const isRunning = await checkServer();
    if (!isRunning) {
      process.exit(1);
    }

    console.log('\n开始测试...\n');

    // 运行所有测试
    for (const testCase of testCases) {
      const result = await runTest(testCase);
      testResults.push(result);

      // 测试之间稍作延迟
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // 生成测试报告
    const reportPath = generateHTMLReport();

    // 输出总结
    const passed = testResults.filter(r => r.status === 'passed').length;
    const failed = testResults.filter(r => r.status === 'failed').length;
    const total = testResults.length;
    const passRate = ((passed / total) * 100).toFixed(1);

    console.log('\n=================================');
    console.log('📊 测试总结');
    console.log('=================================');
    console.log(`总测试数: ${total}`);
    console.log(`通过: ${passed} ✅`);
    console.log(`失败: ${failed} ${failed > 0 ? '❌' : '✅'}`);
    console.log(`通过率: ${passRate}%`);
    console.log('=================================\n');

    // 在浏览器中打开报告
    openReport(reportPath);

    if (failed > 0) {
      process.exit(1);
    }

  } catch (err) {
    console.error('\n❌ 测试运行失败:', err.message);
    process.exit(1);
  }
}

// 启动测试
main();
