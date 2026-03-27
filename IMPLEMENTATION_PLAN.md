# BMS Monitor 项目完整开发实施计划

**项目名称：** BMS 监控系统前端（户用储能设备云端监控）  
**文档版本：** v1.0  
**创建日期：** 2026-03-27  
**负责人：** 小码（开发）、小智（协调汇报）  
**状态：** 阶段 1 完成，阶段 2-5 进行中

---

## 📋 一、项目概述

### 1.1 项目背景
构建户用储能设备 BMS（电池管理系统）的云端监控前端应用，支持设备绑定、实时监控、告警管理和历史数据趋势分析。

### 1.2 核心价值
- **设备管理**：多设备绑定与集中监控
- **实时监控**：电压、温度、SOC 等关键指标实时展示
- **告警中心**：智能告警筛选、搜索、导出与批量处理
- **数据分析**：历史趋势图与数据导出

### 1.3 技术栈
| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React + TypeScript | 19.2.0 + 5.9.3 |
| 构建工具 | Vite | 7.3.1 |
| UI 组件库 | Ant Design | 6.3.1 |
| 状态管理 | Zustand | 5.0.11 |
| 后端服务 | Supabase | 2.98.0 |
| 图表库 | @ant-design/charts | 2.6.7 |
| 样式 | Tailwind CSS | 4.2.1 |

---

## 🎯 二、开发阶段总览

| 阶段 | 名称 | 状态 | 工时 | 完成日期 |
|------|------|------|------|----------|
| 阶段 0 | 项目初始化与 MVP | ✅ 已完成 | 16h | 2026-03-09 |
| 阶段 1 | 告警中心核心增强 | ✅ 已完成 | 4h | 2026-03-26 |
| 阶段 2 | 筛选/搜索功能 | ⏳ 进行中 (40%) | 6h | 待定 |
| 阶段 3 | 导出 + 批量操作 | ⏳ 待开始 | 4h | 待定 |
| 阶段 4 | 空状态优化 | ⏳ 待开始 | 2h | 待定 |
| 阶段 5 | 测试与优化 | ⏳ 待开始 | 4h | 待定 |

**总工时：** 36 小时  
**当前进度：** 55%（阶段 1 完成 + 阶段 2 部分完成）

---

## 📦 三、详细开发计划

### 阶段 0：项目初始化与 MVP ✅（已完成）

#### 完成内容
- [x] 项目脚手架搭建（Vite + React + TS）
- [x] Supabase 数据库 Schema 设计与部署
- [x] 用户认证模块（登录/注册）
- [x] 设备绑定与管理功能
- [x] Dashboard 仪表盘（设备列表 + 指标卡片）
- [x] 设备详情页（实时数据 + 趋势图）
- [x] 告警中心基础版（列表展示）
- [x] 响应式布局与深色主题

#### 核心文件
```
src/
├── App.tsx                    # 应用入口
├── main.tsx                   # 渲染入口
├── pages/
│   ├── Login/                 # 登录页
│   ├── Dashboard/             # 仪表盘
│   ├── DeviceDetail/          # 设备详情
│   └── Alerts/                # 告警中心
├── stores/
│   ├── authStore.ts           # 认证状态
│   ├── deviceStore.ts         # 设备状态
│   ├── alertStore.ts          # 告警状态
│   └── telemetryStore.ts      # 遥测状态
├── hooks/
│   ├── useAuth.ts             # 认证 Hook
│   ├── useDevices.ts          # 设备 Hook
│   └── useRealtime.ts         # Realtime Hook
├── components/
│   ├── layout/                # 布局组件
│   ├── device/                # 设备组件
│   └── charts/                # 图表组件
└── lib/supabaseClient.ts      # Supabase 客户端
```

---

### 阶段 1：告警中心核心增强 ✅（已完成）

#### 完成内容
- [x] 告警列表 UI 优化（表格布局、状态徽章）
- [x] 告警状态管理（已读/未读标记）
- [x] 告警恢复功能（手动恢复活动告警）
- [x] alertStore.ts 扩展（markAsRead、recoverAlert 方法）

#### 技术实现
```typescript
// alertStore.ts 新增方法
markAsRead: async (alertId: string) => {
  await supabase.from('alerts').update({ is_read: true }).eq('id', alertId)
}

recoverAlert: async (alertId: string) => {
  await supabase.from('alerts').update({ end_time: new Date().toISOString() }).eq('id', alertId)
}
```

