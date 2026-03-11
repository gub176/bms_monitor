/**
 * BMS 设备监控常量配置
 */

// 温度阈值配置 (摄氏度)
export const TEMPERATURE_THRESHOLDS = {
  WARNING: 32,    // 警告阈值
  CRITICAL: 35,   // 严重阈值
  MIN: -20,       // 最低工作温度
  MAX: 60,        // 最高工作温度
} as const

// 温度状态类型
export type TemperatureStatus = 'normal' | 'warning' | 'critical'

// 电压阈值配置 (伏特)
export const VOLTAGE_THRESHOLDS = {
  CELL_MIN: 2.5,      // 电芯最低电压
  CELL_MAX: 3.65,     // 电芯最高电压
  CELL_NOMINAL: 3.2,  // 标称电压
} as const

// SOC 阈值配置 (百分比)
export const SOC_THRESHOLDS = {
  LOW: 20,        // 低电量警告
  CRITICAL: 5,    // 严重低电量
  HIGH: 95,       // 高电量警告
} as const

// 电流阈值配置 (安培)
export const CURRENT_THRESHOLDS = {
  CHARGE_MAX: 100,    // 最大充电电流
  DISCHARGE_MAX: 100, // 最大放电电流
} as const

// 设备状态码
export const DEVICE_STATUS = {
  OFFLINE: 0,
  ONLINE: 1,
} as const

// 运行状态码
export const OPERATION_STATUS = {
  STOPPED: 0,
  RUNNING: 1,
  STANDBY: 2,
  FAULT: 3,
} as const

// 充放电状态码
export const CHARGE_STATUS = {
  IDLE: 0,
  CHARGING: 1,
  DISCHARGING: 2,
  FULL: 3,
} as const

// 并网状态码
export const GRID_STATUS = {
  OFFLINE: 0,
  GRID_CONNECTED: 1,
  OFF_GRID: 2,
} as const
