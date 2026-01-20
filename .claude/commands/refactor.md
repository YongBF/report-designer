# Refactor Command

智能重构代码，提升可读性、可维护性和性能。

## 使用方法

### 重构当前文件
```bash
@refactor
```

### 重构特定文件
```bash
@refactor src/components/UserList.vue
```

### 重构特定函数
```bash
@refactor src/utils/helpers.ts:calculateTotal
```

### 应用特定模式
```bash
@refactor --pattern=extract-function
@refactor --pattern=remove-duplication
@refactor --pattern=simplify-conditions
```

## 重构模式

### 1. 提取函数 (Extract Function)
将大函数拆分为多个小函数

```typescript
// Before
function processUser(user: User) {
  // 50 lines of validation
  // 30 lines of transformation
  // 20 lines of saving
}

// After
function processUser(user: User) {
  validateUser(user);
  const transformed = transformUser(user);
  saveUser(transformed);
}
```

### 2. 提取类 (Extract Class)
将承担多重职责的类拆分

```typescript
// Before
class User {
  personalInfo: PersonalInfo;
  workInfo: WorkInfo;
  validatePersonal() {}
  validateWork() {}
  savePersonal() {}
  saveWork() {}
}

// After
class User {
  personal: PersonalProfile;
  work: WorkProfile;
}

class PersonalProfile {
  info: PersonalInfo;
  validate() {}
  save() {}
}
```

### 3. 引入参数对象 (Introduce Parameter Object)
减少参数数量

```typescript
// Before
function createUser(
  name: string,
  email: string,
  age: number,
  address: string,
  phone: string
) {}

// After
interface UserConfig {
  name: string;
  email: string;
  age: number;
  address: string;
  phone: string;
}

function createUser(config: UserConfig) {}
```

### 4. 替换魔法数字 (Replace Magic Number)
使用常量提高可读性

```typescript
// Before
if (user.age > 65) {
  applySeniorDiscount();
}

// After
const SENIOR_AGE_THRESHOLD = 65;

if (user.age > SENIOR_AGE_THRESHOLD) {
  applySeniorDiscount();
}
```

### 5. 简化条件表达式 (Simplify Conditional)
使用卫语句或策略模式

```typescript
// Before
function processOrder(order: Order) {
  if (order) {
    if (order.items && order.items.length > 0) {
      if (order.payment) {
        // process order
      }
    }
  }
}

// After - 使用卫语句
function processOrder(order: Order) {
  if (!order) return;
  if (!order.items?.length) return;
  if (!order.payment) return;

  // process order
}

// Or - 使用策略模式
interface OrderProcessor {
  canProcess(order: Order): boolean;
  process(order: Order): void;
}

class ValidOrderProcessor implements OrderProcessor {
  canProcess(order: Order) {
    return !!order && !!order.items?.length && !!order.payment;
  }

  process(order: Order) {
    // process order
  }
}
```

### 6. 移除重复代码 (Remove Duplication)
遵循 DRY 原则

```typescript
// Before
class UserService {
  async getUser(id: string) {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Failed');
    return response.json();
  }

  async getOrders(userId: string) {
    const response = await fetch(`/api/users/${userId}/orders`);
    if (!response.ok) throw new Error('Failed');
    return response.json();
  }
}

// After
class ApiService {
  protected async fetch(url: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed');
    return response.json();
  }
}

class UserService extends ApiService {
  async getUser(id: string) {
    return this.fetch(`/api/users/${id}`);
  }

  async getOrders(userId: string) {
    return this.fetch(`/api/users/${userId}/orders`);
  }
}
```

## 重构检查清单

重构前确认：
- [ ] 是否有单元测试覆盖？
- [ ] 是否已备份当前代码？
- [ ] 是否在功能分支上工作？
- [ ] 是否理解当前代码逻辑？

重构过程：
- [ ] 小步迭代，每次一个改动
- [ ] 每次改动后运行测试
- [ ] 保持代码功能不变
- [ ] 不添加新功能

重构后验证：
- [ ] 所有测试通过
- [ ] 功能验证正常
- [ ] 性能没有退化
- [ ] 代码已提交

## 输出示例

```markdown
# 重构建议: src/components/UserList.vue

## 问题分析
1. **高圈复杂度**: 组件有 15 个嵌套条件
2. **大函数**: `fetchUsers` 函数有 120 行
3. **重复代码**: 过滤逻辑重复 3 次

## 重构方案

### 方案 1: 提取 Composables
\`\`\`typescript
// Before
const fetchUsers = async () => {
  // 120 lines
};

// After
// composables/useUserFetch.ts
export function useUserFetch() {
  const users = ref<User[]>([]);

  const fetchUsers = async () => {
    const data = await api.getUsers();
    users.value = data;
  };

  return { users, fetchUsers };
}

// In component
const { users, fetchUsers } = useUserFetch();
\`\`\`

### 方案 2: 提取过滤逻辑
\`\`\`typescript
// Before
const activeUsers = users.filter(u => u.status === 'active' && u.verified);
const premiumUsers = users.filter(u => u.status === 'active' && u.verified && u.plan === 'premium');

// After
interface UserFilter {
  status: 'active' | 'inactive';
  verified: boolean;
  plan?: string;
}

function filterUsers(users: User[], filter: UserFilter) {
  return users.filter(user => {
    if (filter.status && user.status !== filter.status) return false;
    if (filter.verified && !user.verified) return false;
    if (filter.plan && user.plan !== filter.plan) return false;
    return true;
  });
}

const activeUsers = filterUsers(users, { status: 'active', verified: true });
const premiumUsers = filterUsers(users, { status: 'active', verified: true, plan: 'premium' });
\`\`\`

## 改进效果
- 圈复杂度: 15 → 5
- 函数长度: 120 行 → 30 行
- 代码重复: 3 处 → 0 处
```

## 注意事项
- 重构不应该改变外部行为
- 保持测试始终通过
- 优先重构高复杂度代码
- 记录重构原因和过程
