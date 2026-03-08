# Supabase 数据库采集报告

**采集时间**: 2026-03-08
**数据库 URL**: https://eblrsbxjuttmdslqtqof.supabase.co
**采集工具**: Supabase Service Key

---

## 1. 数据库表概览

| 表名 | 记录数 | 说明 |
|------|--------|------|
| `devices` | 2 | 设备信息表 |
| `user_devices` | 2 | 用户设备绑定表 |
| `telemetry` | 39,898 | 遥测数据表 |
| `status` | 9,914 | 设备状态表 |
| `alerts` | 28,339 | 告警记录表 |
| `remote_commands` | 0 | 远程命令表 (预留) |

---

## 2. 表结构详情

### 2.1 devices (设备信息表)

**记录数**: 2

| 字段 | 类型 | 说明 |
|------|------|------|
| device_id | TEXT (PK) | 设备唯一标识 (如 ESS12345678901201) |
| auth_key | TEXT | 设备认证密钥 |
| manufacturer | TEXT | 制造商 |
| hw_version | TEXT | 硬件版本 |
| fw_version | TEXT | 固件版本 |
| battery_packs_count | INTEGER | 电池包数量 |
| cell_count | INTEGER | 电芯数量 |
| temp_sensor_count | INTEGER | 温度传感器数量 |
| last_online | TIMESTAMPTZ | 最后上线时间 |
| last_offline | TIMESTAMPTZ | 最后离线时间 |
| status | TEXT | 状态 (online/offline) |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

**设备列表**:
- ESS12345678901201 (Tesla) - online
- ESS12345678901202 (LG Chem) - online

### 2.2 user_devices (用户设备绑定表)

**记录数**: 2

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | UUID (PK) | 用户 ID |
| device_id | TEXT (PK) | 设备 ID |
| role | TEXT | 角色 (owner/viewer) |
| created_at | TIMESTAMPTZ | 绑定时间 |

**绑定关系**:
- 用户 27a5d600... → 设备 ESS12345678901201 (owner)
- 用户 27a5d600... → 设备 ESS12345678901202 (owner)

### 2.3 telemetry (遥测数据表)

**记录数**: 39,898

| 字段 | 类型 | 说明 |
|------|------|------|
| device_id | TEXT (FK) | 设备 ID |
| timestamp | TIMESTAMPTZ | 数据采集时间 |
| received_at | TIMESTAMPTZ | 数据接收时间 |
| cell_voltages | NUMERIC[] | 电芯电压数组 |
| cell_socs | NUMERIC[] | 电芯 SOC 数组 |
| cell_temperatures | NUMERIC[] | 电芯温度数组 |
| data | JSONB | 原始数据 (键值对) |

**数据示例**:
- 电压数据点：16 个
- SOC 数据点：16 个
- 温度数据点：8 个

### 2.4 status (设备状态表)

**记录数**: 9,914

| 字段 | 类型 | 说明 |
|------|------|------|
| device_id | TEXT (FK) | 设备 ID |
| timestamp | TIMESTAMPTZ | 状态采集时间 |
| received_at | TIMESTAMPTZ | 状态接收时间 |
| operation_status | INTEGER | 运行状态 |
| charge_discharge_status | INTEGER | 充放电状态 |
| grid_connection_status | INTEGER | 并网状态 |
| main_contactor_status | INTEGER | 主接触器状态 |
| emergency_stop_status | INTEGER | 急停状态 |
| battery_balancing_status | INTEGER | 电池均衡状态 |

### 2.5 alerts (告警记录表)

**记录数**: 28,339

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL (PK) | 告警 ID |
| device_id | TEXT (FK) | 设备 ID |
| alert_type | TEXT | 告警类型 |
| severity | INTEGER | 告警级别 (1=严重，2=警告，3=提示) |
| start_time | TIMESTAMPTZ | 告警开始时间 |
| end_time | TIMESTAMPTZ | 告警结束时间 |

**告警时间范围**: 2026-02-27 ~ 2026-03-08

**告警类型分布 (Top 10)**:
| 告警类型 | 级别 | 次数 |
|----------|------|------|
| cell_low_temperature_warning | 2 (警告) | 178 |
| cell_voltage_high_warning | 2 (警告) | 177 |
| cell_voltage_low_warning | 2 (警告) | 175 |
| short_circuit | 1 (严重) | 172 |
| undervoltage | 1 (严重) | 150 |
| overvoltage | 1 (严重) | 148 |

### 2.6 remote_commands (远程命令表)

**记录数**: 0 (预留)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID (PK) | 命令 ID |
| device_id | TEXT (FK) | 设备 ID |
| user_id | UUID (FK) | 用户 ID |
| command_type | TEXT | 命令类型 |
| command_data | JSONB | 命令数据 |
| status | TEXT | 状态 (pending/executed/failed) |
| result | JSONB | 执行结果 |
| created_at | TIMESTAMPTZ | 创建时间 |
| executed_at | TIMESTAMPTZ | 执行时间 |

---

## 3. 告警级别映射

| Severity | 中文 | 颜色 | 告警类型 |
|----------|------|------|----------|
| 1 | 严重 | red | short_circuit, undervoltage, overvoltage |
| 2 | 警告 | orange | cell_voltage_high_warning, cell_voltage_low_warning, cell_low_temperature_warning |
| 3 | 提示 | blue | (预留) |

---

## 4. 数据更新频率分析

基于遥测数据:
- 总记录数：39,898
- 时间范围：约 10 天
- 平均更新频率：约 每 22 秒一条数据

基于状态数据:
- 总记录数：9,914
- 平均更新频率：约 每 90 秒一条数据

---

## 5. RLS (行级安全) 策略

已启用的策略:
- ✅ `devices`: 用户只能查看已绑定的设备
- ✅ `user_devices`: 用户只能查看/管理自己的绑定
- ✅ `telemetry`: 用户只能查看已绑定设备的遥测数据
- ✅ `status`: 用户只能查看已绑定设备的状态数据
- ✅ `alerts`: 用户只能查看已绑定设备的告警数据
- ✅ `remote_commands`: 用户只能查看/创建自己的命令

---

## 6. 前端代码适配建议

### 6.1 类型定义更新

已更新 `src/types/database.ts` 以匹配实际数据库结构:

```typescript
export interface Device {
  device_id: string
  auth_key: string
  manufacturer: string | null
  hw_version: string | null
  fw_version: string | null
  battery_packs_count: number | null
  cell_count: number | null
  temp_sensor_count: number | null
  status: 'online' | 'offline' | null
  // ...
}
```

### 6.2 告警级别映射

```typescript
const severityMap: Record<number, { label: string; color: string }> = {
  1: { label: '严重', color: 'red' },
  2: { label: '警告', color: 'orange' },
  3: { label: '提示', color: 'blue' },
}
```

### 6.3 遥测数据解析

```typescript
// data 字段包含键值对形式的原始数据
// 例如：{"01111001": 7001, "01112001": -4516, ...}
// 需要根据协议解析具体含义
```

---

## 7. 建议的后续开发

1. **实时数据展示** - 利用 Supabase Realtime 订阅 telemetry 表
2. **告警仪表板** - 按 severity 分级展示告警
3. **历史趋势图** - 展示电压/温度/SOC 趋势
4. **设备管理** - 添加/删除设备绑定功能
5. **命令下发** - 实现 remote_commands 表的操作

---

**报告生成时间**: 2026-03-08T12:05:00+08:00
