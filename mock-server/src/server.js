/**
 * Mock Server - Report Designer API调试服务器
 *
 * 提供可配置的模拟API接口，支持：
 * - 表格数据接口
 * - 图表数据接口
 * - 动态参数接收
 * - 延迟响应模拟
 * - 错误模拟
 * - 接口管理界面
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const CONFIG_FILE = path.join(__dirname, '../data/api-config.json');

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// 加载API配置
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return config;
    }
  } catch (err) {
    console.error('加载配置文件失败:', err.message);
  }
  return getDefaultConfig();
}

// 保存API配置
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (err) {
    console.error('保存配置文件失败:', err.message);
    return false;
  }
}

// 获取默认配置
function getDefaultConfig() {
  return {
    endpoints: [
      {
        id: 'table-1',
        name: '用户列表',
        path: '/api/users',
        method: 'GET',
        delay: 500,
        enabled: true,
        responseType: 'table',
        data: {
          columns: ['id', 'name', 'email', 'role', 'status'],
          rows: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            name: `用户${i + 1}`,
            email: `user${i + 1}@example.com`,
            role: ['管理员', '普通用户', '访客'][i % 3],
            status: ['激活', '禁用'][i % 2]
          }))
        }
      },
      {
        id: 'chart-1',
        name: '销售数据',
        path: '/api/sales',
        method: 'POST',
        delay: 800,
        enabled: true,
        responseType: 'chart',
        data: {
          categories: ['一月', '二月', '三月', '四月', '五月', '六月'],
          series: [
            { name: '销售额', data: [120, 200, 150, 180, 220, 280] },
            { name: '利润', data: [40, 80, 50, 60, 90, 120] }
          ]
        }
      },
      {
        id: 'pie-1',
        name: '用户分布',
        path: '/api/user-distribution',
        method: 'GET',
        delay: 600,
        enabled: true,
        responseType: 'pie',
        data: [
          { name: '北京', value: 335 },
          { name: '上海', value: 310 },
          { name: '广州', value: 234 },
          { name: '深圳', value: 135 },
          { name: '其他', value: 548 }
        ]
      },
      {
        id: 'gauge-1',
        name: 'CPU使用率',
        path: '/api/cpu',
        method: 'GET',
        delay: 300,
        enabled: true,
        responseType: 'gauge',
        data: {
          value: 75
        }
      }
    ],
    globalSettings: {
      defaultDelay: 500,
      enableLog: true,
      enableErrorSimulation: false
    }
  };
}

// 模拟延迟
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 日志中间件
app.use((req, res, next) => {
  const config = loadConfig();
  if (config.globalSettings.enableLog) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('  Body:', JSON.stringify(req.body, null, 2));
    }
    if (req.query && Object.keys(req.query).length > 0) {
      console.log('  Query:', JSON.stringify(req.query, null, 2));
    }
  }
  next();
});

// API配置管理接口
app.get('/api/config', (req, res) => {
  const config = loadConfig();
  res.json(config);
});

app.post('/api/config', (req, res) => {
  const newConfig = req.body;
  if (saveConfig(newConfig)) {
    res.json({ success: true, message: '配置保存成功' });
  } else {
    res.status(500).json({ success: false, message: '配置保存失败' });
  }
});

// 动态注册API端点
function registerEndpoints() {
  const config = loadConfig();
  const endpoints = config.endpoints || [];

  // 清除已注册的路由（简单方式：重启服务）
  // 实际使用中应该使用更复杂的路由管理

  endpoints.forEach(endpoint => {
    if (!endpoint.enabled) return;

    const handler = async (req, res) => {
      try {
        // 模拟延迟
        const delayTime = endpoint.delay || config.globalSettings.defaultDelay;
        await delay(delayTime);

        // 记录请求参数
        if (config.globalSettings.enableLog) {
          console.log(`[Endpoint] ${endpoint.name}`);
          console.log('  Received params:', {
            query: req.query,
            body: req.body
          });
        }

        // 返回数据
        res.json({
          success: true,
          data: endpoint.data,
          timestamp: new Date().toISOString(),
          params: {
            query: req.query,
            body: req.body
          }
        });
      } catch (err) {
        console.error(`[Error] ${endpoint.name}:`, err.message);
        res.status(500).json({
          success: false,
          error: err.message,
          timestamp: new Date().toISOString()
        });
      }
    };

    if (endpoint.method === 'GET') {
      app.get(endpoint.path, handler);
    } else if (endpoint.method === 'POST') {
      app.post(endpoint.path, handler);
    }

    console.log(`[Registered] ${endpoint.method} ${endpoint.path} - ${endpoint.name}`);
  });
}

// 启动服务器
function startServer() {
  // 注册所有端点
  registerEndpoints();

  // 错误处理
  app.use((err, req, res, next) => {
    console.error('[Server Error]:', err);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: err.message
    });
  });

  // 启动监听
  app.listen(PORT, () => {
    console.log('\n=================================');
    console.log(`🚀 Mock Server 已启动`);
    console.log(`📍 地址: http://localhost:${PORT}`);
    console.log(`🔧 管理界面: http://localhost:${PORT}/index.html`);
    console.log('=================================\n');
    console.log('可用的API接口:');
    const config = loadConfig();
    config.endpoints.forEach(ep => {
      if (ep.enabled) {
        console.log(`  ${ep.method} http://localhost:${PORT}${ep.path}`);
      }
    });
    console.log('\n按 Ctrl+C 停止服务器\n');
  });
}

// 如果直接运行此文件
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
