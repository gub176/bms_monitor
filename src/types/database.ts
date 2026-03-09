// Database Types for BMS Monitoring System
// Based on actual Supabase schema

export interface Json {
  [key: string]: Json | undefined | null | boolean | number | string | Json[]
}

// User & Auth Types
export interface User {
  id: string
  email: string
  created_at: string
}

// Device Types
export interface Device {
  device_id: string
  auth_key: string
  manufacturer: string | null
  hw_version: string | null
  fw_version: string | null
  battery_packs_count: number | null
  cell_count: number | null
  temp_sensor_count: number | null
  last_online: string | null
  last_offline: string | null
  status: 'online' | 'offline' | null
  created_at: string
  updated_at: string
}

export interface UserDevice {
  user_id: string
  device_id: string
  role: 'owner' | 'viewer'
  created_at: string
}

// Telemetry Types
export interface Telemetry {
  device_id: string
  timestamp: string
  received_at: string
  soc: number | null
  soh: number | null
  total_voltage: number | null
  total_current: number | null
  charge_power: number | null
  discharge_power: number | null
  temperature_max: number | null
  temperature_min: number | null
  cell_voltages: number[] | null
  cell_socs: number[] | null
  cell_temperatures: number[] | null
  data: Json | null
}

// Status Types
export interface Status {
  device_id: string
  timestamp: string
  received_at: string
  operation_status: number | null
  charge_status: number | null
  grid_status: number | null
  charge_discharge_status: number | null
  grid_connection_status: number | null
  main_contactor_status: number | null
  emergency_stop_status: number | null
  battery_balancing_status: number | null
}

// Alert Types
export interface Alert {
  id: number
  device_id: string
  alert_type: string
  severity: 1 | 2 | 3
  start_time: string
  end_time: string | null
}

// Command Types (for future use)
export interface RemoteCommand {
  id: string
  device_id: string
  user_id: string
  command_type: string
  command_data: Json
  status: 'pending' | 'executed' | 'failed'
  result: Json | null
  created_at: string
  executed_at: string | null
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null
  error: Error | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// Alert severity mapping
// 1 = Critical (严重)
// 2 = Warning (警告)
// 3 = Info (提示)
export const ALERT_SEVERITY_MAP: Record<number, { label: string; color: string }> = {
  1: { label: '严重', color: 'red' },
  2: { label: '警告', color: 'orange' },
  3: { label: '提示', color: 'blue' },
}

// Alert types
export const ALERT_TYPES = {
  // Severity 1 (Critical)
  short_circuit: '短路',
  undervoltage: '欠压',
  overvoltage: '过压',
  // Severity 2 (Warning)
  cell_voltage_high_warning: '电芯电压过高',
  cell_voltage_low_warning: '电芯电压过低',
  cell_low_temperature_warning: '温度过低',
} as const
