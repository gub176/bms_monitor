# BMS 监控系统技术架构文档

> 版本：1.0  
> 日期：2026 年 5 月

---

## 1. 系统概述

BMS 监控系统是一个基于 Web 的电池管理系统监控平台，采用前后端分离架构，后端使用 Supabase 提供数据库、认证和实时订阅服务。

### 技术栈

| 层级 | 技术选型 |
|------|----------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 7 |
| 路由 | React Router DOM 7 |
| 状态管理 | Zustand 5 |
| UI 组件库 | Ant Design 6 |
| 图表组件 | @ant-design/charts |
| 后端服务 | Supabase (PostgreSQL + Realtime + Auth) |
| 样式方案 | Tailwind CSS 4 |

---

## 2. 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        浏览器客户端                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  路由层   │  │  状态层   │  │  UI 组件  │  │  工具函数   │  │
│  │ App.tsx  │  │ Zustand  │  │  Antd    │  │  formatters│  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      Supabase Client                        │
│              (认证、数据库查询、实时订阅)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase 云服务                         │
├──────────────┬──────────────┬──────────────────────────────┤
│   Auth       │  Database    │      Realtime                │
│  用户认证     │  PostgreSQL  │    WebSocket 订阅            │
└──────────────┴──────────────┴──────────────────────────────┘
```

---

## 3. 目录结构

```
src/
├── main.tsx                 # 应用入口
├── App.tsx                  # 根组件 + 路由配置
│
├── components/              # 可复用组件
│   ├── alerts/              # 告警相关组件
│   │   ├── AlertEmptyState.tsx
│   │   ├── AlertFilters.tsx
│   │   └── AlertSearch.tsx
│   ├── charts/              # 图表组件
│   │   ├── HistoryChart.tsx
│   │   └── index.ts
│   ├── device/              # 设备相关组件
│   │   ├── BindDeviceModal.tsx
│   │   ├── DeviceCard.tsx
│   │   ├── DeviceOverview.tsx
│   │   ├── StatCard.tsx
│   │   ├── StatusBadge.tsx
│   │   └── index.ts
│   └── layout/              # 布局组件
│       ├── MainLayout.tsx
│       ├── ProtectedRoute.tsx
│       └── index.ts
│
├── pages/                   # 页面组件
│   ├── Alerts/              # 告警中心页面
│   │   ├── Alerts.tsx
│   │   └── index.ts
│   ├── Dashboard/           # 仪表盘页面
│   │   ├── Dashboard.tsx
│   │   └── index.ts
│   ├── DeviceDetail/        # 设备详情页面
│   │   ├── DeviceDetail.tsx
│   │   └── index.ts
│   └── Login/               # 登录页面
│       ├── Login.tsx
│       ├── Login.css
│       └── index.ts
│
├── stores/                  # Zustand 状态管理
│   ├── alertStore.ts        # 告警状态
│   ├── authStore.ts         # 认证状态
│   ├── deviceStore.ts       # 设备状态
│   └── telemetryStore.ts    # 遥测数据状态
│
├── hooks/                   # 自定义 Hooks
│   ├── useAuth.ts           # 认证相关逻辑
│   └── useDevices.ts        # 设备相关逻辑
│
├── lib/                     # 库和客户端
│   └── supabaseClient.ts    # Supabase 客户端配置
│
├── types/                   # TypeScript 类型定义
│   └── database.ts          # 数据库表类型
│
├── utils/                   # 工具函数
│   ├── constants.ts         # 常量定义
│   ├── formatters.ts        # 数据格式化
│   └── export.ts            # 导出功能
│
├── constants/               # 常量配置
│   └── device.ts            # 设备相关常量
│
└── assets/                  # 静态资源
    └── react.svg
