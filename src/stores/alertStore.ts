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

export const useAlertStore = create<AlertState>((set) => ({
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

      // 先获取用户绑定的设备 ID 列表
      const { data: userDevices, error: devicesError } = await supabase
        .from('user_devices')
        .select('device_id')
        .eq('user_id', user.id)

      if (devicesError) throw devicesError

      const deviceIds = userDevices.map(d => d.device_id)

      if (deviceIds.length === 0) {
        set({ alerts: [], activeAlerts: [], loading: false, error: null })
        return
      }

      // 查询这些设备的告警
      let query = supabase
        .from('alerts')
        .select(`
          id,
          device_id,
          alert_type,
          severity,
          start_time,
          end_time
        `)
        .in('device_id', deviceIds)

      if (deviceId) {
        query = query.eq('device_id', deviceId)
      }

      const { data, error } = await query

      if (error) throw error

      const allAlerts = data || []
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

  updateAlert: (alertId: string, updates: Partial<Alert>) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        String(a.id) === alertId ? { ...a, ...updates } : a
      ),
      activeAlerts: state.activeAlerts.map((a) =>
        String(a.id) === alertId ? { ...a, ...updates } : a
      ),
    }))
  },

  clearAlerts: () => {
    set({ alerts: [], activeAlerts: [], error: null })
  },
}))
