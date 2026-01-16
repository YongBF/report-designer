# Pages 目录

## 说明

此目录用于存放页面级组件。

## 目录结构

```
pages/
├── home/
│   ├── components/      # 页面私有组件
│   ├── hooks/           # 页面私有 hooks
│   └── index.vue        # 页面主文件
└── user/
    └── ...
```

## 开发规范

1. 每个页面一个独立的文件夹
2. 页面组件命名为 `index.vue`
3. 页面私有组件放在 `components/` 子目录
4. 页面私有 hooks 放在 `hooks/` 子目录
5. 页面特定的类型定义可以在页面内定义
