# Dashboard Clean Energy 重新设计 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Dashboard 从科技蓝主题重新设计为 Clean Energy 主题，移除顶部 header，优化左侧导航栏样式，实现 4 个指标卡片横向排列。

**Architecture:**
- 移除 MainLayout 的 Header 组件，简化布局结构
- 更新 MainLayout 侧边栏样式为 Clean Energy 主题（森林绿、铜金色）
- 更新 Dashboard 指标卡片颜色映射
- 在 index.css 中添加 Clean Energy 布局样式

**Tech Stack:** React, TypeScript, Ant Design, Tailwind CSS

---

## Chunk 1: CSS 样式更新

### Task 1: 更新 index.css 添加 Clean Energy 布局样式

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: 添加 Clean Energy 布局 CSS 样式**

在 `index.css` 文件末尾（`.font-sans` 之后）添加以下样式：

```css
/* =========================================
   Clean Energy Theme - Main Layout
   ========================================= */
.layout-clean-energy {
  background: var(--login-bg-primary);
}

.layout-clean-energy .ant-layout-sider {
  border-right: 1px solid var(--login-border);
}

.layout-clean-energy .ant-menu-item-selected {
  background: rgba(45, 90, 61, 0.08) !important;
  color: var(--login-primary) !important;
}

.layout-clean-energy .ant-menu-item-selected .anticon {
  color: var(--login-primary) !important;
}

.layout-clean-energy .ant-menu-item:hover {
  background: rgba(45, 90, 61, 0.04);
}

/* 侧边栏 Logo 样式 */
.sidebar-logo-green {
  background: linear-gradient(135deg, var(--login-primary) 0%, var(--login-primary-hover) 100%);
}

/* 用户头像 - 森林绿 */
.avatar-green {
  background: var(--login-primary) !important;
}

/* 侧边栏文字优化 */
.sidebar-text-primary {
  font-family: 'Source Sans 3', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.3px;
  color: var(--login-text-primary);
}

.sidebar-text-secondary {
  font-family: 'Source Sans 3', 'Microsoft YaHei', sans-serif;
  font-size: 12px;
  color: var(--login-text-secondary);
}
```

- [ ] **Step 2: 更新全局背景为 Clean Energy 主题**

修改 `body` 的背景色：
```css
body {
  background-color: var(--login-bg-primary); /* 从 #f5f5f5 改为 #f8f6f1 */
}
```

- [ ] **Step 3: 提交**

```bash
git add src/index.css
git commit -m "style: add Clean Energy theme styles for main layout"
```

---

## Chunk 2: MainLayout 重构

### Task 2: 移除 Header 组件并更新侧边栏样式

**Files:**
- Modify: `src/components/layout/MainLayout.tsx`

- [ ] **Step 1: 移除 Header 组件**

删除整个 `<Header>` 组件（约第 122-168 行），包括：
- 折叠按钮
- 面包屑导航
- 系统状态显示
- 用户下拉菜单

- [ ] **Step 2: 简化 Layout 结构**

将布局从：
```tsx
<Layout className="min-h-screen bg-[#f5f7fa]">
  <Sider ...>...</Sider>
  <Layout>
    <Header ...>...</Header>
    <Content className="p-6">...</Content>
  </Layout>
</Layout>
```

改为：
```tsx
<Layout className="min-h-screen layout-clean-energy">
  <Sider ...>...</Sider>
  <Content className="p-6 mt-0">{children}</Content>
</Layout>
```

- [ ] **Step 3: 更新 Sider 样式**

修改 Sider 的 className 和 style：
```tsx
<Sider
  trigger={null}
  collapsible
  collapsed={collapsed}
  breakpoint="lg"
  collapsedWidth="80"
  width="220"
  onBreakpoint={(broken) => setCollapsed(broken)}
  className="shadow-sm border-r border-gray-100 layout-clean-energy"
  style={{ background: '#ffffff' }}
>
```

- [ ] **Step 4: 更新 Logo 样式为森林绿**

修改 Logo 图标背景：
```tsx
<div className="w-8 h-8 rounded-lg sidebar-logo-green flex items-center justify-center">
  <ThunderboltOutlined className="text-white text-base" />
</div>
```

- [ ] **Step 5: 更新用户头像样式**

将蓝色头像改为森林绿：
```tsx
<Avatar icon={<UserOutlined />} size="small" className="avatar-green" />
```

- [ ] **Step 6: 优化侧边栏文字样式**

更新底部用户信息的文字类名：
```tsx
<Text className="text-xs sidebar-text-primary truncate">{email || user?.email}</Text>
<Text className="text-[10px] sidebar-text-secondary">在线监控</Text>
```

- [ ] **Step 7: 移除未使用的导入**

删除不再使用的导入：
- `Button` from antd
- `Badge` from anttd（如果只用于告警菜单项则保留）
- `MenuFoldOutlined`, `MenuUnfoldOutlined`（如果不再使用）

- [ ] **Step 8: 提交**

```bash
git add src/components/layout/MainLayout.tsx
git commit -m "feat: remove header and apply Clean Energy theme to sidebar"
```

---

## Chunk 3: Dashboard 卡片样式更新

### Task 3: 更新 Dashboard 指标卡片为 Clean Energy 主题

**Files:**
- Modify: `src/pages/Dashboard/Dashboard.tsx`

- [ ] **Step 1: 更新设备总数卡片颜色**

```tsx
<StatCard
  title="设备总数"
  value={stats.total}
  suffix="台"
  icon={<ThunderboltOutlined className="text-lg" />}
  color="#2d5a3d"  // 森林绿
/>
```

- [ ] **Step 2: 更新在线设备卡片颜色**

```tsx
<StatCard
  title="在线设备"
  value={stats.online}
  suffix="台"
  icon={<WifiOutlined className="text-lg" />}
  color="#4d8f5d"  // 浅绿
/>
```

- [ ] **Step 3: 更新活跃告警卡片颜色**

```tsx
<StatCard
  title="活跃告警"
  value={stats.activeAlerts}
  suffix="条"
  icon={<BellOutlined className="text-lg" />}
  color="#c9a959"  // 铜金
/>
```

- [ ] **Step 4: 更新系统健康度卡片颜色**

```tsx
<StatCard
  title="系统健康度"
  value={stats.health}
  suffix="%"
  icon={<DashboardOutlined className="text-lg" />}
  color="#2d5a3d"  // 森林绿
/>
```

- [ ] **Step 5: 验证网格布局**

确认卡片容器使用正确的 grid 类：
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

- [ ] **Step 6: 提交**

```bash
git add src/pages/Dashboard/Dashboard.tsx
git commit -m "style: update dashboard stat cards with Clean Energy colors"
```

---

## 验证清单

完成所有任务后，进行以下验证：

- [ ] 启动开发服务器：`npm run dev`
- [ ] 访问 `/dashboard` 页面
- [ ] 验证 4 个指标卡片横向排列（非垂直堆叠）
- [ ] 验证无顶部深色 header
- [ ] 验证左侧导航栏样式美观（字体、间距、颜色）
- [ ] 验证整体 Clean Energy 主题一致性

## 回滚方案

如需回滚：
```bash
git revert HEAD~3..HEAD
```