```

---

## 4. 核心模块设计

### 4.1 路由架构

应用使用 React Router 进行路由管理，核心路由如下：

| 路径 | 组件 | 权限要求 |
|------|------|----------|
| `/login` | Login | 公开 |
| `/` | Dashboard | 需要认证 |
| `/dashboard` | Dashboard | 需要认证 |
| `/device/:deviceId` | DeviceDetail | 需要认证 |
| `/alerts` | Alerts | 需要认证 |

所有需要认证的路由都包裹在 `ProtectedRoute` 组件中。

### 4.2 状态管理

系统使用 Zustand 作为状态管理方案，共维护 4 个核心 Store：

#### 4.2.1 authStore - 认证状态

```typescript
// 核心状态
interface AuthState {
  user: User | null
  loading: boolean
  initializeAuth: () => Promise<void>
  signIn: (email: string, password: string) => Promise<...>
  signOut: () => Promise<void>
}
```

**职责**：
- 用户登录/登出
- 会话管理
- 认证状态同步

#### 4.2.2 deviceStore - 设备状态

```typescript
// 核心状态
interface DeviceState {
  devices: Device[]
  currentDeviceId: string | null
  loading: boolean
  error: string | null
  activeAlertsCount: Record<string, number>
  fetchDevices: () => Promise<void>
  bindDevice: (deviceId: string) => Promise<...>
  unbindDevice: (deviceId: string) => Promise<...>
}
```

**职责**：
- 设备列表管理
- 设备绑定/解绑
- 设备告警计数

#### 4.2.3 alertStore - 告警状态

```typescript
// 核心状态
interface AlertState {
  alerts: Alert[]
  activeAlerts: Alert[]
  loading: boolean
  filters: AlertFilters  // 级别、设备、时间范围
  searchKeyword: string
  selectedAlertIds: string[]
  fetchAlerts: (deviceId?: string) => Promise<void>
  getFilteredAlerts: () => Alert[]
  bulkMarkAsRead: () => Promise<void>
}
```

**职责**：
- 告警数据获取与缓存
- 告警筛选（级别、设备、时间）
- 关键词搜索
- 批量操作（标记已读）

#### 4.2.4 telemetryStore - 遥测数据状态

```typescript
// 核心状态
interface TelemetryState {
  latestTelemetry: Record<string, Telemetry>  // key: deviceId
  latestStatus: Record<string, Status>
  telemetryHistory: Record<string, Telemetry[]>
  realtimeConnected: boolean
  syncMode: 'realtime' | 'polling' | 'fallback'
  subscribeToDevice: (deviceId: string) => void
  fetchTelemetry: (deviceId: string) => Promise<void>
}
```

**职责**：
- 实时数据订阅（Supabase Realtime）
- 轮询降级处理
- 每设备独立的数据通道管理

**数据同步策略**：
1. 优先使用 Supabase Realtime 实时推送
2. 连接失败时自动降级为 30 秒轮询
3. 每个设备独立管理订阅/轮询

---

## 5. 数据流设计

### 5.1 用户登录流程

```
用户输入凭证
    │
    ▼
authStore.signIn(email, password)
    │
    ▼
Supabase Auth API 验证
    │
    ├── 成功 ──→ 保存用户信息到 Store ──→ 跳转 Dashboard
    │
    └── 失败 ──→ 返回错误信息
```

### 5.2 设备数据加载流程

```
进入 Dashboard
    │
    ▼
deviceStore.fetchDevices()
    │
    ▼
查询 user_devices 表获取用户绑定的设备
    │
    ▼
关联查询 devices 表获取设备详情
    │
    ▼
更新 devices 状态 ──→ 渲染设备列表
    │
    ▼
telemetryStore.subscribeToDevice(deviceId)
    │
    ▼
建立 Realtime 订阅 / 启动轮询
    │
    ▼
实时接收数据更新 ──→ 更新 UI
```

### 5.3 告警查询流程

```
进入告警中心 / 切换筛选条件
    │
    ▼
alertStore.fetchAlerts(deviceId?)
    │
    ▼
获取用户绑定的所有设备 ID
    │
    ▼
