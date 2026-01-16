/**
 * Mock Server 测试脚本
 * 用于验证API接口是否正常工作
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

// 测试用例
const tests = [
  {
    name: '用户列表 (GET)',
    method: 'GET',
    path: '/api/users'
  },
  {
    name: '订单列表 (POST)',
    method: 'POST',
    path: '/api/orders',
    body: { status: 'completed' }
  },
  {
    name: '销售数据 (POST)',
    method: 'POST',
    path: '/api/sales',
    body: { startDate: '2024-01-01', endDate: '2024-12-31' }
  },
  {
    name: '用户分布 (GET)',
    method: 'GET',
    path: '/api/user-distribution'
  },
  {
    name: 'CPU使用率 (GET)',
    method: 'GET',
    path: '/api/cpu'
  }
];

// 发送HTTP请求
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
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

// 运行测试
async function runTests() {
  console.log('\n==================================');
  console.log('  Mock Server API 测试');
  console.log('==================================\n');

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`🧪 测试: ${test.name}`);
      console.log(`   ${test.method} ${BASE_URL}${test.path}`);

      const start = Date.now();
      const response = await request(test.method, test.path, test.body);
      const duration = Date.now() - start;

      if (response.status === 200 && response.data.success) {
        console.log(`   ✅ 成功 (${duration}ms)`);
        console.log(`   响应: ${JSON.stringify(response.data).substring(0, 100)}...`);
        passed++;
      } else {
        console.log(`   ❌ 失败 (状态码: ${response.status})`);
        failed++;
      }
    } catch (err) {
      console.log(`   ❌ 错误: ${err.message}`);
      failed++;
    }
    console.log('');
  }

  console.log('==================================');
  console.log(`测试结果: ✅ ${passed} 通过, ❌ ${failed} 失败`);
  console.log('==================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

// 等待服务器启动后运行测试
setTimeout(() => {
  runTests().catch(err => {
    console.error('测试运行失败:', err);
    process.exit(1);
  });
}, 2000);
