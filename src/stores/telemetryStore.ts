import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import type { Telemetry, Status } from '../types/database'

export interface TelemetryState {
  // 数据状态 - 支持多设备
  latestTelemetry: Record<string, Telemetry> // key: deviceId
  latestStatus: Record<string, Status> // key: deviceId
  telemetryHistory: Record<string, Telemetry[]> // key: deviceId

  // UI 状态
  loading: boolean
  error: string | null

  // Actions - 数据更新
  updateTelemetry: (deviceId: string, data: Telemetry) => void
  updateStatus: (deviceId: string, data: Status) => void
  setTelemetryHistory: (deviceId: string, history: Telemetry[]) => void
  clearDeviceData: (deviceId: string) => void
  clearAllData: () => void

  // Actions - 数据获取
  fetchTelemetry: (deviceId: string) => Promise<void>
  fetchStatus: (deviceId: string) => Promise<void>

  // Actions - UI 状态
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  // 初始状态
  latestTelemetry: {},
  latestStatus: {},
  telemetryHistory: {},
  loading: false,
  error: null,

  // 设置加载状态
  setLoading: (loading) => {
    set({ loading })
  },

  // 设置错误
  setError: (error) => {
    set({ error })
  },

  // 更新遥测数据
  updateTelemetry: (deviceId, data) => {
    set((state) => ({
      latestTelemetry: {
        ...state.latestTelemetry,
        [deviceId]: data,
      },
      error: null,
    }))
  },

  // 更新状态数据
  updateStatus: (deviceId, data) => {
    set((state) => ({
      latestStatus: {
        ...state.latestStatus,
        [deviceId]: data,
      },
      error: null,
    }))
  },

  // 设置遥测历史
  setTelemetryHistory: (deviceId, history) => {
    set((state) => ({
      telemetryHistory: {
        ...state.telemetryHistory,
        [deviceId]: history,
      },
    }))
  },

  // 清除单个设备数据
  clearDeviceData: (deviceId) => {
    set((state) => {
      const { [deviceId]: removedTelemetry, ...remainingTelemetry } = state.latestTelemetry
      const { [deviceId]: removedStatus, ...remainingStatus } = state.latestStatus
      const { [deviceId]: removedHistory, ...remainingHistory } = state.telemetryHistory

      return {
        latestTelemetry: remainingTelemetry,
        latestStatus: remainingStatus,
        telemetryHistory: remainingHistory,
      }
    })
  },

  // 清除所有数据
  clearAllData: () => {
    set({
      latestTelemetry: {},
      latestStatus: {},
      telemetryHistory: {},
      loading: false,
      error: null,
    })
  },

  // 获取最新遥测数据
  fetchTelemetry: async (deviceId: string) => {
    set({ loading: true })

    try {
      // 查询所有字段，包括 data JSON
      const { data, error } = await supabase
        .from('telemetry')
        .select('*')
        .eq('device_id', deviceId)
        .order('received_at', { ascending: false })
        .limit(1)

      if (error) {
        console.warn('Telemetry fetch error:', error.message)
        set({ loading: false })
        return
      }

      if (data && data.length > 0) {
        // 更新状态
        get().updateTelemetry(deviceId, data[0] as Telemetry)
      }

      set({ loading: false })
    } catch (err) {
      // 静默处理错误，不影响页面显示
      console.warn('Telemetry fetch failed:', err instanceof Error ? err.message : err)
      set({ loading: false })
    }
  },

  // 获取最新状态数据
  fetchStatus: async (deviceId: string) => {
    set({ loading: true, error: null })

    try {
      const { data, error } = await supabase
        .from('status')
        .select('*')
        .eq('device_id', deviceId)
        .order('received_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          set({ loading: false })
          return
        }
        throw error
      }

      // 更新状态
      get().updateStatus(deviceId, data as Status)
      set({ loading: false })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : '获取状态数据失败',
      })
    }
  },
}))

// ============================================
// 辅助选择器函数
// ============================================

// 从 data JSON 字段提取遥测值
export const extractTelemetryData = (telemetry: Telemetry | null) => {
  if (!telemetry?.data) return null;

  const d = telemetry.data as Record<string, number>;

  // 温度从 cell_temperatures 数组计算最大/最小值 (单位：0.1°C -> °C)
  const temperatures = telemetry.cell_temperatures || [];
  const tempMax = temperatures.length > 0 ? Math.max(...temperatures) / 10 : null;
  const tempMin = temperatures.length > 0 ? Math.min(...temperatures) / 10 : null;

  // SOH: 原始值 / 10 = 实际百分比 (例如：214 / 10 = 21.4%)
  const sohRaw = d?.['01114001'] || 0;
  const soh = sohRaw / 10;

  return {
    soc: d?.['01113001'] ? d['01113001'] / 10 : null,
    soh: soh > 0 ? soh : null,
    total_voltage: d?.['01115001'] ? d['01115001'] / 100 : null,
    total_current: d?.['01116001'] ? d['01116001'] / 10 : null,
    charge_power: d?.['01118001'] ? d['01118001'] : null,
    discharge_power: d?.['01120001'] ? d['01120001'] : null,
    temperature_max: tempMax,
    temperature_min: tempMin,
  };
};

// 计算平均电芯电压 (mV -> V)
export const getAverageCellVoltage = (telemetry: Telemetry | null): number | null => {
  if (!telemetry?.cell_voltages || telemetry.cell_voltages.length === 0) return null
  const sum = telemetry.cell_voltages.reduce((acc, v) => acc + v, 0)
  return Number((sum / telemetry.cell_voltages.length / 1000).toFixed(3))
}

// 获取最大电芯电压
export const getMaxCellVoltage = (telemetry: Telemetry | null): number | null => {
  if (!telemetry?.cell_voltages || telemetry.cell_voltages.length === 0) return null
  return Math.max(...telemetry.cell_voltages)
}

// 获取最小电芯电压
export const getMinCellVoltage = (telemetry: Telemetry | null): number | null => {
  if (!telemetry?.cell_voltages || telemetry.cell_voltages.length === 0) return null
  return Math.min(...telemetry.cell_voltages)
}

// 计算电芯压差
export const getCellVoltageDelta = (telemetry: Telemetry | null): number | null => {
  if (!telemetry?.cell_voltages || telemetry.cell_voltages.length < 2) return null
  const max = Math.max(...telemetry.cell_voltages)
  const min = Math.min(...telemetry.cell_voltages)
  return Number((max - min).toFixed(3))
}

// 判断充放电状态
export const getPowerState = (telemetry: Telemetry | null): 'charging' | 'discharging' | 'idle' | null => {
  if (!telemetry) return null
  if (telemetry.charge_power && telemetry.charge_power > 0) return 'charging'
  if (telemetry.discharge_power && telemetry.discharge_power > 0) return 'discharging'
  return 'idle'
}

// 获取电芯平均温度
export const getAverageCellTemperature = (telemetry: Telemetry | null): number | null => {
  if (!telemetry?.cell_temperatures || telemetry.cell_temperatures.length === 0) return null
  const sum = telemetry.cell_temperatures.reduce((acc, t) => acc + t, 0)
  return Number((sum / telemetry.cell_temperatures.length).toFixed(1))
}
