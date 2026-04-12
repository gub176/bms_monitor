import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import type { Telemetry, Status } from '../types/database'

export type SyncMode = 'realtime' | 'polling' | 'fallback'

export interface TelemetryState {
  // 数据状态 - 支持多设备
  latestTelemetry: Record<string, Telemetry> // key: deviceId
  latestStatus: Record<string, Status> // key: deviceId
  telemetryHistory: Record<string, Telemetry[]> // key: deviceId

  // UI 状态
  loading: boolean
  error: string | null

  // Realtime 状态
  realtimeConnected: boolean
  syncMode: SyncMode

  // Actions - 数据更新
  updateTelemetry: (deviceId: string, data: Telemetry) => void
  updateStatus: (deviceId: string, data: Status) => void
  setTelemetryHistory: (deviceId: string, history: Telemetry[]) => void
  clearDeviceData: (deviceId: string) => void
  clearAllData: () => void

  // Actions - 数据获取
  fetchTelemetry: (deviceId: string) => Promise<void>
  fetchStatus: (deviceId: string) => Promise<void>

  // Actions - Realtime 管理
  subscribeToDevice: (deviceId: string) => void
  unsubscribeFromDevice: (deviceId: string) => void
  setSyncMode: (mode: SyncMode) => void

  // Actions - UI 状态
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// 存储 Realtime 频道引用 - 每设备独立管理
const realtimeChannels: Map<string, any> = new Map()
const pollingTimers: Map<string, ReturnType<typeof setInterval>> = new Map()
const POLL_INTERVAL = 30000 // 30 秒

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  // 初始状态
  latestTelemetry: {},
  latestStatus: {},
  telemetryHistory: {},
  loading: false,
  error: null,
  realtimeConnected: false,
  syncMode: 'realtime' as SyncMode, // 默认尝试 Realtime

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
    // 取消所有 Realtime 订阅
    realtimeChannels.forEach((channel) => {
      channel.unsubscribe()
    })
    realtimeChannels.clear()

    // 停止所有设备的轮询
    pollingTimers.forEach((timer) => {
      clearInterval(timer)
    })
    pollingTimers.clear()

    set({
      latestTelemetry: {},
      latestStatus: {},
      telemetryHistory: {},
      loading: false,
      error: null,
      realtimeConnected: false,
      syncMode: 'realtime',
    })
  },

  // 设置同步模式
  setSyncMode: (mode) => {
    set({ syncMode: mode })
    console.log(`[SyncMode] Switched to ${mode}`)
  },

  // 订阅设备 Realtime 更新
  subscribeToDevice: (deviceId) => {
    if (realtimeChannels.has(deviceId)) {
      return // 已订阅
    }

    const channel = supabase.channel(`device:${deviceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telemetry',
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          console.log('[Realtime] Telemetry update:', payload.new)
          get().updateTelemetry(deviceId, payload.new as Telemetry)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'status',
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          console.log('[Realtime] Status update:', payload.new)
          get().updateStatus(deviceId, payload.new as Status)
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          set({ realtimeConnected: true, syncMode: 'realtime' })
          // 停止该设备的轮询
          stopPolling(deviceId)
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          // 降级到轮询模式
          console.warn('[Realtime] Connection failed, falling back to polling')
          set({ realtimeConnected: false, syncMode: 'fallback' })
          if (realtimeChannels.has(deviceId)) {
            realtimeChannels.get(deviceId).unsubscribe()
            realtimeChannels.delete(deviceId)
          }
          // 启动该设备的轮询
          startPolling(deviceId)
        }
      })

    realtimeChannels.set(deviceId, channel)
  },

  // 取消订阅设备
  unsubscribeFromDevice: (deviceId) => {
    if (realtimeChannels.has(deviceId)) {
      realtimeChannels.get(deviceId).unsubscribe()
      realtimeChannels.delete(deviceId)
    }
  },

  // 获取最新遥测数据
  fetchTelemetry: async (deviceId: string) => {
    set({ loading: true })

    try {
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
        get().updateTelemetry(deviceId, data[0] as Telemetry)
      }

      set({ loading: false })
    } catch (err) {
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
// 轮询辅助函数 - 每设备独立管理
// ============================================

// 启动指定设备的轮询模式
const startPolling = (deviceId: string) => {
  // 先停止该设备已有的轮询
  stopPolling(deviceId)

  // 立即执行一次
  useTelemetryStore.getState().fetchTelemetry(deviceId)
  useTelemetryStore.getState().fetchStatus(deviceId)

  const timer = setInterval(() => {
    useTelemetryStore.getState().fetchTelemetry(deviceId)
    useTelemetryStore.getState().fetchStatus(deviceId)
  }, POLL_INTERVAL)

  pollingTimers.set(deviceId, timer)
  console.log(`[Polling] Started for ${deviceId} with interval:`, POLL_INTERVAL)
}

// 停止指定设备的轮询
const stopPolling = (deviceId: string) => {
  if (pollingTimers.has(deviceId)) {
    clearInterval(pollingTimers.get(deviceId))
    pollingTimers.delete(deviceId)
    console.log(`[Polling] Stopped for ${deviceId}`)
  }
}

// 导出用于外部调用
export { startPolling, stopPolling }

// ============================================
// 辅助选择器函数
// ============================================

// 从 data JSON 字段提取遥测值
export const extractTelemetryData = (telemetry: Telemetry | null) => {
  if (!telemetry?.data) return null;

  try {
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
  } catch {
    // 数据解析失败时返回 null
    return null;
  }
};

// 计算平均电芯电压 (mV -> V)
export const getAverageCellVoltage = (telemetry: Telemetry | null): number | null => {
  if (!telemetry?.cell_voltages || telemetry.cell_voltages.length === 0) return null
  try {
    const sum = telemetry.cell_voltages.reduce((acc, v) => acc + v, 0)
    return Number((sum / telemetry.cell_voltages.length / 1000).toFixed(3))
  } catch {
    return null
  }
}

// 获取最大电芯电压
export const getMaxCellVoltage = (telemetry: Telemetry | null): number | null => {
  if (!telemetry?.cell_voltages || telemetry.cell_voltages.length === 0) return null
  try {
    return Math.max(...telemetry.cell_voltages)
  } catch {
    return null
  }
}

// 获取最小电芯电压
export const getMinCellVoltage = (telemetry: Telemetry | null): number | null => {
  if (!telemetry?.cell_voltages || telemetry.cell_voltages.length === 0) return null
  try {
    return Math.min(...telemetry.cell_voltages)
  } catch {
    return null
  }
}

// 计算电芯压差
export const getCellVoltageDelta = (telemetry: Telemetry | null): number | null => {
  if (!telemetry?.cell_voltages || telemetry.cell_voltages.length < 2) return null
  try {
    const max = Math.max(...telemetry.cell_voltages)
    const min = Math.min(...telemetry.cell_voltages)
    return Number((max - min).toFixed(3))
  } catch {
    return null
  }
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
  try {
    const sum = telemetry.cell_temperatures.reduce((acc, t) => acc + t, 0)
    return Number((sum / telemetry.cell_temperatures.length).toFixed(1))
  } catch {
    return null
  }
}
