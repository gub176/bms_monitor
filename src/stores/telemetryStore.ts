import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import type { Telemetry, Status } from '../types/database'

// 实时订阅通道类型
interface RealtimeChannel {
  on: (
    event: string,
    filter: { event: string; schema: string; table: string; filter?: string },
    callback: Function
  ) => RealtimeChannel
  subscribe: (callback: (status: 'SUBSCRIBED' | 'CHANNEL_ERROR' | string) => void) => RealtimeChannel
  unsubscribe: (callback?: () => void) => void
}

export interface TelemetryState {
  // 数据状态 - 支持多设备
  latestTelemetry: Record<string, Telemetry> // key: deviceId
  latestStatus: Record<string, Status> // key: deviceId
  telemetryHistory: Record<string, Telemetry[]> // key: deviceId

  // UI 状态
  loading: boolean
  error: string | null

  // 实时订阅 - 每个设备一个订阅
  subscriptions: Record<string, RealtimeChannel> // key: deviceId

  // Actions - 数据更新
  updateTelemetry: (deviceId: string, data: Telemetry) => void
  updateStatus: (deviceId: string, data: Status) => void
  setTelemetryHistory: (deviceId: string, history: Telemetry[]) => void
  clearDeviceData: (deviceId: string) => void
  clearAllData: () => void

  // Actions - 数据获取
  fetchTelemetry: (deviceId: string) => Promise<void>
  fetchStatus: (deviceId: string) => Promise<void>

  // Actions - 实时订阅
  subscribeToTelemetry: (deviceId: string) => void
  unsubscribeFromTelemetry: (deviceId: string) => void
  unsubscribeAll: () => void

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
  subscriptions: {},

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
    // 先取消该设备的订阅
    get().unsubscribeFromTelemetry(deviceId)

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
    // 取消所有订阅
    get().unsubscribeAll()

    set({
      latestTelemetry: {},
      latestStatus: {},
      telemetryHistory: {},
      loading: false,
      error: null,
      subscriptions: {},
    })
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
        .single()

      console.log('Telemetry fetch result:', {
        deviceId,
        hasData: !!data,
        error: error ? { code: error.code, message: error.message } : null
      })

      if (error) {
        if (error.code === 'PGRST116') {
          // 没有数据，不是错误
          set({ loading: false })
          return
        }
        // 500 错误或其他错误，静默处理，不影响页面显示
        console.warn('Telemetry fetch error:', error.message)
        set({ loading: false })
        return
      }

      // 更新状态
      get().updateTelemetry(deviceId, data as Telemetry)
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

      console.log('Status fetch result:', {
        deviceId,
        hasData: !!data,
        error: error ? { code: error.code, message: error.message } : null
      })

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

  // 订阅实时遥测数据
  subscribeToTelemetry: (deviceId: string) => {
    const subscriptions = get().subscriptions

    // 如果已经订阅，跳过
    if (subscriptions[deviceId]) {
      return
    }

    // 创建新的实时订阅
    const channel = supabase
      .channel(`realtime:telemetry:${deviceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telemetry',
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          // 当有新遥测数据插入时，更新状态
          const newTelemetry = payload.new as Telemetry
          get().updateTelemetry(deviceId, newTelemetry)
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          get().setError('Subscription failed')
        }
      })

    set((state) => ({
      subscriptions: {
        ...state.subscriptions,
        [deviceId]: channel as unknown as RealtimeChannel,
      },
    }))
  },

  // 取消单个设备的订阅
  unsubscribeFromTelemetry: (deviceId: string) => {
    const subscriptions = get().subscriptions
    const subscription = subscriptions[deviceId]

    if (subscription) {
      subscription.unsubscribe()

      set((state) => {
        const { [deviceId]: removed, ...remaining } = state.subscriptions
        return { subscriptions: remaining }
      })
    }
  },

  // 取消所有订阅
  unsubscribeAll: () => {
    const subscriptions = get().subscriptions

    Object.values(subscriptions).forEach((subscription) => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    })

    set({ subscriptions: {} })
  },
}))

// ============================================
// 辅助选择器函数
// ============================================

// 计算平均电芯电压
export const getAverageCellVoltage = (telemetry: Telemetry | null): number | null => {
  if (!telemetry?.cell_voltages || telemetry.cell_voltages.length === 0) return null
  const sum = telemetry.cell_voltages.reduce((acc, v) => acc + v, 0)
  return Number((sum / telemetry.cell_voltages.length).toFixed(3))
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
