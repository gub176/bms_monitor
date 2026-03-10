# Dashboard Clean Energy 重新设计

## 概述

将 Dashboard 从科技蓝主题重新设计为 Clean Energy 主题，与登录页面保持一致的视觉风格。

## 设计目标

1. **4 个指标卡片横向排列** - 顶部一排显示，不垂直堆叠
2. **移除顶部深色 header** - 页面从白色背景开始，更简洁
3. **左侧导航栏美化** - 优化字体、间距、颜色，采用 Clean Energy 主题
4. **统一 Clean Energy 主题** - 森林绿主色、铜金强调色、米白背景

## 布局结构

```
┌─────────────────────────────────────────────────────────────┐
│  [侧边栏]  │  设备总数  在线设备  活跃告警  系统健康度       │  ← 卡片横向排列
│            ├────────────────────────────────────────────────┤
│  BMS 监控   │  设备列表                                     │
│            │  ┌───────────────────────────────────────────┐ │
│  仪表盘    │  │ 表格内容                                   │ │
│  告警中心  │  │                                           │ │
│            │  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 主题色系

### Clean Energy 主题变量

| 用途 | 变量名 | 值 |
|------|--------|-----|
| 主背景 | `--login-bg-primary` | `#f8f6f1` (米白) |
| 主色调 | `--login-primary` | `#2d5a3d` (森林绿) |
| 主色悬停 | `--login-primary-hover` | `#3d6f4d` |
| 强调色 | `--login-accent` | `#c9a959` (铜金) |
| 文字主色 | `--login-text-primary` | `#1a1a1a` |
| 文字次要 | `--login-text-secondary` | `#5a5a5a` |
| 边框色 | `--login-border` | `#d4cfc7` |

## 具体改动

### 1. MainLayout.tsx

**移除顶部 Header**
- 删除 `<Header>` 组件及其所有内容
- 布局从 `<Sider>` + 直接 `<Content>` 组成

**侧边栏样式更新**
- 背景色：`#ffffff` → 保持白色，但优化边框色为 `--login-border`
- Logo 图标：蓝色 `#1890ff` → 森林绿 `#2d5a3d`
- 选中菜单项：蓝色高亮 → 森林绿高亮
- 用户头像：蓝色 `#1890ff` → 森林绿 `#2d5a3d`
- 文字优化：
  - 增加字间距 `letter-spacing: 0.3px`
  - 优化行高和 padding
  - 选中项文字加粗 `font-weight: 600`

### 2. Dashboard.tsx

**指标卡片布局**
- 保持 `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- 确保 4 个卡片在同一行显示

**卡片样式更新为 Clean Energy 主题**
- 图标背景：`#1890ff15` → `#2d5a3d15` (森林绿)
- 颜色映射：
  - 设备总数：`#1890ff` → `#2d5a3d` (森林绿)
  - 在线设备：`#52c41a` → `#4d8f5d` (浅绿)
  - 活跃告警：`#faad14` → `#c9a959` (铜金)
  - 系统健康度：`#13c2c2` → `#2d5a3d` (森林绿)

### 3. index.css

**新增 Clean Energy 布局样式**
```css
/* Clean Energy Theme - Main Layout */
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
```

## 实现清单

- [ ] 修改 `index.css` - 添加 Clean Energy 布局样式
- [ ] 修改 `MainLayout.tsx` - 移除 Header，更新侧边栏样式
- [ ] 修改 `Dashboard.tsx` - 更新卡片颜色为 Clean Energy 主题
- [ ] 验证 4 个卡片横向排列
- [ ] 验证整体视觉效果

## 成功标准

1. 4 个指标卡片在顶部横向一排显示
2. 无顶部深色 header，页面从白色背景开始
3. 左侧导航栏文字清晰美观，间距合理
4. 整体采用 Clean Energy 主题，与登录页面风格一致
