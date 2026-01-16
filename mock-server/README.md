# Mock Server - Report Designer API调试服务器

简易的后端服务，提供可配置的模拟API接口，用于Report Designer的前端调试。

## ✨ 功能特性

- 📝 **可视化配置界面** - 通过Web界面管理API接口
- 🔄 **动态接口注册** - 支持添加、删除、启用/禁用接口
- 📊 **多种数据格式** - 支持表格、图表（柱状图、折线图、饼图）、仪表盘等
- ⏱ **延迟模拟** - 可配置响应延迟，模拟真实网络环境
- 🎛 **参数回显** - 在响应中返回接收到的参数，方便调试
- 📜 **请求日志** - 控制台输出详细的请求日志
- 🧪 **接口测试** - 一键测试接口是否正常工作

## 🚀 快速开始

### 1. 安装依赖

```bash
cd mock-server
npm install
```

### 2. 启动服务器

**生产模式**：
```bash
npm start
```

**开发模式**（自动重启）：
```bash
npm run dev
```

### 3. 访问管理界面

打开浏览器访问：`http://localhost:3001/index.html`

## 📡 内置API接口

服务器启动后，默认提供以下API接口：

### 1. 用户列表（GET）
```bash
GET http://localhost:3001/api/users
```
**响应数据**：
```json
{
  "success": true,
  "data": {
    "columns": ["id", "name", "email", "role", "status"],
    "rows": [
      { "id": 1, "name": "用户1", "email": "user1@example.com", "role": "管理员", "status": "激活" },
      { "id": 2, "name": "用户2", "email": "user2@example.com", "role": "普通用户", "status": "禁用" }
    ]
  }
}
```

### 2. 销售数据（POST）
```bash
POST http://localhost:3001/api/sales
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```
**响应数据**：
```json
{
  "success": true,
  "data": {
    "categories": ["一月", "二月", "三月", "四月", "五月", "六月"],
    "series": [
      { "name": "销售额", "data": [120, 200, 150, 180, 220, 280] },
      { "name": "利润", "data": [40, 80, 50, 60, 90, 120] }
    ]
  },
  "params": {
    "body": { "startDate": "2024-01-01", "endDate": "2024-12-31" }
  }
}
```

### 3. 用户分布（GET）
```bash
GET http://localhost:3001/api/user-distribution
```
**响应数据**：
```json
{
  "success": true,
  "data": [
    { "name": "北京", "value": 335 },
    { "name": "上海", "value": 310 },
    { "name": "广州", "value": 234 }
  ]
}
```

### 4. CPU使用率（GET）
```bash
GET http://localhost:3001/api/cpu
```
**响应数据**：
```json
{
  "success": true,
  "data": {
    "value": 75
  }
}
```

## 🎯 在Report Designer中使用

### 配置表格组件数据源

1. 创建一个表格组件
2. 在属性面板中，数据源类型选择 "API 接口"
3. API 地址填写：`http://localhost:3001/api/users`
4. 请求方法选择：`GET`
5. 点击保存

### 配置图表组件数据源

1. 创建一个柱状图/折线图组件
2. 在属性面板中，数据源类型选择 "API 接口"
3. API 地址填写：`http://localhost:3001/api/sales`
4. 请求方法选择：`POST`
5. 点击保存

### 测试联动功能

1. 创建一个表单组件，添加"日期范围"选择器
2. 创建一个表格组件，配置API数据源
3. 在"联动配置"中设置表单→表格的联动关系
4. 参数映射：表单的日期字段 → 表格API的startDate/endDate参数
5. 点击表单的查询按钮，观察表格是否自动刷新

## 🛠️ 管理界面功能

### 查看接口列表
- 显示所有已配置的API接口
- 包含接口名称、路径、方法、延迟等信息
- 区分启用/禁用状态

