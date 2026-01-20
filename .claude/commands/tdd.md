# Test Driven Development Command

使用 TDD 原则指导开发，强制 Red-Green-Refactor 循环。

## 使用方法

```bash
@tdd
```

## TDD 流程

### 1. Red（编写失败的测试）
```bash
@tdd "为用户登录功能编写测试"
```
- 生成测试用例
- 测试应该失败
- 验证测试覆盖率

### 2. Green（编写最小实现）
```bash
@tdd "实现用户登录功能"
```
- 编写最少代码使测试通过
- 不考虑代码优化
- 只关注功能正确性

### 3. Refactor（重构优化）
```bash
@tdd "重构登录代码"
```
- 优化代码结构
- 消除重复代码
- 提高代码质量
- 确保测试仍然通过

## 支持的测试框架

- Jest (JavaScript/TypeScript)
- Vitest (JavaScript/TypeScript)
- pytest (Python)
- JUnit (Java)
- RSpec (Ruby)

## 最佳实践

1. **测试命名**
   ```typescript
   describe('UserService', () => {
     describe('login', () => {
       it('should throw error when credentials are invalid', () => {
         // 测试代码
       });
     });
   });
   ```

2. **AAA 模式**
   ```typescript
   it('should return user when credentials are valid', () => {
     // Arrange（准备）
     const credentials = { username: 'test', password: 'test123' };

     // Act（执行）
     const user = userService.login(credentials);

     // Assert（断言）
     expect(user).toBeDefined();
     expect(user.username).toBe('test');
   });
   ```

3. **Mock 外部依赖**
   ```typescript
   jest.mock('./api-client');

   it('should fetch user data', async () => {
     const mockData = { id: 1, name: 'Test' };
     apiClient.get.mockResolvedValue(mockData);

     const user = await userService.getUser(1);
     expect(user).toEqual(mockData);
   });
   ```

## 检查清单

在完成开发后，验证：
- [ ] 所有测试通过
- [ ] 测试覆盖率 > 80%
- [ ] 没有测试警告
- [ ] 代码已重构
- [ ] 文档已更新

## Git 工作流集成

```bash
# 1. 创建功能分支
git checkout -b feature/user-login

# 2. 先写测试
@tdd "编写登录测试"

# 3. 实现功能
@tdd "实现登录"

# 4. 重构代码
@tdd "重构登录代码"

# 5. 运行所有测试
npm test

# 6. 提交代码
git add .
git commit -m "feat(user): add login feature with TDD"

# 7. 合并到主分支
git checkout main
git merge feature/user-login
```
