# Commit Command

智能创建 Git 提交，自动生成符合规范的提交信息。

## 使用方法

```bash
@commit
```

## 功能特性

1. **自动分析修改内容**
   - 查看 staged 文件
   - 分析 diff 内容
   - 识别修改类型

2. **生成提交信息**
   - 使用约定式提交格式
   - 自动选择合适的类型
   - 生成简洁的描述
   - 包含 Co-Authored-By 标记

3. **提交类型识别**
   - `feat`: 新功能
   - `fix`: Bug 修复
   - `docs`: 文档更新
   - `style`: 代码格式（不影响功能）
   - `refactor`: 重构
   - `test`: 测试相关
   - `chore`: 构建过程或工具变动
   - `perf`: 性能优化
   - `ci`: CI 配置
   - `build`: 构建系统
   - `revert`: 回滚

4. **执行流程**
   ```bash
   # 1. 查看 git status
   git status

   # 2. 查看 git diff --staged
   git diff --staged

   # 3. 生成提交信息
   # [自动生成]

   # 4. 执行提交
   git commit -m "<commit-message>"

   # 5. 推送到远程
   git push
   ```

## 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 示例

```
feat(canvas-panel): 修复 Ref 绑定问题

- 使用本地 ref + watch + emit 传递 DOM 元素
- 移除 canvasRefProp prop
- 添加 canvas-ref-ready 事件

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## 注意事项

- 如果没有 staged 文件，提示用户先使用 `git add`
- 提交信息不超过 50 字（中文）
- 不使用 emoji
- 自动推送到远程仓库
