# BMS 监控系统

> 智慧能源 · 绿色未来 — 电池管理系统实时监控平台

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.3.1-646cff.svg)](https://vite.dev)
[![Ant Design](https://img.shields.io/badge/Ant_Design-6.3.1-1890ff.svg)](https://ant.design)

## 📖 项目简介

BMS 监控系统是一个面向企业级用户的电池管理系统（Battery Management System）监控平台，提供实时的设备状态监控、告警管理、数据分析等功能。

### 核心功能

- 📊 **实时仪表盘** — 设备总数、在线状态、活跃告警、系统健康度一目了然
- 🔔 **告警中心** — 活动告警与历史记录分离，支持筛选、搜索、批量操作
- 🔋 **设备详情** — 电芯电压、温度、SOC/SOH 实时监控
- 🔐 **用户认证** — 基于 Supabase 的安全登录会话管理

## 🚀 技术栈

| 类别 | 技术 |
|------|------|
| **前端框架** | React 19.2 + TypeScript |
| **构建工具** | Vite 7.3 |
| **UI 组件库** | Ant Design 6.3 |
| **样式方案** | Tailwind CSS 4 + 自定义 CSS 变量 |
| **状态管理** | Zustand |
| **路由管理** | React Router v7 |
| **后端服务** | Supabase (Auth + Realtime) |
| **数据可视化** | @ant-design/charts |

## 📦 快速开始

### 环境要求

- Node.js >= 18
- npm / yarn / pnpm
- Supabase 账号（用于后端服务）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/gub176/bms_monitor.git
   cd bms_monitor
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   
   复制 `.env.example` 为 `.env` 并填写配置：
   ```bash
   cp .env.example .env
   ```
   
   编辑 `.env` 文件：
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```
   
   访问 http://localhost:5173

## 📁 项目结构

```
bms_monitor/
├── src/
│   ├── components/         # 可复用组件
│   │   ├── alerts/         # 告警相关组件
│   │   ├── charts/         # 图表组件
│   │   ├── device/         # 设备相关组件
│   │   └── layout/         # 布局组件
│   ├── hooks/              # 自定义 Hooks
│   ├── pages/              # 页面组件
│   │   ├── Dashboard/      # 仪表盘
│   │   ├── Alerts/         # 告警中心
│   │   ├── DeviceDetail/   # 设备详情
│   │   └── Login/          # 登录页
│   ├── stores/             # Zustand 状态管理
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   ├── lib/                # 第三方库配置
│   ├── App.tsx             # 应用入口
│   └── main.tsx            # React 入口
├── .env.example            # 环境变量示例
├── index.html              # HTML 模板
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript 配置
└── vite.config.ts          # Vite 配置
```

## 🔧 可用命令

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器（端口 5173） |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | ESLint 代码检查 |

## 🎨 设计特点

- **企业级视觉风格** — 森林绿主题配色，专业稳重
- **响应式布局** — 适配桌面、平板、移动端
- **无障碍支持** — ARIA 标签、键盘导航、焦点管理
- **暗色模式兼容** — CSS 变量设计系统支持主题切换

## 📸 功能预览

| 仪表盘 | 告警中心 |
|--------|----------|
| 实时监控设备状态 | 活动告警与历史记录 |

| 设备详情 | 登录页面 |
|----------|----------|
| 电芯数据详细展示 | 安全认证登录 |

## 🔒 安全性

- ✅ 基于 Supabase JWT 身份验证
- ✅ 敏感路由受 ProtectedRoute 保护
- ✅ 邮箱地址前端脱敏显示
- ✅ HTTPS 强制（生产环境）

## 📝 开发说明

### 添加新页面

1. 在 `src/pages/` 下创建新页面组件
2. 在 `src/App.tsx` 中添加路由
3. 在 `MainLayout` 菜单中添加导航项

### 状态管理

项目使用 Zustand 进行状态管理，位于 `src/stores/`:

- `authStore.ts` — 用户认证状态
- `deviceStore.ts` — 设备数据
- `alertStore.ts` — 告警数据
- `telemetryStore.ts` — 遥测数据

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 开源协议

MIT License

## 📬 联系方式

- 项目地址：https://github.com/gub176/bms_monitor
- Issues：https://github.com/gub176/bms_monitor/issues

---

© 2026 BMS 监控系统。All rights reserved.