#### 交付成果
- 文件：`projects/bms_monitor/src/stores/alertStore.ts`（已修改）
- 文件：`projects/bms_monitor/src/pages/Alerts/Alerts.tsx`（已优化）

---

### 阶段 2：筛选/搜索功能 ⏳（进行中，40%）

**预计工时：** 6 小时  
**当前状态：** 组件创建完成，待测试验证

#### 2.1 告警筛选器组件 `AlertFilters.tsx`

**功能需求：**
- 按级别筛选（严重/警告/提示）- 多选
- 按设备筛选 - 下拉选择已绑定设备
- 按时间范围筛选 - 日期范围选择器
- 重置筛选按钮

**技术实现：**
```tsx
import { Select, DatePicker } from 'antd'
import { useAlertStore } from '../../stores/alertStore'

const AlertFilters = () => {
  const { filters, setFilters, resetFilters } = useAlertStore()
  
  return (
    <div className="flex gap-4 mb-4">
      <Select mode="multiple" placeholder="告警级别" onChange={(v) => setFilters({ levels: v })} />
      <Select placeholder="设备" onChange={(v) => setFilters({ deviceId: v })} />
      <DatePicker.RangePicker onChange={(v) => setFilters({ dateRange: v })} />
      <Button onClick={resetFilters}>重置</Button>
    </div>
  )
}
```

**进度：** ✅ 组件已创建

---

#### 2.2 关键词搜索组件 `AlertSearch.tsx`

**功能需求：**
- 搜索告警消息内容（alert_type、description）
- 实时搜索（输入即搜索，300ms 防抖）
- 清空搜索按钮

**技术实现：**
```tsx
import { Input } from 'antd'
import { debounce } from 'lodash'

const AlertSearch = () => {
  const { setSearchKeyword } = useAlertStore()
  
  const debouncedSearch = useMemo(
    () => debounce((keyword: string) => setSearchKeyword(keyword), 300),
    [setSearchKeyword]
  )
  
  return <Input.Search placeholder="搜索告警内容" onSearch={debouncedSearch} allowClear />
}
```

**进度：** ✅ 组件已创建

---

#### 2.3 筛选状态管理 `alertStore.ts`

**新增状态：**
```typescript
interface AlertState {
  filters: {
    levels: string[]              // 选中的级别
    deviceId?: string             // 选中的设备 ID
    dateRange?: [string, string]  // 时间范围 [start, end]
  }
  searchKeyword: string           // 搜索关键词
  
  setFilters: (filters: Partial<AlertState['filters']>) => void
  setSearchKeyword: (keyword: string) => void
  resetFilters: () => void
  getFilteredAlerts: () => Alert[]  // 计算属性（带筛选逻辑）
}
```

**筛选逻辑：**
```typescript
getFilteredAlerts: () => {
  return alerts.filter(alert => {
    // 级别筛选
    if (filters.levels.length && !filters.levels.includes(alert.level)) return false
    
    // 设备筛选
    if (filters.deviceId && alert.device_id !== filters.deviceId) return false
    
    // 时间范围筛选
    if (filters.dateRange) {
      const alertTime = new Date(alert.start_time)
      if (alertTime < new Date(filters.dateRange[0]) || alertTime > new Date(filters.dateRange[1])) return false
    }
    
    // 关键词搜索
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      if (!alert.alert_type.toLowerCase().includes(keyword) && 
          !alert.description.toLowerCase().includes(keyword)) return false
    }
    
    return true
  })
}
```

**进度：** ✅ Store 已扩展

---

#### 2.4 集成到 Alerts.tsx

**更新内容：**
- 导入筛选器和搜索组件
- 使用 `getFilteredAlerts()` 替代原始 `alerts`
- 添加筛选器工具栏区域

**进度：** ✅ 已集成

---

#### 阶段 2 待办
- [ ] 本地测试验证（筛选功能、搜索功能）
- [ ] 修复潜在问题
- [ ] Git 提交

---

### 阶段 3：导出 + 批量操作 ⏳（待开始）

**预计工时：** 4 小时

#### 3.1 CSV 导出功能

