# 设备详情页头部重新设计 - 实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将设备详情页头部从两行卡片布局重构为单行标签栏式布局

**Architecture:** 保留现有 DeviceDetail.tsx 主体结构，仅重构头部 Card 组件。将原第一行（设备信息）和第二行（三个状态卡片）合并为一个 flex 布局的单行卡片。状态标签作为独立小组件内联展示。

**Tech Stack:** React, TypeScript, Ant Design, Tailwind CSS, CSS 变量

---

## 文件变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/pages/DeviceDetail/DeviceDetail.tsx` | 修改 | 重构头部 Card 组件 JSX 结构 |
| `src/index.css` | 修改（可选） | 如需要新增状态标签样式类 |

---

## 任务分解

### Task 1: 准备工作

**Files:**
- Modify: `src/pages/DeviceDetail/DeviceDetail.tsx`
- Read: `src/index.css`

- [ ] **Step 1: 确认当前代码状态**

运行：
```bash
git status
```
确认当前在正确的分支，工作区干净。

- [ ] **Step 2: 创建设计文档提交**

```bash
git add docs/superpowers/specs/2026-03-11-device-detail-header-redesign.md
git commit -m "docs: add device detail header redesign spec"
```

---

### Task 2: 重构头部 Card 组件 - 结构变更

**Files:**
- Modify: `src/pages/DeviceDetail/DeviceDetail.tsx:207-254` (头部 Card 区域)

- [ ] **Step 1: 替换头部 Card 的 JSX 结构**

将原有的 `div.flex.items-center.justify-between` 结构替换为新的单行 flex 布局：

```tsx
<Card className="energy-card" variant="borderless">
  <div className="flex items-center justify-between flex-wrap gap-4">
    {/* 左侧设备信息 */}
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-active) 100%)' }}
        aria-hidden="true"
      >
        <ThunderboltOutlined className="text-white text-lg" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Title level={4} className="!mb-0 !text-base">
            {device.manufacturer || 'BMS 设备'}
          </Title>
          <Badge
            status={isOnline ? 'success' : 'default'}
            text={isOnline ? '在线' : '离线'}
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
          <span className="font-mono">{device.device_id}</span>
          {deviceAlerts.length > 0 && (
            <span className="flex items-center gap-1 text-[var(--color-error)]">
              <ExclamationCircleOutlined />
              {deviceAlerts.length} 个告警
            </span>
          )}
        </div>
      </div>
    </div>

    {/* 右侧状态标签 */}
    <div className="flex items-center gap-2 flex-wrap">
      {/* 运行状态 */}
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${
          status.operation_status === 1
            ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
            : 'bg-[var(--color-bg-page)] text-[var(--color-text-secondary)]'
        }`}
      >
        {status.operation_status === 1 ? (
          <CheckCircleOutlined aria-hidden="true" />
        ) : (
          <CloseCircleOutlined aria-hidden="true" />
        )}
        {status.operation_status === 1 ? '正常运行' : '停机'}
      </span>

      {/* 充放电状态 */}
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${
          status.charge_status === 1
            ? 'bg-[var(--color-info)]/10 text-[var(--color-info)]'
            : status.charge_status === 2
            ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
            : 'bg-[var(--color-bg-page)] text-[var(--color-text-secondary)]'
        }`}
      >
        <ThunderboltOutlined aria-hidden="true" />
        {status.charge_status === 1 ? '充电中' : status.charge_status === 2 ? '放电中' : '空闲'}
      </span>

      {/* 并网状态 */}
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${
          status.grid_status === 1
            ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
            : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
        }`}
      >
        <WifiOutlined aria-hidden="true" />
        {status.grid_status === 1 ? '已并网' : '离网'}
      </span>
    </div>
  </div>
