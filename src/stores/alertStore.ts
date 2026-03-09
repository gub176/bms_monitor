import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import type { Alert } from '../types/database'

interface AlertState {
  alerts: Alert[]
  activeAlerts: Alert[]
  loading: boolean
  error: string | null
  fetchAlerts: (deviceId?: string) => Promise<void>
  addAlert: (alert: Alert) => void
  updateAlert: (alertId: string, updates: Partial<Alert>) => void
  clearAlerts: () => void
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  activeAlerts: [],
  loading: false,
  error: null,

  fetchAlerts: async (deviceId) => {
    set({ loading: true, error: null })
    try {
      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        set({ loading: false, error: '请先登录' })
        return
      }

      // 通过 user_devices 关联查询用户绑定的设备的告警
      let query = supabase
        .from('user_devices')
        .select(`
          device_id,
          alerts:alerts (
            id,
            device_id,
            alert_type,
            severity,
            start_time,
            end_time
          )
        `)
        .eq('user_id', user.id)

      if (deviceId) {
        query = query.eq('device_id', deviceId)
      }

      const { data, error } = await query

      if (error) throw error

      // 扁平化告警数据
      const allAlerts = (data || []).flatMap(item => item.alerts || [])
      const activeAlerts = allAlerts.filter((a) => a.end_time === null)

      set({
        alerts: allAlerts,
        activeAlerts,
        loading: false,
        error: null,
      })
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
      set({
        loading: false,
        error: err instanceof Error ? err.message : '获取告警列表失败',
      })
    }
  },

  addAlert: (alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts],
      activeAlerts: alert.end_time === null ? [alert, ...state.activeAlerts] : state.activeAlerts,
    }))
  },

  updateAlert: (alertId, updates) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, ...updates } : a
      ),
      activeAlerts: state.activeAlerts.map((a) =>
        a.id === alertId ? { ...a, ...updates } : a
      ),
    }))
  },

  clearAlerts: () => {
    set({ alerts: [], activeAlerts: [], error: null })
  },
}))