**文件：** `src/utils/export.ts`（新建）

**功能需求：**
- 导出当前筛选结果的告警数据
- CSV 格式（UTF-8 with BOM，支持中文）
- 导出字段：级别、类型、描述、设备 ID、开始时间、结束时间、状态

**技术实现：**
```typescript
export const exportAlertsToCSV = (alerts: Alert[]) => {
  const headers = ['级别', '类型', '描述', '设备 ID', '开始时间', '结束时间', '状态']
  const rows = alerts.map(a => [
    a.level,
    a.alert_type,
    a.description,
    a.device_id,
    a.start_time,
    a.end_time || '活动',
    a.is_read ? '已读' : '未读'
  ])
  
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `告警导出_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}
```

**待办：**
- [ ] 创建 export.ts 工具文件
- [ ] 在 Alerts.tsx 添加导出按钮
- [ ] 测试导出功能（Excel 可打开）

---

#### 3.2 批量标记已读

**文件：** `src/stores/alertStore.ts`（修改）

**功能需求：**
- 表格复选框多选告警
- 批量操作工具栏（选中后显示）
- 一键标记选中告警为已读

**技术实现：**
```typescript
// alertStore.ts
bulkMarkAsRead: async (alertIds: string[]) => {
  const { error } = await supabase
    .from('alerts')
    .update({ is_read: true })
    .in('id', alertIds)
  
  if (error) throw error
  
  // 更新本地状态
  set(state => ({
    alerts: state.alerts.map(a => 
      alertIds.includes(a.id) ? { ...a, is_read: true } : a
    )
  }))
}
```

**待办：**
- [ ] 在 alertStore 添加 bulkMarkAsRead 方法
- [ ] Alerts.tsx 表格添加复选框列
- [ ] 添加批量操作工具栏
- [ ] 测试批量操作

---

### 阶段 4：空状态优化 ⏳（待开始）

**预计工时：** 2 小时

#### 4.1 空状态组件 `AlertEmptyState.tsx`

**功能需求：**
- 无活动告警：显示"系统运行正常"
- 筛选无结果：显示"未找到匹配的告警" + "清除筛选"按钮

**技术实现：**
```tsx
interface AlertEmptyStateProps {
  type: 'no-alerts' | 'no-results'
  onClearFilters?: () => void
}