查询 alerts 表（按设备 ID 过滤）
    │
    ▼
alertStore.getFilteredAlerts()
    │
    ▼
按级别/设备/时间/关键词过滤
    │
    ▼
渲染告警列表
```

---

## 6. 数据库设计

### 6.1 核心表结构

| 表名 | 用途 |
|------|------|
| `users` | 用户账户（Supabase Auth） |
| `devices` | BMS 设备信息 |
| `user_devices` | 用户-设备关联（多对多） |
| `telemetry` | 设备遥测数据 |
| `status` | 设备状态数据 |
| `alerts` | 告警记录 |

### 6.2 主要数据关系

```
users 1 ── N user_devices N ── 1 devices
                              │
                              ├─ 1 ── N telemetry
                              ├─ 1 ── N status
                              └─ 1 ── N alerts
```

---

## 7. 实时数据处理

### 7.1 Supabase Realtime 集成

系统使用 Supabase Realtime 实现设备数据的实时更新：

```typescript
// 订阅遥测数据
supabase.channel(`device:${deviceId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    table: 'telemetry',
    filter: `device_id=eq.${deviceId}`
  }, callback)
  .subscribe()
```

### 7.2 降级策略

```
Realtime 连接成功
    │
    ▼
接收实时推送 ──→ 更新状态 ──→ 渲染 UI
    │
    │
X 连接超时/错误 (TIMED_OUT / CHANNEL_ERROR)
    │
    ▼
自动降级到轮询模式
    │
    ▼
每 30 秒轮询一次
```

---

## 8. 安全设计

### 8.1 认证

- 使用 Supabase Auth 进行用户认证
- 支持邮箱/密码登录
- Session 自动刷新 (`autoRefreshToken: true`)
- 持久化登录状态 (`persistSession: true`)

### 8.2 数据访问

- 用户只能访问绑定的设备数据
- 所有数据查询通过 `user_devices` 关联过滤
- 敏感操作（如删除设备）需要用户认证

### 8.3 路由保护

```typescript
// ProtectedRoute 组件
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" />
  
  return children
}
```

---

## 9. 性能优化

### 9.1 数据获取

- 设备列表通过单次查询获取所有数据
- 实时订阅替代频繁轮询
- 历史数据按需加载

### 9.2 渲染优化

- 使用 React 19 的并发特性
- Zustand 状态选择器避免不必要的重渲染
- 组件懒加载（路由级别）

### 9.3 网络优化

- Supabase 请求超时设置为 60 秒
- Realtime 事件限流（10 events/s）

---

## 10. 依赖关系

```
package.json 关键依赖：

├── react / react-dom (19.2.0)       # UI 框架
├── react-router-dom (7.13.1)        # 路由
├── zustand (5.0.11)                 # 状态管理
├── antd (6.3.1)                     # UI 组件库
├── @ant-design/charts (2.6.7)       # 图表
├── @supabase/supabase-js (2.98.0)   # 后端客户端
├── tailwindcss (4.2.1)              # 样式框架
└── vite (7.3.1)                     # 构建工具
```

---

## 11. 环境配置

系统通过环境变量配置 Supabase 连接：

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx
```

客户端初始化见 [supabaseClient.ts](src/lib/supabaseClient.ts)。

---

## 12. 扩展性考虑

### 12.1 数据源扩展

当前系统紧耦合 Supabase，如需更换后端：
1. 抽象数据访问层（DAL）
2. 实现不同后端的 Adapter
3. Store 层依赖接口而非具体实现

### 12.2 组件扩展

- 组件按功能模块划分，易于添加新功能
- 使用 Ant Design 组件库，便于主题定制
- Tailwind CSS 支持响应式布局

### 12.3 状态扩展

Zustand 支持中间件，可添加：
- 持久化存储（localStorage/IndexedDB）
- 日志记录
- 状态快照/回滚

---

© 2026 BMS 监控系统