### 添加新接口
1. 点击"添加新接口"按钮
2. 填写接口信息：
   - 接口名称（如：订单列表）
   - 接口路径（如：/api/orders）
   - 请求方法（GET/POST）
   - 响应类型（表格/图表/饼图/仪表盘）
   - 响应延迟（0-10000ms）
   - 响应数据（JSON格式）
3. 点击"保存"

### 测试接口
- 点击"测试"按钮
- 自动发送请求到接口
- 弹窗显示响应数据

### 启用/禁用接口
- 点击"启用/禁用"按钮切换接口状态
- 禁用的接口不会响应请求

### 删除接口
- 点击"删除"按钮移除接口
- 需要确认操作

### 全局设置
- **启用请求日志**：在控制台输出所有请求的详细信息
- **默认延迟**：新接口的默认响应延迟时间

## 📝 配置文件

接口配置保存在 `data/api-config.json`：

```json
{
  "endpoints": [
    {
      "id": "table-1",
      "name": "用户列表",
      "path": "/api/users",
      "method": "GET",
      "delay": 500,
      "enabled": true,
      "responseType": "table",
      "data": {
        "columns": ["id", "name"],
        "rows": [...]
      }
    }
  ],
  "globalSettings": {
    "defaultDelay": 500,
    "enableLog": true,
    "enableErrorSimulation": false
  }
}
```

## 🔍 请求日志示例

控制台会输出详细的请求日志：

```
[2024-01-16T10:30:00.000Z] POST /api/sales
  Body: {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
[Endpoint] 销售数据
  Received params: {
    query: {},
    body: { startDate: '2024-01-01', endDate: '2024-12-31' }
  }
```

## 📦 数据格式说明

### 表格数据格式
```json
{
  "columns": ["id", "name", "email"],
  "rows": [
    { "id": 1, "name": "张三", "email": "zhangsan@example.com" },
    { "id": 2, "name": "李四", "email": "lisi@example.com" }
  ]
}
```

### 图表数据格式（柱状图、折线图、散点图）
```json
{
  "categories": ["一月", "二月", "三月"],
  "series": [
    { "name": "销售额", "data": [120, 200, 150] },
    { "name": "利润", "data": [40, 80, 50] }
  ]
}
```

### 饼图数据格式
```json
[
  { "name": "北京", "value": 335 },
  { "name": "上海", "value": 310 },
  { "name": "广州", "value": 234 }
]
```

### 仪表盘数据格式
```json
{
  "value": 75
}
```

## 🎨 自定义接口示例

### 创建一个带参数的接口

```json
{
  "name": "订单查询",
  "path": "/api/orders",
  "method": "POST",
  "delay": 800,
  "responseType": "table",
  "data": {
    "columns": ["orderId", "customer", "amount", "status"],
    "rows": []
  }
}
```

在Report Designer中配置联动参数后，接口会接收并返回参数：

**请求**：
```json
{
  "status": "pending",
  "startDate": "2024-01-01"
}
```

**响应**：
```json
{
  "success": true,
  "data": { ... },
  "params": {
    "body": { "status": "pending", "startDate": "2024-01-01" }
  }
}
```

## ⚠️ 注意事项

1. **端口冲突**：如果3001端口被占用，可以通过环境变量修改：
   ```bash
   PORT=3002 npm start
   ```

2. **CORS问题**：服务器已启用CORS，支持跨域请求

3. **数据持久化**：接口配置保存在文件中，重启服务器后不会丢失

4. **实时生效**：修改配置后需要重启服务器才能生效

## 🐛 常见问题

**Q: 接口请求失败？**
A: 检查接口是否启用，路径是否正确，查看服务器控制台日志。

**Q: 修改配置后不生效？**
A: 配置修改后需要重启服务器，使用 `npm run dev` 可以自动重启。

**Q: 如何测试联动参数？**
A: 在Report Designer中配置联动，然后在管理界面点击"测试"按钮，查看响应中的params字段。

## 📄 许可证

MIT
