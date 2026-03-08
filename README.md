# BMS 监控系统前端

户用储能设备云端 BMS 前端应用（MVP）

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand
- **UI 组件**: Ant Design
- **样式**: TailwindCSS
- **路由**: React Router v6
- **后端服务**: Supabase (Auth + Database + Realtime)
- **图表**: Ant Design Charts

## 功能特性

- 用户认证（登录/注册）
- 设备绑定与管理
- 实时数据监控（通过 Supabase Realtime）
- 历史数据趋势图
- 告警中心

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入你的 Supabase 凭证：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

## 项目结构

```
src/
├── components/        # 可复用组件
│   ├── charts/       # 图表组件
│   ├── device/       # 设备相关组件
│   └── layout/       # 布局组件
├── hooks/            # 自定义 Hooks
├── lib/              # 第三方库配置
├── pages/            # 页面组件
│   ├── Alerts/       # 告警中心
│   ├── Dashboard/    # 仪表盘
│   ├── DeviceDetail/ # 设备详情
│   └── Login/        # 登录页
├── stores/           # Zustand 状态管理
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
└── App.tsx           # 应用入口
```

## 可用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 类型检查
npm run type-check

# 预览构建结果
npm run preview
```

## 数据库设置

在 Supabase SQL Editor 中运行 `supabase-schema.sql` 文件创建表结构和 RLS 策略：

1. 登录 Supabase 控制台
2. 进入 SQL Editor
3. 复制 `supabase-schema.sql` 的内容并运行

这将创建以下表：
- `devices` - 设备信息
- `user_devices` - 用户设备关联（支持设备绑定）
- `telemetry` - 遥测数据
- `status` - 设备状态
- `alerts` - 告警记录
- `remote_commands` - 远程命令（预留）

## 后续开发

- [ ] 遥控/遥调命令下发
- [ ] OTA 升级管理
- [ ] 告警通知（邮件/短信）
- [ ] 多语言支持

## 许可证

MIT