</Card>
```

- [ ] **Step 2: 移除不再需要的返回按钮区域**

原返回按钮已在新的头部结构中移除，确认代码中不再包含返回按钮相关的 JSX。

---

### Task 3: 移除原状态卡片

**Files:**
- Modify: `src/pages/DeviceDetail/DeviceDetail.tsx:256-343` (原状态指示器 Row)

- [ ] **Step 1: 删除状态指示器 Row**

删除整个 `<Row gutter={[16, 16]} role="region" aria-label="设备状态">` 部分（包含三个状态卡片）。

删除范围：从 `</Card>`（头部 Card 结束）到下一个 `<Row>`（关键参数 Row）之间的状态卡片代码。

- [ ] **Step 2: 确认删除后结构**

确认删除后的代码结构：
1. 头部 Card（新的单行布局）
2. 关键参数 Row（保持不变）

---

### Task 4: 清理导入

**Files:**
- Modify: `src/pages/DeviceDetail/DeviceDetail.tsx:1-30`

- [ ] **Step 1: 检查并清理未使用的导入**

由于删除了状态卡片，检查是否有以下未使用的导入：
- `Row` - 可能仍需要（用于关键参数行）
- `Col` - 可能仍需要（用于关键参数列）
- `Card` - 仍需要
- `Badge` - 仍需要
- `Tag` - 可能不再需要（如果原状态卡片使用了 Tag）

删除确认不再使用的导入。

---

### Task 5: 样式优化（可选）

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: 检查是否需要新增公共样式类**

如果需要，可以在 `src/index.css` 中添加状态标签的公共样式类：

```css
/* 设备状态标签 */
.device-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all var(--transition-base);
}

.device-status-tag.success {
  background: var(--color-success)/10;
  color: var(--color-success);
}

.device-status-tag.info {
  background: var(--color-info)/10;
  color: var(--color-info);
}

.device-status-tag.warning {
  background: var(--color-warning)/10;
  color: var(--color-warning);
}
```

**注意：** 也可以直接使用内联样式类（如 Task 2 所示），这样更灵活。

---

### Task 6: 响应式处理

**Files:**
- Modify: `src/pages/DeviceDetail/DeviceDetail.tsx`

- [ ] **Step 1: 添加 flex-wrap 行为**

确认头部 Card 的容器使用了 `flex-wrap` 和 `gap-4`，这样在小屏幕上状态标签会自动换行。

- [ ] **Step 2: 添加最小宽度限制**

确认左侧设备信息区使用了 `min-w-0` 和 `flex-1`，确保在窄屏时可以正确收缩。

- [ ] **Step 3: 测试小屏行为**

在浏览器开发者工具中测试宽度 < 768px 时的显示效果：
- 设备信息区应该收缩但不断行
- 状态标签应该换行到下一行

---

### Task 7: 无障碍验证

**Files:**
- Modify: `src/pages/DeviceDetail/DeviceDetail.tsx`

- [ ] **Step 1: 确认 ARIA 标签**

确认以下元素有正确的 ARIA 属性：
- 设备图标：`aria-hidden="true"`
- 状态图标：`aria-hidden="true"`
- 状态标签：有描述性文字（如"正常运行"）
- 主卡片容器：`aria-label="设备信息"`

- [ ] **Step 2: 键盘导航测试**

使用 Tab 键测试页面导航，确认：
- 状态标签不可聚焦（纯展示性）
- 页面其他交互元素可正常访问

---

### Task 8: 构建和测试

**Files:**
- All changed files

- [ ] **Step 1: 运行 TypeScript 类型检查**

```bash
npm run build
```

预期：无类型错误

- [ ] **Step 2: 运行开发服务器**

```bash
npm run dev
```

- [ ] **Step 3: 视觉验证**

在浏览器中访问设备详情页，确认：
- 新的头部布局正确显示
- 状态标签颜色和图标正确
- 响应式行为符合预期
- 告警计数显示在正确位置

- [ ] **Step 4: 提交所有变更**

```bash
git add src/pages/DeviceDetail/DeviceDetail.tsx src/index.css
git commit -m "feat: redesign device detail header with compact label layout"
```

---

## 测试清单

- [ ] 设备在线状态正确显示（绿色圆点 + 文字）
- [ ] 设备 ID 正确显示
- [ ] 告警计数正确显示（无告警时不显示）
- [ ] 运行状态标签颜色正确
- [ ] 充放电状态标签颜色正确
- [ ] 并网状态标签颜色正确
- [ ] 小屏幕（<768px）响应式正常
- [ ] 构建无 TypeScript 错误

---

## 回退方案

如果实施后发现问题需要回退：

```bash
git revert HEAD
```

或者恢复到上一个已知良好的提交：

```bash
git checkout <previous-commit> -- src/pages/DeviceDetail/DeviceDetail.tsx
```

---

## 相关设计文档

- `docs/superpowers/specs/2026-03-11-device-detail-header-redesign.md`