const AlertEmptyState = ({ type, onClearFilters }: AlertEmptyStateProps) => {
  if (type === 'no-results') {
    return (
      <Empty 
        description="未找到匹配的告警"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary" onClick={onClearFilters}>清除筛选</Button>
      </Empty>
    )
  }
  
  return (
    <Empty 
      description="暂无活动告警，系统运行正常"
      image={<CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />}
    />
  )
}
```

**待办：**
- [ ] 创建 AlertEmptyState.tsx 组件
- [ ] 在 Alerts.tsx 中替换现有空状态逻辑
- [ ] 测试两种空状态场景

---

### 阶段 5：测试与优化 ⏳（待开始）

**预计工时：** 4 小时

#### 5.1 功能测试清单

- [ ] 级别筛选功能正常
- [ ] 设备筛选功能正常
- [ ] 时间范围筛选功能正常
- [ ] 关键词搜索功能正常
- [ ] 筛选条件组合使用正常
- [ ] CSV 导出功能正常（文件可打开）
- [ ] 批量标记已读功能正常
- [ ] 空状态显示正确
- [ ] TypeScript 编译无错误
- [ ] ESLint 检查通过

#### 5.2 性能优化

**优化点：**
- 筛选搜索使用防抖（debounce 300ms）
- 大数据量时使用虚拟滚动（Ant Design Table 内置支持）
- 组件使用 React.memo 避免不必要的重渲染

**待办：**
- [ ] 添加防抖处理
- [ ] 性能测试（1000+ 条告警数据）
- [ ] 代码质量检查（TypeScript + ESLint）

---

## 📁 四、文件清单

### 新建文件（阶段 2-4）
```
projects/bms_monitor/src/
├── components/alerts/
│   ├── AlertFilters.tsx        ✅ 已创建
│   ├── AlertSearch.tsx         ✅ 已创建
│   └── AlertEmptyState.tsx     ⏳ 待创建
├── utils/
│   └── export.ts               ⏳ 待创建
```

### 修改文件
```
projects/bms_monitor/src/
├── stores/alertStore.ts        ✅ 已扩展（阶段 2）
├── pages/Alerts/Alerts.tsx     ✅ 已更新（阶段 2）
```

---

## 📅 五、时间线与里程碑

### 已完成
- **2026-03-09：** 项目初始化与 MVP 完成
- **2026-03-26：** 阶段 1（告警中心核心增强）完成
- **2026-03-26 深夜：** 阶段 2 组件创建完成（40%）

### 待完成（预计）
| 里程碑 | 预计日期 | 交付物 |
|--------|----------|--------|
| 阶段 2 完成 | 2026-03-27 | 筛选/搜索功能可测试 |
| 阶段 3 完成 | 2026-03-28 | 导出 + 批量操作可用 |
| 阶段 4 完成 | 2026-03-28 | 空状态优化完成 |
| 阶段 5 完成 | 2026-03-29 | 全部测试通过，可交付 |

---

## ✅ 六、完成标准

### 代码质量
- [x] TypeScript 编译通过 (`npm run build`)
- [x] ESLint 检查无错误 (`npm run lint`)
- [ ] 所有组件添加注释
- [ ] Git 提交信息规范

### 功能验收
- [x] 告警列表 UI 优化
- [x] 告警状态管理（已读/未读）
- [x] 告警恢复功能
- [ ] 筛选功能（级别/设备/时间）
- [ ] 搜索功能（关键词）
- [ ] CSV 导出功能
- [ ] 批量标记已读
- [ ] 空状态优化

### 交付要求
- [ ] Git 提交到 `projects/bms_monitor/`
- [ ] 任务日志更新
- [ ] 成果归档到 `02-agents/xiaoma/archive/`

---

## 🔧 七、技术方案总结

### 状态管理
- **工具：** Zustand
- **方案：** 在 alertStore 中集中管理筛选条件、搜索关键词、告警列表
- **优势：** 简单、轻量、易测试

### UI 组件
- **工具库：** Ant Design 6.x
- **核心组件：** Select、DatePicker.RangePicker、Input.Search、Table、Empty、Button
- **样式：** Tailwind CSS 4.x

### 数据处理
- **筛选逻辑：** 前端过滤（适用于数据量 < 1000 条场景）
- **导出格式：** CSV（UTF-8 with BOM，兼容 Excel）
- **性能优化：** Debounce（300ms）、React.memo、虚拟滚动

### 后端交互
- **服务：** Supabase（PostgreSQL + Auth + Realtime）
- **查询模式：** 通过 user_devices 关联表查询（RLS 安全策略）
- **批量操作：** Supabase `.in()` 批量更新

---

## 📊 八、风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| 筛选性能问题（大数据量） | 中 | 使用虚拟滚动、分页加载 |
| CSV 导出中文乱码 | 低 | 添加 BOM 头，使用 UTF-8 编码 |
| Supabase RLS 策略限制 | 高 | 通过 user_devices 关联表查询 |
| 防抖延迟影响用户体验 | 低 | 调整 debounce 时间（300ms 平衡点） |

---

## 📞 九、沟通与汇报

### 汇报流程
```
小码开发 → 更新任务日志 → 小智检查 → 整理邮件 → 发送给 MK
                                            ↓
外部反馈 → 小智接收 → 更新项目文件 → 通知小码跟进
```

### 汇报节点
- **阶段完成时：** 立即邮件汇报
- **遇到重大阻碍（>1h）：** 立即上报
- **日常进度：** 每日至少更新任务日志 1 次

### 邮件接收
- **主要邮箱：** gub176@163.com
- **发件配置：** "zhi" <kyc176uk1@163.com>

---

## 附录：常用命令速查

```bash
# 开发
cd projects/bms_monitor
npm run dev              # 启动开发服务器（http://localhost:5173）

# 构建
npm run build            # 生产构建
npm run preview          # 预览构建

# 代码质量
npm run lint             # ESLint 检查
npx tsc -b               # TypeScript 检查

# Git 操作
git add . && git commit -m "feat(alerts): 添加筛选/搜索功能"
git push origin main
```

---

*文档创建日期：2026-03-27*  
*最后更新：2026-03-27*  
*版本：v1.0*
