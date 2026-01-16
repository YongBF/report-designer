# Mock Server 项目总结

## ✅ 已完成的内容

### 📁 项目结构
```
mock-server/
├── src/
│   ├── server.js          # Express服务器主文件
│   └── test.js            # API测试脚本
├── public/
│   └── index.html         # 接口管理界面
├── data/
│   └── api-config.json    # API接口配置文件
├── package.json           # 项目依赖配置
├── .gitignore            # Git忽略文件
├── start.sh              # Linux/Mac启动脚本
├── start.bat             # Windows启动脚本
├── README.md             # 完整文档
├── QUICK_START.md        # 快速开始指南
└── PROJECT_SUMMARY.md    # 项目总结（本文件）
```

## 🎯 核心功能

### 1. Express服务器
- ✅ 轻量级Web服务器
- ✅ 支持CORS跨域请求
- ✅ 自动注册API端点
- ✅ 可配置的响应延迟
- ✅ 详细的请求日志

### 2. API接口管理
- ✅ 10个预置接口（表格、图表、饼图、仪表盘等）
- ✅ 动态添加/删除/启用/禁用接口
- ✅ 支持GET和POST请求
- ✅ 参数回显功能

### 3. Web管理界面
- ✅ 响应式设计，美观易用
- ✅ 接口列表展示
- ✅ 一键测试接口
- ✅ 可视化添加新接口
- ✅ 全局设置管理

### 4. 数据格式支持
- ✅ 表格数据（columns + rows）
- ✅ 图表数据（categories + series）
- ✅ 饼图数据（name + value数组）
- ✅ 仪表盘数据（单一value）
- ✅ 散点图数据（二维坐标数组）

## 📡 内置API接口

### 表格数据接口
1. **用户列表** - GET `/api/users`
2. **订单列表** - POST `/api/orders`

### 图表数据接口
3. **销售数据** - POST `/api/sales`
4. **月度趋势** - GET `/api/trends`

### 饼图数据接口
5. **用户分布** - GET `/api/user-distribution`
6. **产品销售占比** - POST `/api/product-sales`

### 仪表盘接口
7. **CPU使用率** - GET `/api/cpu`
8. **内存使用率** - GET `/api/memory`

### 其他图表接口
9. **身高体重分布** - GET `/api/height-weight`（散点图）
10. **转化漏斗** - GET `/api/funnel`（漏斗图）

## 🚀 使用方式

### 快速启动
```bash
cd mock-server
npm install
npm start
```

### 访问地址
- 🌐 服务器：`http://localhost:3001`
- 🎨 管理界面：`http://localhost:3001/index.html`

### 在Report Designer中使用
1. 启动Mock Server
2. 创建表格/图表组件
3. 配置API数据源（地址：`http://localhost:3001/api/...`）
4. 测试联动功能

## 🎨 特色功能

### 1. 参数回显
所有API响应都包含接收到的参数，方便调试：
```json
{
  "success": true,
  "data": {...},
  "params": {
    "query": {...},
    "body": {...}
  }
}
```

### 2. 请求日志
控制台输出详细的请求信息：
```
[2024-01-16T10:30:00.000Z] POST /api/sales
  Body: {"startDate":"2024-01-01"}
[Endpoint] 销售数据
  Received params: {...}
```

### 3. 延迟模拟
可配置响应延迟，模拟真实网络环境：
- 正常速度：500ms
- 快速网络：200ms
- 慢速网络：2000ms

### 4. 接口测试
管理界面提供一键测试功能：
- 点击"测试"按钮
- 自动发送请求
- 显示响应数据

## 📝 配置说明

### 全局配置
```json
{
  "globalSettings": {
    "defaultDelay": 500,        // 默认延迟（毫秒）
    "enableLog": true,           // 启用日志
    "enableErrorSimulation": false  // 错误模拟
  }
}
```

### 接口配置
```json
{
  "id": "table-1",           // 唯一标识
  "name": "用户列表",        // 接口名称
  "path": "/api/users",      // 接口路径
  "method": "GET",          // 请求方法
  "delay": 500,             // 响应延迟
  "enabled": true,          // 是否启用
  "responseType": "table",  // 响应类型
  "data": {...}             // 响应数据
}
```

## 🧪 测试方法

### 运行测试脚本
```bash
npm test
```

### 手动测试
```bash
# 测试用户列表接口
curl http://localhost:3001/api/users

# 测试销售数据接口
curl -X POST http://localhost:3001/api/sales \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2024-01-01"}'
```

## 🔧 开发相关

### 依赖包
- `express` - Web服务器框架
- `cors` - 跨域支持
- `body-parser` - 请求体解析
- `nodemon` - 开发模式自动重启

### 启动模式
- 生产模式：`npm start`
- 开发模式：`npm run dev`（支持热重载）

### 环境变量
- `PORT` - 服务器端口（默认3001）

## 💡 使用技巧

### 1. 调试联动功能
- 在表单中输入数据
- 点击查询按钮
- 在Mock Server控制台查看接收到的参数
- 检查参数是否正确映射

### 2. 测试Loading状态
- 将接口延迟设置为2000ms
- 观察组件的loading动画
- 测试错误重试功能

### 3. 模拟错误场景
- 禁用接口
- 输入错误的API地址
- 测试前端的错误处理

### 4. 数据格式转换
使用请求拦截器转换数据：
```javascript
// 在Report Designer的属性面板中配置
async function intercept(config, linkageParams) {
  const body = JSON.parse(config.body);
  // 转换数据格式
  body.startDate = body.date + ' 00:00:00';
  config.body = JSON.stringify(body);
  return config;
}
```

## 📊 与Report Designer集成

### 支持的组件
- ✅ 表格组件
- ✅ 柱状图组件
- ✅ 折线图组件
- ✅ 饼图组件
- ✅ 散点图组件
- ✅ 仪表盘组件
- ✅ 漏斗图组件

### 联动功能
- ✅ 表单 → 表格（参数传递）
- ✅ 表单 → 图表（动态刷新）
- ✅ 图表 → 图表（联动筛选）
- ✅ 多对多联动（一个源触发多个目标）

## 🎓 学习资源

### 查看文档
- 完整文档：`README.md`
- 快速开始：`QUICK_START.md`

### 示例接口
访问 `http://localhost:3001/index.html` 查看所有内置接口

### 测试数据
所有接口都包含真实的模拟数据，可以直接使用

## 🔄 后续扩展

可以添加的功能：
- 数据库集成（SQLite/MySQL）
- 用户认证（JWT）
- WebSocket支持
- 数据导入/导出
- 接口文档生成（Swagger）
- Mock数据生成器

## 📞 技术支持

遇到问题时：
1. 查看控制台日志
2. 检查接口配置
3. 使用管理界面测试接口
4. 查阅README文档

## ✨ 总结

这个Mock Server是一个完整的API调试工具，特别适合用于：
- Report Designer的前端开发
- API接口原型设计
- 联动功能测试
- 数据可视化调试

简单易用，功能完整，是Report Designer的完美搭档！🚀
