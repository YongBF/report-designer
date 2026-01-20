# Documentation Generator Command

自动生成项目文档，包括 API 文档、使用指南和开发文档。

## 使用方法

### 生成整个项目的文档
```bash
@docs
```

### 为特定模块生成文档
```bash
@docs src/components/Button
```

### 生成 API 文档
```bash
@docs --type=api
```

### 生成使用指南
```bash
@docs --type=guide
```

## 支持的文档类型

### 1. 代码文档
- JSDoc/TSDoc (TypeScript/JavaScript)
- Javadoc (Java/TypeScript)
- Docstring (Python)
- KDoc (Kotlin)

### 2. API 文档
- OpenAPI/Swagger (REST API)
- GraphQL Schema
- gRPC Proto

### 3. 用户文档
- README.md
- CONTRIBUTING.md
- CHANGELOG.md
- ARCHITECTURE.md

## 文档生成流程

```bash
# 1. 分析项目结构
扫描项目目录结构

# 2. 识别文档源
查找 JSDoc、类型定义、配置文件

# 3. 生成文档内容
自动生成 Markdown 文档

# 4. 创建示例代码
提供实用的使用示例

# 5. 验证文档完整性
检查链接、代码示例、交叉引用
```

## 输出结构

```
docs/
├── api/
│   ├── components.md
│   ├── services.md
│   └── utils.md
├── guides/
│   ├── getting-started.md
│   ├── authentication.md
│   └── deployment.md
├── architecture/
│   ├── overview.md
│   ├── database.md
│   └── api-design.md
└── development/
    ├── setup.md
    ├── testing.md
    └── contributing.md
```

## 文档模板

### README.md 模板
```markdown
# [Project Name]

## 简介
[项目描述]

## 功能特性
- [Feature 1]
- [Feature 2]

## 快速开始

### 安装
\`\`\`bash
npm install
\`\`\`

### 使用
\`\`\`typescript
import { Module } from 'package';

const instance = new Module();
instance.doSomething();
\`\`\`

## 文档
- [API 文档](./docs/api)
- [使用指南](./docs/guides)
- [开发文档](./docs/development)

## 贡献
欢迎提交 PR！

## 许可证
MIT
```

### API 文档模板
```markdown
# [Module Name] API 文档

## 概述
[模块功能描述]

## Classes

### Class: Component

#### constructor(options)
创建组件实例。

**参数:**
- `options.id` (string) - 组件 ID
- `options.config` (object) - 配置对象

**示例:**
\`\`\`typescript
const component = new Component({
  id: 'my-component',
  config: { debug: true }
});
\`\`\`

## Functions

### helperFunction(param1, param2)
辅助函数说明。

**参数:**
- `param1` (string) - 参数1说明
- `param2` (number) - 参数2说明

**返回值:**
(boolean) - 返回值说明

**示例:**
\`\`\`typescript
const result = helperFunction('test', 123);
\`\`\`
```

## 最佳实践

1. **注释规范**
   ```typescript
   /**
    * 计算两个数的和
    * @param a - 第一个数
    * @param b - 第二个数
    * @returns 两数之和
    */
   function add(a: number, b: number): number {
     return a + b;
   }
   ```

2. **示例代码**
   - 提供可运行的完整示例
   - 包含常见使用场景
   - 展示最佳实践

3. **图表说明**
   - 架构图（使用 Mermaid）
   - 流程图
   - 时序图

4. **交叉引用**
   - 使用相对链接
   - 保持链接一致性
   - 定期检查链接有效性

## 维护建议

- 定期更新文档
- 与代码保持同步
- 收集用户反馈
- 版本化管理文档
